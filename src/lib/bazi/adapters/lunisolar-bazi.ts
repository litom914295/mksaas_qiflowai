/**
 * QiFlow AI - Lunisolar 八字计算适配器
 *
 * 完全兼容现有 EnhancedBaziCalculator API
 * 使用 Lunisolar + char8ex 插件提供专业级八字计算
 * 包含性能优化和缓存机制
 */

import type {
  EnhancedBaziResult,
  EnhancedBirthData,
  LuckPillarResult,
} from '../enhanced-calculator';
import type { Pillars } from '../types';

// 动态导入 Lunisolar 及插件
let lunisolar: any;
let isInitialized = false;

// 简单的内存缓存
const resultCache = new Map<
  string,
  { result: EnhancedBaziResult; timestamp: number }
>();
const CACHE_TTL = 1000 * 60 * 30; // 30分钟缓存

/**
 * 初始化 Lunisolar（仅执行一次）
 */
function initializeLunisolar() {
  if (isInitialized) return;

  try {
    // 使用 require 加载以支持 CommonJS
    const Lunisolar = require('lunisolar');
    const char8exModule = require('@lunisolar/plugin-char8ex');

    // Lunisolar 是 function，不需要 default
    lunisolar = Lunisolar;

    // char8ex 插件从模块中取出
    // 尝试不同的导出方式
    const char8exPlugin =
      char8exModule.default || char8exModule.char8ex || char8exModule;

    // 确保插件是函数
    if (typeof char8exPlugin !== 'function') {
      console.error('[Lunisolar] char8ex 插件不是函数:', typeof char8exPlugin);
      console.error(
        '[Lunisolar] char8exModule 内容:',
        Object.keys(char8exModule)
      );
    }

    // 扩展 Lunisolar
    Lunisolar.extend(char8exPlugin);

    // 验证插件是否加载成功
    const testDate = Lunisolar('2024-01-01 12:00');
    if (typeof testDate.char8ex !== 'function') {
      console.error('[Lunisolar] char8ex 方法未正确加载');
      throw new Error('char8ex 插件加载失败');
    }

    isInitialized = true;
    console.log('[Lunisolar] 初始化成功，char8ex 插件已加载');
  } catch (error) {
    console.error('[Lunisolar] 初始化失败:', error);
    throw error;
  }
}

/**
 * Lunisolar 八字计算适配器
 * 完全兼容现有 EnhancedBaziCalculator API
 */
export class LunisolarBaziAdapter {
  private lsDate: any;
  private birthData: EnhancedBirthData;
  private baziData: any;
  private solarDateForDisplay?: string; // 记录转换后的阳历日期供显示

  constructor(birthData: EnhancedBirthData) {
    // 初始化 Lunisolar
    initializeLunisolar();
    console.log('========== LunisolarBaziAdapter 构造 ==========');
    console.log('原始 birthData.calendarType:', birthData.calendarType);
    this.birthData = this.normalizeBirthData(birthData);
    console.log(
      '标准化后 birthData.calendarType:',
      this.birthData.calendarType
    );
    this.initialize();
  }

  /**
   * 验证出生数据
   */
  private validateBirthData(data: EnhancedBirthData): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // 1. 验证日期时间
    if (!data.datetime) {
      errors.push('出生日期时间不能为空');
    } else {
      const date = new Date(data.datetime);
      if (Number.isNaN(date.getTime())) {
        errors.push('日期时间格式错误');
      } else if (date.getFullYear() < 1900 || date.getFullYear() > 2100) {
        errors.push('年份必须在1900-2100之间');
      }
    }

    // 2. 验证性别
    if (!data.gender) {
      errors.push('性别不能为空');
    } else if (
      !['male', 'female', 'm', 'f', '男', '女'].includes(
        data.gender.toLowerCase()
      )
    ) {
      errors.push('性别格式错误，应为male/female或男/女');
    }

    // 3. 验证经纬度（如果提供）
    if (data.longitude !== undefined) {
      const lon = Number(data.longitude);
      if (Number.isNaN(lon) || lon < -180 || lon > 180) {
        errors.push('经度必须在0-180之间');
      }
    }

