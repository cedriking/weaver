import { ipcMain } from 'electron';
import { AppWindow } from '../app-window';

export let weaverServerLocalLoad = false;
export let weaverServerPeersReady = false;
export let weaverServerStarted = false;

export const arweaveServerService = (appWindow: AppWindow) => {
  ipcMain.on('weaver-server-synced', (syncronized: boolean) => {
    weaverServerLocalLoad = syncronized;
  });

  ipcMain.on('weaver-server-started', () => {
    weaverServerStarted = true;
  });

  ipcMain.on('weaver-server-loaded', () => {
    weaverServerPeersReady = true;
  });
};
