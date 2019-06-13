import axios, { AxiosResponse } from 'axios';
import * as restify from 'restify';
import { WeaverServer } from '~/weaver-server/WeaverServer';
import { IArweaveTransaction } from 'arweavedb/lib/models';

export default class TransactionController {
  private server: WeaverServer;

  constructor(server: WeaverServer) {
    this.server = server;
  }

  /*** GET Requests ***/
  public async get(req: restify.Request, res: restify.Response, next: restify.Next) {
    let transaction = await this.getTransaction(req.params.txid);
    if (!transaction) {
      transaction = await this.getPeerTx(req.params.txid);
      if (!transaction) {
        res.send(404, 'Not Found.');
        return next();
      }
    }

    res.json(transaction);
    next();
  }

  public async getData(req: restify.Request, res: restify.Response, next: restify.Next) {
    let transaction = await this.getTransaction(req.params.txid);
    if (!transaction) {
      transaction = await this.getPeerTx(req.params.txid);
      if (!transaction) {
        res.send(404, 'Not Found.');
        return next();
      }
    }

    const tags = await this.getTags(transaction);

    // @ts-ignore
    const html = Buffer.from(transaction.data, 'base64').toString('utf-8');
    const contentType = tags.find((t: { name: string, value: string }) => t.name === 'Content-Type').value;

    if (contentType) {
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(html),
        'Content-Type': contentType,
      });
    }

    res.write(html);
    res.end();
    next();
  }

  /*** POST Requests ***/
  public async post(req: restify.Request, res: restify.Response, next: restify.Next) {
    const transaction: IArweaveTransaction = req.body;

    axios.post(`https://arweave.net${req.url}`, transaction).then((r: AxiosResponse) => {
      // tslint:disable-next-line:no-console
      console.log(r.data);
      res.sendRaw(r.status, r.data);

      next();
    }).catch((e:any) => {
      next(e);
    });
  }

  /*** Getters ***/
  private async getTransaction(txid: string): Promise<IArweaveTransaction> {
    return await this.server.arweaveDB.getTransactionById(txid);
  }

  private async getPeerTx(txId: string): Promise<IArweaveTransaction> {
    return new Promise(async (resolve) => {
      const randIndex = this.server.peerController.getRandomPeerIndex();
      const url = this.server.peerController.getPeerUrlFromIndex(randIndex);

      try {
        const res: AxiosResponse = await axios.get(`${url}/tx/${txId}`);

        // Some unknown error ?
        if (!res.data || res.data === '') {
          this.server.peerController.removePeer(randIndex);
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
        this.server.peerController.removePeer(randIndex);
        return resolve(this.getPeerTx(txId));
      }
    });
  }

  /*** Setters ***/
  private async addTransaction(tx: IArweaveTransaction): Promise<boolean> {
    const added: boolean = await this.server.arweaveDB.addTransaction(tx);
    if (added) {
      this.server.trigger('transactions-added', [tx]);
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
      this.server.trigger('transactions-added', txs);
    }

    return added;
  }

  public async addMany(transactions: string[]) {
    const txs: IArweaveTransaction[] = await Promise.all(transactions.map(async (txId) => await this.getPeerTx(txId)));

    return await this.addTransactions(txs);
  }

  // Utils
  private async getTags(transaction: IArweaveTransaction) {
    const tags = transaction.tags.map(tag => {
      const name = window.atob(tag['name']);
      const value = window.atob(tag['value']);

      return { name, value };
    });

    return tags;
  }
}
