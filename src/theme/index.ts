import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

const baseTokens: ThemeConfig['token'] = {
  colorPrimary:   '#2D6A4F',
  colorSuccess:   '#2D8A56',
  colorWarning:   '#C97C2A',
  colorError:     '#C2412C',
  colorInfo:      '#2A6FDB',
  borderRadius:   8,
  borderRadiusSM: 6,
  borderRadiusLG: 12,
  fontFamily:     '"Plus Jakarta Sans", system-ui, sans-serif',
  fontFamilyCode: '"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace',
};

export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...baseTokens,
    colorBgContainer:      '#FFFFFF',
    colorBgLayout:         '#F8FAF9',
    colorBgElevated:       '#FFFFFF',
    colorTextSecondary:    '#6B7B72',
    colorTextTertiary:     '#93A199',
    colorBorder:           '#E7ECE8',
    colorBorderSecondary:  '#D9E0DB',
    colorFillAlter:        '#F1F4F2',
    boxShadow:             '0 1px 0 rgba(13,31,26,.02), 0 1px 2px rgba(13,31,26,.04), 0 8px 24px -16px rgba(13,31,26,.10)',
  },
  components: {
    Table: {
      headerBg:    '#F1F4F2',
      borderColor: '#E7ECE8',
      headerColor: '#6B7B72',
      rowHoverBg:  'rgba(45,106,79,0.05)',
      fontSize:    13,
    },
    Button: {
      fontWeight:    500,
      primaryShadow: 'none',
      defaultShadow: 'none',
      dangerShadow:  'none',
      borderRadius:  8,
    },
    Input: {
      colorBorder:      '#D9E0DB',
      hoverBorderColor: '#52B788',
      activeShadow:     '0 0 0 3px rgba(45,106,79,0.12)',
      borderRadius:     8,
    },
    Select: {
      colorBorder:  '#D9E0DB',
      borderRadius: 8,
    },
    DatePicker: {
      colorBorder:  '#D9E0DB',
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
      boxShadow:      '0 1px 0 rgba(13,31,26,.02), 0 1px 2px rgba(13,31,26,.04), 0 8px 24px -16px rgba(13,31,26,.10)',
    },
    Form: {
      labelColor:    '#6B7B72',
      labelFontSize: 12,
    },
    Drawer: {
      colorBgElevated: '#FFFFFF',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg:  '#FFFFFF',
    },
  },
};

export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...baseTokens,
    colorBgContainer:      '#162A22',
    colorBgLayout:         '#0D1F1A',
    colorBgElevated:       '#1E3A2F',
    colorBorder:           '#243A30',
    colorBorderSecondary:  '#2E4A3D',
    colorText:             '#E8F5E9',
    colorTextSecondary:    '#B7CDBD',
    colorTextTertiary:     '#93A199',
    colorFillAlter:        '#112721',
    boxShadow:             '0 1px 0 rgba(13,31,26,.02), 0 1px 2px rgba(13,31,26,.04), 0 8px 24px -16px rgba(13,31,26,.10)',
  },
  components: {
    Table: {
      headerBg:    '#112721',
      borderColor: '#243A30',
      headerColor: '#8FA89A',
      rowHoverBg:  'rgba(183,228,199,0.06)',
    },
    Drawer: {
      colorBgElevated: '#162A22',
    },
    Modal: {
      contentBg: '#162A22',
      headerBg:  '#162A22',
    },
  },
};
