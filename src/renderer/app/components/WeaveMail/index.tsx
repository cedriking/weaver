import * as React from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import { Sections, SettingsSection, Title, ListItem, TextArea, StyledButton } from './style';
import { NavigationDrawer } from '../NavigationDrawer';
import { Content, Container, Scrollable } from '../Overlay/style';
import { icons } from '~/renderer/app/constants';
import { Input } from '~/renderer/app/components/SearchBox/style';
import { StyledLabel } from '~/renderer/components/Button/styles';
import Ripple from '~/renderer/components/Ripple';

interface Props {
  background?: string;
  foreground?: string;
  type?: 'contained' | 'outlined';
  children?: any;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  style?: any;
}

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

const onSearchInput = () => {};

const onBackClick = () => {
  scrollRef.current.scrollTop = 0;
  store.arweaveApps.resetLoadedItems();
};

const onInput = (e: any) => {
  e.target.style.height = '100px';
  let height: number = e.target.scrollHeight;

  if (height < 100) {
    height = 100;
  }

  e.target.style.height = `${height}px`;
};

export const Button = ({
  background,
  foreground,
  type,
  onClick,
  children,
  style,
}: Props) => (
  <StyledButton
    background={background}
    foreground={foreground}
    type={type}
    onClick={onClick}
    style={style}
  >
    <StyledLabel>{children}</StyledLabel>
    <Ripple color={foreground || '#fff'} />
  </StyledButton>
);

export const ShowCompose = observer((props) => {
  console.log(props);

  return (
    <>
      <SettingsSection>
        <ListItem>
          <Title htmlFor="compose-to">Recipient:</Title>
          <Input id="compose-to" value={store.weaveMailStore.compose.to} onChange={(e) => store.weaveMailStore.compose.to = e.target.value} placeholder="BPr7vrFduuQqqVMu_tftxsScTKUq9ke0rx4q5C9ieQU" />
        </ListItem>
      </SettingsSection>

      <SettingsSection>
        <ListItem>
          <Title htmlFor="compose-subject">Subject:</Title>
          <Input id="compose-subject" value={store.weaveMailStore.compose.subject} onChange={(e) => store.weaveMailStore.compose.subject = e.target.value} />
        </ListItem>
      </SettingsSection>

      <SettingsSection style={{ overflow: '-webkit-paged-x' }}>
        <ListItem style={{ display: 'block' }}>
          <Title htmlFor="compose-msg" style={{ margin: '15px 0', display: 'block' }}>Message:</Title>
          <TextArea id="compose-msg" style={{ height: '100px' }} onInput={onInput}>{store.weaveMailStore.compose.message}</TextArea>
        </ListItem>
      </SettingsSection>

      <SettingsSection>
        <ListItem>
          <Title htmlFor="compose-balance">Send Balance:</Title>
          <Input id="compose-balance" value={store.weaveMailStore.compose.balance} onChange={(e) => store.weaveMailStore.compose.balance = +e.target.value} />
        </ListItem>
      </SettingsSection>

      <ListItem style={{ marginBottom: '50px' }}>
        <Button background="black" onClick={(e) => console.log(e)}>Send Message</Button>
        <Button background="black" onClick={(e) => console.log(e)}>Cancel</Button>
      </ListItem>
    </>
  );
});

export const ShowInbox = observer((props) => {
  console.log(props);

  return (
    <SettingsSection>
      <ListItem>
        <Title style={{ fontSize: '15px' }}>Hello World</Title>
      </ListItem>
    </SettingsSection>
  );
});

const MenuItem = observer(
  ({ selected, children, display, icon, style }: { selected: boolean; children: any; display: string, icon?: any, style?: any }) => (
    <NavigationDrawer.Item
      selected={selected}
      icon={icon}
      onClick={() => (store.weaveMailStore.current = display)}
      style={style}
    >
      {children}
    </NavigationDrawer.Item>
  ),
);

export const WeaveMail = observer(() => {
  return (
    <Container
      right
      onClick={preventHiding}
      visible={
        store.overlay.currentContent === 'weavemail' && store.overlay.visible
      }
    >
      <Scrollable onScroll={onScroll} ref={scrollRef}>
        <NavigationDrawer
          title="WeaveMail"
          search
          onSearchInput={onSearchInput}
          onBackClick={onBackClick}
        >
          <MenuItem selected={store.weaveMailStore.current === 'inbox'} display="inbox">Inbox</MenuItem>
          {store.wallets.items.map((wallet, i) => {
            return (<MenuItem key={i} selected={store.weaveMailStore.current === wallet.title} display={wallet.title} style={{ fontSize: '9px' }}>{wallet.title}</MenuItem>);
          })}
          <div style={{ flex: 1 }} />
          <MenuItem icon={icons.edit} selected={store.weaveMailStore.current === 'compose'} display="compose">
            Compose
          </MenuItem>
        </NavigationDrawer>
        <Sections>
          <Content>
            {store.weaveMailStore.current === 'compose' && <ShowCompose />}
            {store.weaveMailStore.current === 'inbox' && <ShowInbox show="all" />}
          </Content>
        </Sections>
      </Scrollable>
    </Container>
  );
});
