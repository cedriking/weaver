import * as Datastore from 'nedb';
import { getPath } from '~/shared/utils/paths';
import { arweaveNetwork } from '~/shared/constants';
import { observable, action, computed } from 'mobx';
import { JWKInterface } from 'arweave/node/lib/wallet';
import * as notifier from 'node-notifier';
import { WalletItem } from '~/renderer/app/models';

export interface WeaveMailItem {
  id: string;
  txStatus: string;
  from: string;
  subject: string;
  message: string;
  date: string;
  unixTime: number;
  tdFee: string;
  tdQty: string;
}

interface WeaveMailSection {
  label?: string;
  items?: WeaveMailItem[];
}

export class WeaveMailStore {
  public db = new Datastore({
    filename: getPath('storage/weavemail.db'),
    autoload: true,
  });

  @observable
  public wallets: WalletItem[] = [];

  @observable
  public walletsData: JWKInterface[] = [];

  @observable
  public current: string = 'inbox';

  @observable
  public composeCtx = false;

  @observable
  public compose: { sender: string, from: JWKInterface, to: string, subject: string, message: string, balance: string } = { sender: '', from: null, to: '', subject: '', message: '', balance: '0' };

  public async getEmails(walletAddr: string) {
    const mailQuery = {
      op: 'and',
      expr1: {
        op: 'equals',
        expr1: 'to',
        expr2: walletAddr,
      },
      expr2: {
        op: 'equals',
        expr1: 'App-Name',
        expr2: 'permamail',
      },
    };

    const res = await arweaveNetwork.api.post('arql', mailQuery);
  }

  @action
  public async sendMessage() {
    const time = Math.round((new Date()).getTime() / 1000);

    const balance = (isNaN(+this.compose.balance) ? '0' : arweaveNetwork.ar.arToWinston(this.compose.balance));

    const pubKey = await this.getPubKey(this.compose.to);

    if (!pubKey) {
      notifier.notify({
        title: 'Weaver',
        subtitle: 'WeaveMail',
        message: 'Recipient has to send a transaction to the network first.',
        sound: true,
        wait: true,
      }, (err, res) => {
        console.log(err, res);
      });
      return;
    }

    console.log(this.compose.sender, this.compose.from, this.compose.to, this.compose.subject, this.compose.message, this.compose.balance);

    const content = await this.encryptMail(this.compose.message, this.compose.subject, pubKey);
    console.log(content);

    const tx = await arweaveNetwork.createTransaction({
      target: this.compose.to,
      data: arweaveNetwork.utils.concatBuffers([content]),
      quantity: balance,
    }, this.compose.from);

    tx.addTag('App-Name', 'permamail');
    tx.addTag('App-Version', '0.0.2');
    tx.addTag('Unix-Time', time.toString());

    await arweaveNetwork.transactions.sign(tx, this.compose.from);
    console.log(tx.id);
    await arweaveNetwork.transactions.post(tx);

    notifier.notify({
      title: 'Weaver',
      subtitle: 'WeaveMail',
      message: 'Mail dispatched!',
      sound: true,
      wait: true,
    }, (err, res) => {
      console.log(err, res);
    });

    this.clearCompose();
  }

  @action
  public clearCompose() {
    this.compose.to = '';
    this.compose.subject = '';
    this.compose.message = '';
    this.compose.balance = '0';
  }

