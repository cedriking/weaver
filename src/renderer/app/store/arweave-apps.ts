import * as Datastore from 'nedb';
import { observable, computed, action } from 'mobx';
import { getPath } from '~/shared/utils/paths';
import { ArweaveappItem } from '../models/arweaveapp-item';
import { AppsSection } from '../models';
import { arweaveNetwork } from '~/shared/constants';

export const categories = [
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

export class ArweaveAppsStore {
  public db = new Datastore({
    filename: getPath('storage/arweaveapps.db'),
    autoload: true,
  });

  private updateTime = 60000 * 30;
  private homeLimit = 18;

  @observable
  public items: ArweaveappItem[] = [];

  @observable
  public homeItems: ArweaveappItem[] = [];

  @observable
  public itemsLoaded = this.getDefaultLoaded();

  @observable
  public selectedCategory: string = '';

  @observable
  public searched = '';

  @observable
  public selectedItems: string[] = [];

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

    this.db.find({}).exec((err: any, tmpItems: ArweaveappItem[]) => {
      if (err) {
        return console.warn(err);
      }

      tmpItems.sort((a: any, b: any) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);

      hasItems = (tmpItems.length > 0);

      this.items = tmpItems;

      tmpItems.sort((a: ArweaveappItem, b: ArweaveappItem) => a.votes < b.votes ? 1 : a.votes > b.votes ? -1 : 0);
      const tmpHome: ArweaveappItem[] = [];
      for (let i = 0; i < this.homeLimit; i++) {
        tmpHome.push(tmpItems[i]);
      }
      this.homeItems = tmpHome;
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

    const res = await arweaveNetwork.api.post('arql', queryLinks);

    let tmpItems: ArweaveappItem[] = [];
    if (res.data.length) {
      for (let i = 0, j = res.data.length; i < j; i++) {
        const id: string = res.data[i];
        const txRow: any = {};
        const tx: any = await arweaveNetwork.transactions.get(id);

        tx.get('tags').forEach((tag: any) => {
          const key = tag.get('name', { decode: true, string: true });
          txRow[key.toLowerCase()] = tag.get('value', { decode: true, string: true });
        });

        const jsonData = tx.get('data', { decode: true, string: true });
        const data = JSON.parse(jsonData);

        txRow['id'] = id;
        txRow['appIcon'] = data.appIcon;
        txRow['from'] = await arweaveNetwork.wallets.ownerToAddress(tx.owner);
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
        if (!tmpSet.has(`${tmpItems[i].title}-${tmpItems[i].from}`) && categories.find(cat => cat === tmpItems[i].category)) {
          // tmpItems[i].fromUser = await accounts.getUsername(tmpItems[i].from);
          tmpItems[i].votes = await this.getAppVotes(tmpItems[i].id);

          tmp.push(tmpItems[i]);
          tmpSet.add(`${tmpItems[i].title}-${tmpItems[i].from}`);
        }
      }

      if (tmp.length) {
        tmp.sort((a: ArweaveappItem, b: ArweaveappItem) => a.title > b.title ? 1 : a.title < b.title ? -1 : 0);
      }

      tmpItems = tmp;

      tmp.sort((a: ArweaveappItem, b: ArweaveappItem) => a.votes < b.votes ? 1 : a.votes > b.votes ? -1 : 0);
      const tmpHome: ArweaveappItem[] = [];
      for (let i = 0; i < this.homeLimit; i++) {
        tmpHome.push(tmp[i]);
      }
      this.homeItems = tmpHome;
    }

    await this.clearAsync();
    await this.addItem(tmpItems);

    return true;
  }

  public addItem(items: ArweaveappItem[]) {
    return new Promise((resolve) => {
      this.db.insert(items, (err: any, docs: ArweaveappItem[]) => {
        if (err) {
          resolve(false);
          return console.error(err);
        }

        this.items = docs;

        resolve();
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

  @computed
  public get categories() {
    const list: string[] = [];
    let latestList: string = '';
    const byCategory = this.items.slice().sort((a: any, b: any) => a.category > b.category ? 1 : a.category < b.category ? -1 : 0);

    for (let i = 0, j = byCategory.length; i < j; i++) {
      const category = byCategory[i].category;
      if (latestList !== category) {
        list.push(this.capitalize(category));
        latestList = category;
      }
    }

    return list;
  }

  @computed
  public get sections() {

    const list: AppsSection[] = [];
    let section: AppsSection;
    let loaded = 0;

    const byCategory = this.items.slice().sort((a: any, b: any) => a.category > b.category ? 1 : a.category < b.category ? -1 : 0);

    for (let i = 0, j = byCategory.length; i < j; i++) {
      if (loaded > this.itemsLoaded) break;

      const item = byCategory[i];

      if (
          this.searched !== '' &&
          !item.title.toLowerCase().includes(this.searched) &&
          !item.linkId.includes(this.searched)
      ) {
        continue;
      }

      if (this.selectedCategory !== 'all' && this.selectedCategory !== '' && this.selectedCategory.toLowerCase() !== item.category.toLowerCase()) {
        continue;
      }

      if (section && section.label.toLowerCase() === item.category.toLowerCase()) {
        section.items.push(item);
      } else {
        section = {
          label: this.capitalize(item.category),
          items: [item],
        };
        list.push(section);
      }

      loaded++;
    }

    return list;
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

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private async getAppVotes(appId: string) {
    const queryVotes = {
      op: 'and',
      expr1: {
        op: 'and',
        expr1: {
          op: 'equals',
          expr1: 'App-Name',
          expr2: 'arweaveapps',
        },
        expr2: {
          op: 'equals',
          expr1: 'Type',
          expr2: 'vote',
        },
      },
      expr2: {
        op: 'equals',
        expr1: 'Link-Id',
        expr2: appId,
      },
    };

    const res = await arweaveNetwork.api.post('arql', queryVotes);
    return res.data.length;
  }
}
