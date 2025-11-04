/**
 * 农历转换适配器
 * 基于 lunar-javascript 库封装
 * 提供高精度的农历、阳历、节气计算
 */

import { Lunar, Solar } from 'lunar-javascript';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
}

export interface SolarDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface SolarTerm {
  name: string;
  date: Date;
  julianDay: number;
}

/**
 * 农历适配器类
 */
export class LunarAdapter {
  /**
   * 阳历转农历
   */
  public solarToLunar(date: Date): LunarDate {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    return {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeap: lunar.getMonth() < 0,
      yearGanZhi: lunar.getYearInGanZhiExact(),
      monthGanZhi: lunar.getMonthInGanZhiExact(),
      dayGanZhi: lunar.getDayInGanZhiExact(),
    };
  }

  /**
   * 农历转阳历
   */
  public lunarToSolar(
    year: number,
    month: number,
    day: number,
    isLeap = false
  ): Date {
    const lunar = Lunar.fromYmd(year, isLeap ? -month : month, day);
    const solar = lunar.getSolar();

    return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
  }

  /**
   * 获取指定年份的所有节气
   */
  public getYearSolarTerms(year: number): SolarTerm[] {
    const terms: SolarTerm[] = [];

    // 24节气名称
    const termNames = [
      '小寒',
      '大寒',
      '立春',
      '雨水',
      '惊蛰',
      '春分',
      '清明',
      '谷雨',
      '立夏',
      '小满',
      '芒种',
      '夏至',
      '小暑',
      '大暑',
      '立秋',
      '处暑',
      '白露',
      '秋分',
      '寒露',
      '霜降',
      '立冬',
      '小雪',
      '大雪',
      '冬至',
    ];

    // 获取当年1月1日的lunar对象来获取节气表
    const solar = Solar.fromYmd(year, 1, 1);
    const lunar = solar.getLunar();
    const jieQiTable = lunar.getJieQiTable();

    for (let i = 0; i < 24; i++) {
      const jieQi = jieQiTable[termNames[i]];
      if (jieQi) {
        // jieQi 是一个 Solar 对象，需要调用方法获取日期时间
        const y = jieQi.getYear();
        const m = jieQi.getMonth();
        const d = jieQi.getDay();
        const h = jieQi.getHour();
        const min = jieQi.getMinute();
        const s = jieQi.getSecond();

        terms.push({
          name: termNames[i],
          date: new Date(y, m - 1, d, h, min, s),
          julianDay: this.getJulianDay(new Date(y, m - 1, d, h, min, s)),
        });
      }
    }

    return terms.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  /**
   * 获取特定节气的精确时刻
   */
  public getSolarTermDate(year: number, termName: string): Date {
    const terms = this.getYearSolarTerms(year);
    const term = terms.find((t) => t.name === termName);

    if (!term) {
      throw new Error(`节气 ${termName} 在 ${year} 年未找到`);
    }

    return term.date;
  }

  /**
   * 判断是否过了某个节气
   */
  public isAfterSolarTerm(date: Date, year: number, termName: string): boolean {
    const termDate = this.getSolarTermDate(year, termName);
    return date >= termDate;
  }

  /**
   * 获取当前月令（根据节气）
   */
  public getMonthOrder(date: Date): string {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    // 月令地支映射
    const monthBranches = [
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥',
      '子',
      '丑',
    ];

    // 根据节气确定月令
    const year = date.getFullYear();
    const solarTerms = this.getYearSolarTerms(year);

    // 节气与月令对应关系
    const termMonthMap: Record<string, number> = {
      立春: 0,
      惊蛰: 1,
      清明: 2,
      立夏: 3,
      芒种: 4,
      小暑: 5,
      立秋: 6,
      白露: 7,
      寒露: 8,
      立冬: 9,
      大雪: 10,
      小寒: 11,
    };

    let monthIndex = 11; // 默认丑月

    for (const [term, index] of Object.entries(termMonthMap)) {
      const termDate = solarTerms.find((t) => t.name === term)?.date;
      if (termDate && date >= termDate) {
        monthIndex = index;
      }
    }

    return monthBranches[monthIndex];
  }

  /**
   * 获取八字（四柱）
   */
  public getBaZi(date: Date): {
    year: { gan: string; zhi: string };
    month: { gan: string; zhi: string };
    day: { gan: string; zhi: string };
    hour: { gan: string; zhi: string };
  } {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();
    const eightChar = lunar.getEightChar();

    return {
      year: {
        gan: eightChar.getYearGan(),
        zhi: eightChar.getYearZhi(),
      },
      month: {
        gan: eightChar.getMonthGan(),
        zhi: eightChar.getMonthZhi(),
      },
      day: {
        gan: eightChar.getDayGan(),
        zhi: eightChar.getDayZhi(),
      },
      hour: {
        gan: eightChar.getTimeGan(),
        zhi: eightChar.getTimeZhi(),
      },
    };
  }

  /**
   * 获取宜忌
   */
  public getDayYiJi(date: Date): {
    yi: string[];
    ji: string[];
  } {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    return {
      yi: lunar.getDayYi(),
      ji: lunar.getDayJi(),
    };
  }

  /**
   * 获取神煞
   */
  public getDayShenSha(date: Date): {
    auspicious: string[];
    inauspicious: string[];
  } {
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    return {
      auspicious: lunar.getDayShengXiao(),
      inauspicious: lunar.getDayXiongSha(),
    };
  }

  /**
   * 计算儒略日
   */
  private getJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = date.getMonth() + 1 + 12 * a - 3;

    return (
      date.getDate() +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    );
  }

  /**
   * 获取节气间隔天数
   */
  public getDaysBetweenTerms(date: Date): {
    prevTerm: { name: string; days: number };
    nextTerm: { name: string; days: number };
  } {
    const year = date.getFullYear();
    const terms = this.getYearSolarTerms(year);
    const currentTime = date.getTime();

    let prevTerm = null;
    let nextTerm = null;

    for (let i = 0; i < terms.length; i++) {
      if (terms[i].date.getTime() <= currentTime) {
        prevTerm = {
          name: terms[i].name,
          days: Math.floor(
            (currentTime - terms[i].date.getTime()) / (1000 * 60 * 60 * 24)
          ),
        };
      } else if (!nextTerm) {
        nextTerm = {
          name: terms[i].name,
          days: Math.floor(
            (terms[i].date.getTime() - currentTime) / (1000 * 60 * 60 * 24)
          ),
        };
        break;
      }
    }

    // 如果没有找到下一个节气，可能需要查看下一年
    if (!nextTerm) {
      const nextYearTerms = this.getYearSolarTerms(year + 1);
      if (nextYearTerms.length > 0) {
        nextTerm = {
          name: nextYearTerms[0].name,
          days: Math.floor(
            (nextYearTerms[0].date.getTime() - currentTime) /
              (1000 * 60 * 60 * 24)
          ),
        };
      }
    }

    return {
      prevTerm: prevTerm || { name: '', days: 0 },
      nextTerm: nextTerm || { name: '', days: 0 },
    };
  }

  /**
   * 验证日期是否为有效的农历日期
   */
  public isValidLunarDate(
    year: number,
    month: number,
    day: number,
    isLeap = false
  ): boolean {
    try {
      Lunar.fromYmd(year, isLeap ? -month : month, day);
      return true;
    } catch {
      return false;
    }
  }
}

// 导出单例
export const lunarAdapter = new LunarAdapter();
