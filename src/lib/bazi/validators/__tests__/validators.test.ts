/**
 * 输入验证测试
 * 验证所有验证函数的正确性
 */

import {
  assertValidBaziAnalysisInput,
  assertValidBirthInfo,
  normalizeDateString,
  normalizeTimeString,
  safeParseInt,
  safeParseNumber,
  validateBaziAnalysisInput,
  validateBirthInfo,
  validateDateFormat,
  validateDateValidity,
  validateGender,
  validateLatitude,
  validateLongitude,
  validateTimeFormat,
  validateYearRange,
} from '../index';

import { ValidationError } from '../../errors';

describe('日期验证', () => {
  describe('validateDateFormat', () => {
    test('有效日期格式', () => {
      expect(validateDateFormat('2024-01-01')).toBe(true);
      expect(validateDateFormat('2024-12-31')).toBe(true);
      expect(validateDateFormat('1900-05-15')).toBe(true);
    });

    test('无效日期格式', () => {
      expect(validateDateFormat('2024/01/01')).toBe(false);
      expect(validateDateFormat('2024-1-1')).toBe(false);
      expect(validateDateFormat('24-01-01')).toBe(false);
      expect(validateDateFormat('2024-13-01')).toBe(false);
      expect(validateDateFormat('2024-00-01')).toBe(false);
      expect(validateDateFormat('2024-01-32')).toBe(false);
      expect(validateDateFormat('not a date')).toBe(false);
    });
  });

  describe('validateTimeFormat', () => {
    test('有效时间格式', () => {
      expect(validateTimeFormat('00:00')).toBe(true);
      expect(validateTimeFormat('12:30')).toBe(true);
      expect(validateTimeFormat('23:59')).toBe(true);
      expect(validateTimeFormat('14:30:45')).toBe(true);
    });

    test('无效时间格式', () => {
      expect(validateTimeFormat('24:00')).toBe(false);
      expect(validateTimeFormat('12:60')).toBe(false);
      expect(validateTimeFormat('1:30')).toBe(false);
      expect(validateTimeFormat('12:3')).toBe(false);
      expect(validateTimeFormat('not a time')).toBe(false);
    });
  });

  describe('validateDateValidity', () => {
    test('有效日期', () => {
      expect(validateDateValidity('2024-02-29')).toBe(true); // 闰年
      expect(validateDateValidity('2024-12-31')).toBe(true);
      expect(validateDateValidity('2000-02-29')).toBe(true);
    });

    test('无效日期', () => {
      expect(validateDateValidity('2023-02-29')).toBe(false); // 非闰年
      expect(validateDateValidity('2024-02-30')).toBe(false);
      expect(validateDateValidity('2024-04-31')).toBe(false);
      expect(validateDateValidity('2024-13-01')).toBe(false);
    });
  });

  describe('validateYearRange', () => {
    test('默认范围 1900-2100', () => {
      expect(validateYearRange(1900)).toBe(true);
      expect(validateYearRange(2024)).toBe(true);
      expect(validateYearRange(2100)).toBe(true);
      expect(validateYearRange(1899)).toBe(false);
      expect(validateYearRange(2101)).toBe(false);
    });

    test('自定义范围', () => {
      expect(validateYearRange(1950, 1900, 2000)).toBe(true);
      expect(validateYearRange(1850, 1900, 2000)).toBe(false);
      expect(validateYearRange(2050, 1900, 2000)).toBe(false);
    });
  });
});

describe('地理位置验证', () => {
  describe('validateLongitude', () => {
    test('有效经度', () => {
      expect(validateLongitude(0)).toBe(true);
      expect(validateLongitude(120)).toBe(true);
      expect(validateLongitude(-120)).toBe(true);
      expect(validateLongitude(180)).toBe(true);
      expect(validateLongitude(-180)).toBe(true);
    });

    test('无效经度', () => {
      expect(validateLongitude(181)).toBe(false);
      expect(validateLongitude(-181)).toBe(false);
      expect(validateLongitude(360)).toBe(false);
    });
  });

  describe('validateLatitude', () => {
    test('有效纬度', () => {
      expect(validateLatitude(0)).toBe(true);
      expect(validateLatitude(45)).toBe(true);
      expect(validateLatitude(-45)).toBe(true);
      expect(validateLatitude(90)).toBe(true);
      expect(validateLatitude(-90)).toBe(true);
    });

    test('无效纬度', () => {
      expect(validateLatitude(91)).toBe(false);
      expect(validateLatitude(-91)).toBe(false);
      expect(validateLatitude(180)).toBe(false);
    });
  });
});

