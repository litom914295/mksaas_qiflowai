/**
 * 大运流年计算模块
 * 精确计算大运起运时间、流年运势
 */

import { lunarAdapter } from '../calendar/lunar-adapter';
import type { FourPillars } from './four-pillars';

export interface Dayun {
  index: number; // 大运序号
  startAge: number; // 起始年龄
  endAge: number; // 结束年龄
  startYear: number; // 起始年份
  endYear: number; // 结束年份
  gan: string; // 天干
  zhi: string; // 地支
  ganZhi: string; // 干支
  wuxing: string; // 五行属性
  tenGod?: string; // 十神
  description: string; // 运势描述
}

export interface LiuNian {
  year: number; // 年份
  age: number; // 年龄
  gan: string; // 天干
  zhi: string; // 地支
  ganZhi: string; // 干支
  wuxing: string; // 五行属性
  tenGod?: string; // 十神
  fortune: {
    overall: number; // 综合运势 1-10
    career: number; // 事业运
    wealth: number; // 财运
    relationship: number; // 感情运
    health: number; // 健康运
  };
  highlights: string[]; // 重点提示
  warnings: string[]; // 注意事项
}

export interface DayunAnalysis {
  qiYunAge: number; // 起运年龄
  qiYunDate: Date; // 起运日期
  dayunList: Dayun[]; // 大运列表
  currentDayun?: Dayun; // 当前大运
  nextDayun?: Dayun; // 下一个大运
}

export interface LiuNianAnalysis {
  currentYear: LiuNian; // 今年流年
  nextYear: LiuNian; // 明年流年
  recentYears: LiuNian[]; // 近期流年（前2年到后5年）
}

/**
 * 大运流年计算器
 */
export class DayunLiuNianCalculator {
  private readonly GAN_LIST = [
    '甲',
    '乙',
    '丙',
    '丁',
    '戊',
    '己',
    '庚',
    '辛',
    '壬',
    '癸',
  ];
  private readonly ZHI_LIST = [
    '子',
    '丑',
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
  ];

  private readonly WUXING_MAP: Record<string, string> = {
    甲: '木',
    乙: '木',
    丙: '火',
    丁: '火',
    戊: '土',
    己: '土',
    庚: '金',
    辛: '金',
    壬: '水',
    癸: '水',
    子: '水',
    亥: '水',
    寅: '木',
    卯: '木',
    巳: '火',
    午: '火',
    申: '金',
    酉: '金',
    辰: '土',
    戌: '土',
    丑: '土',
    未: '土',
  };

  /**
   * 计算大运
   */
  public calculateDayun(
    fourPillars: FourPillars,
    gender: '男' | '女',
    birthDate: Date
  ): DayunAnalysis {
    // 计算起运年龄
    const qiYunInfo = this.calculateQiYunAge(fourPillars, gender, birthDate);

    // 生成大运列表
    const dayunList = this.generateDayunList(
      fourPillars,
      gender,
      qiYunInfo.age,
      birthDate.getFullYear()
    );

    // 确定当前大运
    const currentAge = new Date().getFullYear() - birthDate.getFullYear();
    const currentDayun = dayunList.find(
      (d) => currentAge >= d.startAge && currentAge <= d.endAge
    );

    const nextDayun = currentDayun
      ? dayunList.find((d) => d.index === currentDayun.index + 1)
      : undefined;

    return {
      qiYunAge: qiYunInfo.age,
      qiYunDate: qiYunInfo.date,
      dayunList,
      currentDayun,
      nextDayun,
    };
  }

  /**
   * 计算起运年龄
   */
  private calculateQiYunAge(
    fourPillars: FourPillars,
    gender: '男' | '女',
    birthDate: Date
  ): { age: number; date: Date } {
    // 获取年干的阴阳属性
    const yearGan = fourPillars.year.gan;
    const isYangYear = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);

    // 判断顺逆
    // 阳年男命、阴年女命顺排
    // 阴年男命、阳年女命逆排
    const isForward =
      (isYangYear && gender === '男') || (!isYangYear && gender === '女');

