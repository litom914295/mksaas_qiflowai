import importedCompassThemes, { importedThemeKeys } from './themes.generated';

export interface CompassLayer {
  name: string | string[];
  startAngle?: number;
  fontSize?: number;
  textColor?: string | string[];
  vertical?: boolean;
  togetherStyle?: 'empty' | 'equally';
  data: string[] | string[][];
  shape?: 'circle' | 'polygon';
}

export interface CompassTheme {
  info: {
    id: number | string;
    name: string;
    preview?: string;
  };
  animation?: {
    enable: boolean;
    duration?: number;
    delay?: number;
  };
  rotate: number;
  autoFontSize?: boolean;
  isShowScale?: boolean;
  compassSize: {
    width: number;
    height: number;
    tianChiRadius?: number;
  };
  latticeFill?: Array<[number, number, string?, string?]>;
  scaleStyle: {
    minLineHeight: number;
    midLineHeight: number;
    maxLineHeight: number;
    numberFontSize?: number;
  };
  line: {
    borderColor: string;
    scaleColor: string;
    scaleHighlightColor: string;
  };
  isShowTianxinCross?: boolean;
  tianxinCrossWidth?: number;
  tianxinCrossColor?: string;
  background?: string;
  data: CompassLayer[];
}

export type CompassThemeKey = (typeof importedThemeKeys)[number];

export const compassThemeKeys: readonly CompassThemeKey[] = importedThemeKeys;
export const defaultCompassTheme: CompassThemeKey = 'compass';
export const compassThemes = importedCompassThemes as Record<
  CompassThemeKey,
  CompassTheme
>;

export const compassTheme = compassThemes.compass;
export const darkTheme = compassThemes.dark;
export const simpleTheme = compassThemes.simple;
export const polygonTheme = compassThemes.polygon;
export const criceTheme = compassThemes.crice;

export const getThemeList = () => {
  return Object.entries(compassThemes).map(([key, theme]) => ({
    key: key as CompassThemeKey,
    ...theme.info,
  }));
};

export const getTheme = (key: CompassThemeKey): CompassTheme => {
  return compassThemes[key];
};

export default compassThemes;
