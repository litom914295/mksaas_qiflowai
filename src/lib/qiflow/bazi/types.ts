/**
 * 八字相关类型定义
 */

// 天干
export type Tiangan =
  | '甲'
  | '乙'
  | '丙'
  | '丁'
  | '戊'
  | '己'
  | '庚'
  | '辛'
  | '壬'
  | '癸';

// 地支
export type Dizhi =
  | '子'
  | '丑'
  | '寅'
  | '卯'
  | '辰'
  | '巳'
  | '午'
  | '未'
  | '申'
  | '酉'
  | '戌'
  | '亥';

// 五行
export type Wuxing = '木' | '火' | '土' | '金' | '水';

// 四柱
export interface Pillar {
  tiangan: Tiangan;
  dizhi: Dizhi;
  nayin?: string;
  canggan?: string[];
}

// 八字命盘
export interface BaziChart {
  // 四柱
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  pillars: Pillar[];

  // 基本信息
  solar: {
    year: number;
    month: number;
    day: number;
    hour: number;
  };
  lunar?: {
    year: number;
    month: number;
    day: number;
    leap?: boolean;
  };

  // 性别
  gender: 'male' | 'female';

  // 日主
  dayMaster?: Tiangan;

  // 五行强弱
  wuxingStrength?: Record<Wuxing, number>;

  // 用神
  yongshen?: {
    primary: Wuxing;
    secondary?: Wuxing;
    favorable: Wuxing[];
    unfavorable: Wuxing[];
  };

  // 别名：喜用神
  usefulGod?: Wuxing;
  favorableElements?: Wuxing[];

  // 十神
  shishen?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };

  // 大运
  dayun?: Array<{
    tiangan: Tiangan;
    dizhi: Dizhi;
    startAge: number;
    endAge: number;
  }>;

  // 元数据
  metadata?: {
    birthPlace?: string;
    timezone?: string;
    [key: string]: any;
  };
}

// 八字分析结果
export interface BaziAnalysis {
  chart: BaziChart;
  personality?: string;
  career?: string;
  wealth?: string;
  health?: string;
  relationships?: string;
  recommendations?: string[];
}
