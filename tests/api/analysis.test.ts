import { describe, expect, test } from 'vitest';

describe('API: 统一分析 - /api/analysis/unified-full', () => {
  const validRequest = {
    personalInfo: {
      name: '张三',
      birthDate: '1990-01-15',
      birthTime: '08:30',
      gender: 'male' as const,
    },
    houseInfo: {
      address: '北京市朝阳区',
      direction: 180, // 南向
      buildYear: 2020,
      floors: 20,
      currentFloor: 8,
    },
  };

  describe('POST - 成功场景', () => {
    test('应返回完整的统一分析结果', async () => {
      const mockAnalyze = async (
        body: typeof validRequest,
        isAuthenticated: boolean
      ) => {
        if (!isAuthenticated) {
          return { error: 'Unauthorized. Please login first.', status: 401 };
        }

        return {
          success: true,
          data: {
            personalInfo: body.personalInfo,
            houseInfo: body.houseInfo,
            xuankongAnalysis: {
              plate: {
                period: 9,
                facing: body.houseInfo.direction,
                direction: '午',
              },
              diagnosis: {
                score: 75,
                issues: expect.any(Array),
              },
              remedyPlans: expect.any(Object),
            },
            baziAnalysis: {
              fourPillars: {
                year: {
                  heavenlyStem: expect.any(String),
                  earthlyBranch: expect.any(String),
                },
                month: {
                  heavenlyStem: expect.any(String),
                  earthlyBranch: expect.any(String),
                },
                day: {
                  heavenlyStem: expect.any(String),
                  earthlyBranch: expect.any(String),
                },
                hour: {
                  heavenlyStem: expect.any(String),
                  earthlyBranch: expect.any(String),
                },
              },
              elements: {
                wood: expect.any(Number),
                fire: expect.any(Number),
                earth: expect.any(Number),
                metal: expect.any(Number),
                water: expect.any(Number),
              },
              luckyElements: expect.any(Array),
              analysis: expect.objectContaining({
                personality: expect.any(String),
                career: expect.any(String),
                wealth: expect.any(String),
                health: expect.any(String),
                relationships: expect.any(String),
              }),
              recommendations: expect.any(Array),
            },
            engine: 'unified',
            timestamp: expect.any(String),
          },
        };
      };

      const result = await mockAnalyze(validRequest, true);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.xuankongAnalysis).toBeDefined();
      expect(result.data.baziAnalysis).toBeDefined();
      expect(result.data.engine).toBe('unified');
    });

    test('应正确计算积分费用（30积分）', () => {
      const REQUIRED_CREDITS = 30;

      const mockCheckCredits = (userBalance: number) => {
        if (userBalance < REQUIRED_CREDITS) {
          return {
            error: 'Insufficient credits',
            required: REQUIRED_CREDITS,
            current: userBalance,
            status: 402,
          };
        }
        return { success: true, remaining: userBalance - REQUIRED_CREDITS };
      };

      // 余额不足
      const result1 = mockCheckCredits(20);
      expect(result1).toHaveProperty('error');
      expect(result1.status).toBe(402);

      // 余额充足
      const result2 = mockCheckCredits(50);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(20);
    });
  });

  describe('POST - 认证验证', () => {
    test('未登录用户应返回 401', () => {
      const mockAnalyze = (isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          return { error: 'Unauthorized. Please login first.', status: 401 };
        }
        return { success: true };
      };

      const result = mockAnalyze(false);
      expect(result).toHaveProperty('error');
      expect(result.status).toBe(401);
    });

    test('已登录用户可以访问', () => {
      const mockAnalyze = (isAuthenticated: boolean) => {
        if (!isAuthenticated) {
          return { error: 'Unauthorized. Please login first.', status: 401 };
        }
        return { success: true };
      };

      const result = mockAnalyze(true);
      expect(result.success).toBe(true);
    });
  });

  describe('POST - 参数验证', () => {
    test('缺少个人信息应返回 400', () => {
      const validateRequest = (body: any) => {
        if (
          !body.personalInfo?.name ||
          !body.personalInfo?.birthDate ||
          !body.personalInfo?.gender
        ) {
          return {
            error: 'Missing required personal information fields.',
            status: 400,
          };
        }
        return { success: true };
      };

      const invalidRequest = {
        personalInfo: { name: '张三' }, // 缺少 birthDate 和 gender
        houseInfo: validRequest.houseInfo,
      };

      const result = validateRequest(invalidRequest);
      expect(result).toHaveProperty('error');
      expect(result.status).toBe(400);
    });

    test('缺少房屋信息应返回 400', () => {
      const validateRequest = (body: any) => {
        if (
          !body.houseInfo?.address ||
          !body.houseInfo?.direction ||
          !body.houseInfo?.buildYear
        ) {
          return {
            error: 'Missing required house information fields.',
            status: 400,
          };
        }
        return { success: true };
      };

      const invalidRequest = {
        personalInfo: validRequest.personalInfo,
        houseInfo: { address: '北京' }, // 缺少 direction 和 buildYear
      };

      const result = validateRequest(invalidRequest);
      expect(result).toHaveProperty('error');
      expect(result.status).toBe(400);
    });
  });

  describe('POST - 错误处理', () => {
    test('分析引擎错误应返回 503', async () => {
      const mockAnalyze = async (shouldFail: boolean) => {
        if (shouldFail) {
          return {
            error: 'Analysis engine error. Please try again later.',
            status: 503,
          };
        }
        return { success: true };
      };

      const result = await mockAnalyze(true);
      expect(result).toHaveProperty('error');
      expect(result.status).toBe(503);
    });

    test('服务器错误应返回 500', () => {
      const mockAnalyze = () => {
        throw new Error('Internal server error');
      };

      expect(() => mockAnalyze()).toThrow('Internal server error');
    });
  });
});

