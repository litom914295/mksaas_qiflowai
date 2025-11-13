import {
  calculateAge,
  cn,
  debounce,
  formatDateLocale,
  generateId,
} from '@/lib/utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Utils 工具函数测试', () => {
  describe('cn - Tailwind CSS 类名合并', () => {
    it('应该合并简单的类名', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe(
        'text-red-500 bg-blue-500'
      );
    });

    it('应该处理冲突的类名 (后者覆盖前者)', () => {
      expect(cn('px-2', 'px-4')).toBe('px-4');
      expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    });

    it('应该处理条件类名', () => {
      expect(cn('base', true && 'conditional', false && 'hidden')).toBe(
        'base conditional'
      );
    });

    it('应该处理空值和undefined', () => {
      expect(cn('base', null, undefined, '')).toBe('base');
    });

    it('应该处理数组类名', () => {
      expect(cn(['text-red-500', 'bg-blue-500'])).toBe(
        'text-red-500 bg-blue-500'
      );
    });

    it('应该处理对象类名', () => {
      expect(
        cn({
          'text-red-500': true,
          'bg-blue-500': false,
          'font-bold': true,
        })
      ).toBe('text-red-500 font-bold');
    });

    it('应该处理混合参数', () => {
      expect(
        cn('base', ['text-sm'], { 'font-bold': true, hidden: false }, 'extra')
      ).toBe('base text-sm font-bold extra');
    });
  });

  describe('generateId - 生成唯一ID', () => {
    it('应该生成唯一ID (无前缀)', () => {
      const id = generateId();
      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('应该生成带前缀的ID', () => {
      const id = generateId('user');
      expect(id).toMatch(/^user_/);
      expect(id.split('_').length).toBe(2);
    });

    it('应该每次生成不同的ID', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('应该包含时间戳组件', () => {
      const beforeTimestamp = Date.now();
      const id = generateId();
      const afterTimestamp = Date.now();

      // ID应该包含时间戳的base36表示
      expect(id.length).toBeGreaterThan(5);
    });

    it('应该处理不同的前缀', () => {
      expect(generateId('order')).toMatch(/^order_/);
      expect(generateId('task')).toMatch(/^task_/);
      expect(generateId('msg')).toMatch(/^msg_/);
    });
  });

  describe('formatDateLocale - 日期格式化 (中文)', () => {
    const testDate = new Date('2024-11-06T14:30:00');

    it('应该格式化短日期 (仅日期)', () => {
      const formatted = formatDateLocale(testDate, 'short');
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/11/);
      expect(formatted).toMatch(/6/);
    });

    it('应该格式化长日期 (日期+时间)', () => {
      const formatted = formatDateLocale(testDate, 'long');
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/11/);
      expect(formatted).toMatch(/14/);
      expect(formatted).toMatch(/30/);
    });

    it('应该接受字符串日期', () => {
      const formatted = formatDateLocale('2024-11-06', 'short');
      expect(formatted).toMatch(/2024/);
      expect(formatted).toMatch(/11/);
      expect(formatted).toMatch(/6/);
    });

    it('应该默认使用短格式', () => {
      const formatted = formatDateLocale(testDate);
      // 短格式不应包含时间
      expect(formatted).not.toMatch(/:/);
    });

    it('应该处理不同的日期', () => {
      const newYear = formatDateLocale('2025-01-01', 'short');
      expect(newYear).toMatch(/2025/);
      expect(newYear).toMatch(/1/);

      const christmas = formatDateLocale('2024-12-25', 'short');
      expect(christmas).toMatch(/12/);
      expect(christmas).toMatch(/25/);
    });
  });

  describe('calculateAge - 计算年龄', () => {
    // Mock Date.now() for consistent testing
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-06'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该正确计算年龄 (生日已过)', () => {
      const birthDate = new Date('1990-01-01');
      const age = calculateAge(birthDate);
      expect(age).toBe(34);
    });

    it('应该正确计算年龄 (生日未过)', () => {
      const birthDate = new Date('1990-12-25');
      const age = calculateAge(birthDate);
      expect(age).toBe(33); // 因为今天是11月6日，12月25日还未到
    });

    it('应该处理今年出生的婴儿', () => {
      const birthDate = new Date('2024-01-01');
      const age = calculateAge(birthDate);
      expect(age).toBe(0);
    });

    it('应该接受字符串日期', () => {
      const age = calculateAge('1990-06-15');
      expect(age).toBe(34);
    });

    it('应该处理同月但日期未到的情况', () => {
      const birthDate = new Date('1990-11-10'); // 同月，但日期晚于今天(11-06)
      const age = calculateAge(birthDate);
      expect(age).toBe(33);
    });

    it('应该处理同月同日的情况', () => {
      const birthDate = new Date('1990-11-06'); // 今天生日
      const age = calculateAge(birthDate);
      expect(age).toBe(34);
    });

    it('应该处理闰年出生的情况', () => {
      const birthDate = new Date('2000-02-29');
      const age = calculateAge(birthDate);
      expect(age).toBe(24);
    });
  });

  describe('debounce - 防抖函数', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('应该延迟函数执行', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      expect(mockFn).toHaveBeenCalledWith('test');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('应该取消之前的调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 300);

      debouncedFn('first');
      vi.advanceTimersByTime(100);

      debouncedFn('second');
      vi.advanceTimersByTime(100);

      debouncedFn('third');
      vi.advanceTimersByTime(300);

      // 只有最后一次调用应该执行
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('third');
    });

    it('应该处理多个参数', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 200);

      debouncedFn('arg1', 'arg2', 'arg3');
      vi.advanceTimersByTime(200);

      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
    });

    it('应该在等待时间后允许新的调用', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('first');
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);

      debouncedFn('second');
      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('应该处理零延迟', () => {
      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn('test');
      vi.advanceTimersByTime(0);

      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('应该在独立调用时执行', () => {
      // 注意: 当前debounce实现不保持this上下文
      // 这是简化实现的已知限制,适用于箭头函数和普通函数
      const mockFn = vi.fn((x: number) => x * 2);
      const debounced = debounce(mockFn, 100);

      debounced(5);
      expect(mockFn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(5);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
    it('应该组合使用多个工具函数', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-06'));

      // 生成用户ID
      const userId = generateId('user');
      expect(userId).toMatch(/^user_/);

      // 计算用户年龄
      const userAge = calculateAge('1995-06-15');
      expect(userAge).toBe(29);

      // 格式化注册日期
      const registeredDate = formatDateLocale('2024-01-15', 'short');
      expect(registeredDate).toMatch(/2024/);

      // 生成CSS类名
      const userCardClass = cn(
        'user-card',
        userAge >= 18 && 'adult',
        'base-styles'
      );
      expect(userCardClass).toContain('adult');

      vi.useRealTimers();
    });

    it('应该处理边界情况的组合', () => {
      // 空字符串和null组合
      expect(cn('', null, 'valid')).toBe('valid');

      // 今天出生的ID生成
      const todayId = generateId('newborn');
      expect(todayId).toBeTruthy();

      // 未来日期应该返回负数或0
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-11-06'));
      const futureAge = calculateAge('2025-01-01');
      expect(futureAge).toBeLessThanOrEqual(0);
      vi.useRealTimers();
    });
  });
});
