import * as Datastore from 'nedb';
import { getPath } from '~/shared/utils/paths';
import { arweaveNetwork } from '~/shared/constants';
import { observable, action } from 'mobx';
import { JWKInterface } from 'arweave/node/lib/wallet';
import * as notifier from 'node-notifier';
import { app } from 'electron';
import { resolve } from 'path';

export class WeaveMailStore {
  public db = new Datastore({
    filename: getPath('storage/weavemail.db'),
    autoload: true,
  });

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

    console.log(res);
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
    const encryptedKey = new Uint8Array(encryptedData.slice(0, 512));
    const encryptedMail = new Uint8Array(encryptedData.slice(512));

    const symmetricKey: any = await window.crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, encryptedKey);

    return arweaveNetwork.crypto.decrypt(encryptedMail, symmetricKey);
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
}
