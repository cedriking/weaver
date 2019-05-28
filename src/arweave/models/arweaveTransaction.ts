export interface ArweaveTransaction {
  id: string;
  last_tx: string;
  owner: string;
  tags?: {[key: string]: string}[],
  target?: string;
  quantity?: string;
  data?: string;
  reward: string;
  signature: string;
}
