import axios from 'axios';
import * as restify from 'restify';
import { getPath } from '~/shared/utils/paths';
import { ArweaveDB } from 'arweavedb';
import InfoController from '~/weaver-server/controllers/InfoController';
import PeerController from '~/weaver-server/controllers/PeerController';
import TransactionController from '~/weaver-server/controllers/TransactionController';
import BlockController from '~/weaver-server/controllers/BlockController';
import {AxiosResponse} from 'axios';

export class WeaverServer {
  private _triggers: Map<string, Function[]> = new Map();
  private server: restify.Server;

  private syncTime = 2 * 60000; // 2 minutes

  private _arweaveDB = new ArweaveDB(getPath('storage'));

  private _infoController: InfoController;
  private _peerController: PeerController;
  private _transactionController: TransactionController;
  private _blockController: BlockController;

  get arweaveDB(): ArweaveDB {
    return this._arweaveDB;
  }
  get infoController(): InfoController {
    return this._infoController;
  }
  get peerController(): PeerController {
    return this._peerController;
  }
  get transactionController(): TransactionController {
    return this._transactionController;
  }
  get blockController(): BlockController {
    return this._blockController;
  }

  constructor() {
    this._infoController = new InfoController(this);
    this._peerController = new PeerController(this);
    this._transactionController = new TransactionController(this);
    this._blockController = new BlockController(this);

    this.init();
  }

  private async init() {
    // Load the databases
    await this._infoController.init();
    await this._peerController.init();

    // Start the server to handle requests
    this.startServer();
    this.sync();
  }

  /*** Event handlers ***/
  on(evt: 'transactions-added' | 'info-updated' | 'block-added' | 'syncronized' | 'peers-ready' | 'server-started', cb: Function) {
    let trigger = this._triggers.get(evt);
    if (trigger) {
      trigger.push(cb);
    } else {
      trigger = [cb];
    }

    this._triggers.set(evt, trigger);
  }

  trigger(evt: 'transactions-added' | 'info-updated' | 'block-added' | 'syncronized' | 'peers-ready' | 'server-started', params: any = null) {
    if (this._triggers.has(evt)) {
      this._triggers.get(evt).forEach(fn => {
        fn(params);
      });
    }
  }

  /*** Server ***/
  startServer() {
    this.server = restify.createServer();

    // Plugins
    this.server.pre(restify.plugins.cpuUsageThrottle({}));
    this.server.pre(restify.plugins.pre.dedupeSlashes());

    this.server.use(restify.plugins.acceptParser(this.server.acceptable));
    this.server.use(restify.plugins.dateParser());
    this.server.use(restify.plugins.queryParser());
    this.server.use(restify.plugins.jsonp());
    this.server.use(restify.plugins.bodyParser());
    this.server.use(restify.plugins.gzipResponse());

    // Allow octet data
    this.server.use((req, res, next) => {
      if (req.body === undefined) {
        const buffer: any[] = [];
        req.on('data', (chunk) => {
          buffer.push(chunk);
        });

        req.once('end', () => {
          const concated = Buffer.concat(buffer);
          req.body = concated.toString('utf8'); // change it to meet your needs (gzip, json, etc)
          next()
        });
      } else {
        next();
      }
    });

    this.infoRoute();
    this.peersRoute();
    this.transactionsRoute();
    this.blocksRoute();

    this.server.get('/*', (req, res, next) => {
      console.log('GET', req.url, req.params, req.query, req.body, req.getContentType(), req.headers);

      const rPeerIndex = this.peerController.getRandomPeerIndex();
      const url = this.peerController.getPeerUrlFromIndex(rPeerIndex);

      axios.get(`${url}${req.url}`).then((r: AxiosResponse) => {
        res.send(r.data);

        next();
      }).catch((e) => {
        next(e);
      });
    });

    this.server.post('/*', (req, res, next) => {
      console.log('POST', req.url, req.params, req.query, req.body, req.getContentType(), req.headers);

      const rPeerIndex = this.peerController.getRandomPeerIndex();
      const url = this.peerController.getPeerUrlFromIndex(rPeerIndex);

      axios.post(`${url}${req.url}`, req.body).then((r: AxiosResponse) => {
        res.send(r.data);

        next();
      }).catch((e) => {
        next(e);
      });
    });

    this.server.listen('1984', () => {
      console.log('listening at %', this.server.url);
      this.trigger('server-started');
    });

  }

  /*** Routes ***/
  private infoRoute() {
    /*** GET ***/
    this.server.get('/', (req, res, next) => this._infoController.get(req, res, next));
    this.server.get('/info', (req, res, next) => this._infoController.get(req, res, next));
  }

  private peersRoute() {
    /*** GET ***/
    this.server.get('/peers', (req, res, next) => this._peerController.get(req, res, next));
  }

  private transactionsRoute() {
    /*** GET ***/
    this.server.get('/tx/:txid', (req, res, next) => this._transactionController.get(req, res, next));
    this.server.get('/:txid', (req, res, next) => this._transactionController.getData(req, res, next));
  }

  private blocksRoute() {
    /*** GET ***/
    this.server.get('/block/height/:height', (req, res, next) => this._blockController.getByHeight(req, res, next));

    /*** POST ***/
    this.server.post('/block', (req, res, next) => this._blockController.post(req, res, next));
  }

  /*** Requests to peers ***/
  private async sync() {
    await this.peerController.update();

    // Check if this is a first call
    const go = async (): Promise<any> => {
      return new Promise(async (resolve) => {
        const block = await this.blockController.update();

        if (block === null) {
          this.trigger('syncronized', true);

          setTimeout(() => {
            this.sync().catch(console.log);
          }, this.syncTime);

          return resolve(null);
        }

        this.trigger('syncronized', false);

        if (block.txs.length) {
          await this.transactionController.addMany(block.txs);
        }

        resolve(go());
      });
    };

    await go();
  }
}