  @computed
  public get sections() {
    const list: WeaveMailSection[] = [];
    let section: WeaveMailSection = {};

    // @ts-ignore
    this.wallets.forEach(async (wallet, i) => {
      const key = await this.walletToKey(this.walletsData[i]);

      const query = {
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'to',
          expr2: wallet.title,
        },
        expr2: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: 'permamail',
        },
      };

      const res = await arweaveNetwork.api.post('arql', query);
      let txRows: WeaveMailItem[] = [];
      if (res.data === '') {
        return txRows;
      }

      txRows = await Promise.all(res.data.map(async (id: string) => {
        const txRow: any = {};
        const tx = await arweaveNetwork.transactions.get(id);
        txRow.unixTime = 0;
        txRow.date = '';

        // @ts-ignore
        tx.get('tags').forEach(tag => {
          const key = tag.get('name', { decode: true, string: true });
          const val = tag.get('value', { decode: true, string: true });

          if (key === 'Unix-Time') {
            txRow.unixTime = +val;
            txRow.date = this.timeConverter(txRow.unixTime);
          }
        });

        txRow.id = id;
        txRow.txStatus = await arweaveNetwork.transactions.getStatus(id);
        txRow.from = await arweaveNetwork.wallets.ownerToAddress(tx.owner);
        txRow.tdFee = arweaveNetwork.ar.winstonToAr(tx.reward);
        txRow.tdQty = arweaveNetwork.ar.winstonToAr(tx.quantity);

        let mail = arweaveNetwork.utils.bufferToString(await this.decryptMail(arweaveNetwork.utils.b64UrlToBuffer(tx.data), key));
        mail = mail.replace(/(?:\r\n|\r|\n)/g, '<br>');
        mail = mail.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        console.log(mail);

        let mailContent;
        try {
          mailContent = JSON.parse(mail);
        } catch (e) {}

        txRow['message'] = mail;
        txRow['subject'] = tx.id;

        if (mailContent) {
          txRow['message'] = mailContent.body;
          txRow['subject'] = mailContent.subject;
        }

        return txRow;
      }));

      txRows.sort((a, b) => b.unixTime - a.unixTime);

      section = {
        label: wallet.title,
        items: txRows,
      };

      list.push(section);
    });

    return list;
  }

  private async encryptMail(content: string, subject: string, pubKey: CryptoKey) {
    const contentEncoder = new TextEncoder();
    const newFormat = JSON.stringify({ subject, body: content });
    const mailBuffer = contentEncoder.encode(newFormat);
    const keyBuffer = await this.generateRandomBytes(256);

    const encryptedMail = await arweaveNetwork.crypto.encrypt(mailBuffer, keyBuffer);
    const encryptedKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, pubKey, keyBuffer);

    return arweaveNetwork.utils.concatBuffers([encryptedKey, encryptedMail]);
  }

  private async decryptMail(encryptedData: any, key: CryptoKey) {
    const encKey = new Uint8Array(encryptedData.slice(0, 512));
    const encMail = new Uint8Array(encryptedData.slice(512));

    const symmetricKey = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, encKey);

    // @ts-ignore
    return arweaveNetwork.crypto.decrypt(encMail, symmetricKey);
  }

  private async getPubKey(address: string) {
    const txId = await arweaveNetwork.wallets.getLastTransactionID(address);
    if (txId === '') {
      return false;
    }

    const tx = await arweaveNetwork.transactions.get(txId);

    if (tx === undefined) {
      return false;
    }

    const pubKey = arweaveNetwork.utils.b64UrlToBuffer(tx.owner);
    console.log(pubKey);

    const keyData = {
      kty: 'RSA',
      e: 'AQAB',
      n: tx.owner,
      alg: 'RSA-OAEP-256',
      ext: true,
    };

    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } };
    return await crypto.subtle.importKey('jwk', keyData, algo, false, ['encrypt']);
  }

  private async generateRandomBytes(length: number) {
    const array = new Uint8Array(length);
    window.crypto.getRandomValues(array);

    return array;
  }

  private timeConverter (unixTime: number) {
    const a = new Date(unixTime * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = `${date} ${month} ${year} ${hour}:${min}:${sec}`;

    return time;
  }

  private async walletToKey(walletData: JWKInterface) {
    const w = Object.create(walletData);
    w.alg = 'RSA-OAEP-256';
    w.ext = true;

    const algo = { name: 'RSA-OAEP', hash: { name: 'SHA-256' } };

    return await crypto.subtle.importKey('jwk', w, algo, false, ['decrypt']);
  }
}
