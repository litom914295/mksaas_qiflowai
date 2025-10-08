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

export type Stem = '甲'|'乙'|'丙'|'丁'|'戊'|'己'|'庚'|'辛'|'壬'|'癸';
export type Branch = '子'|'丑'|'寅'|'卯'|'辰'|'巳'|'午'|'未'|'申'|'酉'|'戌'|'亥';

export type Pillars = {
  year: { stem: Stem; branch: Branch };
  month: { stem: Stem; branch: Branch };
  day: { stem: Stem; branch: Branch };
  hour: { stem: Stem; branch: Branch };
};

export type FiveElement = '木'|'火'|'土'|'金'|'水';

export type FiveElementStrength = Record<FiveElement, number>; // 0..100 scale

export type YongShen = {
  favorable: FiveElement[];
  unfavorable: FiveElement[];
  commentary?: string;
};

export type BaziResult = {
  pillars: Pillars;
  elements: FiveElementStrength;
  yongshen: YongShen;
};


