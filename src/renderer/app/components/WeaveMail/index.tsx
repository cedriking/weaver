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
import { Buttons, DropArrow } from '~/renderer/app/components/Settings/style';
import { ContextMenu, ContextMenuItem } from '~/renderer/app/components/ContextMenu';
import { WeaveMailItem } from '~/renderer/app/store/weavemail';
import { Item, Label } from '~/renderer/app/components/AppsSection/style';
import { Site, Time } from '~/renderer/app/components/WalletItem/style';
import { WalletItem } from '~/renderer/app/models';

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

const toggleComposeAddresses = (e: any) => {
  e.stopPropagation();

  store.weaveMailStore.composeCtx = !store.weaveMailStore.composeCtx;
};

export const setFrom = (e: any, wallet: WalletItem) => {
  e.preventDefault();

  store.weaveMailStore.compose.sender = wallet.title;
  store.weaveMailStore.compose.from = store.wallets.decrypt(store.wallets.items.find(item => wallet.title === item.title));

  store.weaveMailStore.composeCtx = false;
};

export const ComposeFrom = observer(() => {
  if (store.weaveMailStore.compose.sender === '' && store.wallets.defaultWallet !== null) {
    store.weaveMailStore.compose.sender = store.wallets.defaultWallet.title;
    store.weaveMailStore.compose.from = store.wallets.decrypt(store.wallets.defaultWallet);
  }

  return (
    <SettingsSection>
      <ListItem>
        <Title onClick={toggleComposeAddresses}>Sender: <strong>{store.weaveMailStore.compose.sender}</strong></Title>
        <Buttons style={{ marginLeft: 'auto' }}>
          <DropArrow onClick={toggleComposeAddresses} />
          <ContextMenu visible={store.weaveMailStore.composeCtx} style={{ marginLeft: '-320px', width: 'auto' }}>
            {store.wallets.items.map((item, i) => {
              return (<ContextMenuItem key={i} onClick={e => setFrom(e, item)}>{item.title}</ContextMenuItem>);
            })}
          </ContextMenu>
        </Buttons>
      </ListItem>
    </SettingsSection>
  );
});

export const ShowCompose = observer((props) => {
  return (
    <>
      <ComposeFrom />

      <SettingsSection>
        <ListItem>
          <Title htmlFor="compose-to">Recipient:</Title>
          <Input id="compose-to" value={store.weaveMailStore.compose.to} onChange={(e) => store.weaveMailStore.compose.to = e.target.value} />
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
          <TextArea id="compose-msg" style={{ height: '100px' }} onChange={(e) => store.weaveMailStore.compose.message = e.target.value} onInput={onInput} value={store.weaveMailStore.compose.message} />
        </ListItem>
      </SettingsSection>

      <SettingsSection>
        <ListItem>
          <Title htmlFor="compose-balance">Send Balance:</Title>
          <Input type="number" id="compose-balance" value={store.weaveMailStore.compose.balance} onChange={(e) => store.weaveMailStore.compose.balance = e.target.value} />
        </ListItem>
      </SettingsSection>

      <ListItem style={{ marginBottom: '50px' }}>
        <Button background="black" onClick={(e) => store.weaveMailStore.sendMessage()}>Send Message</Button>
        <Button background="black" onClick={(e) => store.weaveMailStore.clearCompose()}>Cancel</Button>
      </ListItem>
    </>
  );
});

const mailItemClick = (d: any) => {
  console.log(d);
};

const MailItem = observer(({ data }: { data: WeaveMailItem }) => {
  return (
    <ListItem key={data.id} onClick={e => mailItemClick(data)}>
      <Title>{data.subject}</Title>
      <Site>{data.from}</Site>
      <Time>{data.tdQty}</Time>
    </ListItem>
  );
});

const MailSection = observer(({ data }: { data: { label?: string; items?: WeaveMailItem[] } }) => {
  return (
    <Item>
      <Label>{data.label}</Label>
      {data.items.map((item: WeaveMailItem) => (
        <MailItem key={item.id} data={item} />
      ))}
    </Item>
  );
});

const ShowInbox = observer((props) => {
  if (!store.weaveMailStore.wallets.length) {
    store.weaveMailStore.wallets = store.wallets.items;
    store.weaveMailStore.walletsData = store.wallets.items.map(wallet => store.wallets.decrypt(wallet));
  }

  console.log(props);

  return (
    <Sections>
      <Content>
        {store.weaveMailStore.sections.map(data => (
          <MailSection data={data} key={data.label} />
        ))}
      </Content>
    </Sections>
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
