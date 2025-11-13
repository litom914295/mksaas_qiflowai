/**
 * 八字输入验证工具
 * 提供完整的输入数据验证逻辑
 *
 * @module bazi/validators
 */

import { ValidationError } from '../errors';
import type { BirthInput } from '../types/core';

/**
 * 验证日期格式 (YYYY-MM-DD)
 */
export function validateDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
  return dateRegex.test(date);
}

/**
 * 验证时间格式 (HH:mm 或 HH:mm:ss)
 */
export function validateTimeFormat(time: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  return timeRegex.test(time);
}

/**
 * 验证日期有效性
 */
export function validateDateValidity(date: string): boolean {
  if (!validateDateFormat(date)) return false;

  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return false;

  // 检查日期是否被JavaScript修正过(如2月30日会被修正为3月)
  const [year, month, day] = date.split('-').map(Number);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
}

/**
 * 验证年份范围
 */
export function validateYearRange(
  year: number,
  min = 1900,
  max = 2100
): boolean {
  return year >= min && year <= max;
}

/**
 * 验证经度
 */
export function validateLongitude(longitude: number): boolean {
  return longitude >= -180 && longitude <= 180;
}

/**
 * 验证纬度
 */
export function validateLatitude(latitude: number): boolean {
  return latitude >= -90 && latitude <= 90;
}

/**
 * 验证性别
 */
export function validateGender(gender: string): boolean {
  return gender === 'male' || gender === 'female';
}

/**
 * 出生信息验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * 验证出生信息
 */
export function validateBirthInfo(
  birthInfo: Partial<BirthInput>
): ValidationResult {
  const errors: string[] = [];

  // 必填字段检查
  if (!birthInfo.date) {
    errors.push('缺少出生日期');
  }

  if (!birthInfo.calendar) {
    errors.push('缺少历法类型 (gregorian 或 lunar)');
  }

  // 日期格式验证
  if (birthInfo.date) {
    if (!validateDateFormat(birthInfo.date)) {
      errors.push('日期格式错误,应为 YYYY-MM-DD');
    } else if (!validateDateValidity(birthInfo.date)) {
      errors.push(`无效的日期: ${birthInfo.date}`);
    } else {
      // 年份范围验证
      const year = new Date(birthInfo.date).getFullYear();
      if (!validateYearRange(year)) {
        errors.push(`年份超出范围,仅支持 1900-2100 年,当前: ${year}`);
      }
    }
  }

  // 时间格式验证
  if (birthInfo.time && !validateTimeFormat(birthInfo.time)) {
    errors.push('时间格式错误,应为 HH:mm 或 HH:mm:ss');
  }

  // 历法类型验证
  if (
    birthInfo.calendar &&
    birthInfo.calendar !== 'gregorian' &&
    birthInfo.calendar !== 'lunar'
  ) {
    errors.push(`无效的历法类型: ${birthInfo.calendar}`);
  }

  // 位置信息验证
  if (birthInfo.location) {
    const { longitude, latitude } = birthInfo.location;

    if (longitude !== undefined && !validateLongitude(longitude)) {
      errors.push(`经度超出范围 (-180 到 180),当前: ${longitude}`);
    }

    if (latitude !== undefined && !validateLatitude(latitude)) {
      errors.push(`纬度超出范围 (-90 到 90),当前: ${latitude}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证出生信息(抛出异常版本)
 */
export function assertValidBirthInfo(
  birthInfo: Partial<BirthInput>
): asserts birthInfo is BirthInput {
  const result = validateBirthInfo(birthInfo);

  if (!result.isValid) {
    throw new ValidationError('出生信息验证失败', result.errors, { birthInfo });
  }
}

/**
 * 验证八字分析请求
 */
export interface BaziAnalysisInput {
  birthDate: string;
  birthTime: string;
  longitude?: number;
  latitude?: number;
  isLunar?: boolean;
  gender?: 'male' | 'female';
}

/**
 * 验证八字分析请求
 */
export function validateBaziAnalysisInput(
  input: Partial<BaziAnalysisInput>
): ValidationResult {
  const errors: string[] = [];

  // 必填字段
  if (!input.birthDate) {
    errors.push('缺少出生日期 (birthDate)');
  }

  if (!input.birthTime) {
    errors.push('缺少出生时间 (birthTime)');
  }

  // 日期验证
  if (input.birthDate) {
    if (!validateDateFormat(input.birthDate)) {
      errors.push('出生日期格式错误,应为 YYYY-MM-DD');
    } else if (!validateDateValidity(input.birthDate)) {
      errors.push(`无效的出生日期: ${input.birthDate}`);
    }
  }

  // 时间验证
  if (input.birthTime && !validateTimeFormat(input.birthTime)) {
    errors.push('出生时间格式错误,应为 HH:mm 或 HH:mm:ss');
  }

  // 经度验证
  if (input.longitude !== undefined && !validateLongitude(input.longitude)) {
    errors.push(`经度超出范围 (-180 到 180),当前: ${input.longitude}`);
  }

  // 纬度验证
  if (input.latitude !== undefined && !validateLatitude(input.latitude)) {
    errors.push(`纬度超出范围 (-90 到 90),当前: ${input.latitude}`);
  }

  // 性别验证
  if (input.gender && !validateGender(input.gender)) {
    errors.push(`无效的性别: ${input.gender},应为 male 或 female`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 验证八字分析请求(抛出异常版本)
 */
export function assertValidBaziAnalysisInput(
  input: Partial<BaziAnalysisInput>
): asserts input is BaziAnalysisInput {
  const result = validateBaziAnalysisInput(input);

  if (!result.isValid) {
    throw new ValidationError('八字分析请求验证失败', result.errors, { input });
  }
}

/**
 * 安全的数字解析
 */
export function safeParseNumber(
  value: any,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  const num = typeof value === 'number' ? value : Number.parseFloat(value);

  if (isNaN(num)) {
    return defaultValue;
  }

  if (min !== undefined && num < min) {
    return defaultValue;
  }

  if (max !== undefined && num > max) {
    return defaultValue;
  }

  return num;
}

/**
 * 安全的整数解析
 */
export function safeParseInt(
  value: any,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  const num =
    typeof value === 'number' ? Math.floor(value) : Number.parseInt(value, 10);

  if (isNaN(num)) {
    return defaultValue;
  }

  if (min !== undefined && num < min) {
    return defaultValue;
  }

  if (max !== undefined && num > max) {
    return defaultValue;
  }

  return num;
}

/**
 * 清理和规范化日期字符串
 */
export function normalizeDateString(date: string): string {
  // 移除多余的空格
  date = date.trim();

  // 将 / 替换为 -
  date = date.replace(/\//g, '-');

  // 确保年份是4位数
  const parts = date.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return date;
}

/**
 * 清理和规范化时间字符串
 */
export function normalizeTimeString(time: string): string {
  // 移除多余的空格
  time = time.trim();

  // 确保格式为 HH:mm
  const parts = time.split(':');
  if (parts.length >= 2) {
    const [hour, minute] = parts;
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }

  return time;
}
