import { observer } from 'mobx-react';
import * as React from 'react';

import store from '~/renderer/app/store';
import { StyledToolbar, Buttons, Separator } from './style';
import { NavigationButtons } from '../NavigationButtons';
import { Tabbar } from '../Tabbar';
import ToolbarButton from '../ToolbarButton';
import { icons } from '../../constants';
import { ipcRenderer } from 'electron';
import BrowserAction from '../BrowserAction';
import { Find } from '../Find';

const onUpdateClick = () => {
  ipcRenderer.send('update-install');
};

const onWalletDrag = (e: any) => {
  e.preventDefault();
  console.log('Wallet dragged');
  ipcRenderer.send('walletdrag', 'C:/Users/cedri_tn22u5y/Documents/arweave-keyfile.json');
};

@observer
class BrowserActions extends React.Component {
  public render() {
    const { selectedTabId } = store.tabGroups.currentGroup;

    return (
      <>
        {selectedTabId &&
          store.extensions.browserActions.map(item => {
            if (item.tabId === selectedTabId) {
              return <BrowserAction data={item} key={item.extensionId} />;
            }
            return null;
          })}
      </>
    );
  }
}

export const Toolbar = observer(() => {
  const { selectedTab } = store.tabs;

  let isWindow = false;
  let blockedAds: any = '';

  if (selectedTab) {
    isWindow = selectedTab.isWindow;
    blockedAds = selectedTab.blockedAds;
  }

  return (
    <StyledToolbar isHTMLFullscreen={store.isHTMLFullscreen}>
      <NavigationButtons />
      <Tabbar />
      <Find />
      <Buttons>
        <BrowserActions />
        {store.updateInfo.available && (
          <ToolbarButton icon={icons.download} onClick={onUpdateClick} />
        )}
        {store.extensions.browserActions.length > 0 && <Separator />}
        {!isWindow && (
          <BrowserAction
            size={18}
            style={{ marginLeft: 0 }}
            opacity={0.54}
            onDragStart={onWalletDrag}
            data={{
              badgeBackgroundColor: 'gray',
              badgeText: '',
              icon: icons.wallet,
              badgeTextColor: 'white',
            }}
          />
        )}
        <Separator />
        {!isWindow && (
          <BrowserAction
            size={18}
            style={{ marginLeft: 0 }}
            opacity={0.54}
            data={{
              badgeBackgroundColor: 'gray',
              badgeText: blockedAds > 0 ? blockedAds.toString() : '',
              icon: icons.shield,
              badgeTextColor: 'white',
            }}
          />
        )}
      </Buttons>
    </StyledToolbar>
  );
});
