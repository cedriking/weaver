import * as Datastore from 'nedb';
import * as restify from 'restify';
import { getPath } from '~/shared/utils/paths';
import { ArweaveInfo } from './models/arweaveInfo';
import axios from 'axios';
import { ArweaveDB } from 'arweavedb';
import { IArweaveBlock, IArweaveTransaction } from 'arweavedb/lib/models';

export class ArweaveServer {
  private _info: ArweaveInfo;
  private _triggers: Map<string, Function[]> = new Map();
  private server: restify.Server;

  // Default ones, taken from a request done to arweave.net/peers
  private peers: string[] = ['91.134.139.36:1984', '128.199.60.249:1984', '159.65.91.188:1984', '193.70.80.113:1984', '159.65.213.43:1984', '193.70.80.217:1984', '209.97.134.129:1984', '151.80.47.234:1984', '188.166.200.45:1984', '94.23.211.10:1984', '80.240.24.73:1984', '80.240.22.105:1984', '45.77.141.116:1984', '46.101.67.172:1984', '13.58.84.22:1984', '3.17.150.80:1984', '188.166.192.169:1984', '62.210.83.155:1984', '164.132.201.33:1984', '5.76.246.153:1989', '172.6.90.173:1984', '67.213.201.172:1984', '18.222.191.57:1984', '5.76.246.153:1993', '18.224.34.194:1984', '18.216.0.7:1984', '3.16.69.193:1984', '18.191.178.238:1984', '13.59.92.210:1984', '18.217.252.91:1984', '18.191.103.131:1984', '94.23.216.85:1984', '108.61.170.40:1984', '80.240.23.86:1984', '3.17.164.108:1984', '18.188.47.253:1984', '3.14.252.65:1984', '37.187.95.164:1984', '147.135.1.110:1984', '52.14.43.227:1984', '18.222.162.101:1984', '18.224.53.127:1984', '18.191.223.104:1984', '52.14.90.4:1984', '107.161.173.22:1984', '3.15.8.224:1984', '18.191.220.129:1984', '18.221.64.177:1984', '3.15.2.208:1984', '18.188.173.239:1984', '3.19.79.142:1984', '3.14.66.92:1984', '18.223.186.54:1984', '13.59.47.71:1984', '95.179.244.207:1984', '45.76.83.66:1984', '3.19.60.247:1984', '3.16.150.5:1984', '3.17.73.55:1984', '3.16.255.198:1984', '199.247.16.227:1984', '3.17.153.63:1984', '18.188.56.62:1984', '18.188.41.49:1984', '3.14.84.0:1984', '3.18.221.139:1984', '3.19.28.79:1984', '95.179.240.98:1984', '45.77.143.147:1984', '199.247.6.193:1984', '199.247.16.169:1984', '95.179.163.75:1984', '45.76.89.57:1984', '95.179.246.38:1984', '95.179.245.50:1984', '140.82.32.230:1984', '95.179.240.36:1984', '140.82.36.173:1984', '95.179.162.248:1984', '149.56.107.58:1984', '149.56.106.150:1984', '149.56.107.165:1984', '45.32.158.231:1984', '40.87.42.246:1984', '217.163.23.252:1984', '104.238.167.66:1984', '95.216.245.176:1984', '95.216.245.177:1984', '34.237.222.214:1984', '157.230.2.154:1984', '213.118.248.166:1985', '137.74.4.178:1984', '178.128.85.23:1984', '165.227.36.199:1984', '188.150.253.229:1983', '51.15.96.191:1984', '83.85.180.146:1984', '108.238.244.144:2013', '35.185.19.153:1984', '45.77.65.220:1984', '35.241.225.81:1984', '164.132.201.39:1984', '164.132.200.205:1984', '164.132.201.19:1984', '164.132.202.32:1984', '164.132.200.112:1984', '164.132.201.150:1984', '164.132.201.52:1984', '164.132.203.165:1984', '164.132.201.192:1984', '164.132.201.13:1984', '193.70.80.76:1984', '193.70.80.52:1984', '193.70.80.83:1984', '193.70.80.205:1984', '213.32.7.152:1984', '213.32.7.192:1984', '213.32.7.153:1984', '164.132.203.215:1984', '164.132.203.227:1984', '149.202.89.20:1984', '164.132.203.198:1984', '151.80.47.37:1984', '149.202.89.107:1984', '164.132.200.145:1984', '213.32.7.165:1984', '149.202.88.155:1984', '95.216.240.242:1984', '84.54.149.140:1984', '108.238.244.144:1988', '149.56.242.205:1984', '149.56.242.125:1984', '149.56.242.44:1984', '149.56.242.59:1984', '91.121.144.138:1984', '149.202.86.126:1984', '149.202.88.228:1984', '108.238.244.144:2017', '95.216.37.142:1984', '178.128.176.31:1984', '95.216.72.185:1984', '51.79.5.208:1984', '54.39.249.32:1984', '54.39.249.80:1984', '54.39.249.16:1984', '149.56.86.64:1984', '51.79.5.192:1984', '89.33.6.51:1984', '54.39.249.48:1984', '54.39.249.64:1984', '94.23.74.168:1984', '142.44.203.32:1984', '213.118.248.166:1984', '149.56.107.81:1984', '74.105.39.88:1985', '91.121.133.32:1984', '95.216.35.154:1984', '95.216.72.184:1984', '95.216.102.207:1984', '95.216.65.135:1984', '95.216.41.222:1984', '134.209.95.108:1984', '95.216.114.176:1984', '209.97.142.170:1984', '107.150.36.100:1984', '54.93.54.173:1984', '107.150.36.99:1984', '66.70.212.0:1984', '159.203.49.13:1984', '159.203.158.108:1984', '54.39.35.192:1984', '51.79.40.224:1984', '51.79.13.192:1984', '138.197.232.192:1984', '139.59.51.59:1984', '163.47.11.64:1984', '149.56.67.128:1984', '142.44.237.144:1984', '51.79.42.0:1984', '149.56.9.64:1984', '54.39.215.112:1984', '51.79.56.128:1984', '149.56.107.83:1984', '149.56.107.173:1984', '157.230.85.148:1984', '45.63.119.210:1984', '199.247.22.232:1984', '95.179.166.24:1984', '3.15.46.198:1984', '51.15.107.254:1984', '178.62.122.194:1993', '95.216.45.115:1984', '167.99.106.38:1984', '178.128.89.236:1984', '45.77.53.60:1984', '149.56.106.146:1984', '149.56.107.76:1984', '149.56.107.172:1984', '193.70.80.196:1984', '149.56.106.26:1984', '136.49.213.56:1984', '95.216.45.215:1984', '80.240.26.87:1984', '158.69.121.235:1984', '158.69.122.207:1984', '158.69.122.234:1984', '158.69.122.192:1984', '178.62.122.194:2015', '158.69.121.141:1984', '178.62.122.194:2017', '108.238.244.144:1984', '143.248.128.46:1984', '51.15.66.146:1984', '3.17.12.143:1984', '74.105.39.88:1984', '37.59.48.209:1984', '108.238.244.144:1989', '149.202.88.193:1984', '113.79.170.24:1984', '95.216.29.237:1984', '158.69.121.40:1984', '46.101.130.178:1984', '90.142.34.25:1984', '217.170.116.138:1984'];
  private activePeers: string[];

