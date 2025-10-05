/**
 * QiFlow AI - 时区处理模块
 *
 * 提供统一的时区处理功能
 * 确保所有八字计算的时区一致性
 */

import { format, isValid } from 'date-fns';
import { formatInTimeZone, getTimezoneOffset, toDate } from 'date-fns-tz';

/**
 * 支持的时区列表
 */
export const SUPPORTED_TIMEZONES = {
  // 亚洲主要时区
  'Asia/Shanghai': {
    name: '中国标准时间',
    offset: '+08:00',
    cities: ['北京', '上海', '深圳'],
  },
  'Asia/Hong_Kong': { name: '香港时间', offset: '+08:00', cities: ['香港'] },
  'Asia/Taipei': { name: '台北时间', offset: '+08:00', cities: ['台北'] },
  'Asia/Tokyo': { name: '日本标准时间', offset: '+09:00', cities: ['东京'] },
  'Asia/Seoul': { name: '韩国标准时间', offset: '+09:00', cities: ['首尔'] },
  'Asia/Singapore': {
    name: '新加坡时间',
    offset: '+08:00',
    cities: ['新加坡'],
  },
  'Asia/Bangkok': { name: '泰国时间', offset: '+07:00', cities: ['曼谷'] },
  'Asia/Dubai': { name: '阿联酋时间', offset: '+04:00', cities: ['迪拜'] },

  // 美洲时区
  'America/New_York': {
    name: '美国东部时间',
    offset: '-05:00',
    cities: ['纽约', '华盛顿'],
  },
  'America/Los_Angeles': {
    name: '美国太平洋时间',
    offset: '-08:00',
    cities: ['洛杉矶', '旧金山'],
  },
  'America/Chicago': {
    name: '美国中部时间',
    offset: '-06:00',
    cities: ['芝加哥'],
  },
  'America/Denver': {
    name: '美国山区时间',
    offset: '-07:00',
    cities: ['丹佛'],
  },

  // 欧洲时区
  'Europe/London': { name: '英国夏令时间', offset: '+00:00', cities: ['伦敦'] },
  'Europe/Paris': {
    name: '欧洲中部时间',
    offset: '+01:00',
    cities: ['巴黎', '柏林'],
  },
  'Europe/Moscow': { name: '莫斯科时间', offset: '+03:00', cities: ['莫斯科'] },

  // 大洋洲时区
  'Australia/Sydney': {
    name: '澳大利亚东部时间',
    offset: '+10:00',
    cities: ['悉尼'],
  },
  'Australia/Melbourne': {
    name: '澳大利亚东部时间',
    offset: '+10:00',
    cities: ['墨尔本'],
  },

  // UTC
  UTC: { name: '协调世界时', offset: '+00:00', cities: ['UTC'] },
} as const;

export type SupportedTimezone = keyof typeof SUPPORTED_TIMEZONES;

/**
 * 时区感知的日期处理类
 */
export class TimezoneAwareDate {
  private date: Date;
  private timezone: SupportedTimezone;

  constructor(
    dateInput: Date | string,
    timezone: SupportedTimezone = 'Asia/Shanghai'
  ) {
    this.timezone = timezone;

    if (typeof dateInput === 'string') {
      // 如果是字符串，确保包含时区信息
      if (dateInput.includes('T') && !dateInput.includes('+')) {
        // 添加时区信息
        dateInput = `${dateInput}+00:00`;
      }
      this.date = toDate(dateInput, { timeZone: timezone });
    } else {
      this.date = new Date(dateInput);
    }

    if (!isValid(this.date)) {
      throw new Error(`无效的日期: ${dateInput}`);
    }
  }

  /**
   * 获取原始日期对象
   */
  getDate(): Date {
    return new Date(this.date);
  }

  /**
   * 获取时区
   */
  getTimezone(): SupportedTimezone {
    return this.timezone;
  }

  /**
   * 格式化为本地时间字符串
   */
  formatLocal(pattern = 'yyyy-MM-dd HH:mm:ss'): string {
    return formatInTimeZone(this.date, this.timezone, pattern);
  }

  /**
   * 格式化为UTC时间字符串
   */
  formatUTC(pattern = 'yyyy-MM-dd HH:mm:ss'): string {
    return format(this.date, pattern) + ' UTC';
  }

  /**
   * 获取时区偏移
   */
  getTimezoneOffset(): number {
    return getTimezoneOffset(this.timezone, this.date);
  }

  /**
   * 转换为其他时区
   */
  toTimezone(targetTimezone: SupportedTimezone): TimezoneAwareDate {
    const localTime = this.formatLocal('yyyy-MM-dd HH:mm:ss');
    return new TimezoneAwareDate(localTime, targetTimezone);
  }

