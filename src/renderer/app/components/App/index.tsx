import { observer } from 'mobx-react';
import * as React from 'react';
import { createGlobalStyle, ThemeProvider } from 'styled-components';

import { Style } from '~/renderer/app/style';
import { Toolbar } from '../Toolbar';
import { ipcRenderer } from 'electron';
import { Line, StyledApp } from './style';
import { WindowsButtons } from '../WindowsButtons';
import { platform } from 'os';
import { Overlay } from '../Overlay';
import store from '../../store';
import * as Arweave from 'arweave/node';

const GlobalStyle = createGlobalStyle`${Style}`;

window.onbeforeunload = () => {
  ipcRenderer.send('browserview-clear');
};

export const arweave = Arweave.init({ host: 'arweave.net', port: 443, protocol: 'https' });

export const App = observer(() => {
  return (
    <ThemeProvider theme={store.theme}>
      <StyledApp>
        <GlobalStyle />
        <Toolbar />
        <Line />
        <Overlay />
        {platform() !== 'darwin' && <WindowsButtons />}
      </StyledApp>
    </ThemeProvider>
  );
});
