import * as React from 'react';
import { observer } from 'mobx-react';

import store from '../../store';
import WalletSection from '../WalletSection';
import { Sections } from './style';
import { NavigationDrawer } from '../NavigationDrawer';
import { Content, Container, Scrollable } from '../Overlay/style';
import { SelectionDialog } from '../SelectionDialog';
import {icons} from '~/renderer/app/constants';

const scrollRef = React.createRef<HTMLDivElement>();

const preventHiding = (e: any) => {
  e.stopPropagation();
};

const onScroll = (e: any) => {
  const scrollPos = e.target.scrollTop;
  const scrollMax = e.target.scrollHeight - e.target.clientHeight - 256;

  if (scrollPos >= scrollMax) {
    store.wallets.itemsLoaded += store.wallets.getDefaultLoaded();
  }
};

const onDeleteClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  store.wallets.deleteSelected();
};

const onCancelClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  store.wallets.selectedItems = [];
};

const onSetDefaultClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  store.wallets.defaultSelected();
};

const onBackClick = () => {
  scrollRef.current.scrollTop = 0;
  store.wallets.resetLoadedItems();
};

const onDragOver = (e: any) => {
  e.stopPropagation();
  e.preventDefault();

  e.dataTransfer.dropEffect = 'copy';
};
const onDrop = async (e: any) => {
  e.stopPropagation();
  e.preventDefault();

  const files: FileList = e.dataTransfer.files;

  for (let i = 0, j = files.length; i < j; i++) {
    const file = files.item(i);
    if (file.type === 'application/json') {
      await store.wallets.addFile(file);
    }
  }

};

const WalletSections = observer(() => {
  return (
    <Sections>
      <Content>
        <WalletSection items={store.wallets.items} />
      </Content>
    </Sections>
  );
});

const MenuItem = observer(
  ({ cat, children }: { cat: string; children: any }) => (
    <NavigationDrawer.Item>
      {children}
    </NavigationDrawer.Item>
  ),
);

const setWalletPassword = (e: any) => {
  store.wallets.changePassword(e.target.value);
};

export const Wallets = observer(() => {
  const { length } = store.wallets.selectedItems;

  return (
    <Container
      right
      onClick={preventHiding}
      visible={
        store.overlay.currentContent === 'wallets' && store.overlay.visible
      }
    >
      <Scrollable onScroll={onScroll} ref={scrollRef}>
        <NavigationDrawer
          title="My Wallets"
          onBackClick={onBackClick}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <NavigationDrawer.Item>Drag and drop your JSON wallet here</NavigationDrawer.Item>
          <div style={{ flex: 1 }} />
          <NavigationDrawer.Item>Always keep a copy of your wallets</NavigationDrawer.Item>
        </NavigationDrawer>
        <input type="password" value={store.wallets.walletPassword} onChange={setWalletPassword} style={{
          marginTop: 50,
          width: '50%',
          marginLeft: 300,
          padding: 10,
        }} />
        <WalletSections />
        <SelectionDialog
          visible={length > 0}
          amount={length}
          onDeleteClick={onDeleteClick}
          onSetDefaultClick={onSetDefaultClick}
          onCancelClick={onCancelClick}
        />
      </Scrollable>
    </Container>
  );
});