describe('其他验证', () => {
  describe('validateGender', () => {
    test('有效性别', () => {
      expect(validateGender('male')).toBe(true);
      expect(validateGender('female')).toBe(true);
    });

    test('无效性别', () => {
      expect(validateGender('Male')).toBe(false);
      expect(validateGender('FEMALE')).toBe(false);
      expect(validateGender('other')).toBe(false);
      expect(validateGender('')).toBe(false);
    });
  });
});

describe('出生信息验证', () => {
  describe('validateBirthInfo', () => {
    test('完整有效信息', () => {
      const result = validateBirthInfo({
        date: '2024-01-01',
        calendar: 'gregorian',
        time: '12:30',
        location: {
          longitude: 120,
          latitude: 40,
        },
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('缺少必填字段', () => {
      const result = validateBirthInfo({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('缺少出生日期');
      expect(result.errors).toContain('缺少历法类型 (gregorian 或 lunar)');
    });

    test('无效日期格式', () => {
      const result = validateBirthInfo({
        date: '2024/01/01',
        calendar: 'gregorian',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('日期格式错误'))).toBe(true);
    });

    test('无效时间格式', () => {
      const result = validateBirthInfo({
        date: '2024-01-01',
        calendar: 'gregorian',
        time: '25:00',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('时间格式错误'))).toBe(true);
    });

    test('年份超出范围', () => {
      const result = validateBirthInfo({
        date: '1800-01-01',
        calendar: 'gregorian',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('年份超出范围'))).toBe(true);
    });

    test('无效经纬度', () => {
      const result = validateBirthInfo({
        date: '2024-01-01',
        calendar: 'gregorian',
        location: {
          longitude: 200,
          latitude: 100,
        },
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('经度超出范围'))).toBe(true);
      expect(result.errors.some((e) => e.includes('纬度超出范围'))).toBe(true);
    });

    test('无效历法类型', () => {
      const result = validateBirthInfo({
        date: '2024-01-01',
        calendar: 'invalid' as any,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('无效的历法类型'))).toBe(
        true
      );
    });
  });

  describe('assertValidBirthInfo', () => {
    test('有效信息不抛出异常', () => {
      expect(() => {
        assertValidBirthInfo({
          date: '2024-01-01',
          calendar: 'gregorian',
        });
      }).not.toThrow();
    });

    test('无效信息抛出 ValidationError', () => {
      expect(() => {
        assertValidBirthInfo({
          date: 'invalid',
          calendar: 'gregorian',
        });
      }).toThrow(ValidationError);
    });

    test('ValidationError 包含错误详情', () => {
      try {
        assertValidBirthInfo({
          date: '2024/01/01',
          calendar: 'gregorian',
        });
        fail('应该抛出异常');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        const validationError = error as ValidationError;
        expect(validationError.errors.length).toBeGreaterThan(0);
        expect(validationError.message).toContain('出生信息验证失败');
      }
    });
  });
});

describe('八字分析请求验证', () => {
  describe('validateBaziAnalysisInput', () => {
    test('完整有效请求', () => {
      const result = validateBaziAnalysisInput({
        birthDate: '2024-01-01',
        birthTime: '12:30',
        longitude: 120,
        latitude: 40,
        isLunar: false,
        gender: 'male',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('缺少必填字段', () => {
      const result = validateBaziAnalysisInput({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('缺少出生日期 (birthDate)');
      expect(result.errors).toContain('缺少出生时间 (birthTime)');
    });

    test('无效性别', () => {
      const result = validateBaziAnalysisInput({
        birthDate: '2024-01-01',
        birthTime: '12:30',
        gender: 'unknown' as any,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('无效的性别'))).toBe(true);
    });
  });

  describe('assertValidBaziAnalysisInput', () => {
    test('有效请求不抛出异常', () => {
      expect(() => {
        assertValidBaziAnalysisInput({
          birthDate: '2024-01-01',
          birthTime: '12:30',
        });
      }).not.toThrow();
    });

    test('无效请求抛出 ValidationError', () => {
      expect(() => {
        assertValidBaziAnalysisInput({
          birthDate: 'invalid',
          birthTime: '12:30',
        });
      }).toThrow(ValidationError);
    });
  });
});

describe('数据解析工具', () => {
  describe('safeParseNumber', () => {
    test('有效数字', () => {
      expect(safeParseNumber('123.45', 0)).toBe(123.45);
      expect(safeParseNumber(123.45, 0)).toBe(123.45);
      expect(safeParseNumber('-50.5', 0)).toBe(-50.5);
    });

    test('无效数字返回默认值', () => {
      expect(safeParseNumber('invalid', 99)).toBe(99);
      expect(safeParseNumber(Number.NaN, 99)).toBe(99);
      expect(safeParseNumber(undefined, 99)).toBe(99);
    });

    test('范围限制', () => {
      expect(safeParseNumber(150, 100, 0, 100)).toBe(100);
      expect(safeParseNumber(-50, 100, 0, 100)).toBe(100);
      expect(safeParseNumber(50, 100, 0, 100)).toBe(50);
    });
  });

  describe('safeParseInt', () => {
    test('有效整数', () => {
      expect(safeParseInt('123', 0)).toBe(123);
      expect(safeParseInt(123.9, 0)).toBe(123);
      expect(safeParseInt('-50', 0)).toBe(-50);
    });

    test('无效整数返回默认值', () => {
      expect(safeParseInt('invalid', 99)).toBe(99);
      expect(safeParseInt(Number.NaN, 99)).toBe(99);
    });

    test('范围限制', () => {
      expect(safeParseInt(150, 100, 0, 100)).toBe(100);
      expect(safeParseInt(-50, 100, 0, 100)).toBe(100);
      expect(safeParseInt(50, 100, 0, 100)).toBe(50);
    });
  });
});

describe('数据规范化', () => {
  describe('normalizeDateString', () => {
    test('规范化日期格式', () => {
      expect(normalizeDateString('2024-1-1')).toBe('2024-01-01');
      expect(normalizeDateString('2024/01/01')).toBe('2024-01-01');
      expect(normalizeDateString(' 2024-1-1 ')).toBe('2024-01-01');
      expect(normalizeDateString('24-1-1')).toBe('0024-01-01');
    });

    test('已规范的日期保持不变', () => {
      expect(normalizeDateString('2024-01-01')).toBe('2024-01-01');
    });
  });

  describe('normalizeTimeString', () => {
    test('规范化时间格式', () => {
      expect(normalizeTimeString('1:5')).toBe('01:05');
      expect(normalizeTimeString(' 12:30 ')).toBe('12:30');
      expect(normalizeTimeString('9:5:30')).toBe('09:05');
    });

    test('已规范的时间保持不变', () => {
      expect(normalizeTimeString('12:30')).toBe('12:30');
    });
  });
});

describe('边界条件测试', () => {
  test('空字符串', () => {
    expect(validateDateFormat('')).toBe(false);
    expect(validateTimeFormat('')).toBe(false);
  });

  test('null 和 undefined', () => {
    expect(
      validateBirthInfo({ date: undefined as any, calendar: 'gregorian' })
        .isValid
    ).toBe(false);
  });

  test('特殊日期: 闰年2月29日', () => {
    expect(validateDateValidity('2024-02-29')).toBe(true);
    expect(validateDateValidity('2023-02-29')).toBe(false);
    expect(validateDateValidity('2000-02-29')).toBe(true);
    expect(validateDateValidity('1900-02-29')).toBe(false);
  });

  test('边界经纬度', () => {
    expect(validateLongitude(180)).toBe(true);
    expect(validateLongitude(-180)).toBe(true);
    expect(validateLongitude(180.0001)).toBe(false);
    expect(validateLatitude(90)).toBe(true);
    expect(validateLatitude(-90)).toBe(true);
    expect(validateLatitude(90.0001)).toBe(false);
  });

  test('极端年份', () => {
    expect(validateYearRange(1900)).toBe(true);
    expect(validateYearRange(2100)).toBe(true);
    expect(validateYearRange(1899)).toBe(false);
    expect(validateYearRange(2101)).toBe(false);
  });
});

describe('综合场景测试', () => {
  test('场景1: 完整的北京出生信息', () => {
    const result = validateBirthInfo({
      date: '1990-05-15',
      calendar: 'gregorian',
      time: '14:30',
      useTrueSolarTime: true,
      location: {
        longitude: 116.4074,
        latitude: 39.9042,
        timezone: 'Asia/Shanghai',
      },
    });

    expect(result.isValid).toBe(true);
  });

  test('场景2: 农历出生信息', () => {
    const result = validateBirthInfo({
      date: '2024-01-15',
      calendar: 'lunar',
      time: '08:00',
    });

    expect(result.isValid).toBe(true);
  });

  test('场景3: 多个错误同时存在', () => {
    const result = validateBirthInfo({
      date: '2150-13-32',
      calendar: 'invalid' as any,
      time: '25:70',
      location: {
        longitude: 200,
        latitude: 100,
      },
    });

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(3);
  });
});
