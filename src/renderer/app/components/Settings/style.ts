import styled, {css} from 'styled-components';
import {centerIcon} from "~/shared/mixins";
import {icons} from "~/renderer/app/constants";
import {Theme} from "~/renderer/app/models/theme";

export const Sections = styled.div`
  margin-left: 300px;
  width: calc(100% - 300px);
  display: flex;
  flex-flow: column;
  align-items: center;
`;

export const Title = styled.h1`
  font-weight: 100
`;

export const Buttons = styled.div`
  float: right;
`;

export const ListItem = styled.div`
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-align-items: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  padding: 0 24px;
  height: 48px;
  background-color: transparent;
`;

export const SettingsSection = styled.div`
  padding: 24px;
  background-color: rgba(255,255,255,0.08);
  margin-bottom: 24px;
  border-radius: 30px;
  overflow: hidden;
  padding: 8px 0px;
  margin-top: 48px;
  box-shadow: 5px 5px 33px 10px rgba(0,0,0,0.21)
`;

export const DropArrow = styled.div`
  ${centerIcon(24)};
  margin-left: 8px;
  height: 32px;
  width: 32px;
  background-image: url(${icons.down});
  border-radius: 50%;
  transition: 0.1s background-color;
  cursor: pointer;

  ${({ theme }: { theme?: Theme }) => css`
    filter: ${theme['overlay.foreground'] === 'light'
  ? 'invert(100%)'
  : 'none'};
  `}
`;
