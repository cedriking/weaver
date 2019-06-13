import * as restify from 'restify';
import IBlockRequest from '~/weaver-server/models/BlockRequest';
import axios, { AxiosResponse } from 'axios';
import { WeaverServer } from '~/weaver-server/WeaverServer';
import { IArweaveBlock } from 'arweavedb/lib/models';

export default class BlockController {
  private server: WeaverServer;

  constructor(server: WeaverServer) {
    this.server = server;
  }

  /*** GET Requests ***/
  public async getByHeight(req: restify.Request, res: restify.Response, next: restify.Next) {
    let block = await this.getBlock(+req.params.height);
    if (!block) {
      block = await this.getPeerBlock(+req.params.height);
      if (!block) {
        res.send(404, 'Block not found.');
        return next();
      }
    }

    res.json(block);
    next();
  }

  /*** POST Requests ***/
  public async post(req: restify.Request, res: restify.Response, next: restify.Next) {
    const block: IBlockRequest = req.body;

    let randIndex = this.server.peerController.getRandomPeerIndex();

    // Only send post requests to Arweave Nodes
    let found = false;
    while (!found) {
      const peer = this.server.peerController.getPeerByIndex(randIndex);
      if (peer.info === null || !peer.info.hasOwnProperty('client') || peer.info.client !== 'weaver') {
        found = true;
      } else {
        randIndex = this.server.peerController.getRandomPeerIndex();
      }
    }

    const url = this.server.peerController.getPeerUrlFromIndex(randIndex);

    try {
      const r: AxiosResponse = await axios.post(`${url}${req.url}`, block);
      console.log(r.data, req.headers.host);
      res.sendRaw(r.status, r.data);
    } catch (e) {
      next(e);
    }
  }

  /*** Getters ***/
  async getBlock(blockHeight: number): Promise<IArweaveBlock> {
    return await this.server.arweaveDB.getBlockByHeight(blockHeight);
  }

  private async getPeerBlock(blockHeight: number): Promise<IArweaveBlock> {
    return new Promise(async (resolve) => {
      const randIndex = this.server.peerController.getRandomPeerIndex();
      const url = this.server.peerController.getPeerUrlFromIndex(randIndex);

      try {
        const res = await axios.get(`${url}/block/height/${blockHeight}`);

        // Some unknown error ?
        if (!res.data) {
          this.server.peerController.removePeer(randIndex);
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

        this.server.peerController.removePeer(randIndex);
        return resolve(this.getPeerBlock(blockHeight));
      }
    });
  }

  /*** Setters ***/
  private async addBlock(block: IArweaveBlock): Promise<boolean> {
    const added: boolean = await this.server.arweaveDB.addBlock(block);
    if (added) {
      this.server.trigger('block-added', block);
    }

    return added;
  }

  public async update(): Promise<IArweaveBlock> {
    const nextHeight = this.server.infoController.getInfo().height + 1;
    const block: IArweaveBlock = await this.getPeerBlock(nextHeight);
    if (block !== null) {
      this.addBlock(block);
      this.server.infoController.update(nextHeight, block.indep_hash);
    }

    return block;
  }
}