  /**
   * 检查是否为夏令时
   */
  isDST(): boolean {
    const jan = new Date(this.date.getFullYear(), 0, 1);
    const jul = new Date(this.date.getFullYear(), 6, 1);

    const janOffset = getTimezoneOffset(this.timezone, jan);
    const julOffset = getTimezoneOffset(this.timezone, jul);
    const currentOffset = this.getTimezoneOffset();

    return Math.min(janOffset, julOffset) === currentOffset;
  }

  /**
   * 获取时区信息
   */
  getTimezoneInfo() {
    return SUPPORTED_TIMEZONES[this.timezone];
  }
}

/**
 * 时区检测和推荐
 */
export class TimezoneDetector {
  /**
   * 根据位置推荐时区
   */
  static recommendTimezone(
    latitude: number,
    longitude: number
  ): SupportedTimezone {
    // 根据经纬度推荐时区
    if (
      longitude >= 73 &&
      longitude <= 135 &&
      latitude >= 3 &&
      latitude <= 53
    ) {
      // 中国大陆
      return 'Asia/Shanghai';
    }
    if (
      longitude >= -125 &&
      longitude <= -65 &&
      latitude >= 25 &&
      latitude <= 50
    ) {
      // 美国东部
      return longitude <= -100 ? 'America/New_York' : 'America/Chicago';
    }
    if (
      longitude >= -10 &&
      longitude <= 30 &&
      latitude >= 35 &&
      latitude <= 70
    ) {
      // 欧洲
      return 'Europe/Paris';
    }
    if (
      longitude >= 139 &&
      longitude <= 146 &&
      latitude >= 35 &&
      latitude <= 43
    ) {
      // 日本
      return 'Asia/Tokyo';
    }
    if (
      longitude >= 126 &&
      longitude <= 130 &&
      latitude >= 37 &&
      latitude <= 38
    ) {
      // 韩国
      return 'Asia/Seoul';
    }

    // 默认返回UTC
    return 'UTC';
  }

  /**
   * 检测用户浏览器时区
   */
  static detectBrowserTimezone(): SupportedTimezone {
    try {
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // 检查是否在支持的时区列表中
      if (browserTimezone in SUPPORTED_TIMEZONES) {
        return browserTimezone as SupportedTimezone;
      }

      // 尝试映射到支持的时区
      const mapping: Record<string, SupportedTimezone> = {
        'Asia/Beijing': 'Asia/Shanghai',
        'Asia/Chongqing': 'Asia/Shanghai',
        'America/Los_Angeles': 'America/Los_Angeles',
        'America/Denver': 'America/Denver',
        'Europe/Berlin': 'Europe/Paris',
        'Europe/Rome': 'Europe/Paris',
        'Australia/Sydney': 'Australia/Sydney',
      };

      return mapping[browserTimezone] || 'UTC';
    } catch (error) {
      console.warn('[TimezoneDetector] 无法检测浏览器时区:', error);
      return 'UTC';
    }
  }

  /**
   * 根据IP地址推荐时区（客户端实现）
   */
  static async recommendTimezoneByIP(): Promise<SupportedTimezone> {
    try {
      // 这里可以集成IP地理位置服务
      // 暂时返回浏览器时区
      return TimezoneDetector.detectBrowserTimezone();
    } catch (error) {
      console.warn('[TimezoneDetector] IP时区检测失败:', error);
      return 'UTC';
    }
  }
}

/**
 * 八字计算专用的时区处理工具
 */
export class BaziTimezoneHandler {
  private defaultTimezone: SupportedTimezone = 'Asia/Shanghai';

  constructor(defaultTimezone?: SupportedTimezone) {
    if (defaultTimezone) {
      this.defaultTimezone = defaultTimezone;
    }
  }

  /**
   * 标准化出生时间
   */
  normalizeBirthDateTime(
    dateTime: Date | string,
    timezone?: SupportedTimezone
  ): TimezoneAwareDate {
    const tz = timezone || this.defaultTimezone;
    return new TimezoneAwareDate(dateTime, tz);
  }

