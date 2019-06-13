import * as restify from 'restify';
import * as Datastore from 'nedb';
import { WeaverServer } from '~/weaver-server/WeaverServer';
import { ArweaveInfo } from '~/weaver-server/models';
import axios from 'axios';
import { getPath } from '~/shared/utils/paths';
import captureVisibleTab = chrome.tabs.captureVisibleTab;

export default class InfoController {
  private server: WeaverServer;
  private _info: ArweaveInfo;

  private infoDB = new Datastore({
    filename: getPath('storage/arweave-info.db'),
    autoload: true,
  });

  constructor(server: WeaverServer) {
    this.server = server;
  }

  async init() {
    return new Promise((resolve) => {
      this.infoDB.find({}, (err: any, docs: ArweaveInfo[]) => {
        if (err) {
          console.log('info find err', err);
        }

        if (docs.length) {
          this._info = docs[0];
          if (!this._info.hasOwnProperty('client')) {
            this._info.network = 'arweave.N.1';
            this._info.client = 'weaver';
            this.updateInfo();
          }
          this.server.trigger('info-updated', this._info);
        } else {
          this._info = {
            network: 'arweave.N.1',
            client: 'weaver',
            version: 5,
            release: 23,
            height: -1,
            current: '',
            blocks: 0,
            peers: 0,
            queue_length: 0,
            node_state_latency: 0,
          };

          this.updateInfo();
        }

        resolve();
      });
    });
  }

  /*** Getter Requests ***/
  async get(req: restify.Request, res: restify.Response, next: restify.Next) {
    res.json(this._info);
    next();
  }

  /*** Post Requests ***/

  /*** Getters ***/
  getInfo(): ArweaveInfo {
    return this._info;
  }

  public async getPeerInfo(peerURL: string): Promise<ArweaveInfo> {
    let res = null;
    try {
      res = await axios.get(`${peerURL}`);
      if (!res.data) return null;
    } catch (e) {
      return null;
    }

    return res.data;
  }

  /*** Setters ***/
  private async updateInfo() {
    return new Promise(resolve => {
      this.infoDB.update({}, this._info, { upsert: true }, (err, numReplaced: number) => {
        if (err) {
          return resolve(null);
        }

        this.server.trigger('info-updated', this._info);
        resolve(numReplaced);
      });
    });
  }

  public async update(height: number, currentHash: string): Promise<boolean> {
    this._info.height = height;
    this._info.current = currentHash;

    this.updateInfo();

    return true;
  }
}