  private loaded = 0;
  private syncTime = 2 * 60000; // 2 minutes

  private arweaveDB = new ArweaveDB(getPath('storage'));

  private infoDB = new Datastore({
    filename: getPath('storage/arweave-info.db'),
    autoload: true,
  });
  private peersDB = new Datastore({
    filename: getPath('storage/arweave-peers.db'),
    autoload: true,
  });

  constructor() {
    // Load the databases
    this.infoDB.find({}, (err: any, docs: ArweaveInfo[]) => {
      if (err) {
        console.log('info find err', err);
      }

      if (docs.length) {
        this._info = docs[0];
        this.trigger('info-updated', this._info);
      } else {
        this._info = {
          network: 'arweave.weaver.1',
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

      if (++this.loaded === 2) {
        this.sync().catch(console.log);
      }
    });

    this.peersDB.find({}, (err: any, docs: string[]) => {
      if (err) {
        console.log(err);
      } else if (docs.length) {
        this.peers = docs;
      }

      if (++this.loaded === 2) {
        this.sync().catch(console.log);
      }
    });

    // Start the server to handle requests
    this.startServer();
  }

  /*** Event handlers ***/
  on(evt: 'transactions-added' | 'info-updated' | 'block-added' | 'syncronized' | 'peers-ready', cb: Function) {
    let trigger = this._triggers.get(evt);
    if (trigger) {
      trigger.push(cb);
    } else {
      trigger = [cb];
    }

    this._triggers.set(evt, trigger);
  }

  private trigger(evt: 'transactions-added' | 'info-updated' | 'block-added' | 'syncronized' | 'peers-ready', params: any = null) {
    if (this._triggers.has(evt)) {
      this._triggers.get(evt).forEach(fn => {
        fn(params);
      });
    }
  }

  /*** Server ***/
  startServer() {
    this.server = restify.createServer();

    // Info
    this.server.get('/info', (req, res) => {
      res.json(this._info);
    });

    // Blocks
    this.server.get('/block/height/:height', async (req, res) => {
      const block = await this.getBlock(+req.params.height);
      if (block) {
        res.json(block);
      } else {
        res.send(404, 'Block not found.');
      }
    });

    // Transactions
    this.server.get('/tx/:txid', async (req, res) => {
      const transaction = await this.getTransaction(req.params.txid);
      if (transaction) {
        res.json(transaction);
      } else {
        res.send(404, 'Not Found.');
      }
    });

    // Data
    this.server.get('/:txid', async (req, res) => {
      let transaction: IArweaveTransaction = await this.getTransaction(req.params.txid);
      if (!transaction) {
        transaction = await this.getPeerTx(req.params.txid);
        if (!transaction) {
          return res.send(404, 'Not Found.');
        }
      }

      const html = Buffer.from(transaction.data, 'base64').toString('utf-8');
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': 'text/html',
      });
      res.write(html);
      res.end();
    });

    this.server.listen('1985');
  }

