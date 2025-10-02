/**
 * 时区处理工具
 */

import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export function convertToTimezone(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone);
}

export function convertFromTimezone(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone);
}

export function getTimezoneOffset(timezone: string): number {
  const now = new Date();
  const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
  const zoned = utcToZonedTime(utc, timezone);
  return (zoned.getTime() - utc.getTime()) / 60000;
}

