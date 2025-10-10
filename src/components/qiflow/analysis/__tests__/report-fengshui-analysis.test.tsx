/**
 * 风水分析报告组件测试
 *
 * 验证组件能否正确调用统一引擎并通过适配器转换输出
 */

import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import { adaptToFrontend } from '@/lib/qiflow/unified/adapters/frontend-adapter';
import { render, screen, waitFor } from '@testing-library/react';
import { ReportFengshuiAnalysis } from '../report-fengshui-analysis';

// Mock 统一引擎
jest.mock('@/lib/qiflow/unified');
jest.mock('@/lib/qiflow/unified/adapters/frontend-adapter');

describe('ReportFengshuiAnalysis', () => {
  const mockHouseInfo = {
    sittingDirection: '北',
    facingDirection: '南',
    period: 9,
    buildingYear: 2024,
  };

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
    // 重置 mock
    jest.clearAllMocks();

    // 设置 mock 返回值
    (UnifiedFengshuiEngine as jest.Mock).mockImplementation(() => ({
      analyze: jest.fn().mockResolvedValue(mockUnifiedOutput),
    }));

    (adaptToFrontend as jest.Mock).mockReturnValue(mockAdaptedResult);
  });

  it('应该正确渲染加载状态', () => {
    render(<ReportFengshuiAnalysis houseInfo={mockHouseInfo} />);

    expect(screen.getByText('正在进行玄空飞星分析...')).toBeInTheDocument();
  });

  it('应该调用统一引擎进行分析', async () => {
    render(<ReportFengshuiAnalysis houseInfo={mockHouseInfo} />);

    await waitFor(() => {
      const engine = new UnifiedFengshuiEngine();
      expect(engine.analyze).toHaveBeenCalledWith(
        expect.objectContaining({
          houseInfo: expect.objectContaining({
            facing: { degrees: 180 }, // 南向 = 180度
            period: 9,
            buildingYear: 2024,
          }),
        })
      );
    });
  });

  it('应该使用适配器转换输出', async () => {
    render(<ReportFengshuiAnalysis houseInfo={mockHouseInfo} />);

    await waitFor(() => {
      expect(adaptToFrontend).toHaveBeenCalledWith(mockUnifiedOutput);
    });
  });

  it('应该在分析失败时显示错误信息', async () => {
    const errorMessage = '分析引擎错误';

    (UnifiedFengshuiEngine as jest.Mock).mockImplementation(() => ({
      analyze: jest.fn().mockRejectedValue(new Error(errorMessage)),
    }));

    render(<ReportFengshuiAnalysis houseInfo={mockHouseInfo} />);

    await waitFor(() => {
      expect(screen.getByText('分析失败')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('应该正确转换方位为角度', async () => {
    const testCases = [
      { facing: '北', expected: 0 },
      { facing: '东北', expected: 45 },
      { facing: '东', expected: 90 },
      { facing: '东南', expected: 135 },
      { facing: '南', expected: 180 },
      { facing: '西南', expected: 225 },
      { facing: '西', expected: 270 },
      { facing: '西北', expected: 315 },
    ];

    for (const { facing, expected } of testCases) {
      jest.clearAllMocks();

      render(
        <ReportFengshuiAnalysis
          houseInfo={{ ...mockHouseInfo, facingDirection: facing }}
        />
      );

      await waitFor(() => {
        const engine = new UnifiedFengshuiEngine();
        expect(engine.analyze).toHaveBeenCalledWith(
          expect.objectContaining({
            houseInfo: expect.objectContaining({
              facing: { degrees: expected },
            }),
          })
        );
      });
    }
  });
});
