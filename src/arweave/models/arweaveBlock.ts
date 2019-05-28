export interface ArweaveBlock {
  nonce: string;
  previous_block: string;
  timestamp: number;
  last_retarget: number;
  diff: number;
  height: number;
  hash: string;
  indep_hash: string;
  txs: string[];
  wallet_list: string;
  reward_addr: string;
  tags: {[key: string]: string}[];
  reward_pool: number;
  weave_size: number;
  block_size: number;
}
