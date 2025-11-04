import {
  addCredits,
  consumeCredits,
  getUserCredits,
  hasEnoughCredits,
} from '@/credits/credits';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
  cleanupTestUser,
  createTestUser,
  getTestUserCredits,
  getTestUserTransactions,
} from '../../helpers/db-helper';

describe('Credits System - 积分系统核心功能', () => {
  let testUser: any;

  beforeEach(async () => {
    // 每个测试前创建测试用户
    testUser = await createTestUser({ credits: 100 });
  });

  afterEach(async () => {
    // 清理测试数据
    if (testUser?.id) {
      await cleanupTestUser(testUser.id);
    }
  });

  describe('getUserCredits - 获取余额', () => {
    test('应该返回正确的用户余额', async () => {
      const balance = await getUserCredits(testUser.id);
      expect(balance).toBe(100);
    });

    test('不存在的用户应该返回0', async () => {
      const balance = await getUserCredits('non-existent-user');
      expect(balance).toBe(0);
    });
  });

  describe('hasEnoughCredits - 余额检查', () => {
    test('余额足够时返回true', async () => {
      const result = await hasEnoughCredits({
        userId: testUser.id,
        requiredCredits: 50,
      });
      expect(result).toBe(true);
    });

    test('余额不足时返回false', async () => {
      const result = await hasEnoughCredits({
        userId: testUser.id,
        requiredCredits: 150,
      });
      expect(result).toBe(false);
    });

    test('正好等于余额时返回true', async () => {
      const result = await hasEnoughCredits({
        userId: testUser.id,
        requiredCredits: 100,
      });
      expect(result).toBe(true);
    });
  });

  describe('consumeCredits - 积分消耗', () => {
    test('应该成功消耗积分', async () => {
      await consumeCredits({
        userId: testUser.id,
        amount: 10,
        description: 'Test Bazi Analysis',
      });

      const newBalance = await getTestUserCredits(testUser.id);
      expect(newBalance).toBe(90);
    });

    test('余额不足时应该抛出错误', async () => {
      await expect(
        consumeCredits({
          userId: testUser.id,
          amount: 1000,
          description: 'Test',
        })
      ).rejects.toThrow('Insufficient credits');

      // 验证余额未变化
      const balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(100);
    });

    test('应该正确记录消费历史', async () => {
      await consumeCredits({
        userId: testUser.id,
        amount: 10,
        description: 'Test Consumption',
      });

      const transactions = await getTestUserTransactions(testUser.id);
      const usageTransaction = transactions.find((t) => t.amount === -10);

      expect(usageTransaction).toBeDefined();
      expect(usageTransaction?.description).toBe('Test Consumption');
    });

    test('无效参数应该抛出错误', async () => {
      await expect(
        consumeCredits({
          userId: testUser.id,
          amount: 0,
          description: 'Test',
        })
      ).rejects.toThrow('Invalid amount');

      await expect(
        consumeCredits({
          userId: testUser.id,
          amount: -10,
          description: 'Test',
        })
      ).rejects.toThrow('Invalid amount');

      await expect(
        consumeCredits({
          userId: '',
          amount: 10,
          description: 'Test',
        })
      ).rejects.toThrow('Invalid params');
    });

    test('连续消费应该正确累计', async () => {
      // 第一次消费
      await consumeCredits({
        userId: testUser.id,
        amount: 30,
        description: 'First',
      });

      let balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(70);

      // 第二次消费
      await consumeCredits({
        userId: testUser.id,
        amount: 20,
        description: 'Second',
      });

      balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(50);
    });
  });

  describe('addCredits - 积分增加', () => {
    test('应该成功增加积分', async () => {
      await addCredits({
        userId: testUser.id,
        amount: 50,
        type: 'purchase',
        description: 'Test Purchase',
      });

      const newBalance = await getTestUserCredits(testUser.id);
      expect(newBalance).toBe(150);
    });

    test('无效金额应该抛出错误', async () => {
      await expect(
        addCredits({
          userId: testUser.id,
          amount: 0,
          type: 'purchase',
          description: 'Test',
        })
      ).rejects.toThrow('Invalid amount');

      await expect(
        addCredits({
          userId: testUser.id,
          amount: -50,
          type: 'purchase',
          description: 'Test',
        })
      ).rejects.toThrow('Invalid amount');
    });

    test('应该记录增加交易', async () => {
      await addCredits({
        userId: testUser.id,
        amount: 50,
        type: 'referral',
        description: 'Referral Bonus',
      });

      const transactions = await getTestUserTransactions(testUser.id);
      const addTransaction = transactions.find(
        (t) => t.amount === 50 && t.type === 'referral'
      );

      expect(addTransaction).toBeDefined();
      expect(addTransaction?.description).toBe('Referral Bonus');
    });

    test('多次充值应该正确累加', async () => {
      await addCredits({
        userId: testUser.id,
        amount: 50,
        type: 'purchase',
        description: 'First Purchase',
      });

      await addCredits({
        userId: testUser.id,
        amount: 30,
        type: 'referral',
        description: 'Referral',
      });

      const balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(180); // 100 + 50 + 30
    });
  });

  describe('积分消耗标准', () => {
    test('八字分析消耗10积分', async () => {
      await consumeCredits({
        userId: testUser.id,
        amount: 10,
        description: 'Bazi Analysis',
      });

      const balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(90);
    });

    test('玄空风水消耗20积分', async () => {
      await consumeCredits({
        userId: testUser.id,
        amount: 20,
        description: 'Xuankong Analysis',
      });

      const balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(80);
    });

    test('AI聊天消耗5积分', async () => {
      await consumeCredits({
        userId: testUser.id,
        amount: 5,
        description: 'AI Chat',
      });

      const balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(95);
    });

    test('深度解读消耗30积分', async () => {
      await consumeCredits({
        userId: testUser.id,
        amount: 30,
        description: 'Deep Interpretation',
      });

      const balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(70);
    });

    test('PDF导出消耗5积分', async () => {
      await consumeCredits({
        userId: testUser.id,
        amount: 5,
        description: 'PDF Export',
      });

      const balance = await getTestUserCredits(testUser.id);
      expect(balance).toBe(95);
    });
  });
});
