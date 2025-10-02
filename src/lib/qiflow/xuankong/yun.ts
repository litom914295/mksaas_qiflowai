/**
 * 运盘计算
 */

import { YunInfo } from './types';

export function getYunInfo(observedAt: Date): YunInfo {
  const year = observedAt.getFullYear();
  
  // 简化的运盘计算逻辑
  let period = 1;
  if (year >= 1864 && year < 1884) period = 1;
  else if (year >= 1884 && year < 1904) period = 2;
  else if (year >= 1904 && year < 1924) period = 3;
  else if (year >= 1924 && year < 1944) period = 4;
  else if (year >= 1944 && year < 1964) period = 5;
  else if (year >= 1964 && year < 1984) period = 6;
  else if (year >= 1984 && year < 2004) period = 7;
  else if (year >= 2004 && year < 2024) period = 8;
  else if (year >= 2024 && year < 2044) period = 9;
  
  return {
    period,
    isBoundary: year % 20 === 4,
    startYear: Math.floor(year / 20) * 20 + 4,
    endYear: Math.floor(year / 20) * 20 + 24,
  };
}

export function getYunByYear(year: number): number {
  const yunInfo = getYunInfo(new Date(year, 0, 1));
  return yunInfo.period;
}

