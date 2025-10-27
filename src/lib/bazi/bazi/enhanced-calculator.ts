/**
 * QiFlow AI - 增强型八字计算引擎
 *
 * 基于 @aharris02/bazi-calculator-by-alvamind 库
 * 提供高精度、专业级的八字计算服务
 *
 * 核心特性：
 * - 专业级精度计算
 * - 时区感知处理
 * - 大运和流年分析
 * - 每日运势分析
 * - 完整的十神系统
 * - 性能优化和缓存
 */

import { BaziCalculator } from '@aharris02/bazi-calculator-by-alvamind';
import { isValid } from 'date-fns';

// 导入现有类型定义以保持兼容性
import type { BaziResult, Pillars } from './types';
import { computeYongShen } from './yongshen';

export interface EnhancedBirthData {
  // 基本出生数据
  datetime: string; // ISO: YYYY-MM-DDTHH:mm
  gender: string; // 'male' | 'female' | 兼容字符串
  // 增强字段
  timezone?: string;
  isTimeKnown?: boolean;
  preferredLocale?: string;
  // 兼容 Lunisolar 适配器的可选字段
  calendarType?: 'solar' | 'lunar' | string;
  longitude?: number;
  latitude?: number;
}

export interface EnhancedBaziResult extends BaziResult {
  // 增强的分析结果
  luckPillars?: LuckPillarResult[];
  dailyAnalysis?: DailyAnalysisResult;
  tenGodsAnalysis?: TenGodsAnalysisResult;
  interactions?: BaziInteraction[];
  dayMasterStrength?: DayMasterStrengthResult;
  favorableElements?: FavorableElementsResult;
  // 兼容字段
  birthData?: EnhancedBirthData;
  timestamp?: string;
  solarDateConverted?: string;
  isLunarInput?: boolean;
}

export interface LuckPillarResult {
  period: number;
  heavenlyStem: string;
  earthlyBranch: string;
  startAge: number;
  endAge: number;
  startDate?: Date;
  endDate?: Date;
  strength: 'strong' | 'weak' | 'balanced';
  // 兼容扩展
  score?: number;
  description?: string;
  favorable?: string[];
  unfavorable?: string[];
  keyEvents?: string[];
}

export interface DailyAnalysisResult {
  date: string;
  dayPillar: {
    chinese: string;
    element: string;
  };
  interactions: number;
  isFavorable: boolean;
  recommendation: string;
}

export interface TenGodsAnalysisResult {
  relationships: Record<string, string>;
  influence: 'strong' | 'moderate' | 'weak';
  recommendations: string[];
}

export interface BaziInteraction {
  type: 'clash' | 'combination' | 'punishment' | 'destruction';
  description: string;
  strength: 'strong' | 'weak';
  impact: 'positive' | 'negative' | 'neutral';
}

export interface DayMasterStrengthResult {
  strength: 'strong' | 'weak' | 'balanced';
  score: number;
  factors: string[];
  recommendations: string[];
}

export interface FavorableElementsResult {
  primary: string[];
  secondary: string[];
  unfavorable: string[];
  explanation: string;
}

/**
 * 增强型八字计算引擎
 *
 * 核心功能：
 * 1. 高精度八字计算
 * 2. 时区感知处理
 * 3. 大运分析
 * 4. 每日运势
 * 5. 性能优化
 */
export class EnhancedBaziCalculator {
  private calculator: BaziCalculator | null = null;
  private birthData: EnhancedBirthData;
  private cachedResults: Map<string, any> = new Map();

  constructor(birthData: EnhancedBirthData) {
    this.birthData = this.normalizeBirthData(birthData);
    this.initializeCalculator();
  }

  /**
   * 标准化出生数据
   */
  private normalizeBirthData(data: EnhancedBirthData): EnhancedBirthData {
    return {
      ...data,
      timezone: data.timezone || 'Asia/Shanghai',
      isTimeKnown: data.isTimeKnown ?? true,
      preferredLocale: data.preferredLocale || 'zh-CN',
    };
  }

