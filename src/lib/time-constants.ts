/**
 * 时辰常量和工具函数
 * 用于八字命理的时间选择
 */

// 十二时辰定义（按照传统命理习惯）
export const TIME_PERIODS = [
  {
    value: 'zi',
    label: '子时',
    timeRange: '23:00-01:00',
    defaultTime: '00:00',
  },
  {
    value: 'chou',
    label: '丑时',
    timeRange: '01:00-03:00',
    defaultTime: '02:00',
  },
  {
    value: 'yin',
    label: '寅时',
    timeRange: '03:00-05:00',
    defaultTime: '04:00',
  },
  {
    value: 'mao',
    label: '卯时',
    timeRange: '05:00-07:00',
    defaultTime: '06:00',
  },
  {
    value: 'chen',
    label: '辰时',
    timeRange: '07:00-09:00',
    defaultTime: '08:00',
  },
  {
    value: 'si',
    label: '巳时',
    timeRange: '09:00-11:00',
    defaultTime: '10:00',
  },
  {
    value: 'wu',
    label: '午时',
    timeRange: '11:00-13:00',
    defaultTime: '12:00',
  },
  {
    value: 'wei',
    label: '未时',
    timeRange: '13:00-15:00',
    defaultTime: '14:00',
  },
  {
    value: 'shen',
    label: '申时',
    timeRange: '15:00-17:00',
    defaultTime: '16:00',
  },
  {
    value: 'you',
    label: '酉时',
    timeRange: '17:00-19:00',
    defaultTime: '18:00',
  },
  {
    value: 'xu',
    label: '戌时',
    timeRange: '19:00-21:00',
    defaultTime: '20:00',
  },
  {
    value: 'hai',
    label: '亥时',
    timeRange: '21:00-23:00',
    defaultTime: '22:00',
  },
] as const;

// 简化时段选择（用户友好的选项）
// 每个时段包含4个时辰，共視12个时辰
export const SIMPLE_TIME_PERIODS = [
  {
    value: 'morning',
    label: '上午',
    description: '卯辰巳午',
    defaultTime: '09:00',
    timeRange: '05:00-13:00',
    periods: ['mao', 'chen', 'si', 'wu'], // 卯时(5-7) 辰时(7-9) 巳时(9-11) 午时(11-13)
  },
  {
    value: 'afternoon',
    label: '下午',
    description: '未申酉戌',
    defaultTime: '15:00',
    timeRange: '13:00-21:00',
    periods: ['wei', 'shen', 'you', 'xu'], // 未时(13-15) 申时(15-17) 酉时(17-19) 戌时(19-21)
  },
  {
    value: 'evening',
    label: '晚上',
    description: '亥子丑寅',
    defaultTime: '23:00',
    timeRange: '21:00-05:00',
    periods: ['hai', 'zi', 'chou', 'yin'], // 亥时(21-23) 子时(23-01) 丑时(01-03) 寅时(03-05)
  },
] as const;

/**
 * 根据时间字符串 (HH:mm) 获取对应的时辰
 */
export function getTimePeriodFromTime(timeStr: string): string {
  if (!timeStr) return 'chen'; // 默认辰时（早上8点）

  const [hours] = timeStr.split(':').map(Number);

  if (hours === 23 || hours === 0) return 'zi';
  if (hours >= 1 && hours < 3) return 'chou';
  if (hours >= 3 && hours < 5) return 'yin';
  if (hours >= 5 && hours < 7) return 'mao';
  if (hours >= 7 && hours < 9) return 'chen';
  if (hours >= 9 && hours < 11) return 'si';
  if (hours >= 11 && hours < 13) return 'wu';
  if (hours >= 13 && hours < 15) return 'wei';
  if (hours >= 15 && hours < 17) return 'shen';
  if (hours >= 17 && hours < 19) return 'you';
  if (hours >= 19 && hours < 21) return 'xu';
  if (hours >= 21 && hours < 23) return 'hai';

  return 'chen'; // 默认
}

/**
 * 获取时辰的默认时间
 */
export function getDefaultTimeForPeriod(period: string): string {
  const timePeriod = TIME_PERIODS.find((p) => p.value === period);
  return timePeriod?.defaultTime || '08:00';
}

/**
 * 获取简化时段的默认时间
 */
export function getDefaultTimeForSimplePeriod(period: string): string {
  const simplePeriod = SIMPLE_TIME_PERIODS.find((p) => p.value === period);
  return simplePeriod?.defaultTime || '08:00';
}
