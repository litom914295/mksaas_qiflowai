/**
 * @jest-environment node
 */

import * as costModule from '../cost';
import { CostController } from '../cost-controller';
import type { ConversationContext } from '../types/conversation';

// Mock the cost module
jest.mock('../cost', () => ({
  recordUsage: jest.fn(),
}));

describe('CostController', () => {
  let costController: CostController;
  let mockContext: ConversationContext;
  let mockRecordUsage: jest.MockedFunction<typeof costModule.recordUsage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRecordUsage = costModule.recordUsage as jest.MockedFunction<
      typeof costModule.recordUsage
    >;
    mockRecordUsage.mockResolvedValue();

    costController = new CostController();
    mockContext = {
      sessionId: 'test-session-123',
      userId: 'test-user-456',
      messages: [],
      userProfile: {
        preferences: {
          language: 'zh-CN',
          responseStyle: 'detailed',
          culturalBackground: 'mainland',
        },
        expertise: 'beginner',
        baziData: undefined,
      },
      metadata: {
        analysisCount: 0,
        totalMessages: 0,
        sessionDuration: 0,
        lastActivity: new Date().toISOString(),
      },
      domainSnapshot: {
        lastUpdatedAt: new Date().toISOString(),
      },
      topicTags: [],
      currentTopic: 'greeting',
      contextStack: [],
    };
  });

  describe('Constructor', () => {
    it('should use default daily budget when no budget is provided', () => {
      const controller = new CostController();
      expect(controller).toBeInstanceOf(CostController);
    });

    it('should use custom daily budget when provided', () => {
      const customBudget = 25.0;
      const controller = new CostController(customBudget);
      expect(controller).toBeInstanceOf(CostController);
    });

    it('should handle zero budget', () => {
      const controller = new CostController(0);
      expect(controller).toBeInstanceOf(CostController);
    });

    it('should handle negative budget', () => {
      const controller = new CostController(-10);
      expect(controller).toBeInstanceOf(CostController);
    });
  });

  describe('ensureWithinBudget', () => {
    it('should return true for valid estimated cost within budget', async () => {
      const estimatedCost = 0.5; // Well within 10% of $10 default budget ($1)
      const result = await costController.ensureWithinBudget(
        mockContext,
        estimatedCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).toHaveBeenCalledWith(
        'test-user-456',
        estimatedCost
      );
    });

    it('should return false for estimated cost exceeding budget threshold', async () => {
      const estimatedCost = 2.0; // Exceeds 10% of $10 default budget ($1)
      const result = await costController.ensureWithinBudget(
        mockContext,
        estimatedCost
      );

      expect(result).toBe(false);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should return true for zero cost', async () => {
      const estimatedCost = 0;
      const result = await costController.ensureWithinBudget(
        mockContext,
        estimatedCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should return true for NaN cost', async () => {
      const estimatedCost = Number.NaN;
      const result = await costController.ensureWithinBudget(
        mockContext,
        estimatedCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should return true for negative cost', async () => {
      const estimatedCost = -0.5;
      const result = await costController.ensureWithinBudget(
        mockContext,
        estimatedCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should use userId as userKey when available', async () => {
      const estimatedCost = 0.5;
      await costController.ensureWithinBudget(mockContext, estimatedCost);

      expect(mockRecordUsage).toHaveBeenCalledWith(
        'test-user-456',
        estimatedCost
      );
    });

    it('should use sessionId as userKey when userId is not available', async () => {
      const contextWithoutUserId = {
        ...mockContext,
        userId: undefined,
      };
      const estimatedCost = 0.5;

      await costController.ensureWithinBudget(
        contextWithoutUserId,
        estimatedCost
      );

      expect(mockRecordUsage).toHaveBeenCalledWith(
        'test-session-123',
        estimatedCost
      );
    });

    it('should not record usage when both userId and sessionId are missing', async () => {
      const contextWithoutIds = {
        ...mockContext,
        userId: undefined,
        sessionId: undefined as any,
      };
      const estimatedCost = 0.5;

      await costController.ensureWithinBudget(contextWithoutIds, estimatedCost);

      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should work with custom budget', async () => {
      const customBudget = 50; // $50 daily budget, so threshold is $5
      const customController = new CostController(customBudget);

      // Within threshold
      let result = await customController.ensureWithinBudget(mockContext, 3.0);
      expect(result).toBe(true);

      // Exceeds threshold
      result = await customController.ensureWithinBudget(mockContext, 7.0);
      expect(result).toBe(false);
    });

    it('should handle very small budget', async () => {
      const smallBudget = 0.1; // $0.10 daily budget, so threshold is $0.01
      const customController = new CostController(smallBudget);

      // Within threshold
      let result = await customController.ensureWithinBudget(
        mockContext,
        0.005
      );
      expect(result).toBe(true);

      // Exceeds threshold
      result = await customController.ensureWithinBudget(mockContext, 0.02);
      expect(result).toBe(false);
    });

    it('should handle recordUsage failures gracefully', async () => {
      mockRecordUsage.mockRejectedValueOnce(new Error('Recording failed'));

      const estimatedCost = 0.5;

      // Should not throw even if recording fails
      await expect(
        costController.ensureWithinBudget(mockContext, estimatedCost)
      ).resolves.toBe(true);

      expect(mockRecordUsage).toHaveBeenCalledWith(
        'test-user-456',
        estimatedCost
      );
    });

    it('should handle exactly at threshold cost', async () => {
      const exactThresholdCost = 1.0; // Exactly 10% of $10 default budget
      const result = await costController.ensureWithinBudget(
        mockContext,
        exactThresholdCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).toHaveBeenCalledWith(
        'test-user-456',
        exactThresholdCost
      );
    });

    it('should handle slightly over threshold cost', async () => {
      const slightlyOverThresholdCost = 1.01; // Slightly over 10% of $10 default budget
      const result = await costController.ensureWithinBudget(
        mockContext,
        slightlyOverThresholdCost
      );

      expect(result).toBe(false);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });
  });

  describe('Budget Calculations', () => {
    it('should calculate threshold as 10% of daily budget', async () => {
      const testCases = [
        { budget: 10, threshold: 1.0 },
        { budget: 50, threshold: 5.0 },
        { budget: 1, threshold: 0.1 },
        { budget: 0.1, threshold: 0.01 },
      ];

      for (const { budget, threshold } of testCases) {
        const controller = new CostController(budget);

        // Test just under threshold
        let result = await controller.ensureWithinBudget(
          mockContext,
          threshold - 0.001
        );
        expect(result).toBe(true);

        // Reset mock for next test
        mockRecordUsage.mockClear();

        // Test just over threshold
        result = await controller.ensureWithinBudget(
          mockContext,
          threshold + 0.001
        );
        expect(result).toBe(false);

        // Reset mock for next test
        mockRecordUsage.mockClear();
      }
    });

    it('should handle zero budget gracefully', async () => {
      const zeroBudgetController = new CostController(0);

      // Any positive cost should exceed 10% of zero budget
      const result = await zeroBudgetController.ensureWithinBudget(
        mockContext,
        0.001
      );
      expect(result).toBe(false);
    });

    it('should handle negative budget gracefully', async () => {
      const negativeBudgetController = new CostController(-10);

      // Threshold would be negative, so any positive cost should exceed it
      const result = await negativeBudgetController.ensureWithinBudget(
        mockContext,
        0.001
      );
      expect(result).toBe(false);
    });
  });

  describe('User Key Resolution', () => {
    it('should prioritize userId over sessionId', async () => {
      const contextWithBothIds = {
        ...mockContext,
        userId: 'user-123',
        sessionId: 'session-456',
      };

      await costController.ensureWithinBudget(contextWithBothIds, 0.5);

      expect(mockRecordUsage).toHaveBeenCalledWith('user-123', 0.5);
    });

    it('should use sessionId when userId is null', async () => {
      const contextWithNullUserId = {
        ...mockContext,
        userId: null as any,
        sessionId: 'session-456',
      };

      await costController.ensureWithinBudget(contextWithNullUserId, 0.5);

      expect(mockRecordUsage).toHaveBeenCalledWith('session-456', 0.5);
    });

    it('should use sessionId when userId is empty string', async () => {
      const contextWithEmptyUserId = {
        ...mockContext,
        userId: '',
        sessionId: 'session-456',
      };

      await costController.ensureWithinBudget(contextWithEmptyUserId, 0.5);

      expect(mockRecordUsage).toHaveBeenCalledWith('session-456', 0.5);
    });

    it('should not record when both userId and sessionId are empty', async () => {
      const contextWithEmptyIds = {
        ...mockContext,
        userId: '',
        sessionId: '',
      };

      await costController.ensureWithinBudget(contextWithEmptyIds, 0.5);

      expect(mockRecordUsage).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle very large estimated costs', async () => {
      const largeCost = 1000000; // $1M
      const result = await costController.ensureWithinBudget(
        mockContext,
        largeCost
      );

      expect(result).toBe(false);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should handle very small estimated costs', async () => {
      const tinyCost = 0.000001; // $0.000001
      const result = await costController.ensureWithinBudget(
        mockContext,
        tinyCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).toHaveBeenCalledWith('test-user-456', tinyCost);
    });

    it('should handle Infinity cost', async () => {
      const infiniteCost = Number.POSITIVE_INFINITY;
      const result = await costController.ensureWithinBudget(
        mockContext,
        infiniteCost
      );

      expect(result).toBe(false);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should handle -Infinity cost', async () => {
      const negativeInfiniteCost = Number.NEGATIVE_INFINITY;
      const result = await costController.ensureWithinBudget(
        mockContext,
        negativeInfiniteCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).not.toHaveBeenCalled();
    });

    it('should handle recordUsage throwing an error', async () => {
      const error = new Error('Database connection failed');
      mockRecordUsage.mockRejectedValueOnce(error);

      const estimatedCost = 0.5;
      const result = await costController.ensureWithinBudget(
        mockContext,
        estimatedCost
      );

      // Should still return true despite recording failure
      expect(result).toBe(true);
      expect(mockRecordUsage).toHaveBeenCalledWith(
        'test-user-456',
        estimatedCost
      );
    });

    it('should handle recordUsage throwing non-Error objects', async () => {
      mockRecordUsage.mockRejectedValueOnce('String error');

      const estimatedCost = 0.5;
      const result = await costController.ensureWithinBudget(
        mockContext,
        estimatedCost
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).toHaveBeenCalledWith(
        'test-user-456',
        estimatedCost
      );
    });

    it('should handle context with missing properties gracefully', async () => {
      const malformedContext = {
        sessionId: 'test-session',
        // Missing other required properties
      } as any;

      const result = await costController.ensureWithinBudget(
        malformedContext,
        0.5
      );

      expect(result).toBe(true);
      expect(mockRecordUsage).toHaveBeenCalledWith('test-session', 0.5);
    });
  });

  describe('Performance', () => {
    it('should complete budget checks quickly', async () => {
      const startTime = Date.now();
      await costController.ensureWithinBudget(mockContext, 0.5);
      const endTime = Date.now();

      // Should complete within reasonable time (100ms should be more than enough)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle concurrent budget checks', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        costController.ensureWithinBudget(
          { ...mockContext, sessionId: `session-${i}` },
          0.5
        )
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(10);
      results.forEach((result) => expect(result).toBe(true));
      expect(mockRecordUsage).toHaveBeenCalledTimes(10);
    });

    it('should handle rapid sequential calls', async () => {
      const results: boolean[] = [];

      for (let i = 0; i < 100; i++) {
        const result = await costController.ensureWithinBudget(
          mockContext,
          0.01
        );
        results.push(result);
      }

      expect(results).toHaveLength(100);
      results.forEach((result) => expect(result).toBe(true));
      expect(mockRecordUsage).toHaveBeenCalledTimes(100);
    });
  });

  describe('Different Budget Scenarios', () => {
    it('should work with various realistic budget amounts', async () => {
      const budgetScenarios = [
        { budget: 1, description: 'Small budget - $1' },
        { budget: 10, description: 'Default budget - $10' },
        { budget: 100, description: 'Medium budget - $100' },
        { budget: 1000, description: 'Large budget - $1000' },
      ];

      for (const { budget, description } of budgetScenarios) {
        const controller = new CostController(budget);
        const threshold = budget * 0.1;

        // Test within budget
        const withinBudgetCost = threshold * 0.5;
        const result1 = await controller.ensureWithinBudget(
          mockContext,
          withinBudgetCost
        );
        expect(result1).toBe(true);

        // Test over budget
        const overBudgetCost = threshold * 2;
        const result2 = await controller.ensureWithinBudget(
          mockContext,
          overBudgetCost
        );
        expect(result2).toBe(false);

        mockRecordUsage.mockClear();
      }
    });

    it('should handle fractional budgets correctly', async () => {
      const fractionalBudget = 2.5; // $2.50
      const controller = new CostController(fractionalBudget);
      const threshold = 0.25; // 10% of $2.50

      // Within threshold
      let result = await controller.ensureWithinBudget(mockContext, 0.2);
      expect(result).toBe(true);

      mockRecordUsage.mockClear();

      // Over threshold
      result = await controller.ensureWithinBudget(mockContext, 0.3);
      expect(result).toBe(false);
    });
  });

  describe('Integration with Cost Recording', () => {
    it('should record usage only when cost is within budget and valid', async () => {
      const testCases = [
        { cost: 0.5, expectedRecord: true, expectedResult: true },
        { cost: 2.0, expectedRecord: false, expectedResult: false },
        { cost: 0, expectedRecord: false, expectedResult: true },
        { cost: -0.1, expectedRecord: false, expectedResult: true },
        { cost: Number.NaN, expectedRecord: false, expectedResult: true },
      ];

      for (const { cost, expectedRecord, expectedResult } of testCases) {
        mockRecordUsage.mockClear();

        const result = await costController.ensureWithinBudget(
          mockContext,
          cost
        );

        expect(result).toBe(expectedResult);
        if (expectedRecord) {
          expect(mockRecordUsage).toHaveBeenCalledWith('test-user-456', cost);
        } else {
          expect(mockRecordUsage).not.toHaveBeenCalled();
        }
      }
    });

    it('should record with correct user key in various scenarios', async () => {
      const scenarios = [
        {
          context: { ...mockContext, userId: 'user-1', sessionId: 'session-1' },
          expectedKey: 'user-1',
        },
        {
          context: {
            ...mockContext,
            userId: undefined,
            sessionId: 'session-2',
          },
          expectedKey: 'session-2',
        },
        {
          context: { ...mockContext, userId: '', sessionId: 'session-3' },
          expectedKey: 'session-3',
        },
        {
          context: {
            ...mockContext,
            userId: null as any,
            sessionId: 'session-4',
          },
          expectedKey: 'session-4',
        },
      ];

      for (const { context, expectedKey } of scenarios) {
        mockRecordUsage.mockClear();

        await costController.ensureWithinBudget(context, 0.5);

        expect(mockRecordUsage).toHaveBeenCalledWith(expectedKey, 0.5);
      }
    });
  });
});
