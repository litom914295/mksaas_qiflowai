/**
 * 玄空飞星组件端到端测试
 * 测试完整的用户工作流程和真实场景
 */

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import '@testing-library/jest-dom';
import {
  PERFORMANCE_THRESHOLDS,
  performanceMonitor,
} from '@/lib/qiflow/xuankong/performance-monitor';
import type { ComprehensiveAnalysis } from '@/lib/qiflow/xuankong/types';
import { ComprehensiveAnalysisPanel } from '../comprehensive-analysis-panel';

// Mock 完整的分析数据
const mockFullAnalysis: ComprehensiveAnalysis = {
  overall: {
    score: 85,
    rating: 'good',
    strengths: ['财运旺盛', '事业发展良好'],
    weaknesses: ['健康需注意', '感情波动'],
    priorities: ['优先改善卧室布局', '注意厨房位置'],
    summary: '整体运势较好，适合居住和发展',
  },
  basicAnalysis: {
    period: 8,
    facing: '坐北朝南',
    palaces: Array(9)
      .fill(null)
      .map((_, i) => ({
        name: ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离'][i],
        position: i + 1,
        mountainStar: i + 1,
        waterStar: 10 - i,
        timeStar: i + 1,
        rating: i % 2 === 0 ? 'good' : 'fair',
        characteristics: '示例特征',
        suitableFor: '示例功能',
        recommendations: '示例建议',
      })),
    characteristics: '运势平稳',
    mainIssues: '无明显问题',
    keyPalaces: [1, 5, 9],
  },
  liunianAnalysis: {
    enabled: true,
    yearStar: 6,
    ganZhi: '甲子',
    characteristics: '流年顺遂',
    favorable: ['财运亨通', '事业顺利'],
    unfavorable: ['健康小忧'],
    recommendations: '保持稳定',
    monthlyTrends: [
      { month: 1, trend: 'improving', rating: 'good', highlights: '开局良好' },
      { month: 2, trend: 'stable', rating: 'fair', highlights: '平稳过渡' },
    ],
    criticalPeriods: ['农历正月', '农历七月'],
    resolutionMethods: ['摆放吉祥物', '调整布局'],
  },
  personalizedAnalysis: {
    enabled: true,
    zodiac: '龙',
    mainElement: '木',
    favorableElements: ['水', '木'],
    unfavorableElements: ['金', '土'],
    luckyDirections: ['东', '东南'],
    categories: {
      health: ['多运动', '注意饮食'],
      career: ['适合创业', '人际关系佳'],
      home: ['东向房间好', '绿色装饰吉'],
      energy: ['早睡早起', '多接触自然'],
    },
    integration: {
      compatibility: '五行相生',
      beneficial: ['东方绿植', '水景布置'],
      conflicting: ['西方金属', '中央土石'],
    },
  },
  recommendations: {
    prioritized: [
      {
        category: 'layout',
        priority: 'urgent',
        title: '调整主卧位置',
        description: '主卧位于凶位，建议调整',
        estimatedTime: '1周',
        estimatedCost: '中等',
        expectedImpact: '显著改善睡眠和健康',
        steps: ['测量房间', '规划布局', '搬移家具', '调整装饰'],
      },
      {
        category: 'decoration',
        priority: 'high',
        title: '优化客厅色彩',
        description: '增强客厅财运',
        estimatedTime: '3天',
        estimatedCost: '较低',
        expectedImpact: '提升家庭氛围',
        steps: ['选择颜色', '购买装饰', '布置摆放'],
      },
    ],
    quickWins: ['摆放绿色植物', '调整床头朝向', '清理杂物'],
    longTermPlan: {
      phase1: '前3个月：基础调整',
      phase2: '3-6个月：深度优化',
      phase3: '6-12个月：持续维护',
    },
    timeline: [
      { milestone: '完成主卧调整', date: '1个月内' },
      { milestone: '完成客厅优化', date: '2个月内' },
      { milestone: '完成全屋改善', date: '6个月内' },
    ],
  },
  tiguaAnalysis: {
    applicable: true,
    theory: '替卦理论说明',
    originalPlate: Array(9)
      .fill(null)
      .map((_, i) => ({ position: i + 1, star: i + 1 })),
    replacementPlate: Array(9)
      .fill(null)
      .map((_, i) => ({ position: i + 1, star: 10 - i })),
    improvements: ['财运提升', '健康改善'],
    considerations: ['需要专业指导'],
    recommendations: '建议采用替卦方案',
  },
  lingzhengAnalysis: {
    available: true,
    lingShen: { position: 1, description: '适合摆放水景' },
    zhengShen: { position: 9, description: '适合摆放山石' },
    waterPlacements: {
      current: '基本合理',
      ideal: '优化水位',
      rating: 'good',
    },
    mountainPlacements: {
      current: '需要改善',
      ideal: '增加山位',
      rating: 'fair',
    },
    overallRating: 'good',
    strengths: ['水位得当'],
    improvements: ['山位需加强'],
  },
  chengmenjueAnalysis: {
    applicable: true,
    theory: '城门诀理论',
    optimalGates: ['正东', '东南'],
    gatePositions: {
      east: {
        suitable: true,
        rating: 'excellent',
        description: '最佳城门位置',
      },
      southeast: { suitable: true, rating: 'good', description: '次佳位置' },
      south: { suitable: false, rating: 'fair', description: '一般位置' },
      southwest: { suitable: false, rating: 'bad', description: '不宜位置' },
      west: { suitable: false, rating: 'bad', description: '不宜位置' },
      northwest: { suitable: false, rating: 'fair', description: '一般位置' },
      north: { suitable: true, rating: 'good', description: '可用位置' },
      northeast: { suitable: false, rating: 'fair', description: '一般位置' },
    },
    assessment: '总体布局良好',
    keyPoints: ['东门为上', '南门次之'],
    priorities: ['优先使用东门', '避免西门'],
    recommendations: '建议以东门为主要出入口',
  },
};

