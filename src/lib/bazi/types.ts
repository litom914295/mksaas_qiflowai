export type CalendarType = 'gregorian' | 'lunar';

export type Location = {
  latitude: number; // degrees
  longitude: number; // degrees
  timezone: string; // IANA TZ
};

export type BirthInput = {
  calendar: CalendarType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm or HH:mm:ss
  useTrueSolarTime?: boolean;
  location?: Location;
};

export type Stem =
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
export type Branch =
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

export type Pillars = {
  year: { stem: Stem; branch: Branch; gan?: string; zhi?: string };
  month: { stem: Stem; branch: Branch; gan?: string; zhi?: string };
  day: { stem: Stem; branch: Branch; gan?: string; zhi?: string };
  hour: { stem: Stem; branch: Branch; gan?: string; zhi?: string };
};

export type FiveElement = '木' | '火' | '土' | '金' | '水';

// 支持中英文两种属性名
export type FiveElementStrength = (
  | Record<FiveElement, number>
  | {
      wood?: number;
      fire?: number;
      earth?: number;
      metal?: number;
      water?: number;
      木?: number;
      火?: number;
      土?: number;
      金?: number;
      水?: number;
      balance?: {
        status: 'balanced' | 'imbalanced';
        shortage?: string[];
        excess?: string[];
      };
    }
) &
  Record<string, any>; // 0..100 scale

export type YongShen = {
  favorable?: FiveElement[];
  unfavorable?: FiveElement[];
  primary?: any[];
  secondary?: any[];
  avoid?: any[];
  commentary?: string;
  explanation?: string;
  recommendations?: Record<string, string[]>;
};

export type BaziResult = {
  pillars: Pillars;
  elements: FiveElementStrength;
  yongshen: YongShen;
};