  /*** Getters ***/
  getInfo(): ArweaveInfo {
    return this._info;
  }

  getActivePeers(): string[] {
    return this.activePeers;
  }

  async getBlock(blockHeight: number): Promise<IArweaveBlock | boolean> {
    return await this.arweaveDB.getBlockByHeight(blockHeight);
  }

  async getTransaction(txid: string): Promise<IArweaveTransaction | boolean> {
    return await this.arweaveDB.getTransactionById(txid);
  }

  /*** Setters ***/
  private async addBlock(block: IArweaveBlock): Promise<boolean> {
    const added: boolean = await this.arweaveDB.addBlock(block);
    if (added) {
      this.trigger('block-added', block);
    }

    return added;
  }

  private async addTransaction(tx: IArweaveTransaction): Promise<boolean> {
    const added: boolean = await this.arweaveDB.addTransaction(tx);
    if (added) {
      this.trigger('transactions-added', [tx]);
    }

    return added;
  }

  private async addTransactions(txs: IArweaveTransaction[]): Promise<boolean> {
    let added = false;
    for (let i = 0, j = txs.length; i < j; i++) {
      added = await this.addTransaction(txs[i]);
      if (!added) {
        break;
      }
    }

    if (added) {
      this.trigger('transactions-added', txs);
    }

    return added;
  }

  private async updateInfo() {
    return new Promise(resolve => {
      this.infoDB.update({}, this._info, { upsert: true }, (err, numReplaced: number) => {
        if (err) {
          return resolve(null);
        }

        this.trigger('info-updated', this._info);
        resolve(numReplaced);
      });
    });
  }

  /*** Requests to peers ***/
  private async sync() {
    await this.activatePeers();

    // Get the updated peers list for the next request
    this.peers = await this.getPeerPeers();

    // Check if this is a first call
    const go = async (): Promise<any> => {
      return new Promise(async (resolve) => {
        this._info.height++;

        const block = await this.getPeerBlock(this._info.height);

        if (block === null) {
          this.trigger('syncronized', true);

          setTimeout(() => {
            this.sync().catch(console.log);
          }, this.syncTime);

          return resolve(null);
        }

        this.trigger('syncronized', false);
        this._info.current = block.indep_hash;

        if (block.txs.length) {
          const txs: IArweaveTransaction[] = await Promise.all(block.txs.map(async (txId) => await this.getPeerTx(txId)));
          await this.addTransactions(txs);
        }

        await this.addBlock(block);
        await this.updateInfo();

        resolve(go());
      });
    };

    await go();
  }

