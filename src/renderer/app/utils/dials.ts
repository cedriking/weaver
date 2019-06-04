import store from '../store';
import { arweaveDB } from '~/arweave';

export const onSiteClick = (url: string) => () => {
  const uri = url;
  if (!url.includes('://') && url.length >= 43) {
    if (!store.arweaveServer.peersReady) {
      url = `https://arweave.net/${url}`;
    } else if (store.arweaveServer.isRunningLocally) {
      url = `http://localhost:1985/${url}`;
    } else {
      const activePeers = arweaveDB.getActivePeers();
      const randIndex = Math.floor(Math.random() * activePeers.length);
      url = `http://${activePeers[randIndex]}/${url}`;
    }
  }

  const tab = store.tabs.selectedTab;

  if (!tab || store.overlay.isNewTab) {
    store.tabs.addTab({ url, active: true });
  } else {
    tab.url = uri;
    tab.callViewMethod('webContents.loadURL', url);
  }

  store.overlay.visible = false;
};
