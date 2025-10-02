import { Yun } from './types';

const PERIOD_START_YEAR = 1864; // inclusive
const PERIOD_END_YEAR = 2043; // inclusive
const YEARS_PER_PERIOD = 20; // 9 periods in SanYuan JiuYun

export function getYunByYear(year: number): Yun {
  if (year < PERIOD_START_YEAR) return 1;
  if (year > PERIOD_END_YEAR) return 9;
  const offset = year - PERIOD_START_YEAR;
  const index = Math.floor(offset / YEARS_PER_PERIOD); // 0..8
  return (index + 1) as Yun;
}

export function getYunInfo(date: Date): { period: Yun; isBoundary: boolean } {
  const year = date.getUTCFullYear();
  const period = getYunByYear(year);
  // Approx boundary near period switching years (every 20 years from 1864): mark ±15 days around Jan 1 as boundary
  const isSwitchYear = (year - PERIOD_START_YEAR) % YEARS_PER_PERIOD === 0;
  if (!isSwitchYear) return { period, isBoundary: false };
  const jan1 = Date.UTC(year, 0, 1);
  const diffDays = Math.abs((date.getTime() - jan1) / (1000 * 60 * 60 * 24));
  return { period, isBoundary: diffDays <= 15 };
}


