/**
 * 大运起运年龄计算
 * 根据性别和出生年份的阴阳属性，精确计算起运年龄
 */

import { BaziChart, Gender, HeavenlyStem } from '../../../types';
import { lunarAdapter } from '../../../core/calendar/lunar-adapter';

export interface QiYunInfo {
  startAge: number;        // 起运年龄
  startDate: Date;         // 起运日期
  isForward: boolean;      // 是否顺排
  daysToJieQi: number;     // 到节气的天数
  description: string;     // 起运描述
}

/**
 * 起运年龄计算器
 */
export class StartAgeCalculator {
  
  /**
   * 计算起运信息
   */
  calculateQiYun(chart: BaziChart, gender: Gender): QiYunInfo {
    const birthTime = chart.birthTime;
    const yearStem = chart.pillars.year.heavenlyStem;
    
    // 判断顺逆排
    const isForward = this.determineDirection(yearStem, gender);
    
    // 获取最近的节气
    const nearestJieQi = isForward 
      ? this.getNextJieQi(birthTime)
      : this.getPrevJieQi(birthTime);
    
    // 计算相差天数
    const daysToJieQi = Math.abs(
      Math.floor((nearestJieQi.getTime() - birthTime.getTime()) / (1000 * 60 * 60 * 24))
    );
    
    // 三天折一年（传统算法）
    const startAge = Math.round(daysToJieQi / 3);
    
    // 计算起运日期
    const startDate = new Date(birthTime);
    startDate.setFullYear(startDate.getFullYear() + startAge);
    
    // 生成描述
    const description = this.generateDescription(startAge, isForward, gender);
    
    return {
      startAge,
      startDate,
      isForward,
      daysToJieQi,
      description
    };
  }
  
  /**
   * 判断大运排列方向
   * 阳年男命、阴年女命顺排
   * 阴年男命、阳年女命逆排
   */
  private determineDirection(yearStem: HeavenlyStem, gender: Gender): boolean {
    const yangStems: HeavenlyStem[] = ['甲', '丙', '戊', '庚', '壬'];
    const isYangYear = yangStems.includes(yearStem);
    
    return (isYangYear && gender === 'male') || (!isYangYear && gender === 'female');
  }
  
  /**
   * 获取下一个节气
   */
  private getNextJieQi(date: Date): Date {
    // 使用农历适配器获取下一个节气
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 获取当年所有节气
    const jieQiList = this.getYearJieQi(year);
    
    // 找到下一个节气
    for (const jieQi of jieQiList) {
      if (jieQi.date > date) {
        return jieQi.date;
      }
    }
    
    // 如果当年没有找到，获取下一年的第一个节气
    const nextYearJieQi = this.getYearJieQi(year + 1);
    return nextYearJieQi[0].date;
  }
  
  /**
   * 获取上一个节气
   */
  private getPrevJieQi(date: Date): Date {
    const year = date.getFullYear();
    
    // 获取当年所有节气
    const jieQiList = this.getYearJieQi(year);
    
    // 反向查找上一个节气
    for (let i = jieQiList.length - 1; i >= 0; i--) {
      if (jieQiList[i].date < date) {
        return jieQiList[i].date;
      }
    }
    
    // 如果当年没有找到，获取上一年的最后一个节气
    const prevYearJieQi = this.getYearJieQi(year - 1);
    return prevYearJieQi[prevYearJieQi.length - 1].date;
  }
  
