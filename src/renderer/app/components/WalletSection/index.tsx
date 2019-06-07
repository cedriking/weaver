import * as React from 'react';

import WalletItems from '../WalletItem';

import { Item, Label } from './style';
import { WalletItem } from '../../models';

export default ({ items }: {items: WalletItem[]}) => {
  return (
    <Item>
      <Label>My Wallets</Label>
      {items.map(item => (
        <WalletItems key={item._id} data={item} />
      ))}
    </Item>
  );
};
