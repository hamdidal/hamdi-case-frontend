import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

const baseTokens: ThemeConfig['token'] = {
  colorPrimary:   '#2D6A4F',
  colorSuccess:   '#2D8A56',
  colorWarning:   '#C97C2A',
  colorError:     '#C2412C',
  colorInfo:      '#2A6FDB',
  borderRadius:   8,
  fontFamily:     '"Plus Jakarta Sans", system-ui, sans-serif',
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...baseTokens,
    colorBgContainer: '#FFFFFF',
    colorBgLayout:    '#F8FAF9',
    colorBgElevated:  '#FFFFFF',
  },
};

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...baseTokens,
    colorBgContainer: '#162A22',
    colorBgLayout:    '#0D1F1A',
    colorBgElevated:  '#1F3A2E',
  },
};