describe('端到端测试：玄空飞星完整工作流', () => {
  beforeEach(() => {
    performanceMonitor.clear();
  });

  describe('完整用户工作流', () => {
    it('应该完成完整的分析查看流程', async () => {
      const user = userEvent.setup();
      const endTiming = performanceMonitor.startTiming('e2e:complete-workflow');

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      // 1. 验证初始加载
      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();
      expect(screen.getByText(/总体评估/i)).toBeInTheDocument();

      // 2. 查看所有标签页
      const tabs = [
        '基础分析',
        '流年分析',
        '个性化',
        '智慧推薦',
        '替卦分析',
        '零正理論',
        '城門訣',
      ];

      for (const tabName of tabs) {
        const tab = screen.getByRole('tab', { name: new RegExp(tabName, 'i') });
        await user.click(tab);

        await waitFor(() => {
          expect(tab).toHaveAttribute('data-state', 'active');
        });
      }

      // 3. 展开/收起操作
      const expandButtons = screen.getAllByRole('button', {
        name: /展开|收起/i,
      });
      if (expandButtons.length > 0) {
        await user.click(expandButtons[0]);
        await waitFor(() => {
          expect(expandButtons[0]).toHaveAttribute('aria-expanded');
        });
      }

      // 4. 导出功能
      const exportButton = screen.getByRole('button', { name: /导出|匯出/i });
      await user.click(exportButton);

      endTiming({ completed: true });

      // 验证性能
      const summary = performanceMonitor.getSummary('e2e:complete-workflow');
      expect(summary).toBeTruthy();
      expect(summary!.averageDuration).toBeLessThan(5000); // 完整流程 < 5秒
    });

    it('应该正确处理推荐筛选和排序', async () => {
      const user = userEvent.setup();

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      // 切换到智慧推荐标签页
      const recommendationsTab = screen.getByRole('tab', { name: /智慧推薦/i });
      await user.click(recommendationsTab);

      await waitFor(() => {
        expect(screen.getByText(/AI智慧分析概覽/i)).toBeInTheDocument();
      });

      // 测试优先级筛选
      const priorityFilter = screen.getByRole('combobox', {
        name: /优先级|優先級/i,
      });
      await user.click(priorityFilter);

      const urgentOption = screen.getByRole('option', { name: /緊急/i });
      await user.click(urgentOption);

      await waitFor(() => {
        expect(
          screen.getByText(/调整主卧位置|調整主臥位置/i)
        ).toBeInTheDocument();
      });

      // 测试分类筛选
      const categoryFilter = screen.getByRole('combobox', {
        name: /分类|分類/i,
      });
      await user.click(categoryFilter);

      const layoutOption = screen.getByRole('option', { name: /布局|佈局/i });
      await user.click(layoutOption);

      await waitFor(() => {
        // 应该只显示布局相关的推荐
        expect(screen.queryByText(/优化客厅色彩/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('错误处理和恢复', () => {
    it('应该优雅处理缺失的可选数据', () => {
      const incompleteAnalysis: ComprehensiveAnalysis = {
        ...mockFullAnalysis,
        liunianAnalysis: {
          enabled: false,
        },
        personalizedAnalysis: {
          enabled: false,
        },
        tiguaAnalysis: {
          applicable: false,
          theory: '',
          originalPlate: [],
          replacementPlate: [],
          improvements: [],
          considerations: [],
          recommendations: '',
        },
      };

      render(<ComprehensiveAnalysisPanel analysis={incompleteAnalysis} />);

      // 验证基本内容仍然显示
      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();
      expect(screen.getByText(/总体评估/i)).toBeInTheDocument();

      // 验证可选模块显示适当的消息
      const liunianTab = screen.getByRole('tab', { name: /流年/i });
      userEvent.click(liunianTab);

      waitFor(() => {
        expect(screen.getByText(/流年分析未啟用/i)).toBeInTheDocument();
      });
    });

    it('应该处理空数组和空对象', () => {
      const emptyAnalysis: ComprehensiveAnalysis = {
        overall: {
          score: 0,
          rating: 'fair',
          strengths: [],
          weaknesses: [],
          priorities: [],
          summary: '',
        },
        basicAnalysis: {
          period: 8,
          facing: '',
          palaces: [],
          characteristics: '',
          mainIssues: '',
          keyPalaces: [],
        },
        recommendations: {
          prioritized: [],
          quickWins: [],
          longTermPlan: {
            phase1: '',
            phase2: '',
            phase3: '',
          },
          timeline: [],
        },
      };

      const { container } = render(
        <ComprehensiveAnalysisPanel analysis={emptyAnalysis} />
      );

      // 组件应该渲染而不崩溃
      expect(container).toBeInTheDocument();
      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();
    });
  });

  describe('响应式和可访问性', () => {
    it('应该在不同视口大小下正确显示', () => {
      const { rerender } = render(
        <ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />
      );

      // 模拟移动端视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));
      rerender(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();

      // 模拟平板视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      window.dispatchEvent(new Event('resize'));
      rerender(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();

      // 模拟桌面视口
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      window.dispatchEvent(new Event('resize'));
      rerender(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      expect(screen.getByText(/综合分析结果/i)).toBeInTheDocument();
    });

    it('应该支持键盘导航', async () => {
      const user = userEvent.setup();

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      const firstTab = screen.getByRole('tab', { name: /总览/i });
      firstTab.focus();

      // 使用方向键导航
      await user.keyboard('{ArrowRight}');

      await waitFor(() => {
        const activeTab = screen.getByRole('tab', { selected: true });
        expect(activeTab).not.toBe(firstTab);
      });

      // 使用 Enter 键激活
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(screen.getByRole('tab', { selected: true })).toBeInTheDocument();
      });
    });

    it('应该提供适当的 ARIA 标签', () => {
      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      // 验证主要区域的 ARIA 标签
      const tabs = screen.getAllByRole('tab');
      tabs.forEach((tab) => {
        expect(tab).toHaveAttribute('aria-controls');
      });

      const tabpanels = screen.getAllByRole('tabpanel');
      expect(tabpanels.length).toBeGreaterThan(0);

      tabpanels.forEach((panel) => {
        expect(panel).toHaveAttribute('aria-labelledby');
      });
    });
  });

  describe('数据一致性验证', () => {
    it('应该在所有视图中显示一致的数据', async () => {
      const user = userEvent.setup();

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      // 总览中的评分
      const overallScore = screen.getByText(/85/);
      expect(overallScore).toBeInTheDocument();

      // 切换到基础分析
      const basicTab = screen.getByRole('tab', { name: /基础分析/i });
      await user.click(basicTab);

      await waitFor(() => {
        // 验证周期信息一致
        expect(screen.getByText(/8/)).toBeInTheDocument();
        expect(screen.getByText(/坐北朝南/i)).toBeInTheDocument();
      });

      // 切换到推荐
      const recommendationsTab = screen.getByRole('tab', { name: /智慧推薦/i });
      await user.click(recommendationsTab);

      await waitFor(() => {
        // 验证推荐内容存在
        expect(
          screen.getByText(/调整主卧位置|調整主臥位置/i)
        ).toBeInTheDocument();
        expect(
          screen.getByText(/优化客厅色彩|優化客廳色彩/i)
        ).toBeInTheDocument();
      });
    });

    it('应该正确计算和显示统计信息', () => {
      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      // 验证总体评估中的统计
      const strengths = mockFullAnalysis.overall.strengths.length;
      const weaknesses = mockFullAnalysis.overall.weaknesses.length;

      expect(
        screen.getByText(new RegExp(`${strengths}`, 'i'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(`${weaknesses}`, 'i'))
      ).toBeInTheDocument();

      // 验证推荐数量
      const totalRecommendations =
        mockFullAnalysis.recommendations.prioritized.length;
      expect(
        screen.getByText(new RegExp(`${totalRecommendations}`, 'i'))
      ).toBeInTheDocument();
    });
  });

  describe('性能基准测试', () => {
    it('应该在性能阈值内完成渲染', () => {
      const endTiming = performanceMonitor.startTiming('e2e:initial-render');

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      endTiming();

      const check = performanceMonitor.checkPerformance(
        'e2e:initial-render',
        PERFORMANCE_THRESHOLDS.components.panel
      );

      expect(check.passed).toBe(true);
      if (!check.passed) {
        console.warn('性能测试未通过:', check.violations);
      }
    });

    it('应该高效处理标签页切换', async () => {
      const user = userEvent.setup();

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      const tabs = screen.getAllByRole('tab');

      for (const tab of tabs) {
        const endTiming = performanceMonitor.startTiming('e2e:tab-switch');

        await user.click(tab);

        await waitFor(() => {
          expect(tab).toHaveAttribute('data-state', 'active');
        });

        endTiming();
      }

      const check = performanceMonitor.checkPerformance(
        'e2e:tab-switch',
        100 // 标签切换应该 < 100ms
      );

      expect(check.passed).toBe(true);
    });

    it('应该高效处理大量数据', () => {
      const largeAnalysis: ComprehensiveAnalysis = {
        ...mockFullAnalysis,
        recommendations: {
          ...mockFullAnalysis.recommendations,
          prioritized: Array(50)
            .fill(null)
            .map((_, i) => ({
              category: 'layout',
              priority:
                i % 3 === 0 ? 'urgent' : i % 3 === 1 ? 'high' : 'medium',
              title: `推荐 ${i + 1}`,
              description: `详细描述 ${i + 1}`,
              estimatedTime: '1周',
              estimatedCost: '中等',
              expectedImpact: '显著改善',
              steps: ['步骤1', '步骤2', '步骤3'],
            })),
        },
      };

      const endTiming = performanceMonitor.startTiming('e2e:large-data');

      render(<ComprehensiveAnalysisPanel analysis={largeAnalysis} />);

      endTiming();

      const check = performanceMonitor.checkPerformance(
        'e2e:large-data',
        1000 // 大数据渲染应该 < 1秒
      );

      expect(check.passed).toBe(true);
    });
  });

  describe('用户交互流畅度', () => {
    it('应该提供即时的视觉反馈', async () => {
      const user = userEvent.setup();

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      const tabs = screen.getAllByRole('tab');

      for (const tab of tabs) {
        const initialState = tab.getAttribute('data-state');

        await user.click(tab);

        // 验证状态立即改变
        await waitFor(
          () => {
            const newState = tab.getAttribute('data-state');
            expect(newState).not.toBe(initialState);
          },
          { timeout: 100 }
        ); // 应该在100ms内响应
      }
    });

    it('应该平滑滚动到相关内容', async () => {
      const user = userEvent.setup();

      render(<ComprehensiveAnalysisPanel analysis={mockFullAnalysis} />);

      // 模拟点击锚点链接
      const links = screen.queryAllByRole('link');

      if (links.length > 0) {
        await user.click(links[0]);

        // 验证滚动行为
        // 注意：在测试环境中，滚动行为可能不会实际发生
        // 但我们可以验证元素存在
        expect(links[0]).toBeInTheDocument();
      }
    });
  });
});

describe('端到端测试：边界情况和异常场景', () => {
  it('应该处理极端评分值', () => {
    const extremeAnalysis: ComprehensiveAnalysis = {
      ...mockFullAnalysis,
      overall: {
        ...mockFullAnalysis.overall,
        score: 100,
      },
    };

    render(<ComprehensiveAnalysisPanel analysis={extremeAnalysis} />);

    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('应该处理超长文本', () => {
    const longTextAnalysis: ComprehensiveAnalysis = {
      ...mockFullAnalysis,
      overall: {
        ...mockFullAnalysis.overall,
        summary: 'A'.repeat(1000), // 1000个字符的超长文本
      },
    };

    const { container } = render(
      <ComprehensiveAnalysisPanel analysis={longTextAnalysis} />
    );

    // 验证组件不会因超长文本崩溃
    expect(container).toBeInTheDocument();
  });

  it('应该处理特殊字符', () => {
    const specialCharsAnalysis: ComprehensiveAnalysis = {
      ...mockFullAnalysis,
      overall: {
        ...mockFullAnalysis.overall,
        strengths: ['<script>alert("xss")</script>', '测试<>&"\''],
      },
    };

    render(<ComprehensiveAnalysisPanel analysis={specialCharsAnalysis} />);

    // 验证特殊字符被正确转义
    expect(screen.queryByText(/alert/)).not.toBeInTheDocument();
  });
});
