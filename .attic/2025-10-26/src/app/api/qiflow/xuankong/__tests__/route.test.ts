/**
 * Xuankong API Route 测试
 *
 * 验证API路由迁移到统一引擎后的功能
 */

import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import { adaptToFrontend } from '@/lib/qiflow/unified/adapters/frontend-adapter';
import { NextRequest } from 'next/server';
import { GET, POST } from '../route';

// Mock dependencies
jest.mock('@/lib/qiflow/unified');
jest.mock('@/lib/qiflow/unified/adapters/frontend-adapter');

describe('Xuankong API Route', () => {
  const mockUnifiedOutput = {
    xuankong: {
      period: 9,
      facing: '子',
      plate: {},
      evaluation: {},
    },
    assessment: {
      overallScore: 85,
      rating: 'good',
      strengths: ['阳光充足'],
      weaknesses: ['通风不佳'],
      topPriorities: ['改善通风'],
      longTermPlan: ['长期维护'],
    },
    metadata: {
      analyzedAt: new Date(),
      version: '1.0.0',
      depth: 'comprehensive',
      computationTime: 150,
    },
  };

  const mockAdaptedResult = {
    basicAnalysis: {
      period: 9,
      facingDirection: '子',
      plates: { period: {}, liunian: {} },
      evaluation: {},
      wenchangwei: [],
      caiwei: [],
    },
    enhancedPlate: {},
    smartRecommendations: {
      all: [],
      urgent: [],
      today: [],
      byCategory: {},
    },
    overallAssessment: {
      score: 85,
      rating: 'good',
      strengths: ['阳光充足'],
      weaknesses: ['通风不佳'],
      topPriorities: ['改善通风'],
      longTermPlan: ['长期维护'],
    },
    metadata: {
      analyzedAt: new Date(),
      version: '1.0.0',
      analysisDepth: 'comprehensive',
      computationTime: 150,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (UnifiedFengshuiEngine as jest.Mock).mockImplementation(() => ({
      analyze: jest.fn().mockResolvedValue(mockUnifiedOutput),
    }));

    (adaptToFrontend as jest.Mock).mockReturnValue(mockAdaptedResult);
  });

  describe('POST', () => {
    it('应该成功处理有效的请求', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong',
        {
          method: 'POST',
          body: JSON.stringify({
            address: '测试地址',
            direction: 180,
            houseType: '公寓',
            observedAt: '2024-01-01',
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.confidence).toBeGreaterThan(0);
    });

    it('应该调用统一引擎进行分析', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong',
        {
          method: 'POST',
          body: JSON.stringify({
            address: '测试地址',
            direction: 180,
          }),
        }
      );

      await POST(request);

      const engine = new UnifiedFengshuiEngine();
      expect(engine.analyze).toHaveBeenCalledWith(
        expect.objectContaining({
          houseInfo: expect.objectContaining({
            facing: { degrees: 180 },
          }),
          analysisOptions: expect.objectContaining({
            includeLiunian: true,
            includePersonalization: false,
            includeTigua: true,
            includeLingzheng: true,
            includeChengmenjue: true,
          }),
        })
      );
    });

    it('应该使用适配器转换输出', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong',
        {
          method: 'POST',
          body: JSON.stringify({
            address: '测试地址',
            direction: 180,
          }),
        }
      );

      await POST(request);

      expect(adaptToFrontend).toHaveBeenCalledWith(mockUnifiedOutput);
    });

    it('应该拒绝无效的请求数据', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong',
        {
          method: 'POST',
          body: JSON.stringify({
            // 缺少必需的 address 字段
            direction: 180,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('应该拒绝超出范围的方向值', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong',
        {
          method: 'POST',
          body: JSON.stringify({
            address: '测试地址',
            direction: 400, // 超出 0-360 范围
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('应该根据评分计算置信度', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong',
        {
          method: 'POST',
          body: JSON.stringify({
            address: '测试地址',
            direction: 180,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      // 置信度应该基于 overallScore (85) / 100 = 0.85
      expect(data.confidence).toBeCloseTo(0.85, 2);
    });

    it('应该正确处理错误情况', async () => {
      (UnifiedFengshuiEngine as jest.Mock).mockImplementation(() => ({
        analyze: jest.fn().mockRejectedValue(new Error('分析失败')),
      }));

      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong',
        {
          method: 'POST',
          body: JSON.stringify({
            address: '测试地址',
            direction: 180,
          }),
        }
      );

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });
  });

  describe('GET', () => {
    it('应该返回API状态信息', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/qiflow/xuankong'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');
      expect(data.endpoint).toBe('xuankong');
      expect(data.version).toBe('1.0.0');
      expect(data.methods).toContain('POST');
    });
  });
});
