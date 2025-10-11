/**
 * @jest-environment node
 */

import {
  type PolicyEngine,
  RuleBasedPolicyEngine,
} from '../strategy/policy-engine';
import type { ConversationContext } from '../types/conversation';

describe('RuleBasedPolicyEngine', () => {
  let policyEngine: PolicyEngine;
  let baseContext: ConversationContext;

  beforeEach(() => {
    policyEngine = new RuleBasedPolicyEngine();
    baseContext = {
      sessionId: 'test-session-123',
      userId: 'test-user-456',
      messages: [],
      userProfile: {
        preferences: {
          language: 'zh-CN',
          responseStyle: 'detailed' as const,
          culturalBackground: 'mainland' as const,
        },
        baziData: {
          year: 1990,
          month: 1,
          day: 1,
          hour: 12,
          gender: 'male' as const,
          timezone: 'Asia/Shanghai',
        },
        expertise: 'beginner' as const,
      },
      metadata: {
        analysisCount: 0,
        totalMessages: 0,
        sessionDuration: 0,
        lastActivity: new Date().toISOString(),
      },
      domainSnapshot: { lastUpdatedAt: new Date().toISOString() },
      topicTags: [],
      currentTopic: 'greeting',
      contextStack: [],
    };
  });

  describe('evaluate', () => {
    it('should return collecting_info state when no bazi data exists', async () => {
      // Context without bazi data
      const contextWithoutBazi = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          // No baziData
        },
      };

      const decision = await policyEngine.evaluate(contextWithoutBazi);

      expect(decision).toEqual({
        nextState: 'collecting_info',
        reasoning: '尚未收集出生或房屋信息，需要继续提问。',
        confidence: 0.6,
        actions: ['ask_more'],
      });
    });

    it('should return analyzing state when bazi data exists but no analysis has been done', async () => {
      const contextWithBazi = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: 0, // No analysis yet
        },
      };

      const decision = await policyEngine.evaluate(contextWithBazi);

      expect(decision).toEqual({
        nextState: 'analyzing',
        reasoning: '具备分析输入，准备执行八字/风水算法。',
        confidence: 0.8,
        actions: ['analyze'],
      });
    });

    it('should return expert_handoff state when expert-handoff tag is present', async () => {
      const contextWithExpertTag = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: 1,
        },
        topicTags: ['expert-handoff', 'complex-case'],
      };

      const decision = await policyEngine.evaluate(contextWithExpertTag);

      expect(decision).toEqual({
        nextState: 'expert_handoff',
        reasoning: '用户需求较为复杂，建议转交人工专家。',
        confidence: 0.7,
        actions: ['handoff'],
      });
    });

    it('should return recommending state when analysis has been completed', async () => {
      const contextWithAnalysis = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: 2,
        },
        topicTags: ['bazi', 'analysis-complete'],
      };

      const decision = await policyEngine.evaluate(contextWithAnalysis);

      expect(decision.nextState).toBe('recommending');
      expect(decision.reasoning).toBe('已有分析结果，可进入建议阶段。');
      expect(decision.actions).toEqual(['summarize']);
      expect(decision.confidence).toBeGreaterThan(0.7);
    });

    it('should increase confidence with more analysis iterations', async () => {
      // Test with different analysis counts
      const baseContextWithBazi = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
      };

      // No analysis
      const context0 = {
        ...baseContextWithBazi,
        metadata: { ...baseContext.metadata, analysisCount: 0 },
      };
      const decision0 = await policyEngine.evaluate(context0);
      expect(decision0.nextState).toBe('analyzing');

      // One analysis
      const context1 = {
        ...baseContextWithBazi,
        metadata: { ...baseContext.metadata, analysisCount: 1 },
      };
      const decision1 = await policyEngine.evaluate(context1);
      expect(decision1.confidence).toBeCloseTo(0.75, 2);

      // Two analyses
      const context2 = {
        ...baseContextWithBazi,
        metadata: { ...baseContext.metadata, analysisCount: 2 },
      };
      const decision2 = await policyEngine.evaluate(context2);
      expect(decision2.confidence).toBeCloseTo(0.8, 2);

      // Three analyses
      const context3 = {
        ...baseContextWithBazi,
        metadata: { ...baseContext.metadata, analysisCount: 3 },
      };
      const decision3 = await policyEngine.evaluate(context3);
      expect(decision3.confidence).toBeCloseTo(0.85, 2);

      // More than three should cap at a certain level
      const context5 = {
        ...baseContextWithBazi,
        metadata: { ...baseContext.metadata, analysisCount: 5 },
      };
      const decision5 = await policyEngine.evaluate(context5);
      expect(decision5.confidence).toBeLessThanOrEqual(0.85);
    });

    it('should handle null/undefined bazi data gracefully', async () => {
      const contextWithNullBazi = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: undefined,
        },
      };

      const decision = await policyEngine.evaluate(contextWithNullBazi);

      expect(decision.nextState).toBe('collecting_info');
      expect(decision.actions).toEqual(['ask_more']);
    });

    it('should handle undefined metadata gracefully', async () => {
      const contextWithUndefinedMetadata = {
        ...baseContext,
        metadata: undefined as any,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
      };

      // Should not throw and should handle gracefully
      expect(async () => {
        await policyEngine.evaluate(contextWithUndefinedMetadata);
      }).not.toThrow();
    });

    it('should handle missing topicTags gracefully', async () => {
      const contextWithoutTopicTags = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: 1,
        },
        topicTags: undefined, // Explicitly undefined
      };

      const decision = await policyEngine.evaluate(contextWithoutTopicTags);

      expect(decision.nextState).toBe('recommending');
      expect(decision.actions).toEqual(['summarize']);
    });

    it('should prioritize expert handoff over other states', async () => {
      const contextWithExpertAndAnalysis = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: 3, // Has analysis
        },
        topicTags: ['expert-handoff', 'complex'], // But also has expert tag
      };

      const decision = await policyEngine.evaluate(
        contextWithExpertAndAnalysis
      );

      // Should prioritize expert handoff over recommending
      expect(decision.nextState).toBe('expert_handoff');
      expect(decision.actions).toEqual(['handoff']);
    });

    it('should return valid confidence values', async () => {
      const contexts = [
        // No bazi data
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
          },
        },
        // Has bazi data, no analysis
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
            baziData: {
              year: 1990,
              month: 5,
              day: 15,
              hour: 14,
              gender: 'male' as const,
              timezone: 'Asia/Shanghai',
            },
          },
          metadata: { ...baseContext.metadata, analysisCount: 0 },
        },
        // Has analysis
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
            baziData: {
              year: 1990,
              month: 5,
              day: 15,
              hour: 14,
              gender: 'male' as const,
              timezone: 'Asia/Shanghai',
            },
          },
          metadata: { ...baseContext.metadata, analysisCount: 2 },
        },
        // Expert handoff
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
            baziData: {
              year: 1990,
              month: 5,
              day: 15,
              hour: 14,
              gender: 'male' as const,
              timezone: 'Asia/Shanghai',
            },
          },
          metadata: { ...baseContext.metadata, analysisCount: 1 },
          topicTags: ['expert-handoff'],
        },
      ];

      for (const context of contexts) {
        const decision = await policyEngine.evaluate(context);

        expect(decision.confidence).toBeGreaterThanOrEqual(0);
        expect(decision.confidence).toBeLessThanOrEqual(1);
        expect(typeof decision.confidence).toBe('number');
        expect(Number.isFinite(decision.confidence)).toBe(true);
      }
    });

    it('should return valid action arrays', async () => {
      const allContexts = [
        // Collecting info context
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
          },
        },
        // Analyzing context
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
            baziData: {
              year: 1990,
              month: 5,
              day: 15,
              hour: 14,
              gender: 'male' as const,
              timezone: 'Asia/Shanghai',
            },
          },
          metadata: { ...baseContext.metadata, analysisCount: 0 },
        },
        // Recommending context
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
            baziData: {
              year: 1990,
              month: 5,
              day: 15,
              hour: 14,
              gender: 'male' as const,
              timezone: 'Asia/Shanghai',
            },
          },
          metadata: { ...baseContext.metadata, analysisCount: 1 },
        },
        // Expert handoff context
        {
          ...baseContext,
          userProfile: {
            preferences: {
              language: 'zh-CN',
              responseStyle: 'detailed' as const,
              culturalBackground: 'mainland' as const,
            },
            expertise: 'beginner' as const,
            baziData: {
              year: 1990,
              month: 5,
              day: 15,
              hour: 14,
              gender: 'male' as const,
              timezone: 'Asia/Shanghai',
            },
          },
          metadata: { ...baseContext.metadata, analysisCount: 1 },
          topicTags: ['expert-handoff'],
        },
      ];

      const validActions = ['ask_more', 'analyze', 'summarize', 'handoff'];

      for (const context of allContexts) {
        const decision = await policyEngine.evaluate(context);

        expect(Array.isArray(decision.actions)).toBe(true);
        expect(decision.actions.length).toBeGreaterThan(0);

        for (const action of decision.actions) {
          expect(validActions).toContain(action);
        }
      }
    });

    it('should return appropriate reasoning strings', async () => {
      const contexts = [
        {
          context: {
            ...baseContext,
            userProfile: {
              preferences: {
                language: 'zh-CN',
                responseStyle: 'detailed' as const,
                culturalBackground: 'mainland' as const,
              },
              expertise: 'beginner' as const,
            },
          },
          expectedReasoning: '尚未收集出生或房屋信息，需要继续提问。',
        },
        {
          context: {
            ...baseContext,
            userProfile: {
              preferences: {
                language: 'zh-CN',
                responseStyle: 'detailed' as const,
                culturalBackground: 'mainland' as const,
              },
              expertise: 'beginner' as const,
              baziData: {
                year: 1990,
                month: 5,
                day: 15,
                hour: 14,
                gender: 'male' as const,
                timezone: 'Asia/Shanghai',
              },
            },
            metadata: { ...baseContext.metadata, analysisCount: 0 },
          },
          expectedReasoning: '具备分析输入，准备执行八字/风水算法。',
        },
        {
          context: {
            ...baseContext,
            userProfile: {
              preferences: {
                language: 'zh-CN',
                responseStyle: 'detailed' as const,
                culturalBackground: 'mainland' as const,
              },
              expertise: 'beginner' as const,
              baziData: {
                year: 1990,
                month: 5,
                day: 15,
                hour: 14,
                gender: 'male' as const,
                timezone: 'Asia/Shanghai',
              },
            },
            metadata: { ...baseContext.metadata, analysisCount: 1 },
            topicTags: ['expert-handoff'],
          },
          expectedReasoning: '用户需求较为复杂，建议转交人工专家。',
        },
        {
          context: {
            ...baseContext,
            userProfile: {
              preferences: {
                language: 'zh-CN',
                responseStyle: 'detailed' as const,
                culturalBackground: 'mainland' as const,
              },
              expertise: 'beginner' as const,
              baziData: {
                year: 1990,
                month: 5,
                day: 15,
                hour: 14,
                gender: 'male' as const,
                timezone: 'Asia/Shanghai',
              },
            },
            metadata: { ...baseContext.metadata, analysisCount: 1 },
          },
          expectedReasoning: '已有分析结果，可进入建议阶段。',
        },
      ];

      for (const { context, expectedReasoning } of contexts) {
        const decision = await policyEngine.evaluate(context);
        expect(decision.reasoning).toBe(expectedReasoning);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed bazi data', async () => {
      const contextWithMalformedBazi = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            // Missing required fields
            year: 1990,
            // month, day, hour, gender, timezone missing
          } as any,
        },
      };

      const decision = await policyEngine.evaluate(contextWithMalformedBazi);

      // Should treat malformed data as no data
      expect(decision.nextState).toBe('collecting_info');
    });

    it('should handle very high analysis counts', async () => {
      const contextWithHighAnalysisCount = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: 1000, // Very high count
        },
      };

      const decision = await policyEngine.evaluate(
        contextWithHighAnalysisCount
      );

      expect(decision.nextState).toBe('recommending');
      expect(decision.confidence).toBeGreaterThan(0);
      expect(decision.confidence).toBeLessThanOrEqual(1);
    });

    it('should handle negative analysis counts', async () => {
      const contextWithNegativeAnalysisCount = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: -5, // Negative count
        },
      };

      const decision = await policyEngine.evaluate(
        contextWithNegativeAnalysisCount
      );

      // Should handle gracefully, likely treat as 0
      expect(decision.nextState).toBe('analyzing');
    });
  });

  describe('Performance', () => {
    it('should evaluate decisions quickly', async () => {
      const context = {
        ...baseContext,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: 2,
        },
      };

      const startTime = Date.now();
      await policyEngine.evaluate(context);
      const endTime = Date.now();

      // Should complete within reasonable time (100ms should be more than enough)
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle multiple concurrent evaluations', async () => {
      const contexts = Array.from({ length: 10 }, (_, i) => ({
        ...baseContext,
        sessionId: `test-session-${i}`,
        userProfile: {
          preferences: {
            language: 'zh-CN',
            responseStyle: 'detailed' as const,
            culturalBackground: 'mainland' as const,
          },
          expertise: 'beginner' as const,
          baziData: {
            year: 1990,
            month: 5,
            day: 15,
            hour: 14,
            gender: 'male' as const,
            timezone: 'Asia/Shanghai',
          },
        },
        metadata: {
          ...baseContext.metadata,
          analysisCount: i % 4,
        },
      }));

      const startTime = Date.now();
      const decisions = await Promise.all(
        contexts.map((context) => policyEngine.evaluate(context))
      );
      const endTime = Date.now();

      expect(decisions).toHaveLength(10);
      decisions.forEach((decision) => {
        expect(decision.nextState).toBeDefined();
        expect(decision.confidence).toBeGreaterThanOrEqual(0);
        expect(decision.confidence).toBeLessThanOrEqual(1);
      });

      // Should complete all evaluations quickly
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});
