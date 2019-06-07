import * as Datastore from 'nedb';
import { observable, action } from 'mobx';
import { getPath } from '~/shared/utils/paths';
import { WalletItem, JWKInterface } from '../models';
import * as fs from 'fs';
import { bufferTob64Url, b64UrlToBuffer } from '../utils';
import CryptoInterface from 'arweave/node/lib/crypto/crypto-interface';
import NodeCryptoDriver from 'arweave/node/lib/crypto/node-driver';

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
  public defaultWallet: WalletItem;

  @observable
  public itemsLoaded = this.getDefaultLoaded();

  @observable
  public selectedItems: WalletItem[] = [];

  constructor() {
    this.load();
  }

  public resetLoadedItems() {
    this.itemsLoaded = this.getDefaultLoaded();
  }

  public async load() {
    this.db.find({}).exec((err: any, tmpItems: WalletItem[]) => {
      if (err) {
        return console.warn(err);
      }

      this.items = tmpItems;
    });
  }

  public async addFile(file: File) {
    const fileData:JWKInterface = JSON.parse(fs.readFileSync(file.path, { encoding: 'utf8' }));
    console.log(fileData);

    const addy = await this.jwkToAddress(fileData);
    const filePath = getPath(`${this.walletsDir}/${addy}.json`);

    if (!fs.existsSync(getPath(this.walletsDir))) {
      fs.mkdirSync(getPath(this.walletsDir));
    }

    fs.writeFileSync(filePath, JSON.stringify(fileData), { encoding: 'utf8' });

    if (this.items.findIndex(i => i._id === addy) !== -1) {
      return true;
    }

    const item: WalletItem = { _id: addy, title: addy, balance: 0, filepath: filePath };
    if (!this.items.length) {
      item.default = true;
      this.defaultWallet = item;
    } else {
      item.default = false;
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

    fs.unlink(getPath(`${this.walletsDir}/${id}.json`), e => {
      if (e) console.warn(e);
    });

    this.db.remove({ _id : id }, err => {
      if (err) return console.warn(err);
    });
  }

  public getDefaultLoaded() {
    return Math.floor(window.innerHeight / 56);
  }

  @action
  public deleteSelected() {
    for (const item of this.selectedItems) {
      this.removeItem(item._id);
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

  private setDefaultWallet(item: WalletItem) {
    this.items.forEach(i => item.default = item._id === i._id);

    const items = this.items;
    this.db.remove({}, async (e) => {
      if (e) return console.warn(e);

      await this.addItem(items);
    });

    this.defaultWallet = item;
  }
}