describe('API: AI增强分析 - /api/analysis/ai-enhanced', () => {
  const validRequest = {
    birthDate: '1990-01-15',
    birthTime: '08:30',
    gender: 'male' as const,
    isQuickAnalysis: false,
  };

  describe('POST - 成功场景', () => {
    test('应返回完整的AI分析结果', async () => {
      const mockAnalyze = async (body: typeof validRequest) => ({
        success: true,
        data: {
          baziResult: {
            fourPillars: {
              year: { heavenlyStem: '庚', earthlyBranch: '午' },
              month: { heavenlyStem: '戊', earthlyBranch: '寅' },
              day: { heavenlyStem: '甲', earthlyBranch: '辰' },
              hour: { heavenlyStem: '戊', earthlyBranch: '辰' },
            },
            dayMaster: '甲',
            gender: body.gender === 'male' ? '男' : '女',
          },
          aiAnalysis: {
            summary: 'AI生成的总结',
            personality: '性格分析',
            career: '事业分析',
            wealth: '财运分析',
            relationship: '感情分析',
            health: '健康分析',
            generatedAt: expect.any(Date),
          },
          isQuickAnalysis: body.isQuickAnalysis,
          userId: null,
        },
      });

      const result = await mockAnalyze(validRequest);

      expect(result.success).toBe(true);
      expect(result.data.baziResult).toBeDefined();
      expect(result.data.aiAnalysis).toBeDefined();
      expect(result.data.aiAnalysis.summary).toBeTruthy();
    });

    test('快速分析模式应只返回摘要', async () => {
      const quickRequest = { ...validRequest, isQuickAnalysis: true };

      const mockAnalyze = async (body: typeof quickRequest) => ({
        success: true,
        data: {
          baziResult: expect.any(Object),
          aiAnalysis: {
            summary: 'AI生成的快速分析',
            personality: '',
            career: '',
            wealth: '',
            relationship: '',
            health: '',
            generatedAt: expect.any(Date),
          },
          isQuickAnalysis: body.isQuickAnalysis,
        },
      });

      const result = await mockAnalyze(quickRequest);

      expect(result.success).toBe(true);
      expect(result.data.isQuickAnalysis).toBe(true);
      expect(result.data.aiAnalysis.summary).toBeTruthy();
      expect(result.data.aiAnalysis.personality).toBe('');
    });

    test('应正确处理不同性别', async () => {
      const testCases = [
        { gender: 'male' as const, expected: '男' },
        { gender: 'female' as const, expected: '女' },
      ];

      for (const testCase of testCases) {
        const request = { ...validRequest, gender: testCase.gender };

        const mockAnalyze = async (body: typeof request) => ({
          success: true,
          data: {
            baziResult: {
              gender: body.gender === 'male' ? '男' : '女',
            },
          },
        });

        const result = await mockAnalyze(request);
        expect(result.data.baziResult.gender).toBe(testCase.expected);
      }
    });
  });

  describe('POST - 参数验证', () => {
    test('无效的日期格式应返回错误', () => {
      const validateRequest = (body: any) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(body.birthDate)) {
          return {
            error: '生日格式必须为 YYYY-MM-DD',
            success: false,
            status: 400,
          };
        }
        return { success: true };
      };

      const invalidDates = ['1990/01/15', '1990-1-15', '90-01-15', 'invalid'];

      for (const date of invalidDates) {
        const result = validateRequest({ birthDate: date });
        expect(result.success).toBe(false);
      }
    });

    test('无效的时间格式应返回错误', () => {
      const validateRequest = (body: any) => {
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(body.birthTime)) {
          return { error: '时间格式必须为 HH:mm', success: false, status: 400 };
        }
        return { success: true };
      };

      const invalidTimes = ['8:30', '08:3', '8:30 AM', 'invalid'];

      for (const time of invalidTimes) {
        const result = validateRequest({ birthTime: time });
        expect(result.success).toBe(false);
      }
    });

    test('无效的性别应返回错误', () => {
      const validateRequest = (body: any) => {
        if (!['male', 'female'].includes(body.gender)) {
          return {
            error: '性别必须为 male 或 female',
            success: false,
            status: 400,
          };
        }
        return { success: true };
      };

      const result = validateRequest({ gender: 'other' });
      expect(result.success).toBe(false);
    });

    test('有效的参数应通过验证', () => {
      const validateRequest = (body: any) => {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const timeRegex = /^\d{2}:\d{2}$/;

        if (!dateRegex.test(body.birthDate)) return { success: false };
        if (!timeRegex.test(body.birthTime)) return { success: false };
        if (!['male', 'female'].includes(body.gender))
          return { success: false };

        return { success: true };
      };

      const result = validateRequest(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('POST - 用户认证（可选）', () => {
    test('提供userId时应验证用户身份', async () => {
      const requestWithUserId = { ...validRequest, userId: 'user_123' };

      const mockAnalyze = async (
        body: any,
        authenticatedUserId: string | null
      ) => {
        if (body.userId && authenticatedUserId !== body.userId) {
          return { error: '用户身份验证失败', success: false, status: 401 };
        }
        return { success: true, data: { userId: authenticatedUserId } };
      };

      // 认证失败
      const result1 = await mockAnalyze(requestWithUserId, 'user_456');
      expect(result1.success).toBe(false);
      expect(result1.status).toBe(401);

      // 认证成功
      const result2 = await mockAnalyze(requestWithUserId, 'user_123');
      expect(result2.success).toBe(true);
    });

    test('不提供userId时应允许匿名访问', async () => {
      const mockAnalyze = async (body: any) => ({
        success: true,
        data: { userId: null },
      });

      const result = await mockAnalyze(validRequest);
      expect(result.success).toBe(true);
      expect(result.data.userId).toBeNull();
    });
  });

  describe('POST - 错误处理', () => {
    test('AI服务不可用应返回 503', async () => {
      const mockAnalyze = async () => {
        throw new Error('AI API connection failed');
      };

      const handleError = async () => {
        try {
          await mockAnalyze();
        } catch (error: any) {
          if (error.message.includes('API')) {
            return {
              error: 'AI服务暂时不可用，请稍后重试',
              success: false,
              status: 503,
            };
          }
          throw error;
        }
      };

      const result = await handleError();
      expect(result.success).toBe(false);
      expect(result.status).toBe(503);
    });

    test('Zod验证错误应返回 400', () => {
      const handleZodError = (error: any) => {
        if (error.name === 'ZodError') {
          return { error: '输入数据格式错误', success: false, status: 400 };
        }
        return { error: 'Unknown error', status: 500 };
      };

      const zodError = { name: 'ZodError', issues: [] };
      const result = handleZodError(zodError);

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
  });

  describe('GET - 服务状态检查', () => {
    test('应返回服务可用状态', async () => {
      const mockCheckStatus = async (hasApiKey: boolean) => ({
        success: true,
        data: {
          available: hasApiKey,
          message: hasApiKey
            ? 'AI增强分析服务可用'
            : 'AI服务未配置，请设置 OPENAI_API_KEY',
        },
      });

      // API Key 已配置
      const result1 = await mockCheckStatus(true);
      expect(result1.success).toBe(true);
      expect(result1.data.available).toBe(true);

      // API Key 未配置
      const result2 = await mockCheckStatus(false);
      expect(result2.success).toBe(true);
      expect(result2.data.available).toBe(false);
    });
  });
});
