/**
 * 时区处理模块
 */

/**
 * 时区感知日期对象
 */
export interface TimezoneAwareDate {
  formatLocal(): string;
  formatUTC(): string;
  getTimezoneOffset(): number;
  toDate(): Date;
}

/**
 * 创建时区感知的日期
 */
export function createTimezoneAwareDate(
  datetime: string | Date,
  timezone: string
): TimezoneAwareDate {
  const date = typeof datetime === 'string' ? new Date(datetime) : datetime;
  
  return {
    formatLocal(): string {
      return date.toLocaleString('zh-CN', { timeZone: timezone });
    },
    formatUTC(): string {
      return date.toISOString();
    },
    getTimezoneOffset(): number {
      // 简化处理：返回常见时区的偏移量（小时）
      const timezoneOffsets: Record<string, number> = {
        'Asia/Shanghai': 8,
        'Asia/Hong_Kong': 8,
        'Asia/Taipei': 8,
        UTC: 0,
        'America/New_York': -5,
        'America/Los_Angeles': -8,
        'Europe/London': 0,
      };
      return timezoneOffsets[timezone] ?? 8;
    },
    toDate(): Date {
      return date;
    },
  };
}

/**
 * 获取推荐时区
 */
export function getRecommendedTimezone(location?: {
  latitude: number;
  longitude: number;
}): string {
  // 默认返回 UTC+8 (中国标准时间)
  if (!location) {
    return 'Asia/Shanghai';
  }

  // 根据经度推测时区
  const { longitude } = location;
  
  // 简化处理：根据经度判断大致时区
  if (longitude >= 105 && longitude <= 135) {
    return 'Asia/Shanghai'; // 中国
  } else if (longitude >= -125 && longitude <= -70) {
    return 'America/New_York'; // 美国东部
  } else if (longitude >= -10 && longitude <= 10) {
    return 'Europe/London'; // 欧洲
  }
  
  return 'Asia/Shanghai';
}

/**
 * 将时区转换为 UTC 偏移量
 */
export function getTimezoneOffset(timezone: string): number {
  // 简化处理：返回常见时区的偏移量（小时）
  const timezoneOffsets: Record<string, number> = {
    'Asia/Shanghai': 8,
    'Asia/Hong_Kong': 8,
    'Asia/Taipei': 8,
    UTC: 0,
    'America/New_York': -5,
    'America/Los_Angeles': -8,
    'Europe/London': 0,
  };

  return timezoneOffsets[timezone] ?? 8;
}
