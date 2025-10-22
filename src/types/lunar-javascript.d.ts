/**
 * Type definitions for lunar-javascript
 * 农历 JavaScript 库的类型声明
 */

declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromDate(date: Date): Solar;
    getLunar(): Lunar;
    toYmd(): string;
    toFullString(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromSolar(solar: Solar): Lunar;
    getSolar(): Solar;
    getYearInGanZhiExact(): string;
    getMonthInGanZhiExact(): string;
    getDayInGanZhiExact(): string;
    getYearGanZhi(): string;
    getMonthGanZhi(): string;
    getDayGanZhi(): string;
    getTimeGanZhi(): string;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    toYmd(): string;
    toFullString(): string;
    getEightChar(): EightChar;
    getDayYi(): string[];
    getDayJi(): string[];
    getDayShengXiao(): string[];
    getDayXiongSha(): string[];
    getJieQiTable(): Record<string, Solar>; // 返回的是 Solar 对象而不是字符串
  }

  export class EightChar {
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
  }

  export class SolarYear {
    static fromYear(year: number): SolarYear;
    getJieQiTable(): Record<string, Solar>; // 返回的是 Solar 对象而不是字符串
  }

  export class SolarMonth {
    static fromYm(year: number, month: number): SolarMonth;
  }

  export class SolarWeek {
    constructor(year: number, month: number, day: number, start: number);
  }

  export class LunarMonth {
    constructor(year: number, month: number);
    getYear(): number;
    getMonth(): number;
    getDayCount(): number;
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear;
    getMonths(): LunarMonth[];
  }

  export class SolarUtil {
    static getDaysOfMonth(year: number, month: number): number;
    static isLeapYear(year: number): boolean;
  }

  export class LunarUtil {
    static convertJieQi(name: string): string;
    static getJieQi(name: string): string;
  }

  export class Foto {}
  export class Tao {}
  export class NineStar {}
  export class SolarSeason {}
  export class SolarHalfYear {}
  export class LunarTime {}
  export class ShouXingUtil {}
  export class FotoUtil {}
  export class TaoUtil {}
  export class HolidayUtil {}
  export class NineStarUtil {}
  export class I18n {}
}
