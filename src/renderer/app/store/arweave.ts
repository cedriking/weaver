import { observable } from 'mobx';
import { weaverServer } from '~/weaver-server';
import { ArweaveInfo } from '~/weaver-server/models';
import { ipcRenderer } from 'electron';
import store from '~/renderer/app/store/index';

export class ArweaveStore {
  @observable
  public height: number = 0;

  @observable
  public isRunningLocally: boolean = false;

  @observable
  public peersReady: boolean = false;

  @observable
  public serverStarted: boolean = false;

  constructor() {
    weaverServer.on('info-updated', (info: ArweaveInfo) => {
      // console.log('info updated', info);
      this.height = info.height < 0 ? 0 : info.height;
    });

    weaverServer.on('syncronized', (isSynced: boolean) => {
      this.isRunningLocally = isSynced;
      ipcRenderer.send('weaver-server-synced', store.arweaveServer.isRunningLocally);
    });

    weaverServer.on('peers-ready', () => {
      this.peersReady = true;
      ipcRenderer.send('weaver-server-loaded');
    });

    weaverServer.on('server-started', () => {
      this.serverStarted = true;
      ipcRenderer.send('weaver-server-started');
    });

    /*arweaveDB.on('transactions-added', (txs: ArweaveTransaction[]) => {
      console.log('transactions added.', txs.length);
    });
    arweaveDB.on('block-added', (block: ArweaveBlock) => {
      console.log('Block added', block);
    });*/
  }
}
