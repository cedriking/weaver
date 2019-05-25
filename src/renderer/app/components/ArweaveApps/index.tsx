import * as React from 'react';
import { observer } from 'mobx-react';
import { Actions } from '../Overlay/style';
import store from '../../store';
import { Bubble } from '../Bubble';
import { onSiteClick } from '../../utils/dials';

export const ArweaveApps = observer(() => {
  return (
    <Actions>
      {store.arweaveApps.items.map(item => (
        <Bubble
          itemsPerRow={6}
          onClick={onSiteClick(`https://arweave.net/${item.linkId}`)}
          key={item.id}
          maxLines={1}
          iconSize={20}
          icon={item.appIcon}
        >
          {item.title}
        </Bubble>
      ))}
    </Actions>
  );
});
