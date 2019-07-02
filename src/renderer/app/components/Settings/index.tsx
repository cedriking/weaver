import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import AppsSection from '../AppsSection';
import { Buttons, Sections, SettingsSection, Title, ListItem } from './style';
import { NavigationDrawer } from '../NavigationDrawer';
import { Content, Container, Scrollable, DropArrow } from '../Overlay/style';
import { ContextMenu, ContextMenuItem } from '~/renderer/app/components/ContextMenu';
import { icons } from '~/renderer/app/constants';

const scrollRef = React.createRef<HTMLDivElement>();

const preventHiding = (e: any) => {
  e.stopPropagation();
};

store.settingsStore.currentDisplay = 'search_engine';

const onScroll = (e: any) => {
  const scrollPos = e.target.scrollTop;
  const scrollMax = e.target.scrollHeight - e.target.clientHeight - 256;

  if (scrollPos >= scrollMax) {
    store.arweaveApps.itemsLoaded += store.arweaveApps.getDefaultLoaded();
  }
};

const onBackClick = () => {
  scrollRef.current.scrollTop = 0;
  store.arweaveApps.resetLoadedItems();
};

/*** Search Engine ***/
let seMenuVisible = false;
const engineHex = '#585858c7';

const toggleSEMenu = (e: any) => {
  e.stopPropagation();
  store.settingsStore.searchEngineCtx = !store.settingsStore.searchEngineCtx;
};

const setEngineGoogle = () => {
  store.settingsStore.setSearchEngine('google');
  seMenuVisible = false;
  document.getElementById('ctx-item-g').style.backgroundColor = engineHex;
  document.getElementById('ctx-item-b').style.backgroundColor = '';
  document.getElementById('ctx-item-y').style.backgroundColor = '';
  document.getElementById('ctx-item-d').style.backgroundColor = '';
};
const setEngineBing = () => {
  store.settingsStore.setSearchEngine('bing');
  seMenuVisible = false;
  document.getElementById('ctx-item-g').style.backgroundColor = '';
  document.getElementById('ctx-item-b').style.backgroundColor = engineHex;
  document.getElementById('ctx-item-y').style.backgroundColor = '';
  document.getElementById('ctx-item-d').style.backgroundColor = '';
};
const setEngineYahoo = () => {
  store.settingsStore.setSearchEngine('yahoo');
  seMenuVisible = false;
  document.getElementById('ctx-item-g').style.backgroundColor = '';
  document.getElementById('ctx-item-b').style.backgroundColor = '';
  document.getElementById('ctx-item-y').style.backgroundColor = engineHex;
  document.getElementById('ctx-item-d').style.backgroundColor = '';
};
const setEngineDuckDuckGo = () => {
  store.settingsStore.setSearchEngine('duckduckgo');
  seMenuVisible = false;
  document.getElementById('ctx-item-g').style.backgroundColor = '';
  document.getElementById('ctx-item-b').style.backgroundColor = '';
  document.getElementById('ctx-item-y').style.backgroundColor = '';
  document.getElementById('ctx-item-d').style.backgroundColor = engineHex;
};

const MenuItem = observer(
  ({ selected, children, display, style }: { selected: boolean, children: any, display: any, style?: any }) => (
    <NavigationDrawer.Item
      selected={selected}
      onClick={() => (store.settingsStore.currentDisplay = display)}
    >
      {children}
    </NavigationDrawer.Item>
  ),
);

export const SearchEngines = observer(() => {
  return (
    <SettingsSection>
      <ListItem>
        <Title style={{ fontSize: '15px' }}>Search Engines</Title>
        <Buttons style={{ marginLeft: 'auto' }}>
          <DropArrow visible={true} onClick={toggleSEMenu} style={{ cursor: 'pointer' }} />
          <ContextMenu id="search-engine-dp" visible={store.settingsStore.searchEngineCtx} style={{ marginLeft: '-61px' }}>
            <ContextMenuItem icon={icons.search} onClick={setEngineGoogle} id="ctx-item-g">
              Google
            </ContextMenuItem>
            <ContextMenuItem onClick={setEngineYahoo} icon={icons.search} id="ctx-item-y">
              Yahoo
            </ContextMenuItem>
            <ContextMenuItem icon={icons.search} onClick={setEngineBing} id="ctx-item-b">
              Bing
            </ContextMenuItem>
            <ContextMenuItem icon={icons.search} onClick={setEngineDuckDuckGo}  id="ctx-item-d">
              DuckDuckGo
            </ContextMenuItem>
          </ContextMenu>
        </Buttons>
      </ListItem>
    </SettingsSection>
  );
});

export const Settings = observer(() => {
  return (
    <Container
      right
      onClick={preventHiding}
      visible={
        store.overlay.currentContent === 'settings' && store.overlay.visible
      }
    >
      <Scrollable onScroll={onScroll} ref={scrollRef}>
        <NavigationDrawer
          title="Settings"
          onBackClick={onBackClick}
        >
          <MenuItem selected={store.settingsStore.currentDisplay === 'search_engine'} display="search_engine">Search Engine</MenuItem>
          <MenuItem selected={store.settingsStore.currentDisplay === 'server_settings'} display="server_settings">Server Settings</MenuItem>
        </NavigationDrawer>
        <Sections>
          <Content>
            {store.settingsStore.currentDisplay === 'search_engine' && <SearchEngines />}
          </Content>
        </Sections>
      </Scrollable>
    </Container>
  );
});