    // 获取节气信息
    const jieQi = this.getNearestJieQi(birthDate, isForward);

    // 计算相差天数
    const diffDays =
      Math.abs(jieQi.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);

    // 三天折一年（传统算法）
    const qiYunAge = Math.floor(diffDays / 3);

    // 计算起运日期
    const qiYunDate = new Date(birthDate);
    qiYunDate.setFullYear(qiYunDate.getFullYear() + qiYunAge);

    return {
      age: qiYunAge,
      date: qiYunDate,
    };
  }

  /**
   * 获取最近的节气
   */
  private getNearestJieQi(date: Date, isForward: boolean): Date {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // 简化处理：使用农历适配器获取节气
    const jieQiDates = this.getYearJieQi(year);

    if (isForward) {
      // 顺排：找下一个节气
      for (const jqDate of jieQiDates) {
        if (jqDate > date) {
          return jqDate;
        }
      }
      // 如果没找到，返回下一年第一个节气
      return this.getYearJieQi(year + 1)[0];
    }
    // 逆排：找上一个节气
    for (let i = jieQiDates.length - 1; i >= 0; i--) {
      if (jieQiDates[i] < date) {
        return jieQiDates[i];
      }
    }
    // 如果没找到，返回上一年最后一个节气
    const prevYearJieQi = this.getYearJieQi(year - 1);
    return prevYearJieQi[prevYearJieQi.length - 1];
  }

  /**
   * 获取一年的所有节气日期
   */
  private getYearJieQi(year: number): Date[] {
    const jieQiDates: Date[] = [];

    // 24节气名称
    const jieQiNames = [
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

    // 使用农历适配器获取节气日期
    // 这里简化处理，实际应该调用精确的节气计算
    for (let month = 1; month <= 12; month++) {
      // 每月两个节气
      jieQiDates.push(new Date(year, month - 1, 5)); // 节
      jieQiDates.push(new Date(year, month - 1, 20)); // 气
    }

    return jieQiDates;
  }

  /**
   * 生成大运列表
   */
  private generateDayunList(
    fourPillars: FourPillars,
    gender: '男' | '女',
    qiYunAge: number,
    birthYear: number
  ): Dayun[] {
    const dayunList: Dayun[] = [];

    // 获取月柱索引
    const monthGanIndex = this.GAN_LIST.indexOf(fourPillars.month.gan);
    const monthZhiIndex = this.ZHI_LIST.indexOf(fourPillars.month.zhi);

    // 判断顺逆
    const yearGan = fourPillars.year.gan;
    const isYangYear = ['甲', '丙', '戊', '庚', '壬'].includes(yearGan);
    const isForward =
      (isYangYear && gender === '男') || (!isYangYear && gender === '女');

    // 生成10个大运（覆盖100年）
    for (let i = 0; i < 10; i++) {
      const step = isForward ? i + 1 : -(i + 1);
      const ganIndex = (monthGanIndex + step + 100) % 10;
      const zhiIndex = (monthZhiIndex + step + 120) % 12;

      const gan = this.GAN_LIST[ganIndex];
      const zhi = this.ZHI_LIST[zhiIndex];
      const ganZhi = gan + zhi;

      const startAge = qiYunAge + i * 10;
      const endAge = startAge + 9;
      const startYear = birthYear + startAge;
      const endYear = birthYear + endAge;

      dayunList.push({
        index: i + 1,
        startAge,
        endAge,
        startYear,
        endYear,
        gan,
        zhi,
        ganZhi,
        wuxing: this.WUXING_MAP[gan] + this.WUXING_MAP[zhi],
        description: this.generateDayunDescription(ganZhi, i + 1),
      });
    }

    return dayunList;
  }

  /**
   * 生成大运描述
   */
  private generateDayunDescription(ganZhi: string, index: number): string {
    const descriptions: Record<string, string> = {
      甲子: '新的开始，充满活力和创新机会',
      乙丑: '稳步发展，适合积累和储备',
      丙寅: '事业上升期，展现才华的好时机',
      丁卯: '人际关系活跃，合作机会增多',
      戊辰: '稳定发展期，适合守成和巩固',
      己巳: '转型变化期，需要灵活应对',
      庚午: '挑战与机遇并存，需要果断决策',
      辛未: '收获期，过去的努力开始见效',
      壬申: '扩展期，适合开拓新领域',
      癸酉: '调整期，需要反思和规划',
    };

    return descriptions[ganZhi] || `第${index}大运，${ganZhi}运势`;
  }

  /**
   * 计算流年
   */
  public calculateLiuNian(
    fourPillars: FourPillars,
    birthYear: number,
    targetYear?: number
  ): LiuNianAnalysis {
    const currentYear = targetYear || new Date().getFullYear();
    const age = currentYear - birthYear;

    // 计算当年流年
    const currentYearLiuNian = this.calculateSingleLiuNian(
      fourPillars,
      currentYear,
      age
    );

    // 计算明年流年
    const nextYearLiuNian = this.calculateSingleLiuNian(
      fourPillars,
      currentYear + 1,
      age + 1
    );

    // 计算近期流年（前2年到后5年）
    const recentYears: LiuNian[] = [];
    for (let i = -2; i <= 5; i++) {
      if (i !== 0 && i !== 1) {
        // 排除当年和明年（已单独计算）
        recentYears.push(
          this.calculateSingleLiuNian(fourPillars, currentYear + i, age + i)
        );
      }
    }

    return {
      currentYear: currentYearLiuNian,
      nextYear: nextYearLiuNian,
      recentYears,
    };
  }

  /**
   * 计算单个流年
   */
  private calculateSingleLiuNian(
    fourPillars: FourPillars,
    year: number,
    age: number
  ): LiuNian {
    // 计算年份的干支
    const ganIndex = (year - 4) % 10;
    const zhiIndex = (year - 4) % 12;

    const gan = this.GAN_LIST[ganIndex];
    const zhi = this.ZHI_LIST[zhiIndex];
    const ganZhi = gan + zhi;

    // 分析流年运势
    const fortune = this.analyzeLiuNianFortune(fourPillars, gan, zhi);
    const { highlights, warnings } = this.generateLiuNianTips(
      fourPillars,
      gan,
      zhi
    );

    return {
      year,
      age,
      gan,
      zhi,
      ganZhi,
      wuxing: this.WUXING_MAP[gan] + this.WUXING_MAP[zhi],
      fortune,
      highlights,
      warnings,
    };
  }

  /**
   * 分析流年运势
   */
  private analyzeLiuNianFortune(
    fourPillars: FourPillars,
    liuNianGan: string,
    liuNianZhi: string
  ): LiuNian['fortune'] {
    // 简化的运势评分逻辑
    // 实际应该根据流年与四柱的生克制化关系详细计算

    const dayGan = fourPillars.day.gan;
    const dayZhi = fourPillars.day.zhi;

    // 基础分数
    let overall = 6;
    let career = 6;
    let wealth = 6;
    let relationship = 6;
    let health = 6;

    // 天干相生加分
    if (this.isGenerating(liuNianGan, dayGan)) {
      overall += 1;
      career += 1;
      wealth += 1;
    }

    // 天干相克减分
    if (this.isControlling(liuNianGan, dayGan)) {
      overall -= 1;
      health -= 1;
    }

    // 地支相合加分
    if (this.isCombining(liuNianZhi, dayZhi)) {
      overall += 1;
      relationship += 2;
    }

    // 地支相冲减分
    if (this.isClashing(liuNianZhi, dayZhi)) {
      overall -= 1;
      relationship -= 1;
      health -= 1;
    }

    // 本命年特殊处理
    if (liuNianZhi === fourPillars.year.zhi) {
      overall -= 1;
      health -= 1;
    }

    // 限制分数范围
    const limitScore = (score: number) => Math.max(1, Math.min(10, score));

    return {
      overall: limitScore(overall),
      career: limitScore(career),
      wealth: limitScore(wealth),
      relationship: limitScore(relationship),
      health: limitScore(health),
    };
  }

  /**
   * 生成流年提示
   */
  private generateLiuNianTips(
    fourPillars: FourPillars,
    liuNianGan: string,
    liuNianZhi: string
  ): { highlights: string[]; warnings: string[] } {
    const highlights: string[] = [];
    const warnings: string[] = [];

    // 本命年提示
    if (liuNianZhi === fourPillars.year.zhi) {
      warnings.push('本命年，宜守不宜攻');
      warnings.push('注意健康和安全');
      highlights.push('适合学习提升');
    }

    // 天干相生
    if (this.isGenerating(liuNianGan, fourPillars.day.gan)) {
      highlights.push('贵人运强，易得帮助');
      highlights.push('事业发展顺利');
    }

    // 天干相克
    if (this.isControlling(liuNianGan, fourPillars.day.gan)) {
      warnings.push('压力较大，需调节心态');
      warnings.push('避免冲动决策');
    }

    // 地支相合
    if (this.isCombining(liuNianZhi, fourPillars.day.zhi)) {
      highlights.push('人际关系和谐');
      highlights.push('合作机会增多');
    }

    // 地支相冲
    if (this.isClashing(liuNianZhi, fourPillars.day.zhi)) {
      warnings.push('易有变动和冲突');
      warnings.push('保持冷静理性');
    }

    // 桃花年
    if (this.isPeachBlossom(liuNianZhi, fourPillars.day.zhi)) {
      highlights.push('桃花运旺盛');
      highlights.push('社交活动增多');
    }

    // 财星年
    if (this.isWealthStar(liuNianGan, fourPillars.day.gan)) {
      highlights.push('财运机会增多');
      highlights.push('适合投资理财');
    }

    return { highlights, warnings };
  }

  // 辅助判断方法

  private isGenerating(source: string, target: string): boolean {
    const relations: Record<string, string> = {
      木: '火',
      火: '土',
      土: '金',
      金: '水',
      水: '木',
    };
    const sourceWuxing = this.WUXING_MAP[source];
    const targetWuxing = this.WUXING_MAP[target];
    return relations[sourceWuxing] === targetWuxing;
  }

  private isControlling(source: string, target: string): boolean {
    const relations: Record<string, string> = {
      木: '土',
      土: '水',
      水: '火',
      火: '金',
      金: '木',
    };
    const sourceWuxing = this.WUXING_MAP[source];
    const targetWuxing = this.WUXING_MAP[target];
    return relations[sourceWuxing] === targetWuxing;
  }

  private isCombining(zhi1: string, zhi2: string): boolean {
    const combinations: Record<string, string> = {
      子: '丑',
      丑: '子',
      寅: '亥',
      亥: '寅',
      卯: '戌',
      戌: '卯',
      辰: '酉',
      酉: '辰',
      巳: '申',
      申: '巳',
      午: '未',
      未: '午',
    };
    return combinations[zhi1] === zhi2;
  }

  private isClashing(zhi1: string, zhi2: string): boolean {
    const clashes: Record<string, string> = {
      子: '午',
      午: '子',
      丑: '未',
      未: '丑',
      寅: '申',
      申: '寅',
      卯: '酉',
      酉: '卯',
      辰: '戌',
      戌: '辰',
      巳: '亥',
      亥: '巳',
    };
    return clashes[zhi1] === zhi2;
  }

  private isPeachBlossom(liuNianZhi: string, dayZhi: string): boolean {
    const peachBlossoms: Record<string, string[]> = {
      申: ['酉'],
      子: ['酉'],
      辰: ['酉'],
      寅: ['卯'],
      午: ['卯'],
      戌: ['卯'],
      亥: ['子'],
      卯: ['子'],
      未: ['子'],
      巳: ['午'],
      酉: ['午'],
      丑: ['午'],
    };
    return peachBlossoms[dayZhi]?.includes(liuNianZhi) || false;
  }

  private isWealthStar(liuNianGan: string, dayGan: string): boolean {
    // 简化判断：日主所克为财
    return this.isControlling(dayGan, liuNianGan);
  }
}

// 导出单例
export const dayunLiuNianCalculator = new DayunLiuNianCalculator();
