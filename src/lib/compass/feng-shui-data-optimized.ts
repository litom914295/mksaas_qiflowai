/**
 * 优化版风水罗盘数据配置
 * 
 * 针对视觉优化的数据结构：
 * 1. 优化字体大小配置
 * 2. 改进颜色搭配
 * 3. 调整布局参数
 */

import { LayerData } from './feng-shui-types';

export const OPTIMIZED_COMPASS_DATA: LayerData[] = [
  {
    name: "八数",
    startAngle: 0,
    fontSize: 32, // 从78减小到32，避免过大
    textColor: "#ffffff",
    vertical: false,
    togetherStyle: "empty",
    data: ["一", "二", "三", "四", "五", "六", "七", "八"],
  },
  {
    name: ["后先天八卦", "先天八卦", "龙上八煞"],
    startAngle: 0,
    fontSize: 14, // 从18减小到14，提高可读性
    textColor: ["#e0e7ff", "#ff6b6b", "#ffd93d"], // 优化颜色对比度
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
    fontSize: 16, // 从18减小到16，优化密集显示
    textColor: "#f1f5f9",
    vertical: false,
    togetherStyle: "empty",
    data: [
      "子", "癸", "丑", "艮", "寅", "甲", "卯", "乙", "辰", "巽", "巳", "丙",
      "午", "丁", "未", "坤", "申", "庚", "酉", "辛", "戌", "乾", "亥", "壬",
    ],
  },
  {
    name: "九宫八卦",
    startAngle: 22.5, // 偏移角度，使九宫更整齐
    fontSize: 18,
    textColor: "#a78bfa",
    vertical: true,
    togetherStyle: "empty",
    data: ["乾宫", "兑宫", "离宫", "震宫", "巽宫", "坎宫", "艮宫", "坤宫"],
  },
];

// 优化后的八卦映射
export const OPTIMIZED_BAGUA_MAPPING = {
  "乾": { 
    direction: 315, 
    element: "金", 
    meaning: "天", 
    color: "#fbbf24",
    description: "代表天、父亲、领导力"
  },
  "坤": { 
    direction: 225, 
    element: "土", 
    meaning: "地", 
    color: "#a16207",
    description: "代表地、母亲、包容力"
  },
  "震": { 
    direction: 90, 
    element: "木", 
    meaning: "雷", 
    color: "#10b981",
    description: "代表雷、长男、行动力"
  },
  "巽": { 
    direction: 135, 
    element: "木", 
    meaning: "风", 
    color: "#06b6d4",
    description: "代表风、长女、柔顺力"
  },
  "坎": { 
    direction: 0, 
    element: "水", 
    meaning: "水", 
    color: "#3b82f6",
    description: "代表水、中男、智慧力"
  },
  "离": { 
    direction: 180, 
    element: "火", 
    meaning: "火", 
    color: "#ef4444",
    description: "代表火、中女、光明力"
  },
  "艮": { 
    direction: 45, 
    element: "土", 
    meaning: "山", 
    color: "#8b5cf6",
    description: "代表山、少男、稳定力"
  },
  "兑": { 
    direction: 270, 
    element: "金", 
    meaning: "泽", 
    color: "#f59e0b",
    description: "代表泽、少女、喜悦力"
  },
};

// 二十四山详细信息
export const TWENTY_FOUR_MOUNTAINS = {
  "子": { element: "水", direction: 0, description: "正北方，水之始" },
  "癸": { element: "水", direction: 15, description: "北偏东，阴水" },
  "丑": { element: "土", direction: 30, description: "东北偏北，湿土" },
  "艮": { element: "土", direction: 45, description: "东北方，山土" },
  "寅": { element: "木", direction: 60, description: "东北偏东，阳木" },
  "甲": { element: "木", direction: 75, description: "东偏北，木之始" },
  "卯": { element: "木", direction: 90, description: "正东方，木之盛" },
  "乙": { element: "木", direction: 105, description: "东偏南，阴木" },
  "辰": { element: "土", direction: 120, description: "东南偏东，湿土" },
  "巽": { element: "木", direction: 135, description: "东南方，风木" },
  "巳": { element: "火", direction: 150, description: "东南偏南，阴火" },
  "丙": { element: "火", direction: 165, description: "南偏东，火之始" },
  "午": { element: "火", direction: 180, description: "正南方，火之盛" },
  "丁": { element: "火", direction: 195, description: "南偏西，阴火" },
  "未": { element: "土", direction: 210, description: "西南偏南，燥土" },
  "坤": { element: "土", direction: 225, description: "西南方，地土" },
  "申": { element: "金", direction: 240, description: "西南偏西，阳金" },
  "庚": { element: "金", direction: 255, description: "西偏南，金之始" },
  "酉": { element: "金", direction: 270, description: "正西方，金之盛" },
  "辛": { element: "金", direction: 285, description: "西偏北，阴金" },
  "戌": { element: "土", direction: 300, description: "西北偏西，燥土" },
  "乾": { element: "金", direction: 315, description: "西北方，天金" },
  "亥": { element: "水", direction: 330, description: "西北偏北，阴水" },
  "壬": { element: "水", direction: 345, description: "北偏西，阳水" },
};

// 优化后的配置
export const OPTIMIZED_CONFIG = {
  radius: 280, // 稍微减小半径，留出更多边距
  centralPoint: { x: 300, y: 300 },
  defaultFontSize: 16, // 减小默认字体
  layerPadding: 8, // 增加层间距
  borderWidth: 2, // 减小边框宽度
  borderColor: '#3b82f6', // 使用更现代的蓝色
  tianChiRadius: 60, // 减小天池半径
  scaleHeight: 40, // 减小刻度高度
  
  // 新增优化配置
  layerHeights: [45, 35, 30, 25], // 自定义层高度
  adaptiveScaling: true, // 启用自适应缩放
  modernStyling: true, // 启用现代样式
  enhancedReadability: true, // 启用增强可读性
};

// 颜色主题配置
export const COLOR_SCHEMES = {
  classic: {
    primary: '#1a1a1a',
    secondary: '#00ffff',
    accent: '#ff0000',
    text: '#ffffff',
    background: '#0a0a0a',
  },
  modern: {
    primary: '#0f172a',
    secondary: '#3b82f6',
    accent: '#ef4444',
    text: '#f1f5f9',
    background: '#020617',
  },
  elegant: {
    primary: '#1e1b4b',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    text: '#e0e7ff',
    background: '#0f0a19',
  },
  nature: {
    primary: '#064e3b',
    secondary: '#10b981',
    accent: '#f59e0b',
    text: '#ecfdf5',
    background: '#022c22',
  },
};

// 字体配置
export const FONT_CONFIGS = {
  traditional: {
    primary: '楷书, KaiTi, serif',
    secondary: '宋体, SimSun, serif',
    modern: 'Arial, sans-serif',
  },
  modern: {
    primary: 'PingFang SC, Microsoft YaHei, sans-serif',
    secondary: 'SF Pro Display, Helvetica Neue, sans-serif',
    modern: 'Inter, system-ui, sans-serif',
  },
  elegant: {
    primary: 'Noto Serif SC, serif',
    secondary: 'Source Han Sans SC, sans-serif',
    modern: 'Roboto, sans-serif',
  },
};