import { WordArray } from 'crypto-js';

export interface WalletItem {
  _id?: string;
  title?: string;
  balance?: number;
  default?: boolean;
  hovered?: boolean;
  filepath?: string;
}
