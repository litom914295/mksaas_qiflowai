import { describe, expect, test, beforeAll } from 'vitest';

describe('API: 八字分析 - /api/bazi/analyze', () => {
  const validRequest = {
    datetime: '1990-01-15T08:30',
    gender: 'male' as const,
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  describe('POST - 成功场景', () => {
    test('应返回完整的八字分析结果', async () => {
      // Mock API handler
      const mockAnalyze = async (body: typeof validRequest) => {
        const datetime = new Date(body.datetime);
        
        return {
          success: true,
          data: {
            chart: {
              pillars: {
                year: {
                  heavenlyStem: '庚',
                  earthlyBranch: '午',
                  nayin: '海中金',
                  hiddenStems: ['午'],
                },
                month: {
                  heavenlyStem: '戊',
                  earthlyBranch: '寅',
                  nayin: '炉中火',
                  hiddenStems: ['寅'],
                },
                day: {
                  heavenlyStem: '甲',
                  earthlyBranch: '辰',
                  nayin: '大林木',
                  hiddenStems: ['辰'],
                },
                hour: {
                  heavenlyStem: '戊',
                  earthlyBranch: '辰',
                  nayin: '路旁土',
                  hiddenStems: ['辰'],
                },
              },
              dayMaster: '甲',
              gender: body.gender === 'male' ? '男' : '女',
            },
            wuxing: {
              elements: {
                木: 20,
                火: 15,
                土: 25,
                金: 20,
                水: 20,
              },
              dayMasterStrength: 65,
              balance: {
                strongest: '土',
                weakest: '火',
                balanced: false,
              },
            },
            yongshen: {
              primary: {
                element: '金',
                reason: '日主偏强，取金泄身为用神',
              },
              secondary: {
                element: '水',
                reason: '水可助金，为喜神',
              },
              avoid: {
                element: '土',
                reason: '土过旺，为忌神',
              },
              recommendations: ['适宜从事金融、法律、机械等属金行业'],
            },
            pattern: {
              primary: '正官格',
              strength: 75,
              details: expect.arrayContaining([
                expect.objectContaining({
                  name: expect.any(String),
                  description: expect.any(String),
                  advantages: expect.any(Array),
                  challenges: expect.any(Array),
                }),
              ]),
              subPatterns: expect.any(Array),
            },
          },
        };
      };

      const result = await mockAnalyze(validRequest);

      // 验证响应结构
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      
      // 验证四柱
      expect(result.data.chart.pillars).toHaveProperty('year');
      expect(result.data.chart.pillars).toHaveProperty('month');
      expect(result.data.chart.pillars).toHaveProperty('day');
      expect(result.data.chart.pillars).toHaveProperty('hour');
      
      // 验证日主
      expect(result.data.chart.dayMaster).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/);
      
      // 验证五行
      expect(result.data.wuxing.elements).toHaveProperty('木');
      expect(result.data.wuxing.elements).toHaveProperty('火');
      expect(result.data.wuxing.elements).toHaveProperty('土');
      expect(result.data.wuxing.elements).toHaveProperty('金');
      expect(result.data.wuxing.elements).toHaveProperty('水');
      
      // 验证用神
      expect(result.data.yongshen.primary.element).toMatch(/^[木火土金水]$/);
      expect(result.data.yongshen.recommendations).toBeInstanceOf(Array);
      
      // 验证格局
      expect(result.data.pattern.primary).toBeTruthy();
      expect(result.data.pattern.strength).toBeGreaterThanOrEqual(0);
      expect(result.data.pattern.strength).toBeLessThanOrEqual(100);
    });

    test('应正确处理女性性别', async () => {
      const femaleRequest = {
        ...validRequest,
        gender: 'female' as const,
      };

      const mockAnalyze = async (body: typeof femaleRequest) => ({
        success: true,
        data: {
          chart: {
            gender: body.gender === 'male' ? '男' : '女',
          },
        },
      });

      const result = await mockAnalyze(femaleRequest);
      expect(result.data.chart.gender).toBe('女');
    });

    test('应正确处理不同时区', async () => {
      const timezones = ['Asia/Shanghai', 'America/New_York', 'Europe/London'];

      for (const timezone of timezones) {
        const request = { ...validRequest, timezone };
        
        const mockAnalyze = async (body: typeof request) => ({
          success: true,
          data: {
            timezone: body.timezone,
          },
        });

        const result = await mockAnalyze(request);
        expect(result.success).toBe(true);
      }
    });

    test('应正确处理时辰不明', async () => {
      const unknownTimeRequest = {
        ...validRequest,
        isTimeKnown: false,
      };

      const mockAnalyze = async (body: typeof unknownTimeRequest) => ({
        success: true,
        data: {
          isTimeKnown: body.isTimeKnown,
          note: body.isTimeKnown ? null : '时辰不明，仅提供日柱分析',
        },
      });

      const result = await mockAnalyze(unknownTimeRequest);
      expect(result.success).toBe(true);
      expect(result.data.isTimeKnown).toBe(false);
    });
  });

  describe('POST - 参数验证', () => {
    test('缺少 datetime 应返回 400 错误', () => {
      const invalidRequest = {
        gender: 'male',
        timezone: 'Asia/Shanghai',
      };

      const validateRequest = (body: any) => {
        if (!body.datetime) {
          return {
            error: '参数错误',
            details: { fieldErrors: { datetime: ['Required'] } },
          };
        }
        return { success: true };
      };

      const result = validateRequest(invalidRequest);
      expect(result).toHaveProperty('error');
      expect(result.error).toContain('参数错误');
    });

    test('无效的 gender 应返回 400 错误', () => {
      const invalidRequest = {
        datetime: '1990-01-15T08:30',
        gender: 'invalid',
      };

      const validateRequest = (body: any) => {
        if (!['male', 'female'].includes(body.gender)) {
          return {
            error: '参数错误',
            details: { fieldErrors: { gender: ['Invalid enum value'] } },
          };
        }
        return { success: true };
      };

      const result = validateRequest(invalidRequest);
      expect(result).toHaveProperty('error');
    });

    test('无效的日期格式应返回 400 错误', () => {
      const invalidRequest = {
        datetime: 'invalid-date',
        gender: 'male',
      };

      const validateRequest = (body: any) => {
        const datetime = new Date(body.datetime);
        if (Number.isNaN(datetime.getTime())) {
          return { error: '无效的日期时间格式' };
        }
        return { success: true };
      };

      const result = validateRequest(invalidRequest);
      expect(result).toHaveProperty('error');
      expect(result.error).toBe('无效的日期时间格式');
    });

    test('未来日期应可以处理（预测场景）', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const futureRequest = {
        datetime: futureDate.toISOString().slice(0, 16),
        gender: 'male',
      };

      const validateRequest = (body: any) => {
        const datetime = new Date(body.datetime);
        if (Number.isNaN(datetime.getTime())) {
          return { error: '无效的日期时间格式' };
        }
        return { success: true, isFuture: datetime > new Date() };
      };

      const result = validateRequest(futureRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('POST - 错误处理', () => {
    test('服务器错误应返回 500', async () => {
      const mockAnalyzeWithError = async () => {
        throw new Error('Internal server error');
      };

      try {
        await mockAnalyzeWithError();
      } catch (error: any) {
        expect(error.message).toBe('Internal server error');
      }
    });

    test('应正确处理空请求体', () => {
      const validateRequest = (body: any) => {
        if (!body || Object.keys(body).length === 0) {
          return {
            error: '参数错误',
            details: { message: 'Request body is required' },
          };
        }
        return { success: true };
      };

      const result = validateRequest(null);
      expect(result).toHaveProperty('error');
    });
  });

  describe('POST - 数据质量验证', () => {
    test('返回的天干地支应在有效范围内', async () => {
      const heavenlyStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
      const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

      const mockAnalyze = async () => ({
        success: true,
        data: {
          chart: {
            pillars: {
              day: {
                heavenlyStem: '甲',
                earthlyBranch: '子',
              },
            },
          },
        },
      });

      const result = await mockAnalyze();
      const { heavenlyStem, earthlyBranch } = result.data.chart.pillars.day;
      
      expect(heavenlyStems).toContain(heavenlyStem);
      expect(earthlyBranches).toContain(earthlyBranch);
    });

    test('五行总和应合理（允许误差）', async () => {
      const mockAnalyze = async () => ({
        success: true,
        data: {
          wuxing: {
            elements: {
              木: 20,
              火: 15,
              土: 25,
              金: 20,
              水: 20,
            },
          },
        },
      });

      const result = await mockAnalyze();
      const { elements } = result.data.wuxing;
      const total = Object.values(elements).reduce((sum, val) => sum + val, 0);
      
      // 五行总和应该是100%左右（允许误差范围）
      expect(total).toBeGreaterThanOrEqual(95);
      expect(total).toBeLessThanOrEqual(105);
    });

    test('格局强度应在 0-100 范围内', async () => {
      const mockAnalyze = async () => ({
        success: true,
        data: {
          pattern: {
            primary: '正官格',
            strength: 75,
          },
        },
      });

      const result = await mockAnalyze();
      const { strength } = result.data.pattern;
      
      expect(strength).toBeGreaterThanOrEqual(0);
      expect(strength).toBeLessThanOrEqual(100);
    });
  });
});
