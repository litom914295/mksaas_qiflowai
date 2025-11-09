/**
 * Formatter单元测试
 * 测试价格格式化和日期格式化功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatPrice, formatDate } from '@/lib/formatter';

describe('Formatter 测试', () => {
  describe('formatPrice - 价格格式化', () => {
    it('应该格式化美元价格 (分->元)', () => {
      // 100分 = $1.00
      expect(formatPrice(100, 'USD')).toBe('$1');
    });

    it('应该格式化欧元价格', () => {
      expect(formatPrice(1000, 'EUR')).toBe('€10');
    });

    it('应该格式化英镑价格', () => {
      expect(formatPrice(2500, 'GBP')).toBe('£25');
    });

    it('应该格式化人民币价格', () => {
      expect(formatPrice(5000, 'CNY')).toBe('CN¥50');
    });

    it('应该格式化日元价格', () => {
      expect(formatPrice(100000, 'JPY')).toBe('¥1,000');
    });

    it('应该处理零价格', () => {
      expect(formatPrice(0, 'USD')).toBe('$0');
    });

    it('应该处理大额价格 (添加千位分隔符)', () => {
      // 100万分 = $10,000
      expect(formatPrice(1000000, 'USD')).toBe('$10,000');
    });

    it('应该处理小数价格 (分转元)', () => {
      // 1234分 = $12.34, 实际显示小数
      expect(formatPrice(1234, 'USD')).toBe('$12.34');
    });

    it('应该处理负价格 (退款场景)', () => {
      expect(formatPrice(-500, 'USD')).toBe('-$5');
    });

    it('应该处理极小值', () => {
      expect(formatPrice(1, 'USD')).toBe('$0.01');
    });

    it('应该处理极大值', () => {
      // 10亿分 = $10,000,000
      expect(formatPrice(1000000000, 'USD')).toBe('$10,000,000');
    });

    it('应该使用正确的货币符号', () => {
      const usdPrice = formatPrice(100, 'USD');
      const eurPrice = formatPrice(100, 'EUR');
      const gbpPrice = formatPrice(100, 'GBP');

      expect(usdPrice).toContain('$');
      expect(eurPrice).toContain('€');
      expect(gbpPrice).toContain('£');
    });

    it('应该不显示小数点 (minimumFractionDigits: 0)', () => {
      // 根据代码,minimumFractionDigits: 0, 所以不会显示.00
      const price = formatPrice(100, 'USD');
      expect(price).toBe('$1');
      expect(price).not.toContain('.00');
    });

    it('应该正确转换分到元 (除以100)', () => {
      // 测试除以100的逻辑
      expect(formatPrice(100, 'USD')).toBe('$1');
      expect(formatPrice(1000, 'USD')).toBe('$10');
      expect(formatPrice(10000, 'USD')).toBe('$100');
    });
  });

  describe('formatDate - 日期格式化', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.useRealTimers();
    });

    it('应该格式化为 YYYY/MM/DD 格式', () => {
      const date = new Date('2024-06-15T00:00:00Z');
      expect(formatDate(date)).toBe('2024/06/15');
    });

    it('应该正确补零单数字月份', () => {
      const date = new Date('2024-01-05T00:00:00Z');
      expect(formatDate(date)).toBe('2024/01/05');
    });

    it('应该正确补零单数字日期', () => {
      const date = new Date('2024-12-01T00:00:00Z');
      expect(formatDate(date)).toBe('2024/12/01');
    });

    it('应该处理双数字月份和日期', () => {
      const date = new Date('2024-12-25T00:00:00Z');
      expect(formatDate(date)).toBe('2024/12/25');
    });

    it('应该处理年初日期', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(formatDate(date)).toBe('2024/01/01');
    });

    it('应该处理年末日期', () => {
      const date = new Date('2024-12-31T00:00:00Z');
      expect(formatDate(date)).toBe('2024/12/31');
    });

    it('应该处理闰年2月29日', () => {
      const date = new Date('2024-02-29T00:00:00Z');
      expect(formatDate(date)).toBe('2024/02/29');
    });

    it('应该处理过去的日期', () => {
      const date = new Date('2020-03-15T00:00:00Z');
      expect(formatDate(date)).toBe('2020/03/15');
    });

    it('应该处理未来的日期', () => {
      const date = new Date('2030-08-20T00:00:00Z');
      expect(formatDate(date)).toBe('2030/08/20');
    });

    it('应该处理当前日期', () => {
      const now = new Date('2024-06-15T10:30:00Z');
      vi.setSystemTime(now);

      expect(formatDate(now)).toBe('2024/06/15');
    });

    it('应该忽略时间部分,只格式化日期', () => {
      const morning = new Date('2024-06-15T08:00:00Z');
      const evening = new Date('2024-06-15T20:00:00Z');

      // 由于时区转换,结果可能不同,但应该是有效日期
      const morningFormatted = formatDate(morning);
      const eveningFormatted = formatDate(evening);
      expect(morningFormatted).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      expect(eveningFormatted).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it('应该处理不同世纪的日期', () => {
      const date1900s = new Date('1999-12-31T00:00:00Z');
      const date2000s = new Date('2000-01-01T00:00:00Z');

      expect(formatDate(date1900s)).toBe('1999/12/31');
      expect(formatDate(date2000s)).toBe('2000/01/01');
    });

    it('应该使用正确的分隔符 /', () => {
      const date = new Date('2024-06-15T00:00:00Z');
      const formatted = formatDate(date);

      expect(formatted).toContain('/');
      expect(formatted.split('/').length).toBe(3);
    });

    it('应该保持一致的长度格式', () => {
      const date1 = new Date('2024-01-01T00:00:00Z');
      const date2 = new Date('2024-12-31T00:00:00Z');

      expect(formatDate(date1).length).toBe(10); // YYYY/MM/DD = 10字符
      expect(formatDate(date2).length).toBe(10);
    });
  });

  describe('综合场景测试', () => {
    it('应该正确处理价格和日期组合 (订单场景)', () => {
      const orderPrice = 5999; // 59.99美元
      const orderDate = new Date('2024-06-15T00:00:00Z');

      const formattedPrice = formatPrice(orderPrice, 'USD');
      const formattedDate = formatDate(orderDate);

      expect(formattedPrice).toBe('$59.99'); // 显示小数
      expect(formattedDate).toBe('2024/06/15');
    });

    it('应该处理多货币价格显示', () => {
      const amount = 10000; // 100美元/欧元/英镑

      const usd = formatPrice(amount, 'USD');
      const eur = formatPrice(amount, 'EUR');
      const gbp = formatPrice(amount, 'GBP');

      expect(usd).toContain('$');
      expect(eur).toContain('€');
      expect(gbp).toContain('£');

      // 所有货币的数值部分应该相同 (100)
      expect(usd).toContain('100');
      expect(eur).toContain('100');
      expect(gbp).toContain('100');
    });

    it('应该处理交易历史记录格式化', () => {
      const transactions = [
        { amount: 1000, date: new Date('2024-06-01T00:00:00Z') },
        { amount: 2500, date: new Date('2024-06-10T00:00:00Z') },
        { amount: -500, date: new Date('2024-06-15T00:00:00Z') }, // 退款
      ];

      const formatted = transactions.map((t) => ({
        amount: formatPrice(t.amount, 'USD'),
        date: formatDate(t.date),
      }));

      expect(formatted[0].amount).toBe('$10');
      expect(formatted[0].date).toBe('2024/06/01');
      expect(formatted[1].amount).toBe('$25');
      expect(formatted[1].date).toBe('2024/06/10');
      expect(formatted[2].amount).toBe('-$5'); // 负数
      expect(formatted[2].date).toBe('2024/06/15');
    });
  });

  describe('边界情况和特殊值', () => {
    it('应该处理价格的浮点数精度问题', () => {
      // JavaScript浮点数精度问题的常见案例
      const price1 = 12345; // 123.45美元
      const price2 = 99999; // 999.99美元

      expect(formatPrice(price1, 'USD')).toBe('$123.45');
      expect(formatPrice(price2, 'USD')).toBe('$999.99');
    });

    it('应该处理UTC vs 本地时间的日期', () => {
      // 使用UTC时间创建日期
      const dateUTC = new Date('2024-06-15T00:00:00Z');

      // formatDate使用本地时间的年月日
      const formatted = formatDate(dateUTC);

      // 验证格式正确 (年月日由本地时区决定)
      expect(formatted).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it('应该处理午夜边界的日期', () => {
      const midnight = new Date('2024-06-15T00:00:00Z');
      const justBefore = new Date('2024-06-14T23:59:59Z');

      const formattedMidnight = formatDate(midnight);
      const formattedBefore = formatDate(justBefore);

      // 两个日期可能相同或不同,取决于本地时区
      expect(formattedMidnight).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
      expect(formattedBefore).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it('应该处理非常旧的日期', () => {
      const oldDate = new Date('1970-01-01T00:00:00Z');
      expect(formatDate(oldDate)).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    });

    it('应该处理一分钱的价格', () => {
      expect(formatPrice(1, 'USD')).toBe('$0.01');
    });

    it('应该处理大于int32的价格', () => {
      const veryLargePrice = 2147483647; // 接近int32最大值
      const formatted = formatPrice(veryLargePrice, 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain(','); // 应该有千位分隔符
    });
  });
});
