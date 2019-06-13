import { IArweaveBlock } from 'arweavedb/lib/models';

export interface INewBlock extends IArweaveBlock {
  hash_list: string[];
}

export default interface IBlockRequest {
  block_data_segment: string;
  new_block: INewBlock;
}
