import styled, { css } from 'styled-components';
import { centerIcon } from '~/shared/mixins';
import { icons } from '~/renderer/app/constants';
import { Theme } from '~/renderer/app/models/theme';
import { transparency } from '~/renderer/constants';

interface StyledButtonProps {
  background: string;
  foreground: string;
  type?: 'contained' | 'outlined';
}

export const Sections = styled.div`
  margin-left: 300px;
  width: calc(100% - 300px);
  display: flex;
  flex-flow: column;
  align-items: center;
`;

export const Title = styled.label`
  font-weight: 100;
  font-size: 15px;
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

export const TextArea = styled.textarea`
  height: 100%;
  flex: 1;
  width: 100%;
  background-color: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 16px;
  margin-left: 12px;
  margin-right: 16px;
  font-family: Arial;
  resize: none;

  ${({ theme }: { theme?: Theme }) => css`
    color: ${theme['overlay.foreground'] === 'light'
      ? 'white'
      : `rgba(0, 0, 0, ${transparency.text.high})`};

    &::placeholder {
      color: rgba(255, 255, 255, 0.54);

      color: ${theme['overlay.foreground'] === 'light'
        ? `rgba(255, 255, 255, ${transparency.text.medium})`
        : `rgba(0, 0, 0, ${transparency.text.medium})`};
    }
  `}
`;

export const StyledButton = styled.div`
  min-width: 88px;
  width: fit-content;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  padding: 0 10px;
  margin: 20px 10px;
  flex: 1;

  &::before {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0;
    position: absolute;
    will-change: opacity;
    transition: 0.2s opacity;
  }

  &:hover::before {
    opacity: 0.12;
  }

  ${({ background, foreground, type }: StyledButtonProps) => css`
    color: ${foreground || '#fff'};
    border: ${type === 'outlined'
      ? `1px solid ${background || '#2196F3'}`
      : 'unset'};
    background-color: ${type === 'outlined'
      ? 'transparent'
      : background || '#2196F3'};

    &::before {
      background-color: ${foreground || '#fff'};
    }
  `};
`;