    if (data.latitude !== undefined) {
      const lat = Number(data.latitude);
      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        errors.push('纬度必须在-90到90之间');
      }
    }

    // 4. 验证时区（如果提供）
    if (data.timezone && typeof data.timezone !== 'string') {
      errors.push('时区格式错误');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 标准化出生数据
   */
  private normalizeBirthData(data: EnhancedBirthData): EnhancedBirthData {
    // 先验证数据
    const validation = this.validateBirthData(data);
    if (!validation.valid) {
      const errorMsg = `数据验证失败: ${validation.errors.join('; ')}`;
      console.error('[LunisolarBaziAdapter]', errorMsg);
      throw new Error(errorMsg);
    }

    return {
      ...data,
      timezone: data.timezone || 'Asia/Shanghai',
      isTimeKnown: data.isTimeKnown ?? true,
      preferredLocale: data.preferredLocale || 'zh-CN',
    };
  }

  /**
   * 初始化
   */
  private initialize(): void {
    try {
      // 解析日期时间
      const datetime = this.birthData.datetime;
      const calendarType = this.birthData.calendarType || 'solar';
      console.log('[LunisolarBaziAdapter] 原始日期时间:', datetime);
      console.log('[LunisolarBaziAdapter] 历法类型:', calendarType);

      // 创建 Lunisolar 日期对象
      if (calendarType === 'lunar') {
        // 如果是阴历，lunisolar 可以直接用阴历计算八字
        const [datePart, timePart] = datetime.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const timeStr = timePart || '00:00';

        console.log('[LunisolarBaziAdapter] 阴历输入:', {
          year,
          month,
          day,
          time: timeStr,
        });

        // 先创建阴历日期（只有年月日）
        const lunarDate = lunisolar.fromLunar({ year, month, day });
        // 然后在转换后的阳历日期上设置时间
        const solarDateStr = lunarDate.format('YYYY-MM-DD');
        this.lsDate = lunisolar(`${solarDateStr} ${timeStr}`);

        // 记录转换后的阳历日期供界面显示
        this.solarDateForDisplay = this.lsDate.format('YYYY-MM-DD HH:mm:ss');

        console.log(
          '[LunisolarBaziAdapter] 阴历转换后的阳历日期:',
          this.solarDateForDisplay
        );
        console.log(
          '[LunisolarBaziAdapter] 注意：lunisolar 可以直接用阴历计算八字，不需要转换'
        );
      } else {
        // 阳历直接创建
        this.lsDate = lunisolar(datetime);
      }
      console.log(
        '[LunisolarBaziAdapter] Lunisolar日期:',
        this.lsDate.format('YYYY-MM-DD HH:mm:ss')
      );

      // 获取八字数据
      // char8 是一个对象，不是函数
      this.baziData = this.lsDate.char8;
      if (!this.baziData || !this.baziData._list) {
        throw new Error('获取八字数据失败');
      }

      console.log('[LunisolarBaziAdapter] 初始化成功');
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 初始化失败:', error);
      throw new Error(
        `Lunisolar 适配器初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
      );
    }
  }

  /**
   * 标准化性别
   */
  private normalizeGender(gender: string): 'male' | 'female' {
    const normalized = gender.toLowerCase().trim();
    if (normalized === 'male' || normalized === 'm' || normalized === '男') {
      return 'male';
    }
    if (normalized === 'female' || normalized === 'f' || normalized === '女') {
      return 'female';
    }
    return 'male'; // 默认
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(): string {
    const { datetime, gender, longitude, latitude, calendarType } =
      this.birthData;
    return `${datetime}-${gender}-${calendarType || 'solar'}-${longitude || 0}-${latitude || 0}`;
  }

  /**
   * 清理过期缓存
   */
  private static cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of resultCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        resultCache.delete(key);
      }
    }
  }

  /**
   * 清除所有缓存（用于调试和测试）
   */
  public static clearAllCache(): void {
    resultCache.clear();
    console.log('[LunisolarBaziAdapter] 已清除所有缓存');
  }

  /**
   * 计算完整八字结果（带缓存和性能监控）
   */
  async calculate(): Promise<EnhancedBaziResult> {
    const startTime = Date.now();
    const cacheKey = this.getCacheKey();
    console.log('[LunisolarBaziAdapter] 生成的缓存键:', cacheKey);
    console.log('[LunisolarBaziAdapter] 当前缓存数量:', resultCache.size);
    console.log(
      '[LunisolarBaziAdapter] 所有缓存键:',
      Array.from(resultCache.keys())
    );

    // 临时：强制清除缓存以测试修复
    if (this.birthData.calendarType === 'lunar') {
      console.log(
        '[LunisolarBaziAdapter] 🔄 阴历输入，强制重新计算（跳过缓存）'
      );
      // 不使用缓存，直接继续计算
    } else {
      // 检查缓存
      const cached = resultCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(
          '[LunisolarBaziAdapter] ⚠️ 使用缓存结果，缓存键匹配:',
          cacheKey
        );
        console.log(
          '[LunisolarBaziAdapter] 缓存时间:',
          new Date(cached.timestamp).toISOString()
        );
        return cached.result;
      }
    }

    try {
      console.log('[LunisolarBaziAdapter] 开始计算八字');

      // 1. 基础四柱
      const pillars = this.calculatePillars();
      console.log('[LunisolarBaziAdapter] 四柱:', pillars);

      // 2. 五行分析
      const elements = this.calculateElements();
      console.log('[LunisolarBaziAdapter] 五行:', elements);

      // 3. 十神分析
      const tenGods = this.calculateTenGods();
      console.log('[LunisolarBaziAdapter] 十神:', tenGods);

      // 4. 用神分析（基于五行和日主强弱）
      const yongshen = this.calculateYongshen(elements, pillars);
      console.log('[LunisolarBaziAdapter] 用神:', yongshen);

      // 5. 大运分析
      const luckPillars = this.calculateLuckPillars();

      // 6. 农历信息
      const lunar = this.getLunarInfo();

      // 7. 神煞信息
      const shensha = this.calculateShensha();

      // 8. 胎元、命宫、身宫、空亡
      const advancedFeatures = this.calculateAdvancedFeatures();

      // 9. 格局分析
      const pattern = this.calculatePattern(pillars, tenGods, elements);
      console.log('[LunisolarBaziAdapter] 格局:', pattern);

      // 10. 日主命理分析
      const dayMasterAnalysis = this.analyzeDayMaster(
        pillars,
        elements,
        tenGods,
        yongshen
      );
      console.log('[LunisolarBaziAdapter] 日主命理:', dayMasterAnalysis);

      // 组装结果
      const yongshenDisplay = {
        primary: yongshen.primary,
        secondary: yongshen.secondary,
        unfavorable: yongshen.unfavorable,
        explanation: yongshen.explanation,
      };

      const result: EnhancedBaziResult = {
        pillars,
        elements,
        favorableElements: yongshenDisplay,
        yongshen: {
          favorable: yongshen.primary,
          unfavorable: yongshen.unfavorable,
          primary: yongshen.primary,
          secondary: yongshen.secondary,
          explanation: yongshen.explanation,
        } as any,
        tenGods,
        tenGodsAnalysis: tenGods?.analysis,
        luckPillars,
        lunar,
        shensha,
        pattern, // 格局分析
        dayMasterAnalysis, // 日主命理分析
        ...advancedFeatures,
        birthData: this.birthData,
        timestamp: new Date().toISOString(),
        // 如果是阴历输入，附加转换后的阳历日期
        ...(this.solarDateForDisplay && {
          solarDateConverted: this.solarDateForDisplay,
          isLunarInput: true,
        }),
      } as EnhancedBaziResult;

      // 计算性能监控
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`[LunisolarBaziAdapter] 计算完成，耗时: ${duration}ms`);

      // 存储到缓存
      resultCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });

      // 定期清理过期缓存
      if (resultCache.size > 100) {
        LunisolarBaziAdapter.cleanExpiredCache();
      }

      return result;
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算失败:', error);
      const endTime = Date.now();
      console.log(`[LunisolarBaziAdapter] 失败耗时: ${endTime - startTime}ms`);
      throw error;
    }
  }

  /**
   * 计算四柱
   */
  private calculatePillars(): Pillars {
    try {
      // char8._list 包含 [year, month, day, hour] 四柱数据
      const [yearPillar, monthPillar, dayPillar, hourPillar] =
        this.baziData._list;

      return {
        year: {
          stem: yearPillar.stem?.name || '',
          branch: yearPillar.branch?.name || '',
          gan: yearPillar.stem?.name || '',
          zhi: yearPillar.branch?.name || '',
        },
        month: {
          stem: monthPillar.stem?.name || '',
          branch: monthPillar.branch?.name || '',
          gan: monthPillar.stem?.name || '',
          zhi: monthPillar.branch?.name || '',
        },
        day: {
          stem: dayPillar.stem?.name || '',
          branch: dayPillar.branch?.name || '',
          gan: dayPillar.stem?.name || '',
          zhi: dayPillar.branch?.name || '',
        },
        hour: {
          stem: hourPillar.stem?.name || '',
          branch: hourPillar.branch?.name || '',
          gan: hourPillar.stem?.name || '',
          zhi: hourPillar.branch?.name || '',
        },
      };
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算四柱失败:', error);
      throw error;
    }
  }

  /**
   * 计算五行分析
   */
  private calculateElements(): any {
    try {
      // 从四柱的天干地支中统计五行
      const [yearPillar, monthPillar, dayPillar, hourPillar] =
        this.baziData._list;

      // 原始分布（计数）
      const distribution: {
        wood: number;
        fire: number;
        earth: number;
        metal: number;
        water: number;
      } = {
        wood: 0,
        fire: 0,
        earth: 0,
        metal: 0,
        water: 0,
      };

      // 五行名称映射（来自 lunisolar 的 e5.name 中文）
      const elementMap: Record<string, keyof typeof distribution> = {
        木: 'wood',
        火: 'fire',
        土: 'earth',
        金: 'metal',
        水: 'water',
      };

      // 统计各个天干地支的五行
      const pillars = [yearPillar, monthPillar, dayPillar, hourPillar];
      pillars.forEach((pillar) => {
        // 天干五行
        const stemElement = pillar.stem?.e5?.name;
        if (stemElement && elementMap[stemElement]) {
          distribution[elementMap[stemElement]]++;
        }

        // 地支五行
        const branchElement = pillar.branch?.e5?.name;
        if (branchElement && elementMap[branchElement]) {
          distribution[elementMap[branchElement]]++;
        }
      });

      // 百分比分布
      const total = Object.values(distribution).reduce(
        (sum, val) => sum + val,
        0
      );
      const percentages =
        total > 0
          ? {
              wood: Math.round((distribution.wood / total) * 100),
              fire: Math.round((distribution.fire / total) * 100),
              earth: Math.round((distribution.earth / total) * 100),
              metal: Math.round((distribution.metal / total) * 100),
              water: Math.round((distribution.water / total) * 100),
            }
          : { ...distribution };

      const lacking = this.getLackingElements(distribution);
      const dominant = this.getDominantElement(distribution);

      return {
        // 兼容：顶层直接提供百分比（wood/fire/...）
        ...percentages,
        // 新增：原始计数与百分比同时返回
        distribution,
        percentages,
        balance: {
          status: lacking.length === 0 ? 'balanced' : 'imbalanced',
          shortage: lacking,
          excess: dominant,
        },
      };
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算五行失败:', error);
      return {
        distribution: {
          wood: 0,
          fire: 0,
          earth: 0,
          metal: 0,
          water: 0,
        },
        percentages: {
          wood: 0,
          fire: 0,
          earth: 0,
          metal: 0,
          water: 0,
        },
        balance: {
          status: 'imbalanced',
          shortage: [],
          excess: [],
        },
      };
    }
  }

  /**
   * 获取主导元素
   */
  private getDominantElement(distribution: Record<string, number>): string[] {
    const elements = [
      { name: 'wood', value: distribution.wood },
      { name: 'fire', value: distribution.fire },
      { name: 'earth', value: distribution.earth },
      { name: 'metal', value: distribution.metal },
      { name: 'water', value: distribution.water },
    ];

    const max = Math.max(...elements.map((e) => e.value));
    if (max === 0) return [];
    return elements.filter((e) => e.value === max).map((e) => e.name);
  }

  /**
   * 获取缺少的元素
   */
  private getLackingElements(distribution: Record<string, number>): string[] {
    const elements = [
      { name: 'wood', value: distribution.wood },
      { name: 'fire', value: distribution.fire },
      { name: 'earth', value: distribution.earth },
      { name: 'metal', value: distribution.metal },
      { name: 'water', value: distribution.water },
    ];

    return elements.filter((e) => e.value === 0).map((e) => e.name);
  }

  /**
   * 计算十神分析
   * 返回 normalize.ts 期望的格式：tenGodsAnalysis
   */
  private calculateTenGods(): any {
    try {
      // 需要性别信息来计算十神
      const sex = this.birthData.gender === 'male' ? 1 : 0;
      const char8ex = this.lsDate.char8ex({ sex });

      // 获取各柱的十神（stemTenGod）
      const yearTenGod = char8ex.year?.stemTenGod;
      const monthTenGod = char8ex.month?.stemTenGod;
      const dayTenGod = char8ex.day?.stemTenGod;
      const hourTenGod = char8ex.hour?.stemTenGod;

      // 统计十神分布
      const distribution: Record<string, number> = {};
      [yearTenGod, monthTenGod, hourTenGod].forEach((tenGod) => {
        const key = tenGod?.key;
        if (key && key !== '日主') {
          distribution[key] = (distribution[key] || 0) + 1;
        }
      });

      // 分析图谱
      const analysis: Record<string, any> = {};
      const totalCount = Object.values(distribution).reduce(
        (sum, c) => sum + c,
        0
      );
      Object.entries(distribution).forEach(([tenGodName, count]) => {
        const strength =
          totalCount > 0 ? Math.round((count / totalCount) * 100) : 50;
        analysis[tenGodName] = {
          count,
          strength,
          trend: 'stable',
          keywords: [tenGodName],
          opportunities: [],
          risks: [],
        };
      });

      const result = {
        year: yearTenGod?.key || '',
        month: monthTenGod?.key || '',
        day: dayTenGod?.key || '',
        hour: hourTenGod?.key || '',
        distribution,
        analysis,
      };

      console.log('[LunisolarBaziAdapter] 十神输出:', result);
      return result;
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算十神失败:', error);
      return {
        year: '',
        month: '',
        day: '',
        hour: '',
        distribution: {},
        analysis: {},
      };
    }
  }

  /**
   * 获取十神分布
   */
  private getTenGodsDistribution(tenGods: any): Record<string, number> {
    const distribution: Record<string, number> = {};

    ['year', 'month', 'day', 'hour'].forEach((pillar) => {
      const god = tenGods[pillar]?.value;
      if (god) {
        distribution[god] = (distribution[god] || 0) + 1;
      }
    });

    return distribution;
  }

  /**
   * 计算用神忌神
   * 基于五行平衡和日主强弱判断
   */
  private calculateYongshen(elements: any, pillars: any): any {
    try {
      // 获取五行分布
      const { wood, fire, earth, metal, water, balance } = elements;

      // 日主五行
      const dayMasterStem = pillars.day.stem;
      const dayMasterElement = this.getStemElement(dayMasterStem);

      console.log(
        '[calculateYongshen] 日主:',
        dayMasterStem,
        '五行:',
        dayMasterElement
      );
      console.log('[calculateYongshen] 五行分布:', {
        wood,
        fire,
        earth,
        metal,
        water,
      });
      console.log('[calculateYongshen] 平衡状态:', balance);

      // 简化判断日主强弱（基于日主五行的百分比）
      const dayMasterScore = this.getElementScore(dayMasterElement, {
        wood,
        fire,
        earth,
        metal,
        water,
      });
      const isStrong = dayMasterScore > 30; // 简化判断

      // 用神逻辑：
      // 1. 日主强：用财官食伤（泄耗日主）
      // 2. 日主弱：用印比（生助日主）
      // 3. 考虑五行缺失和过旺

      let primary: string[] = [];
      let secondary: string[] = [];
      let unfavorable: string[] = [];

      if (isStrong) {
        // 日主强，用泄耗
        const drainElements = this.getDrainElements(dayMasterElement);
        primary = drainElements.slice(0, 1);
        secondary = drainElements.slice(1, 2);

        // 忌神：生助日主的五行
        const supportElements = this.getSupportElements(dayMasterElement);
        unfavorable = supportElements;
      } else {
        // 日主弱，用生助
        const supportElements = this.getSupportElements(dayMasterElement);
        primary = supportElements.slice(0, 1);
        secondary = supportElements.slice(1, 2);

        // 忌神：泄耗日主的五行
        const drainElements = this.getDrainElements(dayMasterElement);
        unfavorable = drainElements;
      }

      // 不再自动添加缺失五行，因为可能与忌神冲突
      // 只在缺失且不是忌神时才补充
      if (balance.shortage && balance.shortage.length > 0) {
        balance.shortage.forEach((elem: string) => {
          // 只有不在忌神列表中，才补充为次用神
          if (
            !unfavorable.includes(elem) &&
            !primary.includes(elem) &&
            !secondary.includes(elem)
          ) {
            secondary.push(elem);
          }
        });
      }

      // 去重并确保用神和忌神不重复
      const finalPrimary = Array.from(new Set(primary)).filter(
        (e) => !unfavorable.includes(e)
      );
      const finalSecondary = Array.from(new Set(secondary)).filter(
        (e) => !unfavorable.includes(e)
      );
      const finalUnfavorable = Array.from(new Set(unfavorable));

      const result = {
        primary: finalPrimary,
        secondary: finalSecondary,
        unfavorable: finalUnfavorable,
        explanation: isStrong
          ? `日主${this.getElementChinese(dayMasterElement)}偏强（${dayMasterScore}%），宜用泄耗之神`
          : `日主${this.getElementChinese(dayMasterElement)}偏弱（${dayMasterScore}%），宜用生助之神`,
      };

      console.log('[calculateYongshen] 结果:', result);
      return result;
    } catch (error) {
      console.error('[calculateYongshen] 计算失败:', error);
      return {
        primary: [],
        secondary: [],
        unfavorable: [],
        explanation: '用神计算中',
      };
    }
  }

  /**
   * 获取天干对应的五行
   */
  private getStemElement(stem: string): string {
    const stemElementMap: Record<string, string> = {
      甲: 'wood',
      乙: 'wood',
      丙: 'fire',
      丁: 'fire',
      戊: 'earth',
      己: 'earth',
      庚: 'metal',
      辛: 'metal',
      壬: 'water',
      癸: 'water',
    };
    return stemElementMap[stem] || 'wood';
  }

  /**
   * 获取五行中文名
   */
  private getElementChinese(element: string): string {
    const elementNames: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    return elementNames[element] || element;
  }

  /**
   * 获取五行的得分
   */
  private getElementScore(
    element: string,
    scores: Record<string, number>
  ): number {
    return scores[element] || 0;
  }

  /**
   * 获取泄耗的五行（我生 + 我克）
   */
  private getDrainElements(element: string): string[] {
    const drainMap: Record<string, string[]> = {
      wood: ['fire', 'earth'], // 木生火，木克土
      fire: ['earth', 'metal'], // 火生土，火克金
      earth: ['metal', 'water'], // 土生金，土克水
      metal: ['water', 'wood'], // 金生水，金克木
      water: ['wood', 'fire'], // 水生木，水克火
    };
    return drainMap[element] || [];
  }

  /**
   * 获取生助的五行（生我 + 同类）
   */
  private getSupportElements(element: string): string[] {
    const supportMap: Record<string, string[]> = {
      wood: ['water', 'wood'], // 水生木，比肩
      fire: ['wood', 'fire'], // 木生火，比肩
      earth: ['fire', 'earth'], // 火生土，比肩
      metal: ['earth', 'metal'], // 土生金，比肩
      water: ['metal', 'water'], // 金生水，比肩
    };
    return supportMap[element] || [];
  }

  /**
   * 计算大运（完善版）
   */
  private calculateLuckPillars(): LuckPillarResult[] {
    try {
      const gender = this.birthData.gender;
      const birthYear = new Date(this.birthData.datetime).getFullYear();
      const pillars = this.calculatePillars();
      const dayMasterStem = pillars.day.stem;
      const dayMasterElement = this.getStemElement(dayMasterStem);

      // 判断阴阳年：根据年干
      const yearStem = pillars.year.stem;
      const yangStems = ['甲', '丙', '戊', '庚', '壬'];
      const isYangYear = yangStems.includes(yearStem);

      // 阳男阴女顺排，阴男阳女逆排
      const isForward =
        (gender === 'male' && isYangYear) ||
        (gender === 'female' && !isYangYear);

      // 获取月柱作为起点
      const [_, monthPillar] = this.baziData._list;
      const monthValue = monthPillar.value;

      // 生成 10 个大运
      const luckPillars: LuckPillarResult[] = [];
      const startAge = this.calculateStartAge(); // 起运岁数

      for (let i = 0; i < 10; i++) {
        // 计算大运干支
        let pillarValue: number;
        if (isForward) {
          pillarValue = (monthValue + i + 1) % 60;
        } else {
          pillarValue = (monthValue - i - 1 + 60) % 60;
        }

        // 使用 Lunisolar 的 SB 类来获取干支名称
        const Lunisolar = require('lunisolar');
        const sb = new Lunisolar.SB(pillarValue);

        const pillarStartAge = startAge + i * 10;
        const pillarEndAge = pillarStartAge + 9;

        // 评估大运强度和吉凶
        const stemElement = this.getStemElement(sb.stem.name);
        const branchElement = this.getBranchElement(sb.branch.name);
        const luckAnalysis = this.analyzeLuckPillar(
          sb.stem.name,
          sb.branch.name,
          dayMasterElement
        );

        luckPillars.push({
          period: i + 1,
          heavenlyStem: sb.stem.name,
          earthlyBranch: sb.branch.name,
          startAge: pillarStartAge,
          endAge: pillarEndAge,
          strength: luckAnalysis.strength,
          score: luckAnalysis.score,
          description: luckAnalysis.description,
          favorable: luckAnalysis.favorable,
          unfavorable: luckAnalysis.unfavorable,
          keyEvents: luckAnalysis.keyEvents,
        });
      }

      return luckPillars;
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算大运失败:', error);
      return [];
    }
  }

  /**
   * 计算起运岁数
   * 简化版：默认从 1 岁起运
   * 实际应根据出生日与节气的距离计算
   */
  private calculateStartAge(): number {
    try {
      // 获取最近的节气信息
      const recentSolarTerm = this.lsDate.recentSolarTerm();
      if (recentSolarTerm?.[1]) {
        const solarTermDate = new Date(recentSolarTerm[1]);
        const birthDate = this.lsDate.toDate();

        // 计算距离天数
        const diffDays = Math.abs(
          Math.floor(
            (birthDate.getTime() - solarTermDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        );

        // 简化算法：3天 = 1岁
        const startAge = Math.floor(diffDays / 3);

        // 起运岁数一般在 0-10 岁之间
        return Math.max(0, Math.min(10, startAge));
      }

      // 默认值
      return 1;
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算起运岁数失败:', error);
      return 1;
    }
  }

  /**
   * 分析大运吉凶
   */
  private analyzeLuckPillar(
    stem: string,
    branch: string,
    dayMasterElement: string
  ): any {
    const stemElement = this.getStemElement(stem);
    const branchElement = this.getBranchElement(branch);

    // 计算与日主的关系
    const stemRelation = this.getElementRelation(dayMasterElement, stemElement);
    const branchRelation = this.getElementRelation(
      dayMasterElement,
      branchElement
    );

    // 综合评分（-10到+10）
    let score = 0;
    const favorable: string[] = [];
    const unfavorable: string[] = [];
    const keyEvents: string[] = [];

    // 天干影响（权重60%）
    if (stemRelation === 'support') {
      score += 6;
      favorable.push(`${this.getElementChinese(stemElement)}天干生助`);
    } else if (stemRelation === 'drain') {
      score -= 4;
      unfavorable.push(`${this.getElementChinese(stemElement)}天干泄耗`);
    } else if (stemRelation === 'same') {
      score += 3;
      favorable.push(`${this.getElementChinese(stemElement)}天干比和`);
    }

    // 地支影响（权重40%）
    if (branchRelation === 'support') {
      score += 4;
      favorable.push(`${this.getElementChinese(branchElement)}地支生助`);
    } else if (branchRelation === 'drain') {
      score -= 3;
      unfavorable.push(`${this.getElementChinese(branchElement)}地支泄耗`);
    } else if (branchRelation === 'same') {
      score += 2;
      favorable.push(`${this.getElementChinese(branchElement)}地支比和`);
    }

    // 判定强度
    let strength: 'strong' | 'weak' | 'balanced';
    let description: string;

    if (score >= 6) {
      strength = 'strong';
      description = '大吉之运，诸事顺利，可大展宏图';
      keyEvents.push('事业进步', '财运亨通', '贵人相助');
    } else if (score >= 2) {
      strength = 'balanced';
      description = '吉运，整体平顺，小有收获';
      keyEvents.push('平稳发展', '小有进步');
    } else if (score >= -2) {
      strength = 'balanced';
      description = '平运，喜忧参半，宜守成';
      keyEvents.push('保守为宜', '避免冒进');
    } else if (score >= -6) {
      strength = 'weak';
      description = '较为艰难，多波折，需谨慎';
      keyEvents.push('诸事不顺', '需多努力');
      unfavorable.push('运势低迷');
    } else {
      strength = 'weak';
      description = '凶运，困难重重，宜静守待时';
      keyEvents.push('多灾多难', '需防范风险');
      unfavorable.push('运势极差', '事业受阻');
    }

    return {
      strength,
      score,
      description,
      favorable,
      unfavorable,
      keyEvents,
    };
  }

  /**
   * 获取五行关系
   */
  private getElementRelation(
    fromElement: string,
    toElement: string
  ): 'support' | 'drain' | 'same' | 'neutral' {
    if (fromElement === toElement) return 'same';

    // 生我、比肩 = support
    const supportElements = this.getSupportElements(fromElement);
    if (supportElements.includes(toElement)) return 'support';

    // 我生、我克 = drain
    const drainElements = this.getDrainElements(fromElement);
    if (drainElements.includes(toElement)) return 'drain';

    return 'neutral';
  }

  /**
   * 获取地支对应的五行
   */
  private getBranchElement(branch: string): string {
    const branchElementMap: Record<string, string> = {
      子: 'water',
      丑: 'earth',
      寅: 'wood',
      卯: 'wood',
      辰: 'earth',
      巳: 'fire',
      午: 'fire',
      未: 'earth',
      申: 'metal',
      酉: 'metal',
      戌: 'earth',
      亥: 'water',
    };
    return branchElementMap[branch] || 'wood';
  }

  /**
   * 计算胎元、命宫、身宫、空亡
   */
  private calculateAdvancedFeatures(): {
    embryo: string;
    ownSign: string;
    bodySign: string;
    missing: string[];
  } {
    try {
      const sex = this.birthData.gender === 'male' ? 1 : 0;
      const char8ex = this.lsDate.char8ex({ sex });

      // 胎元：受孕之月，由出生月柱后一位推得
      const embryo = char8ex.embryo()?.toString() || '';

      // 命宫：主寿命乎长短
      const ownSign = char8ex.ownSign()?.toString() || '';

      // 身宫：主身体健康
      const bodySign = char8ex.bodySign()?.toString() || '';

      // 空亡：旬空地支
      const missing = char8ex.missing?.map((branch: any) => branch.name) || [];

      console.log('[LunisolarBaziAdapter] 胎元:', embryo);
      console.log('[LunisolarBaziAdapter] 命宫:', ownSign);
      console.log('[LunisolarBaziAdapter] 身宫:', bodySign);
      console.log('[LunisolarBaziAdapter] 空亡:', missing);

      return {
        embryo,
        ownSign,
        bodySign,
        missing,
      };
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算高级功能失败:', error);
      return {
        embryo: '',
        ownSign: '',
        bodySign: '',
        missing: [],
      };
    }
  }

  /**
   * 计算神煞（完善版）
   */
  private calculateShensha(): any {
    try {
      const sex = this.birthData.gender === 'male' ? 1 : 0;
      const char8ex = this.lsDate.char8ex({ sex });

      // 收集所有神煞，并记录来源柱位
      const allGods: Array<{ name: string; pillar: string }> = [];

      // 年柱神煞
      if (char8ex.year?.gods) {
        char8ex.year.gods.forEach((god: any) => {
          if (god?.name) {
            allGods.push({ name: god.name, pillar: '年柱' });
          }
        });
      }

      // 月柱神煞
      if (char8ex.month?.gods) {
        char8ex.month.gods.forEach((god: any) => {
          if (god?.name) {
            allGods.push({ name: god.name, pillar: '月柱' });
          }
        });
      }

      // 日柱神煞
      if (char8ex.day?.gods) {
        char8ex.day.gods.forEach((god: any) => {
          if (god?.name) {
            allGods.push({ name: god.name, pillar: '日柱' });
          }
        });
      }

      // 时柱神煞
      if (char8ex.hour?.gods) {
        char8ex.hour.gods.forEach((god: any) => {
          if (god?.name) {
            allGods.push({ name: god.name, pillar: '时柱' });
          }
        });
      }

      // 专业神煞分类
      const favorableKeywords = [
        '天乙贵人',
        '太极贵人',
        '天德贵人',
        '月德贵人',
        '福星贵人',
        '文昌',
        '学堂',
        '词馆',
        '国印',
        '将星',
        '天德',
        '月德',
        '天赦',
        '福德',
        '天喜',
        '龙德',
        '三奇',
        '金舆',
        '禄神',
        '驿马',
        '华盖',
        '学堂',
        '进神',
      ];

      const unfavorableKeywords = [
        '羊刃',
        '劫煞',
        '亡神',
        '孤辰',
        '寡宿',
        '灾煞',
        '天罗',
        '地网',
        '白虎',
        '吊客',
        '丧门',
        '披头',
        '血刃',
        '飞刃',
        '六厄',
        '阴差阳错',
        '十恶大败',
        '桃花煞',
        '孤鸾煞',
        '元辰',
        '勾绞',
        '绞煞',
      ];

      const neutralKeywords = [
        '咸池',
        '红艳',
        '桃花',
        '沐浴',
        '长生',
        '冠带',
        '临官',
        '帝旺',
        '衰',
        '病',
        '死',
        '墓',
        '绝',
        '胎',
        '养',
      ];

      const favorable: Array<{
        name: string;
        pillar: string;
        description: string;
      }> = [];
      const unfavorable: Array<{
        name: string;
        pillar: string;
        description: string;
      }> = [];
      const neutral: Array<{
        name: string;
        pillar: string;
        description: string;
      }> = [];

      allGods.forEach((god) => {
        const godName = god.name;
        const description = this.getShenshaDescription(godName);

        const isFavorable = favorableKeywords.some((keyword) =>
          godName.includes(keyword)
        );
        const isUnfavorable = unfavorableKeywords.some((keyword) =>
          godName.includes(keyword)
        );
        const isNeutral = neutralKeywords.some((keyword) =>
          godName.includes(keyword)
        );

        const godData = {
          name: godName,
          pillar: god.pillar,
          description,
        };

        if (isFavorable) {
          favorable.push(godData);
        } else if (isUnfavorable) {
          unfavorable.push(godData);
        } else if (isNeutral) {
          neutral.push(godData);
        } else {
          // 未分类的神煞归入中性
          neutral.push(godData);
        }
      });

      const result = {
        favorable,
        unfavorable,
        neutral,
        all: allGods.map((g) => g.name),
        summary: {
          favorableCount: favorable.length,
          unfavorableCount: unfavorable.length,
          neutralCount: neutral.length,
          totalCount: allGods.length,
        },
      };

      console.log('[LunisolarBaziAdapter] 神煞分析完成:', result.summary);
      return result;
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算神煞失败:', error);
      return {
        favorable: [],
        unfavorable: [],
        neutral: [],
        all: [],
        summary: {
          favorableCount: 0,
          unfavorableCount: 0,
          neutralCount: 0,
          totalCount: 0,
        },
      };
    }
  }

  /**
   * 获取神煞描述
   */
  private getShenshaDescription(shenshaName: string): string {
    const descriptions: Record<string, string> = {
      天乙贵人: '最吉之神，遇难呈祥，逢凶化吉',
      太极贵人: '聪明好学，喜欢钻研玄学',
      天德贵人: '一生多得贵人相助',
      月德贵人: '心地善良，处事公正',
      文昌: '聪明好学，文采出众',
      学堂: '求知欲强，利学业功名',
      华盖: '性格孤高，喜艺术玄学',
      将星: '处事果断，具领导才能',
      金舆: '富贵安逸，生活优裕',
      驿马: '奔波走动，变动性大',
      桃花: '人缘好，异性缘佳',
      咸池: '感情丰富，注重外表',
      红艳: '异性缘佳，易有桃花',
      羊刃: '性格刚烈，易有血光',
      劫煞: '破财克妻，易遇灾祸',
      亡神: '体弱多病，易有损伤',
      孤辰: '性格孤独，六亲缘薄',
      寡宿: '孤独寡合，婚姻不顺',
      灾煞: '易遇意外，多灾多难',
      阴差阳错: '婚姻易出问题',
      十恶大败: '做事易失败，财运欠佳',
      空亡: '易成空，六亲缘薄',
      长生: '生命力旺盛',
      沐浴: '风流多情，性格不稳',
      冠带: '外表光鲜，重视形象',
      临官: '事业有成，权力欲强',
      帝旺: '精力充沛，运势极旺',
      衰: '运势低落，做事易败',
      病: '身体欠佳，易生疾病',
      死: '气势衰弱，做事不利',
      墓: '封藏守成，性格保守',
      绝: '断绝消亡，凶险较大',
      胎: '孕育萌芽，新生之象',
      养: '休养生息，缓慢发展',
    };

    // 尝试精确匹配
    if (descriptions[shenshaName]) {
      return descriptions[shenshaName];
    }

    // 尝试模糊匹配
    for (const [key, desc] of Object.entries(descriptions)) {
      if (shenshaName.includes(key)) {
        return desc;
      }
    }

    return '详细信息待补充';
  }

  /**
   * 计算格局
   */
  private calculatePattern(pillars: Pillars, tenGods: any, elements: any): any {
    try {
      const dayMasterStem = pillars.day.stem;
      const monthBranch = pillars.month.branch;
      const monthStem = pillars.month.stem;

      // 月令十神
      const monthTenGod = tenGods.month?.stem || '';

      // 判定格局类型
      const patternType = this.determinePatternType(pillars, tenGods, elements);
      const patternDetails = this.getPatternDetails(
        patternType,
        pillars,
        tenGods
      );

      return {
        type: patternType,
        name: patternDetails.name,
        description: patternDetails.description,
        quality: patternDetails.quality,
        characteristics: patternDetails.characteristics,
        favorable: patternDetails.favorable,
        unfavorable: patternDetails.unfavorable,
        analysis: patternDetails.analysis,
      };
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算格局失败:', error);
      return {
        type: 'unknown',
        name: '格局待判定',
        description: '格局分析计算中',
        quality: 'neutral',
        characteristics: [],
        favorable: [],
        unfavorable: [],
        analysis: '',
      };
    }
  }

  /**
   * 判定格局类型
   */
  private determinePatternType(
    pillars: Pillars,
    tenGods: any,
    elements: any
  ): string {
    const dayMaster = pillars.day.stem;
    const monthBranch = pillars.month.branch;
    const monthStem = pillars.month.stem;
    const monthTenGod =
      typeof (tenGods as any)?.month === 'string'
        ? (tenGods as any).month
        : (tenGods as any)?.month?.stem || '';

    // 1. 从格判定（一方独大）
    const strongestElement = this.getStrongestElement(elements);
    const dayMasterElement = this.getStemElement(dayMaster);

    // 日主极弱且一方独大，考虑从格
    if (
      elements.balance?.dayMasterScore &&
      elements.balance.dayMasterScore < 20
    ) {
      const strongScore = this.getElementScore(
        strongestElement,
        elements.distribution
      );
      if (strongScore > 60) {
        if (strongestElement === 'wood' || strongestElement === 'fire')
          return 'cong-wang'; // 从旺格
        if (strongestElement === 'metal' || strongestElement === 'water')
          return 'cong-sha'; // 从煞格
        if (strongestElement === 'earth') return 'cong-er'; // 从儿格
      }
    }

    // 2. 正格判定（根据月令十神）
    if (monthTenGod.includes('正官') || monthTenGod.includes('偏官')) {
      return 'guan-sha'; // 官煞格
    }
    if (monthTenGod.includes('正财') || monthTenGod.includes('偏财')) {
      return 'cai'; // 财格
    }
    if (monthTenGod.includes('食神') || monthTenGod.includes('伤官')) {
      return 'shi-shang'; // 食伤格
    }
    if (monthTenGod.includes('正印') || monthTenGod.includes('偏印')) {
      return 'yin'; // 印格
    }
    if (monthTenGod.includes('比肩') || monthTenGod.includes('劫财')) {
      return 'jie-lu'; // 建禄格/劫财格
    }

    // 3. 特殊格局判定
    if (this.hasSpecialCombination(pillars)) {
      return 'special'; // 特殊格局
    }

    // 4. 默认普通格局
    return 'normal';
  }

  /**
   * 检查是否有特殊组合
   */
  private hasSpecialCombination(pillars: Pillars): boolean {
    // 检查是否有三合、六合、半合等特殊组合
    // 简化判断，实际应更复杂
    const branches = [
      pillars.year.branch,
      pillars.month.branch,
      pillars.day.branch,
      pillars.hour.branch,
    ];

    // 三合局判定（简化）
    const sanhe = [
      ['申', '子', '辰'], // 水局
      ['亥', '卯', '未'], // 木局
      ['寅', '午', '戌'], // 火局
      ['巳', '酉', '丑'], // 金局
    ];

    for (const group of sanhe) {
      const matches = branches.filter((b) => group.includes(b));
      if (matches.length >= 3) return true;
    }

    return false;
  }

  /**
   * 获取格局详情
   */
  private getPatternDetails(
    patternType: string,
    pillars: Pillars,
    tenGods: any
  ): any {
    const patterns: Record<string, any> = {
      'guan-sha': {
        name: '官煞格',
        description: '月令见官煞，主权贵、事业、地位',
        quality: 'good',
        characteristics: ['有管理才能', '责任感强', '适合当官', '地位显贵'],
        favorable: ['财星生官', '印星护官'],
        unfavorable: ['食伤克官', '比劫夺财'],
        analysis:
          '官煞格人物责任感强，适合公职发展。需要注意避免食伤克官，以免影响事业运。',
      },
      cai: {
        name: '财格',
        description: '月令见财星，主财富、物质、经营',
        quality: 'good',
        characteristics: ['善于理财', '经商才能', '物质欲望强', '财运佳'],
        favorable: ['食伤生财', '身强能任'],
        unfavorable: ['劫财夺财', '身弱不胜'],
        analysis:
          '财格人物善于理财，适合经商。需要身强才能任财，否则财多身弱。',
      },
      'shi-shang': {
        name: '食伤格',
        description: '月令见食伤，主才华、表达、创造',
        quality: 'neutral',
        characteristics: ['才华横溢', '表达能力强', '创意丰富', '自由不羁'],
        favorable: ['财星通关', '身强能泄'],
        unfavorable: ['印星克制', '身弱不支'],
        analysis:
          '食伤格人物才华出众，适合创作、艺术等领域。需要注意不要过分自负。',
      },
      yin: {
        name: '印格',
        description: '月令见印星，主文化、学业、智慧',
        quality: 'good',
        characteristics: ['聪明好学', '文化水平高', '利学业', '贵人多'],
        favorable: ['官星生印', '身弱印生'],
        unfavorable: ['财星坏印', '印多成疾'],
        analysis:
          '印格人物聪明好学，适合文化教育事业。需要注意印星太旺会影响行动力。',
      },
      'jie-lu': {
        name: '建禄格',
        description: '月令见比劫，主独立、竞争、权力',
        quality: 'neutral',
        characteristics: ['独立性强', '竞争意识', '有领导力', '自我意识强'],
        favorable: ['官煞制比', '食伤泄秀'],
        unfavorable: ['比劫过多', '缺少制衡'],
        analysis: '建禄格人物独立性强，适合创业。需要有官煞或食伤来制衡。',
      },
      'cong-wang': {
        name: '从旺格',
        description: '日主极弱，从旺神而行',
        quality: 'special',
        characteristics: ['顺势而为', '适应能力强', '不可强出头'],
        favorable: ['顺其旺势', '不可克泄'],
        unfavorable: ['印比助身', '逆其旺势'],
        analysis: '从格需要顺势而为，切忌逆行。从旺格适合跟随强者发展。',
      },
      'cong-sha': {
        name: '从煞格',
        description: '日主极弱，从官煞而行',
        quality: 'special',
        characteristics: ['能屈能伸', '适应环境能力强'],
        favorable: ['顺其官煞', '财生官煞'],
        unfavorable: ['印比助身', '食伤克官'],
        analysis: '从煞格适合在大机构工作，顺应组织安排。',
      },
      'cong-er': {
        name: '从儿格',
        description: '日主极弱，从食伤而行',
        quality: 'special',
        characteristics: ['才华横溢', '表现欲强'],
        favorable: ['财星通关', '食伤生财'],
        unfavorable: ['印比助身', '官煞克身'],
        analysis: '从儿格适合表演、创作等展示才华的行业。',
      },
      special: {
        name: '特殊格局',
        description: '具有特殊组合的格局',
        quality: 'special',
        characteristics: ['不同寻常', '需具体分析'],
        favorable: [],
        unfavorable: [],
        analysis: '特殊格局需要具体情况具体分析。',
      },
      normal: {
        name: '普通格局',
        description: '普通的八字格局',
        quality: 'neutral',
        characteristics: ['平凡中正', '性格均衡'],
        favorable: ['五行中和', '日主有根'],
        unfavorable: ['五行偏私', '日主太弱'],
        analysis: '普通格局宜平稳发展，不宜冒进。',
      },
    };

    return patterns[patternType] || patterns.normal;
  }

  /**
   * 获取最强五行
   */
  private getStrongestElement(elements: any): string {
    if (!elements.distribution) return 'wood';

    const { wood, fire, earth, metal, water } = elements.distribution;
    const scores = { wood, fire, earth, metal, water };

    let maxElement = 'wood';
    let maxScore = wood;

    for (const [elem, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        maxElement = elem;
      }
    }

    return maxElement;
  }

  /**
   * 分析日主命理
   */
  private analyzeDayMaster(
    pillars: Pillars,
    elements: any,
    tenGods: any,
    yongshen: any
  ): any {
    try {
      const dayMasterStem = pillars.day.stem;
      const dayMasterBranch = pillars.day.branch;
      const dayMasterElement = this.getStemElement(dayMasterStem);
      const dayMasterScore = elements.balance?.dayMasterScore || 50;

      // 1. 日干基本性格
      const stemPersonality = this.getStemPersonality(dayMasterStem);

      // 2. 日主强弱分析
      const strengthAnalysis = this.analyzeDayMasterStrength(
        dayMasterScore,
        dayMasterElement
      );

      // 3. 生旺死绝分析
      const twelvePalace = this.analyzeTwelvePalace(
        dayMasterStem,
        pillars.month.branch
      );

      // 4. 通根透干分析
      const rootingAnalysis = this.analyzeRooting(dayMasterStem, pillars);

      // 5. 综合评价
      const overallScore = this.calculateOverallScore(
        strengthAnalysis,
        twelvePalace,
        rootingAnalysis
      );

      return {
        stem: dayMasterStem,
        branch: dayMasterBranch,
        element: dayMasterElement,
        elementChinese: this.getElementChinese(dayMasterElement),
        score: dayMasterScore,
        personality: stemPersonality,
        strength: strengthAnalysis,
        twelvePalace,
        rooting: rootingAnalysis,
        overall: overallScore,
        recommendations: this.generateRecommendations(
          strengthAnalysis,
          yongshen,
          overallScore
        ),
      };
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 日主命理分析失败:', error);
      return {
        stem: '',
        branch: '',
        element: 'wood',
        elementChinese: '木',
        score: 50,
        personality: {},
        strength: {},
        twelvePalace: {},
        rooting: {},
        overall: {},
        recommendations: [],
      };
    }
  }

  /**
   * 获取日干性格特征
   */
  private getStemPersonality(stem: string): any {
    const personalities: Record<string, any> = {
      甲: {
        name: '甲木',
        traits: ['正直坦率', '仁德之心', '积极向上', '进取心强'],
        character: '如参天大树，浩然正气',
      },
      乙: {
        name: '乙木',
        traits: ['温柔委婉', '灵活变通', '善于适应', '意志坚韧'],
        character: '如藤蔓花草，韧性十足',
      },
      丙: {
        name: '丙火',
        traits: ['热情开朗', '光明磊落', '积极主动', '脱颖而出'],
        character: '如烈日烈火，光耀四方',
      },
      丁: {
        name: '丁火',
        traits: ['温文尔雅', '细腻敏感', '内敛深沉', '文化修养'],
        character: '如灯烛星光，温暖人心',
      },
      戊: {
        name: '戊土',
        traits: ['忌厚老实', '稳重可靠', '包容大度', '承载万物'],
        character: '如大地高山，沉稳厚重',
      },
      己: {
        name: '己土',
        traits: ['温和亲切', '善于协调', '内忱外强', '自我意识'],
        character: '如田土沃土，滋养万物',
      },
      庚: {
        name: '庚金',
        traits: ['果断强势', '有原则性', '決断力强', '不容妥协'],
        character: '如剑斧钢铁，刚毅不屈',
      },
      辛: {
        name: '辛金',
        traits: ['精明利落', '敏锐敏感', '善于谋划', '细腻入微'],
        character: '如珠宝饰金，精致美丽',
      },
      壬: {
        name: '壬水',
        traits: ['智慧活泼', '应变能力强', '善于沟通', '包容性大'],
        character: '如江海湖泊，浩然广阔',
      },
      癸: {
        name: '癸水',
        traits: ['柔软细腻', '内敛丰富', '善解人意', '适应性强'],
        character: '如雨露春水，滋润无声',
      },
    };

    return personalities[stem] || { name: '未知', traits: [], character: '' };
  }

  /**
   * 分析日主强弱
   */
  private analyzeDayMasterStrength(score: number, element: string): any {
    let level: string;
    let description: string;
    const advantages: string[] = [];
    let disadvantages: string[] = [];

    if (score >= 70) {
      level = '极强';
      description = '日主太旺，需泄耗或克制';
      advantages.push('体力充沛', '意志强大', '不易生病');
      disadvantages.push('过于强势', '难以驾驭', '易造成损失');
    } else if (score >= 55) {
      level = '偏强';
      description = '日主偏强，身强能任财官';
      advantages.push('身体健康', '意志坚定', '能承担重任');
      disadvantages.push('需要泄秀', '避免过刚');
    } else if (score >= 45) {
      level = '中和';
      description = '日主中和，五行平衡最佳';
      advantages.push('阴阳平衡', '性格中正', '适应力强');
      disadvantages = [];
    } else if (score >= 30) {
      level = '偏弱';
      description = '日主偏弱，需要生助';
      advantages.push('柔软变通', '善于合作');
      disadvantages.push('体力欠佳', '意志力弱', '需要贵人相助');
    } else {
      level = '极弱';
      description = '日主极弱，需大量生助';
      advantages.push('能屈能伸', '适应性强');
      disadvantages.push('身体虚弱', '意志不坚', '易受外界影响', '需依靠他人');
    }

    return {
      score,
      level,
      description,
      advantages,
      disadvantages,
    };
  }

  /**
   * 分析十二长生宫位
   */
  private analyzeTwelvePalace(dayStem: string, monthBranch: string): any {
    // 十二长生表（简化版，修正“卯”误写）
    const palaces: Record<string, Record<string, string>> = {
      甲: {
        亥: '长生',
        子: '沐浴',
        丑: '冠带',
        寅: '临官',
        卯: '帝旺',
        辰: '衰',
        巳: '病',
        午: '死',
        未: '墓',
        申: '绝',
        酉: '胎',
        戌: '养',
      },
      乙: {
        午: '长生',
        巳: '沐浴',
        辰: '冠带',
        卯: '临官',
        寅: '帝旺',
        丑: '衰',
        子: '病',
        亥: '死',
        戌: '墓',
        酉: '绝',
        申: '胎',
        未: '养',
      },
      丙: {
        寅: '长生',
        卯: '沐浴',
        辰: '冠带',
        巳: '临官',
        午: '帝旺',
        未: '衰',
        申: '病',
        酉: '死',
        戌: '墓',
        亥: '绝',
        子: '胎',
        丑: '养',
      },
      丁: {
        酉: '长生',
        申: '沐浴',
        未: '冠带',
        午: '临官',
        巳: '帝旺',
        辰: '衰',
        卯: '病',
        寅: '死',
        丑: '墓',
        子: '绝',
        亥: '胎',
        戌: '养',
      },
      戊: {
        寅: '长生',
        卯: '沐浴',
        辰: '冠带',
        巳: '临官',
        午: '帝旺',
        未: '衰',
        申: '病',
        酉: '死',
        戌: '墓',
        亥: '绝',
        子: '胎',
        丑: '养',
      },
      己: {
        酉: '长生',
        申: '沐浴',
        未: '冠带',
        午: '临官',
        巳: '帝旺',
        辰: '衰',
        卯: '病',
        寅: '死',
        丑: '墓',
        子: '绝',
        亥: '胎',
        戌: '养',
      },
      庚: {
        巳: '长生',
        午: '沐浴',
        未: '冠带',
        申: '临官',
        酉: '帝旺',
        戌: '衰',
        亥: '病',
        子: '死',
        丑: '墓',
        寅: '绝',
        卯: '胎',
        辰: '养',
      },
      辛: {
        子: '长生',
        亥: '沐浴',
        丑: '冠带',
        寅: '临官',
        卯: '帝旺',
        辰: '衰',
        巳: '病',
        午: '死',
        未: '墓',
        申: '绝',
        酉: '胎',
        戌: '养',
      },
      壬: {
        申: '长生',
        酉: '沐浴',
        戌: '冠带',
        亥: '临官',
        子: '帝旺',
        丑: '衰',
        寅: '病',
        卯: '死',
        辰: '墓',
        巳: '绝',
        午: '胎',
        未: '养',
      },
      癸: {
        卯: '长生',
        寅: '沐浴',
        辰: '冠带',
        巳: '临官',
        午: '帝旺',
        未: '衰',
        申: '病',
        酉: '死',
        戌: '墓',
        亥: '绝',
        子: '胎',
        丑: '养',
      },
    };

    const palace = palaces[dayStem]?.[monthBranch] || '未知';
    const palaceDescriptions: Record<string, string> = {
      长生: '生命力旺盛，如新生婴儿，潜力巨大',
      沐浴: '风流多情，性格不稳，易有桃花',
      冠带: '外表光鲜，重视形象，为人体面',
      临官: '事业有成，权力欲强，适合做官',
      帝旺: '精力充沛，运势极旺，事业顶峰',
      衰: '运势低落，做事易败，需谨慎',
      病: '身体欠佳，易生疾病，需养生',
      死: '气势衰弱，做事不利，需静守',
      墓: '封藏守成，性格保守，不宜冒进',
      绝: '断绝消亡，凶险较大，需防范',
      胎: '孕育萌芽，新生之象，可待发展',
      养: '休养生息，缓慢发展，积蓄实力',
    };

    return {
      palace,
      description: palaceDescriptions[palace] || '',
      strength: ['长生', '临官', '帝旺'].includes(palace)
        ? 'strong'
        : ['衰', '病', '死', '绝'].includes(palace)
          ? 'weak'
          : 'balanced',
    };
  }

  /**
   * 分析通根透干
   */
  private analyzeRooting(dayStem: string, pillars: Pillars): any {
    const dayElement = this.getStemElement(dayStem);
    const branches = [
      pillars.year.branch,
      pillars.month.branch,
      pillars.day.branch,
      pillars.hour.branch,
    ];

    // 检查地支中是否有同五行或生助五行
    let rootCount = 0;
    const rootBranches: string[] = [];

    branches.forEach((branch, index) => {
      const branchElement = this.getBranchElement(branch);
      if (branchElement === dayElement) {
        rootCount++;
        const positions = ['年支', '月支', '日支', '时支'];
        rootBranches.push(positions[index]);
      }
    });

    let level: string;
    let description: string;

    if (rootCount >= 3) {
      level = '深根';
      description = '通根极深，基础牢固，不易动摇';
    } else if (rootCount === 2) {
      level = '有根';
      description = '有根基，站得稳固，有一定实力';
    } else if (rootCount === 1) {
      level = '微根';
      description = '根基较弱，需要外助，易受影响';
    } else {
      level = '无根';
      description = '完全无根，极为虚弱，需大量生助';
    }

    return {
      level,
      count: rootCount,
      branches: rootBranches,
      description,
    };
  }

  /**
   * 计算综合评分
   */
  private calculateOverallScore(
    strength: any,
    twelvePalace: any,
    rooting: any
  ): any {
    let totalScore = strength.score;

    // 十二长生宫位加权
    if (twelvePalace.strength === 'strong') totalScore += 10;
    else if (twelvePalace.strength === 'weak') totalScore -= 10;

    // 通根加权
    totalScore += rooting.count * 5;

    // 最终评级
    let rating: string;
    let comment: string;

    if (totalScore >= 80) {
      rating = '上上';
      comment = '命局极佳，潜力巨大，有成大事之象';
    } else if (totalScore >= 65) {
      rating = '上';
      comment = '命局优良，运势顺畅，容易成功';
    } else if (totalScore >= 50) {
      rating = '中上';
      comment = '命局良好，平稳发展，小有成就';
    } else if (totalScore >= 35) {
      rating = '中';
      comment = '命局中等，喜忧参半，需努力奋斗';
    } else if (totalScore >= 20) {
      rating = '中下';
      comment = '命局较弱，多波折，需加倍努力';
    } else {
      rating = '下';
      comment = '命局艰难，困难重重，需谨慎守成';
    }

    return {
      score: totalScore,
      rating,
      comment,
    };
  }

  /**
   * 生成建议
   */
  private generateRecommendations(
    strength: any,
    yongshen: any,
    overall: any
  ): string[] {
    const recommendations: string[] = [];

    // 基于强弱的建议
    if (strength.level === '极强' || strength.level === '偏强') {
      recommendations.push('宜从事挑战性工作，发挥个人优势');
      recommendations.push('注意避免过度强势，适当谦虚低调');
    } else if (strength.level === '极弱' || strength.level === '偏弱') {
      recommendations.push('宜多依靠贵人，善于合作共赢');
      recommendations.push('注意保养身体，增强体魄');
    }

    // 基于用神的建议
    if (yongshen.primary && yongshen.primary.length > 0) {
      const primaryElements = yongshen.primary
        .map((e: string) => this.getElementChinese(e))
        .join('、');
      recommendations.push(`宜多接触${primaryElements}属性事物，增强运势`);
    }

    if (yongshen.unfavorable && yongshen.unfavorable.length > 0) {
      const unfavorableElements = yongshen.unfavorable
        .map((e: string) => this.getElementChinese(e))
        .join('、');
      recommendations.push(
        `应避免${unfavorableElements}属性事物，减少不利影响`
      );
    }

    // 基于整体评分的建议
    if (overall.rating === '上上' || overall.rating === '上') {
      recommendations.push('天赋优异，宜积极进取，大展宏图');
    } else if (overall.rating === '下' || overall.rating === '中下') {
      recommendations.push('宜平稳守成，积累实力，忍耐待发');
    }

    return recommendations;
  }

  /**
   * 获取农历信息
   */
  private getLunarInfo(): any {
    try {
      const lunar = this.lsDate.lunar;

      return {
        year: lunar.year,
        month: lunar.month,
        day: lunar.day,
        isLeapMonth: lunar.isLeapMonth,
        monthName: lunar.monthName,
        dayName: lunar.dayName,
        yearGanZhi: lunar.yearGanZhi,
        monthGanZhi: lunar.monthGanZhi,
        dayGanZhi: lunar.dayGanZhi,
        solarTerm: this.lsDate.solarTerm?.value || null,
      };
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 获取农历信息失败:', error);
      return {};
    }
  }

  /**
   * 计算日运（每日运势）
   */
  calculateDailyFortune(targetDate?: Date): any {
    try {
      const date = targetDate || new Date();
      const targetLunar = lunisolar(date);
      const dayPillar = targetLunar.char8.day;

      // 获取日干支
      const dayStem = dayPillar.stem?.name || '';
      const dayBranch = dayPillar.branch?.name || '';

      // 获取本命盘日主
      const pillars = this.calculatePillars();
      const birthDayStem = pillars.day.stem;
      const birthDayElement = this.getStemElement(birthDayStem);

      // 分析与本命盘的关系
      const stemElement = this.getStemElement(dayStem);
      const branchElement = this.getBranchElement(dayBranch);

      const stemRelation = this.getElementRelation(
        birthDayElement,
        stemElement
      );
      const branchRelation = this.getElementRelation(
        birthDayElement,
        branchElement
      );

      // 计算当日评分（-5到+5）
      let score = 0;
      const favorable: string[] = [];
      const unfavorable: string[] = [];
      const suggestions: string[] = [];

      // 天干影响
      if (stemRelation === 'support') {
        score += 3;
        favorable.push(
          `${this.getElementChinese(stemElement)}天干生助，运势佳`
        );
        suggestions.push('适合展开行动，把握机会');
      } else if (stemRelation === 'drain') {
        score -= 2;
        unfavorable.push(
          `${this.getElementChinese(stemElement)}天干泄耗，易疲惫`
        );
        suggestions.push('保存实力，不宜冒进');
      }

      // 地支影响
      if (branchRelation === 'support') {
        score += 2;
        favorable.push(
          `${this.getElementChinese(branchElement)}地支生助，基础稳`
        );
      } else if (branchRelation === 'drain') {
        score -= 1;
        unfavorable.push(`${this.getElementChinese(branchElement)}地支泄耗`);
      }

      // 判定吉凶
      let fortune: string;
      let description: string;
      let color: string;

      if (score >= 4) {
        fortune = '大吉';
        description = '运势极佳，诸事顺利，可大展手脚';
        color = '#ff4444';
        suggestions.push('把握吉时，积极进取');
      } else if (score >= 2) {
        fortune = '吉';
        description = '运势良好，平顺顺利，小有收获';
        color = '#ff6666';
        suggestions.push('保持积极，顺势而为');
      } else if (score >= -1) {
        fortune = '平';
        description = '运势平稳，无大喜大忧';
        color = '#ffaa00';
        suggestions.push('守成为主，不宜冒险');
      } else if (score >= -3) {
        fortune = '凶';
        description = '运势欠佳，诸事不顺，需谨慎';
        color = '#666666';
        suggestions.push('谨慎行事，避免冲突');
      } else {
        fortune = '大凶';
        description = '运势极差，多灾多难，宜静守';
        color = '#333333';
        suggestions.push('静守待时，不宜行动');
      }

      return {
        date: date.toISOString().split('T')[0],
        dayStem,
        dayBranch,
        score,
        fortune,
        description,
        color,
        favorable,
        unfavorable,
        suggestions,
      };
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 计算日运失败:', error);
      return {
        date: new Date().toISOString().split('T')[0],
        dayStem: '',
        dayBranch: '',
        score: 0,
        fortune: '未知',
        description: '日运计算失败',
        color: '#999999',
        favorable: [],
        unfavorable: [],
        suggestions: [],
      };
    }
  }

  /**
   * 批量计算未来N天的日运
   */
  calculateFutureFortunes(days = 7): any[] {
    const fortunes: any[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      fortunes.push(this.calculateDailyFortune(targetDate));
    }

    return fortunes;
  }

  /**
   * 获取真太阳时
   */
  getTrueSolarTime(longitude: number): Date {
    try {
      // Lunisolar 原生支持真太阳时
      // TODO: 查阅 Lunisolar 文档确认真太阳时计算方法
      return this.lsDate.toDate();
    } catch (error) {
      console.error('[LunisolarBaziAdapter] 真太阳时计算失败:', error);
      return this.lsDate.toDate();
    }
  }

  /**
   * 获取日主（用于兼容）
   */
  getDayMaster(): { stem: string; branch: string } {
    return {
      stem: this.baziData.day?.stem?.name || '',
      branch: this.baziData.day?.branch?.name || '',
    };
  }
}

/**
 * 创建 Lunisolar 八字计算器
 */
export function createLunisolarCalculator(
  birthData: EnhancedBirthData
): LunisolarBaziAdapter {
  return new LunisolarBaziAdapter(birthData);
}

/**
 * 辅助函数：判断 char8ex 插件是否可用
 */
export function isChar8exAvailable(): boolean {
  try {
    // 尝试创建一个测试实例
    const test = lunisolar(new Date());
    const bazi = test.char8({ gender: 'male' });
    return !!bazi;
  } catch (error) {
    console.error('[LunisolarBaziAdapter] char8ex 不可用:', error);
    return false;
  }
}
