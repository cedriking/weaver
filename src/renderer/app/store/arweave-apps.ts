import * as Datastore from 'nedb';
import { observable, computed, action } from 'mobx';
import { getPath } from '~/shared/utils/paths';
import { countVisitedTimes, compareDates, getSectionLabel } from '../utils';
import { ArweaveappItem } from '../models/arweaveapp-item';
import { arweave } from '~/renderer/app/components/App';

export class ArweaveAppsStore {
  public db = new Datastore({
    filename: getPath('storage/arweaveapps.db'),
    autoload: true,
  });

  private updateTime = 60000 * 30;

  @observable
  public items: ArweaveappItem[] = [];

  @observable
  public itemsLoaded = this.getDefaultLoaded();

  @observable
  public searched = '';

  @observable
  public selectedItems: string[] = [];

  public categories() {
    return [
      'games',
      'gambling',
      'social',
      'finance',
      'development',
      'media',
      'wallet',
      'stores',
      'security',
      'governance',
      'property',
      'storage',
      'identity',
      'energy',
      'health',
    ];
  }

  constructor() {
    this.load();
  }

  public resetLoadedItems() {
    this.itemsLoaded = this.getDefaultLoaded();
  }

  public getById(id: string) {
    return this.items.find(x => x.id === id);
  }

  public async load() {
    let hasItems = false;
    await this.db.find({}).exec((err: any, items: ArweaveappItem[]) => {
      if (err) {
        return console.warn(err);
      }

      items.sort((a: any, b: any) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);

      hasItems = (items.length > 0);
      this.items = items;
    });

    if (!hasItems) {
      await this.getArweaveApps();
    }

    setTimeout(() => this.update(), this.updateTime);
  }

  public async getArweaveApps() {
    const queryLinks = {
      op: 'and',
      expr1: {
        op: 'equals',
        expr1: 'App-Name',
        expr2: 'arweaveapps',
      },
      expr2: {
        op: 'equals',
        expr1: 'Type',
        expr2: 'publish',
      },
    };

    const res = await arweave.api.post('arql', queryLinks);

    let tmpItems: ArweaveappItem[] = [];
    if (res.data.length) {
      for (let i = 0, j = res.data.length; i < j; i++) {
        const id: string = res.data[i];
        const txRow: any = {};
        const tx: any = await arweave.transactions.get(id);

        tx.get('tags').forEach((tag: any) => {
          const key = tag.get('name', { decode: true, string: true });
          txRow[key.toLowerCase()] = tag.get('value', { decode: true, string: true });
        });

        const jsonData = tx.get('data', { decode: true, string: true });
        const data = JSON.parse(jsonData);

        txRow['id'] = id;
        txRow['appIcon'] = data.appIcon;
        txRow['from'] = await arweave.wallets.ownerToAddress(tx.owner);
        txRow['title'] = data.title;
        txRow['linkId'] = data.linkId;
        txRow['description'] = data.description;

        tmpItems.push(txRow);
      }

      if (tmpItems.length) {
        tmpItems.sort((a: any, b: any) => +b['unix-time'] - +a['unix-time']);
      }

      const tmp: ArweaveappItem[] = [];
      const tmpSet = new Set();
      for (let i = 0, j = tmpItems.length; i < j; i++) {
        if (!tmpSet.has(`${tmpItems[i].title}-${tmpItems[i].from}`) && this.categories().find(cat => cat === tmpItems[i].category)) {
          // tmpItems[i].fromUser = await accounts.getUsername(tmpItems[i].from);

          tmp.push(tmpItems[i]);
          tmpSet.add(`${tmpItems[i].title}-${tmpItems[i].from}`);
        }
      }

      if (tmp.length) {
        tmp.sort((a: any, b: any) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);
      }

      tmpItems = tmp;
    }

    await this.clearAsync();
    for (let i = 0, j = tmpItems.length; i < j; i++) {
      this.addItem(tmpItems[i]);
    }

    return true;
  }

  public addItem(item: ArweaveappItem) {
    return new Promise((resolve: (id: string) => void) => {
      this.db.insert(item, (err: any, doc: ArweaveappItem) => {
        if (err) return console.error(err);

        this.items.push(doc);
        resolve(doc.id);
      });
    });
  }

  public clearAsync() {
    return new Promise((resolve) => {
      this.clear((e: any, num: any) => {
        resolve();
      });
    });
  }

  public clear(cb = (e: any, n: any) => {}) {
    this.items = [];

    this.db.remove({}, { multi: true }, (err, num) => {
      cb(err, num);
    });
  }

  public removeItem(id: string) {
    this.items = this.items.filter(x => x.id !== id);

    this.db.remove({ _id: id }, err => {
      if (err) return console.warn(err);
    });
  }

  private async update() {
    await this.getArweaveApps();
    setTimeout(() => this.update(), this.updateTime);
  }

  @action
  public search(str: string) {
    this.searched = str.toLowerCase().toLowerCase();
    this.itemsLoaded = this.getDefaultLoaded();
  }

  public getDefaultLoaded() {
    return Math.floor(window.innerHeight / 56);
  }

  @action
  public deleteSelected() {
    for (const item of this.selectedItems) {
      this.removeItem(item);
    }
    this.selectedItems = [];
  }
}