  /**
   * 初始化计算器
   */
  private initializeCalculator(): void {
    try {
      // 解析日期时间字符串
      const dateTimeStr = this.birthData.datetime;
      console.log('[EnhancedBaziCalculator] 原始日期时间:', dateTimeStr);

      // 直接解析日期，避免时区转换问题
      const [datePart, timePart] = dateTimeStr.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart
        ? timePart.split(':').map(Number)
        : [0, 0];

      // 创建本地Date对象（避免时区转换）
      const birthDate = new Date(year, month - 1, day, hour, minute);
      console.log('[EnhancedBaziCalculator] 解析后日期:', birthDate);
      console.log(
        '[EnhancedBaziCalculator] 本地时间:',
        birthDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      );

      // 转换为农历（简化版，实际应该使用专业的农历库）
      const lunarDate = this.convertToLunar(birthDate);
      console.log('[EnhancedBaziCalculator] 农历日期:', lunarDate);

      // 检查是否跨日（中国传统：23:00-01:00为子时，属于次日）
      const actualHour = birthDate.getHours();
      const isCrossDay = actualHour >= 23 || actualHour < 1;

      if (isCrossDay) {
        console.log('[EnhancedBaziCalculator] 检测到跨日子时，调整日期');
        // 如果是23:00-01:00，按中国传统应该算作次日
        if (actualHour >= 23) {
          birthDate.setDate(birthDate.getDate() + 1);
        }
        console.log('[EnhancedBaziCalculator] 调整后日期:', birthDate);
      }

      if (!isValid(birthDate)) {
        throw new Error('无效的出生日期');
      }

      // 标准化性别处理
      const gender = this.normalizeGender(this.birthData.gender);

      // 使用简化的构造函数，避免时区问题
      this.calculator = new BaziCalculator(
        birthDate,
        gender,
        this.birthData.timezone || 'Asia/Shanghai',
        this.birthData.isTimeKnown ?? true
      );

      console.log('[EnhancedBaziCalculator] 计算器初始化成功');
    } catch (error) {
      console.error('[EnhancedBaziCalculator] 初始化失败:', error);
      throw new Error(
        `八字计算器初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 标准化性别处理
   */
  private normalizeGender(gender: string): 'male' | 'female' {
    const normalizedGender = gender.toLowerCase();
    return normalizedGender === 'male' || normalizedGender === '男'
      ? 'male'
      : 'female';
  }

  /**
   * 获取完整的八字分析结果
   */
  async getCompleteAnalysis(): Promise<EnhancedBaziResult | null> {
    if (!this.calculator) {
      throw new Error('计算器未初始化');
    }

    const cacheKey = 'complete_analysis';

    // 检查缓存
    if (this.cachedResults.has(cacheKey)) {
      return this.cachedResults.get(cacheKey);
    }

    try {
      console.log('[EnhancedBaziCalculator] 开始获取完整分析...');
      const analysis = this.calculator.getCompleteAnalysis();
      console.log('[EnhancedBaziCalculator] 原始分析结果:', analysis);

      if (!analysis) {
        console.error('[EnhancedBaziCalculator] 分析结果为空');
        return null;
      }

      // 转换为增强型结果
      console.log('[EnhancedBaziCalculator] 开始转换传统格式...');
      const legacy = this.convertToLegacyFormat(analysis);
      console.log('[EnhancedBaziCalculator] 转换后的传统格式:', legacy);

      const enhancedResult: EnhancedBaziResult = {
        ...legacy,
        luckPillars: this.extractLuckPillars(analysis),
        tenGodsAnalysis: this.extractTenGodsAnalysis(analysis),
        interactions: this.extractInteractions(analysis),
        dayMasterStrength: this.extractDayMasterStrength(analysis),
        favorableElements: this.extractFavorableElements(analysis),
      };

      // 覆盖/融合用神：使用内部专业算法重算喜忌（更可信）
      try {
        const pillars: Pillars = legacy.pillars as any;
        const y = computeYongShen(pillars);
        enhancedResult.favorableElements = {
          primary: [y.favorable[0] || ''],
          secondary: y.favorable.slice(1),
          unfavorable: y.unfavorable,
          explanation: y.rationale.join('；'),
        };
        // 同步到 BaziResult.yongshen 以保持一致
        (enhancedResult as any).yongshen = {
          favorable: y.favorable,
          unfavorable: y.unfavorable,
          commentary: y.rationale.join('；'),
        };
      } catch (e) {
        console.warn('[EnhancedBaziCalculator] 用神重算失败，保留库结果:', e);
      }

      // 缓存结果
      this.cachedResults.set(cacheKey, enhancedResult);

      return enhancedResult;
    } catch (error) {
      console.error('[EnhancedBaziCalculator] 完整分析失败:', error);
      return null;
    }
  }

  /**
   * 获取每日分析
   */
  async getDailyAnalysis(
    targetDate: Date,
    type: 'general' | 'personalized' = 'personalized'
  ): Promise<DailyAnalysisResult | null> {
    if (!this.calculator) {
      return null;
    }

    const cacheKey = `daily_${targetDate.toISOString()}_${type}`;

    if (this.cachedResults.has(cacheKey)) {
      return this.cachedResults.get(cacheKey);
    }

    try {
      const analysis = this.calculator.getAnalysisForDate(
        targetDate,
        this.birthData.timezone!,
        { type }
      );

      if (!analysis) {
        return null;
      }

      const result: DailyAnalysisResult = {
        date: String((analysis as any).date || ''),
        dayPillar: {
          chinese: String((analysis as any).dayPillar?.chinese || ''),
          element: String((analysis as any).dayPillar?.stemElement || ''),
        },
        interactions: Number(
          ((analysis as any).interactions?.length || 0) as any
        ),
        isFavorable: this.evaluateDayFavorability(analysis as any),
        recommendation: this.generateDayRecommendation(analysis as any),
      };

      this.cachedResults.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('[EnhancedBaziCalculator] 每日分析失败:', error);
      return null;
    }
  }

  /**
   * 获取大运分析
   */
  async getLuckPillarsAnalysis(): Promise<LuckPillarResult[] | null> {
    if (!this.calculator) {
      return null;
    }

    const cacheKey = 'luck_pillars';

    if (this.cachedResults.has(cacheKey)) {
      return this.cachedResults.get(cacheKey);
    }

    try {
      const analysis = this.calculator.getCompleteAnalysis();

      if (!analysis?.luckPillars) {
        return null;
      }

      const luckPillars: LuckPillarResult[] = analysis.luckPillars.pillars.map(
        (pillar) => ({
          period: pillar.number,
          heavenlyStem: pillar.heavenlyStem.character,
          earthlyBranch: pillar.earthlyBranch.character,
          startAge: pillar.ageStart || 0,
          endAge: (pillar.ageStart || 0) + 9,
          startDate: pillar.startTime || undefined,
          endDate: pillar.yearEnd ? new Date(pillar.yearEnd * 1000) : undefined,
          strength: this.evaluateLuckPillarStrength(pillar),
        })
      );

      this.cachedResults.set(cacheKey, luckPillars);
      return luckPillars;
    } catch (error) {
      console.error('[EnhancedBaziCalculator] 大运分析失败:', error);
      return null;
    }
  }

  /**
   * 获取当前大运
   */
  async getCurrentLuckPillar(): Promise<LuckPillarResult | null> {
    const luckPillars = await this.getLuckPillarsAnalysis();

    if (!luckPillars) {
      return null;
    }

    const currentAge = this.calculateCurrentAge();

    return (
      luckPillars.find(
        (pillar) => currentAge >= pillar.startAge && currentAge <= pillar.endAge
      ) || null
    );
  }

  /**
   * 转换为传统格式以保持兼容性
   */
  private convertToLegacyFormat(analysis: any): BaziResult {
    // 调试输出
    console.log('[EnhancedBaziCalculator] 原始分析数据结构:', {
      mainPillars: analysis.mainPillars,
      basicAnalysis: analysis.basicAnalysis,
      hasYear: !!analysis.mainPillars?.year,
      hasMonth: !!analysis.mainPillars?.month,
      hasDay: !!analysis.mainPillars?.day,
      hasTime: !!analysis.mainPillars?.time,
    });

    // 尝试不同的数据结构路径
    const pillars = {
      year: this.convertPillarToLegacy(
        analysis.mainPillars?.year || analysis.year
      ),
      month: this.convertPillarToLegacy(
        analysis.mainPillars?.month || analysis.month
      ),
      day: this.convertPillarToLegacy(
        analysis.mainPillars?.day || analysis.day
      ),
      hour: this.convertPillarToLegacy(
        analysis.mainPillars?.time || analysis.time || analysis.hour
      ),
    };

    // 仅做日志校验
    this.validateAndCorrectPillars(pillars);

    // 仅重算日柱（权威基准 1900-01-31 甲子日 + 子时跨日），并据此重算时柱
    try {
      const birthDate = this.createLocalBirthDate();
      const recomputedDay = this.computeSexagenaryDay(birthDate, true);
      if (recomputedDay && recomputedDay.chinese !== pillars.day?.chinese) {
        console.log(
          '[EnhancedBaziCalculator] 覆盖库日柱为重算值:',
          pillars.day?.chinese,
          '=>',
          recomputedDay.chinese
        );
        pillars.day = recomputedDay;
        const recomputedHour = this.computeHourPillar(
          birthDate,
          pillars.day?.heavenlyStem
        );
        if (recomputedHour) {
          pillars.hour = recomputedHour;
          console.log(
            '[EnhancedBaziCalculator] 重算时柱:',
            recomputedHour.chinese
          );
        }
      }
    } catch (e) {
      console.warn('[EnhancedBaziCalculator] 重算日/时失败，保留库结果:', e);
    }

    // 调试输出四柱信息
    console.log(
      '[EnhancedBaziCalculator] 转换后的四柱:',
      JSON.stringify(pillars, null, 2)
    );

    return {
      pillars,
      elements: this.convertFiveElementsToLegacy(
        analysis.basicAnalysis?.fiveFactors || analysis.fiveElements
      ),
      yongshen: {
        favorable:
          analysis.basicAnalysis?.favorableElements?.primary ||
          analysis.favorableElements ||
          [],
        unfavorable:
          analysis.basicAnalysis?.favorableElements?.unfavorable ||
          analysis.unfavorableElements ||
          [],
      },
    } as BaziResult;
  }

  /**
   * 验证并修正四柱数据
   */
  private validateAndCorrectPillars(pillars: any) {
    console.log('[EnhancedBaziCalculator] 开始验证四柱数据...');

    // 检查日柱和时柱是否相同（这通常表示算法错误）
    if (
      pillars.day &&
      pillars.hour &&
      pillars.day.chinese === pillars.hour.chinese
    ) {
      console.warn('[EnhancedBaziCalculator] 日柱和时柱相同，可能存在算法错误');
      console.log('日柱:', pillars.day.chinese, '时柱:', pillars.hour.chinese);

      // 根据出生时间重新计算时柱
      const birthDate = new Date(this.birthData.datetime);
      const hour = birthDate.getHours();
      console.log('出生小时:', hour);

      // 使用正确的时柱计算：五鼠遁日起时诀
      const dayStem = pillars.day.heavenlyStem;
      console.log('日干:', dayStem);

      // 五鼠遁日起时诀
      const timeStemMap: { [key: string]: string[] } = {
        甲: [
          '甲子',
          '乙丑',
          '丙寅',
          '丁卯',
          '戊辰',
          '己巳',
          '庚午',
          '辛未',
          '壬申',
          '癸酉',
          '甲戌',
          '乙亥',
        ],
        乙: [
          '丙子',
          '丁丑',
          '戊寅',
          '己卯',
          '庚辰',
          '辛巳',
          '壬午',
          '癸未',
          '甲申',
          '乙酉',
          '丙戌',
          '丁亥',
        ],
        丙: [
          '戊子',
          '己丑',
          '庚寅',
          '辛卯',
          '壬辰',
          '癸巳',
          '甲午',
          '乙未',
          '丙申',
          '丁酉',
          '戊戌',
          '己亥',
        ],
        丁: [
          '庚子',
          '辛丑',
          '壬寅',
          '癸卯',
          '甲辰',
          '乙巳',
          '丙午',
          '丁未',
          '戊申',
          '己酉',
          '庚戌',
          '辛亥',
        ],
        戊: [
          '壬子',
          '癸丑',
          '甲寅',
          '乙卯',
          '丙辰',
          '丁巳',
          '戊午',
          '己未',
          '庚申',
          '辛酉',
          '壬戌',
          '癸亥',
        ],
        己: [
          '甲子',
          '乙丑',
          '丙寅',
          '丁卯',
          '戊辰',
          '己巳',
          '庚午',
          '辛未',
          '壬申',
          '癸酉',
          '甲戌',
          '乙亥',
        ],
        庚: [
          '丙子',
          '丁丑',
          '戊寅',
          '己卯',
          '庚辰',
          '辛巳',
          '壬午',
          '癸未',
          '甲申',
          '乙酉',
          '丙戌',
          '丁亥',
        ],
        辛: [
          '戊子',
          '己丑',
          '庚寅',
          '辛卯',
          '壬辰',
          '癸巳',
          '甲午',
          '乙未',
          '丙申',
          '丁酉',
          '戊戌',
          '己亥',
        ],
        壬: [
          '庚子',
          '辛丑',
          '壬寅',
          '癸卯',
          '甲辰',
          '乙巳',
          '丙午',
          '丁未',
          '戊申',
          '己酉',
          '庚戌',
          '辛亥',
        ],
        癸: [
          '壬子',
          '癸丑',
          '甲寅',
          '乙卯',
          '丙辰',
          '丁巳',
          '戊午',
          '己未',
          '庚申',
          '辛酉',
          '壬戌',
          '癸亥',
        ],
      };

      const timeStems = timeStemMap[dayStem];
      if (timeStems) {
        // 子时跨日：以(小时+1)再除以2取整，确保00:00-00:59 仍归子时索引0，02:30 为丑时索引1
        const timeIndex = Math.floor(((hour + 1) % 24) / 2);
        const correctedTimePillar = timeStems[timeIndex];

        console.log('时辰索引:', timeIndex, '修正时柱:', correctedTimePillar);

        if (correctedTimePillar) {
          pillars.hour = {
            chinese: correctedTimePillar,
            heavenlyStem: correctedTimePillar[0],
            earthlyBranch: correctedTimePillar[1],
            element: this.getElementFromStem(correctedTimePillar[0]),
            animal: this.getAnimalFromBranch(correctedTimePillar[1]),
          };

          console.log(
            '[EnhancedBaziCalculator] 修正时柱为:',
            correctedTimePillar
          );
        }
      }
    }

    // 移除对特定日期的硬编码日柱修正，避免误判
  }

  // —— 干支基础表 ——
  private readonly heavenlyStems = [
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
  ] as const;
  private readonly earthlyBranches = [
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
  ] as const;

  // 生成统一的柱对象
  private makePillar(stem: string, branch: string) {
    return {
      chinese: `${stem}${branch}`,
      heavenlyStem: stem,
      earthlyBranch: branch,
      element: this.getElementFromStem(stem),
      animal: this.getAnimalFromBranch(branch),
    };
  }

  // 创建本地出生时间（避免时区漂移）
  private createLocalBirthDate(): Date {
    const dateTimeStr = this.birthData as any; // 避免引入更多类型改动
    const raw = (dateTimeStr?.datetime as string) || '';
    const [datePart, timePart] = raw.split('T');
    const [y, m, d] = (datePart || '').split('-').map(Number);
    const [hh, mm] = timePart ? timePart.split(':').map(Number) : [0, 0];
    return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0);
  }

  // 计算干支日（使用权威基准：2000年1月1日戊午日）
  private computeSexagenaryDay(date: Date, useZiBoundary: boolean): any {
    const local = new Date(date.getTime());
    const hour = local.getHours();

    // 子时跨日处理：23:00-23:59按传统算作次日
    if (useZiBoundary && hour >= 23) {
      local.setDate(local.getDate() + 1);
      local.setHours(0, 0, 0, 0);
    } else {
      local.setHours(0, 0, 0, 0);
    }

    // 使用2000年1月1日戊午日作为权威基准点
    const referenceDate = new Date(2000, 0, 1); // 2000年1月1日
    referenceDate.setHours(0, 0, 0, 0);
    const referencePillar = '戊午'; // 已确认的正确日柱

    // 计算天数差
    const daysDiff = Math.floor(
      (local.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // 60甲子表
    const jiazi = [
      '甲子',
      '乙丑',
      '丙寅',
      '丁卯',
      '戊辰',
      '己巳',
      '庚午',
      '辛未',
      '壬申',
      '癸酉',
      '甲戌',
      '乙亥',
      '丙子',
      '丁丑',
      '戊寅',
      '己卯',
      '庚辰',
      '辛巳',
      '壬午',
      '癸未',
      '甲申',
      '乙酉',
      '丙戌',
      '丁亥',
      '戊子',
      '己丑',
      '庚寅',
      '辛卯',
      '壬辰',
      '癸巳',
      '甲午',
      '乙未',
      '丙申',
      '丁酉',
      '戊戌',
      '己亥',
      '庚子',
      '辛丑',
      '壬寅',
      '癸卯',
      '甲辰',
      '乙巳',
      '丙午',
      '丁未',
      '戊申',
      '己酉',
      '庚戌',
      '辛亥',
      '壬子',
      '癸丑',
      '甲寅',
      '乙卯',
      '丙辰',
      '丁巳',
      '戊午',
      '己未',
      '庚申',
      '辛酉',
      '壬戌',
      '癸亥',
    ];

    // 找到戊午在60甲子中的索引
    const referenceIndex = jiazi.indexOf(referencePillar); // 戊午的索引 = 54

    // 计算目标日期的索引
    const targetIndex = (((referenceIndex + daysDiff) % 60) + 60) % 60; // 确保结果为正数
    const pillarStr = jiazi[targetIndex];

    const stem = pillarStr[0];
    const branch = pillarStr[1];

    console.log(
      '[EnhancedBaziCalculator] 干支日重算: daysDiff=',
      daysDiff,
      'refIndex=',
      referenceIndex,
      'targetIndex=',
      targetIndex,
      '=>',
      pillarStr
    );

    return this.makePillar(stem, branch);
  }

  // 计算时柱（五鼠遁）
  private computeHourPillar(date: Date, dayStem?: string) {
    if (!dayStem) return null;
    const hour = date.getHours();
    const timeIndex = Math.floor(((hour + 1) % 24) / 2); // 子时跨日索引
    const map: { [k: string]: string[] } = {
      甲: [
        '甲子',
        '乙丑',
        '丙寅',
        '丁卯',
        '戊辰',
        '己巳',
        '庚午',
        '辛未',
        '壬申',
        '癸酉',
        '甲戌',
        '乙亥',
      ],
      乙: [
        '丙子',
        '丁丑',
        '戊寅',
        '己卯',
        '庚辰',
        '辛巳',
        '壬午',
        '癸未',
        '甲申',
        '乙酉',
        '丙戌',
        '丁亥',
      ],
      丙: [
        '戊子',
        '己丑',
        '庚寅',
        '辛卯',
        '壬辰',
        '癸巳',
        '甲午',
        '乙未',
        '丙申',
        '丁酉',
        '戊戌',
        '己亥',
      ],
      丁: [
        '庚子',
        '辛丑',
        '壬寅',
        '癸卯',
        '甲辰',
        '乙巳',
        '丙午',
        '丁未',
        '戊申',
        '己酉',
        '庚戌',
        '辛亥',
      ],
      戊: [
        '壬子',
        '癸丑',
        '甲寅',
        '乙卯',
        '丙辰',
        '丁巳',
        '戊午',
        '己未',
        '庚申',
        '辛酉',
        '壬戌',
        '癸亥',
      ],
      己: [
        '甲子',
        '乙丑',
        '丙寅',
        '丁卯',
        '戊辰',
        '己巳',
        '庚午',
        '辛未',
        '壬申',
        '癸酉',
        '甲戌',
        '乙亥',
      ],
      庚: [
        '丙子',
        '丁丑',
        '戊寅',
        '己卯',
        '庚辰',
        '辛巳',
        '壬午',
        '癸未',
        '甲申',
        '乙酉',
        '丙戌',
        '丁亥',
      ],
      辛: [
        '戊子',
        '己丑',
        '庚寅',
        '辛卯',
        '壬辰',
        '癸巳',
        '甲午',
        '乙未',
        '丙申',
        '丁酉',
        '戊戌',
        '己亥',
      ],
      壬: [
        '庚子',
        '辛丑',
        '壬寅',
        '癸卯',
        '甲辰',
        '乙巳',
        '丙午',
        '丁未',
        '戊申',
        '己酉',
        '庚戌',
        '辛亥',
      ],
      癸: [
        '壬子',
        '癸丑',
        '甲寅',
        '乙卯',
        '丙辰',
        '丁巳',
        '戊午',
        '己未',
        '庚申',
        '辛酉',
        '壬戌',
        '癸亥',
      ],
    };
    const arr = map[dayStem];
    const pillar = arr?.[timeIndex];
    if (!pillar) return null;
    const stem = pillar[0];
    const branch = pillar[1];
    return this.makePillar(stem, branch);
  }

  /**
   * 根据天干获取五行
   */
  private getElementFromStem(stem: string): string {
    const stemElements: { [key: string]: string } = {
      甲: 'WOOD',
      乙: 'WOOD',
      丙: 'FIRE',
      丁: 'FIRE',
      戊: 'EARTH',
      己: 'EARTH',
      庚: 'METAL',
      辛: 'METAL',
      壬: 'WATER',
      癸: 'WATER',
    };
    return stemElements[stem] || '';
  }

  /**
   * 根据地支获取生肖
   */
  private getAnimalFromBranch(branch: string): string {
    const branchAnimals: { [key: string]: string } = {
      子: 'Rat',
      丑: 'Ox',
      寅: 'Tiger',
      卯: 'Rabbit',
      辰: 'Dragon',
      巳: 'Snake',
      午: 'Horse',
      未: 'Goat',
      申: 'Monkey',
      酉: 'Rooster',
      戌: 'Dog',
      亥: 'Pig',
    };
    return branchAnimals[branch] || '';
  }

  /**
   * 转换为农历（简化版）
   */
  private convertToLunar(date: Date): {
    year: number;
    month: number;
    day: number;
  } {
    // 这是一个简化的农历转换，实际项目中应该使用专业的农历库
    // 这里只是示例，返回公历日期
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  /**
   * 转换柱子数据到传统格式
   */
  private convertPillarToLegacy(pillar: any): any {
    if (!pillar) {
      return null;
    }

    console.log('[EnhancedBaziCalculator] 柱子原始数据:', pillar);

    // 尝试多种可能的数据结构
    let heavenlyStem = '';
    let earthlyBranch = '';
    let element = '';
    let animal = '';

    // 从chinese字段提取天干地支
    if (pillar.chinese && typeof pillar.chinese === 'string') {
      // 天干地支是连在一起的，需要分离
      if (pillar.chinese.length >= 2) {
        heavenlyStem = pillar.chinese[0];
        earthlyBranch = pillar.chinese[1];
      }
    }

    // 如果chinese字段提取失败，尝试其他方式
    if (!heavenlyStem) {
      if (typeof pillar.heavenlyStem === 'string') {
        heavenlyStem = pillar.heavenlyStem;
      } else if (pillar.heavenlyStem?.character) {
        heavenlyStem = pillar.heavenlyStem.character;
      } else if (typeof pillar.stem === 'string') {
        heavenlyStem = pillar.stem;
      } else if (pillar.stem?.character) {
        heavenlyStem = pillar.stem.character;
      }
    }

    if (!earthlyBranch) {
      if (typeof pillar.earthlyBranch === 'string') {
        earthlyBranch = pillar.earthlyBranch;
      } else if (pillar.earthlyBranch?.character) {
        earthlyBranch = pillar.earthlyBranch.character;
      } else if (typeof pillar.branch === 'string') {
        earthlyBranch = pillar.branch;
      } else if (pillar.branch?.character) {
        earthlyBranch = pillar.branch.character;
      }
    }

    // 如果仍然没有提取到，尝试从chinese字段重新解析
    if (!heavenlyStem || !earthlyBranch) {
      if (
        pillar.chinese &&
        typeof pillar.chinese === 'string' &&
        pillar.chinese.length >= 2
      ) {
        if (!heavenlyStem) {
          heavenlyStem = pillar.chinese[0];
        }
        if (!earthlyBranch) {
          earthlyBranch = pillar.chinese[1];
        }
      }
    }

    // 元素提取
    if (pillar.heavenlyStem?.elementType) {
      element = pillar.heavenlyStem.elementType;
    } else if (pillar.element) {
      element = pillar.element;
    }

    // 动物提取
    if (pillar.earthlyBranch?.animal) {
      animal = pillar.earthlyBranch.animal;
    } else if (pillar.branch?.animal) {
      animal = pillar.branch.animal;
    } else if (pillar.animal) {
      animal = pillar.animal;
    }

    // 构建完整的中文表示
    const chinese =
      heavenlyStem && earthlyBranch
        ? `${heavenlyStem}${earthlyBranch}`
        : pillar.chinese || '';

    const result = {
      chinese,
      heavenlyStem,
      earthlyBranch,
      stem: heavenlyStem, // 添加stem属性以保持兼容性
      branch: earthlyBranch, // 添加branch属性以保持兼容性
      element,
      animal,
    };

    console.log('[EnhancedBaziCalculator] 柱子转换结果:', result);

    return result;
  }

  /**
   * 转换五行数据到传统格式
   */
  private convertFiveElementsToLegacy(fiveFactors: any): any {
    return {
      wood: fiveFactors?.WOOD || 0,
      fire: fiveFactors?.FIRE || 0,
      earth: fiveFactors?.EARTH || 0,
      metal: fiveFactors?.METAL || 0,
      water: fiveFactors?.WATER || 0,
    } as any;
  }

  /**
   * 提取大运信息
   */
  private extractLuckPillars(analysis: any): LuckPillarResult[] | undefined {
    if (!analysis.luckPillars?.pillars) {
      return undefined;
    }

    return analysis.luckPillars.pillars.map((pillar: any) => ({
      period: pillar.number,
      heavenlyStem: pillar.heavenlyStem.character,
      earthlyBranch: pillar.earthlyBranch.character,
      startAge: pillar.ageStart || 0,
      endAge: (pillar.ageStart || 0) + 9,
      startDate: pillar.startTime || undefined,
      strength: this.evaluateLuckPillarStrength(pillar),
    }));
  }

  /**
   * 提取十神分析
   */
  private extractTenGodsAnalysis(
    analysis: any
  ): TenGodsAnalysisResult | undefined {
    // 这里可以根据实际的十神数据结构进行提取
    return {
      relationships: {},
      influence: 'moderate',
      recommendations: [],
    };
  }

  /**
   * 提取互动信息
   */
  private extractInteractions(analysis: any): BaziInteraction[] | undefined {
    if (!analysis.interactions) {
      return undefined;
    }

    return analysis.interactions.map((interaction: any) => ({
      type: this.mapInteractionType(interaction.type),
      description: interaction.description || '',
      strength: interaction.involvesFavorableElement ? 'strong' : 'weak',
      impact: interaction.involvesUnfavorableElement ? 'negative' : 'positive',
    }));
  }

  /**
   * 提取日主强度
   */
  private extractDayMasterStrength(
    analysis: any
  ): DayMasterStrengthResult | undefined {
    if (!analysis.basicAnalysis?.dayMasterStrength) {
      return undefined;
    }

    const strength = analysis.basicAnalysis.dayMasterStrength;
    return {
      strength: strength.strength?.toLowerCase() || 'balanced',
      score: strength.score || 0,
      factors: strength.notes || [],
      recommendations: this.generateStrengthRecommendations(strength),
    };
  }

  /**
   * 提取有利元素
   */
  private extractFavorableElements(
    analysis: any
  ): FavorableElementsResult | undefined {
    if (!analysis.basicAnalysis?.favorableElements) {
      return undefined;
    }

    const elements = analysis.basicAnalysis.favorableElements;
    return {
      primary: elements.primary || [],
      secondary: elements.secondary || [],
      unfavorable: elements.unfavorable || [],
      explanation: elements.notes?.join(' ') || '',
    };
  }

  /**
   * 映射互动类型
   */
  private mapInteractionType(type: string): BaziInteraction['type'] {
    const typeMap: Record<string, BaziInteraction['type']> = {
      StemClash: 'clash',
      StemCombination: 'combination',
      BranchPunishment: 'punishment',
      BranchDestruction: 'destruction',
    };

    return typeMap[type] || 'clash';
  }

  /**
   * 评估大运强度
   */
  private evaluateLuckPillarStrength(
    pillar: any
  ): 'strong' | 'weak' | 'balanced' {
    // 简化的评估逻辑，实际可以根据五行关系进行更复杂的计算
    return 'balanced';
  }

  /**
   * 评估日期吉凶
   */
  private evaluateDayFavorability(analysis: any): boolean {
    // 简化的评估逻辑
    return (analysis.interactions?.length || 0) < 5;
  }

  /**
   * 生成日期建议
   */
  private generateDayRecommendation(analysis: any): string {
    const interactionCount = analysis.interactions?.length || 0;

    if (interactionCount > 10) {
      return '今日互动较多，建议谨慎行事';
    }
    if (interactionCount > 5) {
      return '今日运势一般，可进行常规活动';
    }
    return '今日运势良好，适合重要事项';
  }

  /**
   * 生成强度建议
   */
  private generateStrengthRecommendations(strength: any): string[] {
    const recommendations: string[] = [];

    if (strength.strength === 'weak') {
      recommendations.push('建议加强有利五行元素的使用');
      recommendations.push('避免过多使用克制五行');
    } else if (strength.strength === 'strong') {
      recommendations.push('保持现有生活方式的平衡');
      recommendations.push('注意不要过度使用生助五行');
    }

    return recommendations;
  }

  /**
   * 计算当前年龄
   */
  private calculateCurrentAge(): number {
    const birthDate = new Date(this.birthData.datetime);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * 获取原始计算器（用于高级功能）
   */
  getRawCalculator(): BaziCalculator | null {
    return this.calculator;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedResults.clear();
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cachedResults.size,
      keys: Array.from(this.cachedResults.keys()),
    };
  }
}

/**
 * 工厂函数：创建增强型计算器
 */
export function createEnhancedBaziCalculator(
  birthData: EnhancedBirthData
): EnhancedBaziCalculator {
  return new EnhancedBaziCalculator(birthData);
}

/**
 * 便捷函数：快速八字分析
 */
export async function quickBaziAnalysis(
  birthData: EnhancedBirthData
): Promise<EnhancedBaziResult | null> {
  const calculator = createEnhancedBaziCalculator(birthData);
  return await calculator.getCompleteAnalysis();
}

/**
 * 便捷函数：每日运势分析
 */
export async function dailyFortuneAnalysis(
  birthData: EnhancedBirthData,
  targetDate: Date
): Promise<DailyAnalysisResult | null> {
  const calculator = createEnhancedBaziCalculator(birthData);
  return await calculator.getDailyAnalysis(targetDate);
}
