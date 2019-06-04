import { observable } from 'mobx';
import { arweaveDB } from '~/arweave';
import { ArweaveInfo } from '~/arweave/models';
import { ipcRenderer } from 'electron';
import store from '~/renderer/app/store/index';

export class ArweaveStore {
  @observable
  public height: number = 0;

  @observable
  public isRunningLocally: boolean = false;

  @observable
  public peersReady: boolean = false;

  constructor() {
    arweaveDB.on('info-updated', (info: ArweaveInfo) => {
      // console.log('info updated', info);
      this.height = info.height < 0 ? 0 : info.height;
    });

    arweaveDB.on('syncronized', (isSynced: boolean) => {
      this.isRunningLocally = isSynced;
      ipcRenderer.send('arweave-server-synced', store.arweaveServer.isRunningLocally);
    });

    arweaveDB.on('peers-ready', () => {
      this.peersReady = true;
      ipcRenderer.send('arweave-server-loaded');
    });

    /*arweaveDB.on('transactions-added', (txs: ArweaveTransaction[]) => {
      console.log('transactions added.', txs.length);
    });
    arweaveDB.on('block-added', (block: ArweaveBlock) => {
      console.log('Block added', block);
    });*/
  }
}
