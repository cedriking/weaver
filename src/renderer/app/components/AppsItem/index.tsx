import * as React from 'react';
import { observer } from 'mobx-react';

import store from '../../store';
import { HistoryItem } from '../../models';
import { Favicon, Title, Site } from './style';
import { ListItem } from '../ListItem';
import { ArweaveappItem } from '../../models/arweaveapp-item';

const onClick = (item: HistoryItem) => (e: React.MouseEvent) => {
  if (!e.ctrlKey) return;

  const index = store.arweaveApps.selectedItems.indexOf(item._id);

  if (index === -1) {
    store.arweaveApps.selectedItems.push(item._id);
  } else {
    store.arweaveApps.selectedItems.splice(index, 1);
  }
};

const onTitleClick = (url: string) => (e: React.MouseEvent) => {
  if (!e.ctrlKey) {
    store.tabs.addTab({ url, active: true });
    store.overlay.visible = false;
  }
};

export default observer(({ data }: { data: ArweaveappItem }) => {
  const selected = store.arweaveApps.selectedItems.includes(data.id);

  return (
    <ListItem key={data.id} onClick={onClick(data)} selected={selected}>
      <Favicon
        style={{
          backgroundImage: `url(${data.appIcon})`,
        }}
      />
      <Title onClick={onTitleClick(`https://arweave.net/${data.linkId}`)}>{data.title}</Title>
      <Site>{data.linkId}</Site>
    </ListItem>
  );
});
