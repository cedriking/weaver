import { observable } from 'mobx';
import { arweaveDB } from '~/arweave';
import {ArweaveBlock, ArweaveInfo, ArweaveTransaction} from '~/arweave/models';

export class ArweaveStore {
  @observable
  public height: number = 0;

  constructor() {
    /*arweaveDB.on('transactions-added', (txs: ArweaveTransaction[]) => {
      console.log('transactions added.', txs.length);
    });*/
    arweaveDB.on('info-updated', (info: ArweaveInfo) => {
      // console.log('info updated', info);
      this.height = info.height < 0 ? 0 : info.height;
    });
    /*arweaveDB.on('block-added', (block: ArweaveBlock) => {
      console.log('Block added', block);
    });*/
  }
}
