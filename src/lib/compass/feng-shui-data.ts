/**
 * 风水罗盘数据配置
 */

import { LayerData } from './feng-shui-types';

export const DEFAULT_COMPASS_DATA: LayerData[] = [
  {
    name: "八数",
    startAngle: 0,
    fontSize: 78,
    textColor: "white",
    vertical: false,
    togetherStyle: "empty",
    data: ["一", "二", "三", "四", "五", "六", "七", "八"],
  },
  {
    name: ["后先天八卦", "先天八卦", "龙上八煞"],
    startAngle: 0,
    fontSize: 18,
    textColor: ["white", "red", "white"],
    vertical: false,
    togetherStyle: "equally",
    data: [
      ["坎", "☰", "辰"],
      ["艮", "☲", "寅"],
      ["震", "☱", "申"],
      ["巽", "☴", "酉"],
      ["离", "☵", "亥"],
      ["坤", "☶", "卯"],
      ["兑", "☳", "巳"],
      ["乾", "☷", "午"],
    ],
  },
  {
    name: "二十四山",
    startAngle: 0,
    fontSize: 18,
    textColor: "white",
    vertical: false,
    togetherStyle: "empty",
    data: [
      "子", "癸", "丑", "艮", "寅", "甲", "卯", "乙", "辰", "巽", "巳", "丙",
      "午", "丁", "未", "坤", "申", "庚", "酉", "辛", "戌", "乾", "亥", "壬",
    ],
  },
];

export const BAGUA_MAPPING = {
  "乾": { direction: 315, element: "金", meaning: "天" },
  "坤": { direction: 225, element: "土", meaning: "地" },
  "震": { direction: 90, element: "木", meaning: "雷" },
  "巽": { direction: 135, element: "木", meaning: "风" },
  "坎": { direction: 0, element: "水", meaning: "水" },
  "离": { direction: 180, element: "火", meaning: "火" },
  "艮": { direction: 45, element: "土", meaning: "山" },
  "兑": { direction: 270, element: "金", meaning: "泽" },
};

export const DEFAULT_CONFIG = {
  radius: 300,
  centralPoint: { x: 300, y: 300 },
  defaultFontSize: 30,
  layerPadding: 5,
  borderWidth: 3,
  borderColor: '#00ffff',
  tianChiRadius: 80,
  scaleHeight: 48,
};