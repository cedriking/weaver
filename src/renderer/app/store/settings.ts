import * as Datastore from 'nedb';
import { observable, computed, action } from 'mobx';
import { getPath } from '~/shared/utils/paths';

export class Settings {
  public db = new Datastore({
    filename: getPath('storage/arweaveapps.db'),
    autoload: true,
  });

  @observable
  public port = 1984;

  constructor() {
    this.db.findOne({}, (err: any, port: number) => {
      if (err) {
        console.log(err);
      } else {
        this.port = port;
      }
    });
  }
}
