import * as React from 'react';
import { observer } from 'mobx-react';

import store from '../../store';
import { WalletItem } from '../../models';
import { Remove, Title, Site } from './style';
import { ListItem } from '../ListItem';

const onClick = (item: WalletItem) => (e: React.MouseEvent) => {
  if (!e.ctrlKey) return;

  const index = store.wallets.selectedItems.indexOf(item._id);

  if (index === -1) {
    store.wallets.selectedItems.push(item._id);
  } else {
    store.wallets.selectedItems.splice(index, 1);
  }
};

const onRemoveClick = (item: WalletItem) => () => {
  store.wallets.removeItem(item._id);
};

export default observer(({ data }: { data: WalletItem }) => {
  const selected = store.wallets.selectedItems.includes(data._id);

  return (
    <ListItem key={data._id} onClick={onClick(data)} selected={selected}>
      <Title>{data.title}</Title>
      <Site>{data.balance}</Site>
      <Remove onClick={onRemoveClick(data)} />
    </ListItem>
  );
});