  /**
   * 验证出生时间的有效性
   */
  validateBirthDateTime(
    dateTime: Date | string,
    timezone?: SupportedTimezone
  ): {
    isValid: boolean;
    errors: string[];
    normalizedDate?: TimezoneAwareDate;
  } {
    const errors: string[] = [];

    try {
      const normalizedDate = this.normalizeBirthDateTime(dateTime, timezone);
      const date = normalizedDate.getDate();

      // 检查日期范围（1900-2100）
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) {
        errors.push('出生年份应在1900-2100之间');
      }

      // 检查是否为未来日期
      if (date > new Date()) {
        errors.push('出生日期不能为未来时间');
      }

      // 检查时间是否合理（可选）
      const hour = date.getHours();
      if (hour < 0 || hour > 23) {
        errors.push('出生时间格式不正确');
      }

      return {
        isValid: errors.length === 0,
        errors,
        normalizedDate,
      };
    } catch (error) {
      errors.push(
        `日期时间格式错误: ${error instanceof Error ? error.message : '未知错误'}`
      );
      return {
        isValid: false,
        errors,
      };
    }
  }

  /**
   * 计算真太阳时偏移
   */
  calculateTrueSolarTimeOffset(
    dateTime: Date | string,
    longitude: number,
    timezone: SupportedTimezone = this.defaultTimezone
  ): number {
    const normalizedDate = this.normalizeBirthDateTime(dateTime, timezone);
    const date = normalizedDate.getDate();

    // 简化的真太阳时计算
    // 实际应该使用更精确的天文计算
    const timezoneOffset = normalizedDate.getTimezoneOffset() / 60; // 小时
    const longitudeOffset = longitude / 15; // 每15度经度对应1小时

    // 计算赤道日时差（简化版本）
    const dayOfYear = Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const solarDeclination =
      23.45 * Math.sin(((360 / 365) * (dayOfYear - 81) * Math.PI) / 180);

    // 真太阳时偏移（分钟）
    const trueSolarOffset =
      4 * (longitude - timezoneOffset * 15) +
      4 * Math.sin((2 * solarDeclination * Math.PI) / 180);

    return Math.round(trueSolarOffset);
  }

  /**
   * 获取时区列表
   */
  getAvailableTimezones(): Array<{
    key: SupportedTimezone;
    name: string;
    offset: string;
    cities: string[];
  }> {
    return Object.entries(SUPPORTED_TIMEZONES).map(([key, info]) => ({
      key: key as SupportedTimezone,
      name: info.name,
      offset: info.offset,
      cities: [...info.cities],
    }));
  }

  /**
   * 获取推荐时区
   */
  getRecommendedTimezone(userLocation?: {
    latitude: number;
    longitude: number;
  }): SupportedTimezone {
    if (userLocation) {
      return TimezoneDetector.recommendTimezone(
        userLocation.latitude,
        userLocation.longitude
      );
    }

    return TimezoneDetector.detectBrowserTimezone();
  }

  /**
   * 格式化时区显示
   */
  formatTimezoneDisplay(timezone: SupportedTimezone): string {
    const info = SUPPORTED_TIMEZONES[timezone];
    return `${info.name} (${info.offset})`;
  }

  /**
   * 转换时区
   */
  convertTimezone(
    dateTime: Date | string,
    fromTimezone: SupportedTimezone,
    toTimezone: SupportedTimezone
  ): TimezoneAwareDate {
    const sourceDate = new TimezoneAwareDate(dateTime, fromTimezone);
    return sourceDate.toTimezone(toTimezone);
  }
}

/**
 * 全局时区处理器实例
 */
let globalTimezoneHandler: BaziTimezoneHandler | null = null;

/**
 * 获取全局时区处理器
 */
export function getGlobalTimezoneHandler(): BaziTimezoneHandler {
  if (!globalTimezoneHandler) {
    globalTimezoneHandler = new BaziTimezoneHandler();
  }
  return globalTimezoneHandler;
}

/**
 * 设置全局默认时区
 */
export function setGlobalTimezone(timezone: SupportedTimezone): void {
  if (globalTimezoneHandler) {
    globalTimezoneHandler = new BaziTimezoneHandler(timezone);
  } else {
    globalTimezoneHandler = new BaziTimezoneHandler(timezone);
  }
}

/**
 * 便捷的时区感知日期创建函数
 */
export function createTimezoneAwareDate(
  dateInput: Date | string,
  timezone?: SupportedTimezone
): TimezoneAwareDate {
  return new TimezoneAwareDate(dateInput, timezone);
}

/**
 * 验证出生时间
 */
export function validateBirthDateTime(
  dateTime: Date | string,
  timezone?: SupportedTimezone
): ReturnType<BaziTimezoneHandler['validateBirthDateTime']> {
  const handler = getGlobalTimezoneHandler();
  return handler.validateBirthDateTime(dateTime, timezone);
}

/**
 * 获取推荐时区
 */
export function getRecommendedTimezone(userLocation?: {
  latitude: number;
  longitude: number;
}): SupportedTimezone {
  const handler = getGlobalTimezoneHandler();
  return handler.getRecommendedTimezone(userLocation);
}
