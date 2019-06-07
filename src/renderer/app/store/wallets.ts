import { ipcRenderer } from 'electron';
import * as Datastore from 'nedb';
import { observable, action } from 'mobx';
import { getPath } from '~/shared/utils/paths';
import { WalletItem, JWKInterface } from '../models';
import * as fs from 'fs';
import { bufferTob64Url, b64UrlToBuffer } from '../utils';
import CryptoInterface from 'arweave/node/lib/crypto/crypto-interface';
import NodeCryptoDriver from 'arweave/node/lib/crypto/node-driver';
import * as crypto from 'crypto-js';
import store from '~/renderer/app/store/index';

export class WalletsStore {
  public db = new Datastore({
    filename: getPath('storage/wallets.db'),
    autoload: true,
  });

  private crypto: CryptoInterface = new NodeCryptoDriver();
  private walletsDir = 'wallets';

  @observable
  public items: WalletItem[] = [];

  @observable
  public defaultWallet: WalletItem = null;

  @observable
  public itemsLoaded = this.getDefaultLoaded();

  @observable
  public selectedItems: string[] = [];

  @observable
  public walletPassword: string = '';

  public tmpPath: string = '';

  private appClosing = false;

  // Clear the temp decrypted wallet
  private to: any = null;
  private tmpInterval = 10000; // 10 seconds

  constructor() {
    this.load();

    ipcRenderer.on('app-closing', () => {
      this.appClosing = true;
      this.tmpDelete();
    });
  }

  public resetLoadedItems() {
    this.itemsLoaded = this.getDefaultLoaded();
  }

  public async load() {
    this.walletPassword = window.atob(window.atob(window.localStorage.getItem('arweaveWalletPassword') || ''));

    this.db.find({}).exec((err: any, tmpItems: WalletItem[]) => {
      if (err) {
        return console.warn(err);
      }

      this.items = tmpItems;
      const items = JSON.parse(JSON.stringify(this.items.filter(i => i.isDefault)));

      this.defaultWallet = items[0];
    });
  }

  public async addFile(file: File) {
    const fileData:JWKInterface = JSON.parse(fs.readFileSync(file.path, { encoding: 'utf8' }));

    const addy = await this.jwkToAddress(fileData);
    const filePath = getPath(`${this.walletsDir}/${addy}`);

    if (this.items.findIndex(i => i._id === addy) !== -1) {
      return true;
    }

    const item: WalletItem = { _id: addy, title: addy, balance: 0, filepath: filePath };

    if (!fs.existsSync(getPath(this.walletsDir))) {
      fs.mkdirSync(getPath(this.walletsDir));
    }

    this.saveEncrypt(item, JSON.stringify(fileData));

    if (!this.items.length) {
      item.isDefault = true;
      this.defaultWallet = item;

    } else {
      item.isDefault = false;
    }

    await this.addItem([item]);

    return true;
  }

  public addItem(items: WalletItem[]) {
    return new Promise((resolve) => {
      this.db.insert(items, (err: any, docs: WalletItem[]) => {
        if (err) {
          resolve(false);
          return console.error(err);
        }

        this.items = docs;
        resolve();
      });
    });
  }

  public removeItem(id: string) {
    this.items = this.items.filter(x => x._id !== id);

    this.db.remove({ _id : id }, err => {
      if (err) return console.warn(err);

      fs.unlink(getPath(`${this.walletsDir}/${id}`), e => {
        if (e) console.warn(e);
      });

      if (this.defaultWallet && this.defaultWallet._id === id) {
        this.defaultWallet = this.items[0];
      }
    });
  }

  public saveEncrypt(item: WalletItem, data: string) {
    fs.writeFileSync(item.filepath, crypto.AES.encrypt(data, this.walletPassword).toString(), { encoding: 'utf8' });
  }

  public decrypt(item: WalletItem): WalletItem {
    const fileData: string = fs.readFileSync(item.filepath, { encoding: 'utf8' });
    const decrypted = crypto.AES.decrypt(fileData, this.walletPassword);

    return JSON.parse(decrypted.toString(crypto.enc.Utf8));
  }

  public saveDecrypt(item: WalletItem) {
    const data = this.decrypt(item);

    fs.writeFileSync(item.filepath, data, { encoding: 'utf8' });
  }

  public tmpDecrypt(item: WalletItem): string {
    this.tmpDelete();

    const data = this.decrypt(item);
    this.tmpPath = getPath(`wallets/${Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)}.json`);

    fs.writeFileSync(this.tmpPath, JSON.stringify(data), { encoding: 'utf8' });

    clearInterval(this.to);
    this.to = setInterval(() => {
      store.wallets.tmpDelete();
      clearInterval(this.to);
      this.to = null;
    }, this.tmpInterval);

    return this.tmpPath;
  }

  public tmpDelete() {
    if (this.tmpPath.length) {
      fs.unlink(this.tmpPath, e => {
        if (e) console.warn(e);
      });
      this.tmpPath = '';
    }

    if (this.appClosing) ipcRenderer.send('temp-wallet-deleted');
  }

  public getDefaultLoaded() {
    return Math.floor(window.innerHeight / 56);
  }

  @action
  public changePassword(val: string) {
    const itemsData = this.items.map(i => {
      return this.decrypt(i);
    });

    this.walletPassword = val;

    window.localStorage.setItem('arweaveWalletPassword', window.btoa(window.btoa(this.walletPassword)));

    for (let i = 0, j = itemsData.length; i < j; i++) {
      const item = this.items[i];
      this.saveEncrypt(item, JSON.stringify(itemsData[i]));
    }
  }

  @action
  public deleteSelected() {
    for (const item of this.selectedItems) {
      this.removeItem(item);
    }

    this.selectedItems = [];
  }

  @action
  public defaultSelected() {
    this.setDefaultWallet(this.selectedItems[0]);
  }

  private async jwkToAddress(jwk: JWKInterface): Promise<string> {
    return this.ownerToAddress(jwk.n);
  }

  private async ownerToAddress(owner: string): Promise<string> {
    return bufferTob64Url(
      await this.crypto.hash(b64UrlToBuffer(owner)),
    );
  }

  private setDefaultWallet(itemId: string) {
    const index = this.items.findIndex(i => i._id === itemId);
    if (index === -1) return;

    const item = this.items[index];

    const tmpItems = this.items;
    for (let i = 0, j = tmpItems.length; i < j; i++) {
      console.log(item, tmpItems[i]);
      tmpItems[i].isDefault = (tmpItems[i]._id === item._id)
    }

    this.db.remove({}, async (e) => {
      if (e) return console.warn(e);

      await this.addItem(tmpItems);
    });

    this.defaultWallet = item;
  }
}