  private async getPeerBlock(blockHeight: number): Promise<IArweaveBlock> {
    return new Promise(async (resolve) => {
      const randIndex = Math.floor(Math.random() * this.activePeers.length);

      try {
        const res = await axios.get(`http://${this.activePeers[randIndex]}/block/height/${blockHeight}`);

        // Some unknown error ?
        if (!res.data) {
          console.log(this.activePeers.length);
          this.activePeers.splice(randIndex, 1);
          return resolve(this.getPeerBlock(blockHeight));
        }

        // Block height doesn't exists
        if (res.data === 'Block not found.') {
          return resolve(null);
        }

        resolve(res.data);
      } catch (e) {
        if (e.response && e.response.status && e.response.status >= 400) {
          return resolve(null);
        }

        console.log(e, this.activePeers.length);
        this.activePeers.splice(randIndex, 1);
        return resolve(this.getPeerBlock(blockHeight));
      }
    });
  }

  private async getPeerTx(txId: string): Promise<IArweaveTransaction> {
    return new Promise(async (resolve) => {
      const randIndex = Math.floor(Math.random() * this.activePeers.length);

      try {
        const res = await axios.get(`http://${this.activePeers[randIndex]}/tx/${txId}`);

        // Some unknown error ?
        if (!res.data || res.data === '') {
          console.log(this.activePeers.length);
          this.activePeers.splice(randIndex, 1);
          return resolve(this.getPeerTx(txId));
        }

        // Transaction doesn't exists
        if (res.data === 'Not Found.') {
          return resolve(null);
        }

        resolve(res.data);
      } catch (e) {
        if (e.response && e.response.status && e.response.status >= 400) {
          return resolve(null);
        }

        console.log('- Error. Retrying.');
        this.activePeers.splice(randIndex, 1);
        return resolve(this.getPeerTx(txId));
      }
    });
  }

  private async getPeerInfo(peer: string): Promise<ArweaveInfo> {
    const res = await axios.get(`http://${peer}`);
    if (!res.data) return null;

    return res.data;
  }

  private async getPeerPeers(): Promise<string[]> {
    return new Promise((async resolve => {
      const randIndex = Math.floor(Math.random() * this.activePeers.length);

      try {
        const res = await axios.get(`http://${this.activePeers[randIndex]}/peers`);

        // Some unknown error ?
        if (!res.data || !res.data.length) {
          console.log(this.activePeers.length);
          this.activePeers.splice(randIndex, 1);
          return resolve(this.getPeerPeers());
        }

        resolve(res.data);
      } catch (e) {
        console.log(e, this.activePeers.length);
        console.log('- Error. Retrying.');
        this.activePeers.splice(randIndex, 1);
        return resolve(this.getPeerPeers());
      }
    }));
  }

  /**
   * Even if we have hundreds of peers, we only "activate" a peer when it's up to date,
   * get at least 10 and continue looking while everything else is being done;
   * we need to cleanup all the non up to date nodes.
   */
  private async activatePeers() {
    const p: {height: number, peer: string}[] = [];

    const testPeer = async () => {
      return new Promise(async (resolve) => {
        if (p.length === 10) {
          resolve();
        } else if (p.length === 30) {
          return null;
        }

        const index = Math.floor(Math.random() * this.peers.length);

        this.getPeerInfo(this.peers[index]).then((peer: ArweaveInfo) => {
          if (!p.length) {
            p.push({ peer: this.peers[index], height: peer.height });
            return resolve(testPeer());
          }

          if (peer.height > p[0].height) {
            // Delete any peer that is smaller
            for (let i = 0, j = p.length; i < j; i++) {
              if (p[i].height < peer.height) {
                p.splice(i, 1);
                i--;
              }
            }
          }
          p.push({ peer: this.peers[index], height: peer.height });

          resolve(testPeer());
        }).catch(e => {
          this.peers.splice(index, 1);
          resolve(testPeer());
        });
      });
    };

    await testPeer();
    this.activePeers = p.map(a => a.peer);

    this.trigger('peers-ready');

    return this.activePeers;
  }
}