  /**
   * 获取一年的所有节气
   * 注意：这里只获取"节"，不包括"气"
   * 12个节：立春、惊蛰、清明、立夏、芒种、小暑、立秋、白露、寒露、立冬、大雪、小寒
   */
  private getYearJieQi(year: number): Array<{name: string; date: Date}> {
    const jieList = [
      { month: 2, name: '立春' },
      { month: 3, name: '惊蛰' },
      { month: 4, name: '清明' },
      { month: 5, name: '立夏' },
      { month: 6, name: '芒种' },
      { month: 7, name: '小暑' },
      { month: 8, name: '立秋' },
      { month: 9, name: '白露' },
      { month: 10, name: '寒露' },
      { month: 11, name: '立冬' },
      { month: 12, name: '大雪' },
      { month: 1, name: '小寒' }  // 注意：小寒在下一年的1月
    ];
    
    const result: Array<{name: string; date: Date}> = [];
    
    for (const jie of jieList) {
      const actualYear = jie.month === 1 ? year + 1 : year;
      // 使用农历适配器获取精确的节气时间
      const jieQiDate = lunarAdapter.getJieQiTime(actualYear, jie.name);
      
      if (jieQiDate) {
        result.push({
          name: jie.name,
          date: jieQiDate
        });
      } else {
        // 如果农历适配器无法获取，使用近似值
        const approximateDay = jie.month === 2 ? 4 : 5 + (jie.month - 2) * 2;
        result.push({
          name: jie.name,
          date: new Date(actualYear, jie.month - 1, approximateDay)
        });
      }
    }
    
    // 按日期排序
    result.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return result;
  }
  
  /**
   * 生成起运描述
   */
  private generateDescription(startAge: number, isForward: boolean, gender: Gender): string {
    const direction = isForward ? '顺' : '逆';
    const genderText = gender === 'male' ? '男' : '女';
    
    if (startAge === 0) {
      return `${genderText}命，${direction}排大运，出生即起运`;
    } else if (startAge <= 3) {
      return `${genderText}命，${direction}排大运，${startAge}岁起运，童年即入大运`;
    } else if (startAge <= 10) {
      return `${genderText}命，${direction}排大运，${startAge}岁起运，少年开始转运`;
    } else {
      return `${genderText}命，${direction}排大运，${startAge}岁起运，青年方显运势`;
    }
  }
  
  /**
   * 计算起运的精确时刻
   * 考虑时辰的影响
   */
  calculatePreciseQiYunTime(chart: BaziChart, gender: Gender): Date {
    const qiYunInfo = this.calculateQiYun(chart, gender);
    const birthTime = chart.birthTime;
    
    // 计算精确的起运时间
    // 不仅考虑日期，还要考虑时辰
    const preciseStartTime = new Date(birthTime);
    
    // 加上起运年数
    preciseStartTime.setFullYear(preciseStartTime.getFullYear() + qiYunInfo.startAge);
    
    // 考虑剩余的天数（不足3天的部分）
    const remainingDays = qiYunInfo.daysToJieQi % 3;
    if (remainingDays > 0) {
      // 每天折算4个月
      const additionalMonths = Math.round(remainingDays * 4);
      preciseStartTime.setMonth(preciseStartTime.getMonth() + additionalMonths);
    }
    
    return preciseStartTime;
  }
  
  /**
   * 判断当前是否已起运
   */
  hasStartedDaYun(chart: BaziChart, gender: Gender, currentDate: Date = new Date()): boolean {
    const qiYunInfo = this.calculateQiYun(chart, gender);
    return currentDate >= qiYunInfo.startDate;
  }
  
  /**
   * 获取距离起运的时间
   */
  getTimeToQiYun(chart: BaziChart, gender: Gender, currentDate: Date = new Date()): {
    years: number;
    months: number;
    days: number;
    description: string;
  } {
    const qiYunInfo = this.calculateQiYun(chart, gender);
    
    if (currentDate >= qiYunInfo.startDate) {
      return {
        years: 0,
        months: 0,
        days: 0,
        description: '已起运'
      };
    }
    
    const timeDiff = qiYunInfo.startDate.getTime() - currentDate.getTime();
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;
    
    let description = '距离起运还有';
    if (years > 0) description += `${years}年`;
    if (months > 0) description += `${months}月`;
    if (remainingDays > 0) description += `${remainingDays}天`;
    
    return {
      years,
      months,
      days: remainingDays,
      description
    };
  }
}