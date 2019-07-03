import * as React from 'react';
import { StyledNavigationDrawerItem, Icon } from './style';

export const NavigationDrawerItem = ({
  children,
  selected,
  onClick,
  icon,
  style,
}: {
  children: any;
  selected?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  icon?: string;
  style?: any;
}) => {
  return (
    <StyledNavigationDrawerItem selected={selected} onClick={onClick} style={style}>
      {icon && <Icon style={{ backgroundImage: `url(${icon})` }} />}
      {children}
    </StyledNavigationDrawerItem>
  );
};
