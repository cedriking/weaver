import * as Datastore from 'nedb';
import { getPath } from '~/shared/utils/paths';
import { arweaveNetwork } from '~/shared/constants';
import store from './';
import { observable, action } from 'mobx';

export class WeaveMailStore {
  public db = new Datastore({
    filename: getPath('storage/weavemail.db'),
    autoload: true,
  });

  @observable
  public current: string = 'inbox';

  @observable
  public compose: { to: string, subject: string, message: string, balance: number } = { to: '', subject: '', message: '', balance: 0 };

  constructor() {
    this.refresh().catch(console.log);
  }

  public async refresh() {
    store.wallets.items.forEach(async wallet => {
      await this.getEmails(wallet.title);
    });
  }

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
}
