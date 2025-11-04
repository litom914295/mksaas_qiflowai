import type {
  ComprehensiveAnalysisResult,
  EnhancedXuankongPlate,
} from '@/types/qiflow/xuankong';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BasicAnalysisView } from '../basic-analysis-view';
import { ComprehensiveAnalysisPanel } from '../comprehensive-analysis-panel';
import { InteractiveFlyingStarGrid } from '../interactive-flying-star-grid';

describe('组件集成测试', () => {
  let mockAnalysisResult: ComprehensiveAnalysisResult;
  let mockPlate: EnhancedXuankongPlate;

  beforeEach(() => {
    // 模拟完整的分析结果
    mockPlate = {
      period: 9,
      facing: {
        degrees: 180,
        direction: '坐北向南',
        palace: '离',
      },
      palaces: {
        中: {
          palace: '中',
          position: { row: 1, col: 1 },
          mountainStar: 5,
          facingStar: 5,
          timeStar: 9,
          fortuneRating: '平',
          score: 60,
          element: '土',
        },
        乾: {
          palace: '乾',
          position: { row: 0, col: 2 },
          mountainStar: 6,
          facingStar: 1,
          timeStar: 4,
          fortuneRating: '吉',
          score: 75,
          element: '金',
        },
        坎: {
          palace: '坎',
          position: { row: 2, col: 1 },
          mountainStar: 1,
          facingStar: 8,
          timeStar: 2,
          fortuneRating: '大吉',
          score: 88,
          element: '水',
        },
      },
      specialPatterns: [],
      overallScore: 75,
      metadata: {
        calculatedAt: new Date('2024-01-01'),
        calculationMethod: 'standard',
        version: '1.0.0',
      },
    };

    mockAnalysisResult = {
      basicAnalysis: {
        enhancedPlate: mockPlate,
        palaceDetails: {
          中: {
            palace: '中',
            stars: [
              { type: '山星', number: 5 },
              { type: '向星', number: 5 },
              { type: '运星', number: 9 },
            ],
            rating: '平',
            score: 60,
            interpretation: '中宫五黄，需要注意',
            suitableFor: ['储藏', '通道'],
            recommendations: ['保持整洁', '避免长时间停留'],
          },
          坎: {
            palace: '坎',
            stars: [
              { type: '山星', number: 1 },
              { type: '向星', number: 8 },
              { type: '运星', number: 2 },
            ],
            rating: '大吉',
            score: 88,
            interpretation: '一八组合，旺财旺丁',
            suitableFor: ['卧室', '书房', '办公室'],
            recommendations: ['可作为主要活动区域', '摆放水景增强财运'],
          },
        },
        summary: {
          overallScore: 75,
          characteristics: '整体运势中等偏上，有吉有凶',
          mainIssues: ['中宫五黄需要化解', '部分方位能量不足'],
          keyPalaces: ['坎', '乾'],
        },
      },
      overallAssessment: {
        comprehensiveScore: 75,
        strengths: ['坎宫大吉，财运旺盛', '乾宫吉利，人际关系好'],
        weaknesses: ['中宫五黄，需要化解', '离宫较凶，注意健康'],
        priorities: ['化解五黄煞', '强化吉宫能量'],
        longTermPlan: ['第一阶段：化解凶煞', '第二阶段：增强吉运'],
      },
      metadata: {
        analysisDate: new Date('2024-01-01'),
        analysisVersion: '1.0.0',
        options: {
          includeLiunian: false,
          includePersonalization: false,
        },
      },
    };
  });

  describe('ComprehensiveAnalysisPanel 集成测试', () => {
    it('应该正确渲染完整的分析面板', () => {
      render(
        <ComprehensiveAnalysisPanel
          analysisResult={mockAnalysisResult}
          isLoading={false}
        />
      );

      // 验证主要元素存在
      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();
      expect(screen.getByText(/总览/i)).toBeInTheDocument();
      expect(screen.getByText(/基础分析/i)).toBeInTheDocument();
    });

    it('应该显示加载状态', () => {
      render(
        <ComprehensiveAnalysisPanel analysisResult={null} isLoading={true} />
      );

      expect(screen.getByText(/分析中/i)).toBeInTheDocument();
    });

    it('应该显示空状态', () => {
      render(
        <ComprehensiveAnalysisPanel analysisResult={null} isLoading={false} />
      );

      expect(screen.getByText(/暂无分析结果/i)).toBeInTheDocument();
    });

    it('应该能够切换标签页', async () => {
      const user = userEvent.setup();

      render(
        <ComprehensiveAnalysisPanel
          analysisResult={mockAnalysisResult}
          isLoading={false}
        />
      );

      // 点击基础分析标签
      const basicTab = screen.getByText(/基础分析/i);
      await user.click(basicTab);

      // 验证内容切换
      await waitFor(() => {
        expect(screen.getByText(/九宫飞星盘/i)).toBeInTheDocument();
      });
    });

    it('刷新按钮应该触发回调', async () => {
      const handleRefresh = vi.fn();
      const user = userEvent.setup();

      render(
        <ComprehensiveAnalysisPanel
          analysisResult={mockAnalysisResult}
          isLoading={false}
          onRefresh={handleRefresh}
        />
      );

      const refreshButton = screen.getByRole('button', { name: /刷新/i });
      await user.click(refreshButton);

      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });

    it('导出按钮应该触发回调', async () => {
      const handleExport = vi.fn();
      const user = userEvent.setup();

      render(
        <ComprehensiveAnalysisPanel
          analysisResult={mockAnalysisResult}
          isLoading={false}
          onExport={handleExport}
        />
      );

      const exportButton = screen.getByRole('button', { name: /导出/i });
      await user.click(exportButton);

      expect(handleExport).toHaveBeenCalledTimes(1);
    });
  });

  describe('BasicAnalysisView 与 InteractiveFlyingStarGrid 集成', () => {
    it('应该正确渲染基础分析视图及飞星盘', () => {
      render(<BasicAnalysisView analysisResult={mockAnalysisResult} />);

      // 验证概况卡片
      expect(screen.getByText(/基础分析概况/i)).toBeInTheDocument();
      expect(screen.getByText(/综合评分/i)).toBeInTheDocument();
      expect(screen.getByText(/75分/i)).toBeInTheDocument();

      // 验证飞星盘
      expect(screen.getByText(/九宫飞星盘/i)).toBeInTheDocument();
    });

    it('应该显示宫位详细信息', () => {
      render(<BasicAnalysisView analysisResult={mockAnalysisResult} />);

      // 验证中宫信息
      expect(screen.getByText(/中宫/i)).toBeInTheDocument();
      expect(screen.getByText(/平/i)).toBeInTheDocument();

      // 验证坎宫信息
      expect(screen.getByText(/坎宫/i)).toBeInTheDocument();
      expect(screen.getByText(/大吉/i)).toBeInTheDocument();
    });

    it('飞星盘应该支持交互', async () => {
      const handleCellClick = vi.fn();
      const user = userEvent.setup();

      render(
        <InteractiveFlyingStarGrid
          plate={mockPlate}
          onCellClick={handleCellClick}
        />
      );

      // 查找并点击中宫
      const centerCell = screen.getByText(/中/i).closest('div');
      if (centerCell) {
        await user.click(centerCell);
        expect(handleCellClick).toHaveBeenCalled();
      }
    });

    it('飞星盘悬停应该显示详情', async () => {
      const user = userEvent.setup();

      render(<InteractiveFlyingStarGrid plate={mockPlate} size="lg" />);

      // 悬停在坎宫
      const kanCell = screen.getByText(/坎/i).closest('div');
      if (kanCell) {
        await user.hover(kanCell);

        // 验证详情卡片出现
        await waitFor(() => {
          expect(screen.getByText(/宫位详情/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('数据流测试', () => {
    it('分析结果应该正确传递到子组件', () => {
      render(<BasicAnalysisView analysisResult={mockAnalysisResult} />);

      // 验证评分传递
      expect(screen.getByText(/75分/i)).toBeInTheDocument();

      // 验证特征传递
      expect(screen.getByText(/整体运势中等偏上/i)).toBeInTheDocument();
    });

    it('宫位数据应该正确渲染', () => {
      render(<BasicAnalysisView analysisResult={mockAnalysisResult} />);

      // 验证坎宫评分
      const kanCards = screen.getAllByText(/88分/i);
      expect(kanCards.length).toBeGreaterThan(0);

      // 验证中宫评分
      const zhongCards = screen.getAllByText(/60分/i);
      expect(zhongCards.length).toBeGreaterThan(0);
    });

    it('缺少数据时应该显示友好提示', () => {
      const incompleteResult = {
        ...mockAnalysisResult,
        basicAnalysis: undefined,
      };

      render(<BasicAnalysisView analysisResult={incompleteResult as any} />);

      expect(screen.getByText(/基础分析数据不可用/i)).toBeInTheDocument();
    });
  });

  describe('响应式布局测试', () => {
    it('应该在不同尺寸下正确渲染', () => {
      const { container } = render(
        <BasicAnalysisView analysisResult={mockAnalysisResult} />
      );

      // 验证响应式类名
      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('飞星盘应该支持不同尺寸', () => {
      const sizes = ['sm', 'md', 'lg'] as const;

      sizes.forEach((size) => {
        const { rerender } = render(
          <InteractiveFlyingStarGrid plate={mockPlate} size={size} />
        );

        expect(screen.getByText(/中/i)).toBeInTheDocument();

        rerender(<InteractiveFlyingStarGrid plate={mockPlate} size={size} />);
      });
    });
  });

  describe('性能测试', () => {
    it('大数据量渲染应该保持高效', () => {
      const start = Date.now();

      render(<BasicAnalysisView analysisResult={mockAnalysisResult} />);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // 渲染应该在1秒内完成
    });

    it('重复渲染应该快速', () => {
      const { rerender } = render(
        <BasicAnalysisView analysisResult={mockAnalysisResult} />
      );

      const start = Date.now();

      // 重复渲染10次
      for (let i = 0; i < 10; i++) {
        rerender(<BasicAnalysisView analysisResult={mockAnalysisResult} />);
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // 10次重渲染应该在500ms内
    });
  });

  describe('错误边界测试', () => {
    it('应该处理无效的宫位数据', () => {
      const invalidResult = {
        ...mockAnalysisResult,
        basicAnalysis: {
          ...mockAnalysisResult.basicAnalysis,
          palaceDetails: null as any,
        },
      };

      // 不应该抛出错误
      expect(() => {
        render(<BasicAnalysisView analysisResult={invalidResult} />);
      }).not.toThrow();
    });

    it('应该处理缺失的评分数据', () => {
      const noScoreResult = {
        ...mockAnalysisResult,
        basicAnalysis: {
          ...mockAnalysisResult.basicAnalysis,
          summary: {
            ...mockAnalysisResult.basicAnalysis!.summary,
            overallScore: undefined as any,
          },
        },
      };

      render(<BasicAnalysisView analysisResult={noScoreResult} />);

      // 应该有fallback处理
      expect(screen.getByText(/基础分析概况/i)).toBeInTheDocument();
    });
  });

  describe('可访问性测试', () => {
    it('所有交互元素应该可以键盘访问', () => {
      render(
        <ComprehensiveAnalysisPanel
          analysisResult={mockAnalysisResult}
          isLoading={false}
          onRefresh={vi.fn()}
        />
      );

      // 验证按钮可访问性
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
      });
    });

    it('应该有适当的ARIA标签', () => {
      render(<InteractiveFlyingStarGrid plate={mockPlate} />);

      // 验证可访问性结构
      const grid = screen.getByText(/中/i).closest('[role]');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('状态管理测试', () => {
    it('加载状态切换应该正确', () => {
      const { rerender } = render(
        <ComprehensiveAnalysisPanel analysisResult={null} isLoading={true} />
      );

      expect(screen.getByText(/分析中/i)).toBeInTheDocument();

      rerender(
        <ComprehensiveAnalysisPanel
          analysisResult={mockAnalysisResult}
          isLoading={false}
        />
      );

      expect(screen.queryByText(/分析中/i)).not.toBeInTheDocument();
      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();
    });

    it('数据更新应该触发重新渲染', () => {
      const { rerender } = render(
        <BasicAnalysisView analysisResult={mockAnalysisResult} />
      );

      expect(screen.getByText(/75分/i)).toBeInTheDocument();

      const updatedResult = {
        ...mockAnalysisResult,
        basicAnalysis: {
          ...mockAnalysisResult.basicAnalysis!,
          summary: {
            ...mockAnalysisResult.basicAnalysis!.summary,
            overallScore: 85,
          },
        },
      };

      rerender(<BasicAnalysisView analysisResult={updatedResult} />);

      expect(screen.getByText(/85分/i)).toBeInTheDocument();
    });
  });
});
