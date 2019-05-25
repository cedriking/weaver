import * as React from 'react';
import { observer } from 'mobx-react';

import store from '../../store';
import AppsSection from '../AppsSection';
import { Sections } from './style';
import { NavigationDrawer } from '../NavigationDrawer';
import { Content, Container, Scrollable } from '../Overlay/style';
import { SelectionDialog } from '../SelectionDialog';

const scrollRef = React.createRef<HTMLDivElement>();

const preventHiding = (e: any) => {
  e.stopPropagation();
};

const onScroll = (e: any) => {
  const scrollPos = e.target.scrollTop;
  const scrollMax = e.target.scrollHeight - e.target.clientHeight - 256;

  if (scrollPos >= scrollMax) {
    store.arweaveApps.itemsLoaded += store.arweaveApps.getDefaultLoaded();
  }
};

const onInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
  store.arweaveApps.search(e.currentTarget.value);
};

const onCancelClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  store.arweaveApps.selectedItems = [];
};

const onDeleteClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  store.arweaveApps.deleteSelected();
};

const onBackClick = () => {
  scrollRef.current.scrollTop = 0;
  store.arweaveApps.resetLoadedItems();
};

const AppsSections = observer(() => {
  return (
    <Sections>
      <Content>
        {store.arweaveApps.sections.map(data => (
          <AppsSection data={data} key={data.label} />
        ))}
      </Content>
    </Sections>
  );
});

const MenuItem = observer(
  ({ cat, children }: { cat: string; children: any }) => (
    <NavigationDrawer.Item
      onClick={() => (store.arweaveApps.selectedCategory = cat)}
      selected={store.arweaveApps.selectedCategory === cat}
    >
      {children}
    </NavigationDrawer.Item>
  ),
);

export const Apps = observer(() => {
  const { length } = store.arweaveApps.selectedItems;

  return (
    <Container
      right
      onClick={preventHiding}
      visible={
        store.overlay.currentContent === 'arweaveapps' && store.overlay.visible
      }
    >
      <Scrollable onScroll={onScroll} ref={scrollRef}>
        <NavigationDrawer
          title="Arweave Apps"
          search
          onSearchInput={onInput}
          onBackClick={onBackClick}
        >
          <MenuItem cat="all">All</MenuItem>
          {store.arweaveApps.categories.map((cat, i) => {
            return (<MenuItem key={i} cat={cat.toLowerCase()}>{cat}</MenuItem>);
          })}
        </NavigationDrawer>
        <AppsSections />
        <SelectionDialog
          visible={length > 0}
          amount={length}
          onDeleteClick={onDeleteClick}
          onCancelClick={onCancelClick}
        />
      </Scrollable>
    </Container>
  );
});
