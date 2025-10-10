/**
 * 阳历阴历转换模块
 * 用于八字计算中的日期转换
 */

// 农历数据表（1900-2100年）
const lunarInfo = [
  0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0,
  0x09ad0, 0x055d2, 0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255,
  0x0b540,
  // ... 更多数据可以根据需要添加
];

/**
 * 阳历转农历
 */
export function solarToLunar(year: number, month: number, day: number) {
  // 简化实现
  const baseDate = new Date(1900, 0, 31);
  const targetDate = new Date(year, month - 1, day);
  let offset = Math.floor(
    (targetDate.getTime() - baseDate.getTime()) / 86400000
  );

  let lunarYear = 1900;
  let lunarMonth = 1;
  let lunarDay = 1;
  let isLeapMonth = false;

  // 计算农历年
  let yearDays = 0;
  for (let i = 1900; i < 2100 && offset > 0; i++) {
    yearDays = getYearDays(i);
    if (offset < yearDays) {
      lunarYear = i;
      break;
    }
    offset -= yearDays;
  }

  // 计算农历月和日
  const leapMonth = getLeapMonth(lunarYear);
  let monthDays = 0;

  for (let i = 1; i <= 12 && offset > 0; i++) {
    // 闰月
    if (leapMonth > 0 && i === leapMonth + 1 && !isLeapMonth) {
      i--;
      isLeapMonth = true;
      monthDays = getLeapMonthDays(lunarYear);
    } else {
      monthDays = getMonthDays(lunarYear, i);
    }

    if (offset < monthDays) {
      lunarMonth = i;
      lunarDay = offset + 1;
      break;
    }

    if (isLeapMonth && i === leapMonth) {
      isLeapMonth = false;
    }
    offset -= monthDays;
  }

  return {
    year: lunarYear,
    month: lunarMonth,
    day: lunarDay,
    isLeapMonth,
    zodiac: getZodiac(lunarYear),
    ganZhi: getGanZhi(lunarYear),
  };
}

/**
 * 获取年的天数
 */
function getYearDays(year: number): number {
  let sum = 348;
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += lunarInfo[year - 1900] & i ? 1 : 0;
  }
  return sum + getLeapMonthDays(year);
}

/**
 * 获取闰月天数
 */
function getLeapMonthDays(year: number): number {
  if (getLeapMonth(year)) {
    return lunarInfo[year - 1900] & 0x10000 ? 30 : 29;
  }
  return 0;
}

/**
 * 获取闰月月份
 */
function getLeapMonth(year: number): number {
  return lunarInfo[year - 1900] & 0xf;
}

/**
 * 获取月份天数
 */
function getMonthDays(year: number, month: number): number {
  return lunarInfo[year - 1900] & (0x10000 >> month) ? 30 : 29;
}

/**
 * 获取生肖
 */
function getZodiac(year: number): string {
  const zodiacs = [
    '鼠',
    '牛',
    '虎',
    '兔',
    '龙',
    '蛇',
    '马',
    '羊',
    '猴',
    '鸡',
    '狗',
    '猪',
  ];
  return zodiacs[(year - 4) % 12];
}

/**
 * 获取干支纪年
 */
function getGanZhi(year: number): string {
  const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const zhi = [
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

  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;

  return gan[ganIndex] + zhi[zhiIndex];
}

/**
 * 计算节气
 */
export function getSolarTerm(
  year: number,
  month: number,
  day: number
): string | null {
  // 24节气数据
  const solarTerms = [
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

  // 简化的节气计算（实际需要更精确的算法）
  const termIndex = Math.floor((month - 1) * 2 + (day > 15 ? 1 : 0));

  if (termIndex >= 0 && termIndex < solarTerms.length) {
    return solarTerms[termIndex];
  }

  return null;
}

/**
 * 判断是否为闰年
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * 获取月份的天数
 */
export function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (month === 2 && isLeapYear(year)) {
    return 29;
  }

  return daysInMonth[month - 1];
}

/**
 * 日期验证
 */
export function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > getDaysInMonth(year, month)) return false;

  return true;
}

export default {
  solarToLunar,
  getSolarTerm,
  isLeapYear,
  getDaysInMonth,
  isValidDate,
};
