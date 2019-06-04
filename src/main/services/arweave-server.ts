import { arweaveDB } from '~/arweave';
import { ipcMain } from 'electron';
import { AppWindow } from '../app-window';

export let arweaveServerLocalLoad = false;
export let arweaveServerPeersReady = false;

export const arweaveServerService = (appWindow: AppWindow) => {
  ipcMain.on('arweave-server-synced', (syncronized: boolean) => {
    arweaveServerLocalLoad = syncronized;
  });

  ipcMain.on('arweave-server-loaded', () => {
    arweaveServerPeersReady = true;
  });

  /*ipcMain.on('update-check', () => {
    if (process.env.ENV !== 'dev') {
      // autoUpdater.checkForUpdates();
    }
  });*/

  /*autoUpdater.on('update-downloaded', ({ version }) => {
    appWindow.webContents.send('update-available', version);
  });*/
};
