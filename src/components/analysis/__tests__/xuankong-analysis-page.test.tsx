/**
 * 玄空分析页面组件测试
 *
 * 验证组件迁移到统一引擎后的功能
 */

import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import { adaptToFrontend } from '@/lib/qiflow/unified/adapters/frontend-adapter';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { XuankongAnalysisPage } from '../xuankong-analysis-page';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/lib/qiflow/unified');
jest.mock('@/lib/qiflow/unified/adapters/frontend-adapter');
jest.mock('../forms/xuankong-input-form', () => ({
  XuankongInputForm: ({ onSubmit }: any) => (
    <button
      onClick={() =>
        onSubmit({
          facingDirection: 180,
          completionYear: 2024,
          completionMonth: 1,
          address: '测试地址',
          currentYear: 2024,
        })
      }
    >
      提交表单
    </button>
  ),
}));
jest.mock('../comprehensive-analysis-panel', () => ({
  ComprehensiveAnalysisPanel: ({ analysisResult, isLoading }: any) => (
    <div data-testid="analysis-panel">
      {isLoading ? '分析中...' : analysisResult ? '分析完成' : '等待分析'}
    </div>
  ),
}));

describe('XuankongAnalysisPage', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();
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
      strengths: [],
      weaknesses: [],
      topPriorities: [],
      longTermPlan: [],
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
      strengths: [],
      weaknesses: [],
      topPriorities: [],
      longTermPlan: [],
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

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });

    (UnifiedFengshuiEngine as jest.Mock).mockImplementation(() => ({
      analyze: jest.fn().mockResolvedValue(mockUnifiedOutput),
    }));

    (adaptToFrontend as jest.Mock).mockReturnValue(mockAdaptedResult);
  });

  it('应该正确渲染页面标题', () => {
    render(<XuankongAnalysisPage />);

    expect(screen.getByText('玄空飞星风水分析')).toBeInTheDocument();
    expect(screen.getByText('探索您的风水能量场')).toBeInTheDocument();
  });

  it('应该在表单提交时调用统一引擎', async () => {
    render(<XuankongAnalysisPage />);

    const submitButton = screen.getByText('提交表单');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const engine = new UnifiedFengshuiEngine();
      expect(engine.analyze).toHaveBeenCalledWith(
        expect.objectContaining({
          houseInfo: expect.objectContaining({
            facing: { degrees: 180 },
            buildingYear: 2024,
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
  });

  it('应该使用适配器转换输出', async () => {
    render(<XuankongAnalysisPage />);

    const submitButton = screen.getByText('提交表单');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(adaptToFrontend).toHaveBeenCalledWith(mockUnifiedOutput);
    });
  });

  it('应该在分析完成后显示结果', async () => {
    render(<XuankongAnalysisPage />);

    const submitButton = screen.getByText('提交表单');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('分析完成')).toBeInTheDocument();
    });
  });

  it('应该正确计算元运', async () => {
    render(<XuankongAnalysisPage />);

    const submitButton = screen.getByText('提交表单');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const engine = new UnifiedFengshuiEngine();
      const call = (engine.analyze as jest.Mock).mock.calls[0][0];

      // 2024年应该是九运
      expect(call.houseInfo.period).toBe(9);
    });
  });

  it('返回按钮应该调用路由返回', () => {
    render(<XuankongAnalysisPage />);

    const backButton = screen.getByText('返回');
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });
});
