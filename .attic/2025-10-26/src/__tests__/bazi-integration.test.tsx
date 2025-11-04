/**
 * 八字前端集成测试
 * 测试UI组件与API的集成
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock API responses
const mockBaziAnalysis = {
  success: true,
  data: {
    bazi: {
      yearPillar: { gan: '甲', zhi: '子' },
      monthPillar: { gan: '丙', zhi: '寅' },
      dayPillar: { gan: '戊', zhi: '辰' },
      hourPillar: { gan: '庚', zhi: '申' },
    },
    wuxing: {
      elements: {
        wood: { count: 3, percentage: 37.5 },
        fire: { count: 2, percentage: 25.0 },
        earth: { count: 2, percentage: 25.0 },
        metal: { count: 1, percentage: 12.5 },
        water: { count: 0, percentage: 0 },
      },
      dayMaster: '戊',
      dayMasterElement: '土',
    },
    yongshen: {
      yongshen: '木',
      xishen: '火',
      jishen: '金',
      choushen: '水',
    },
    pattern: {
      type: '正财格',
      quality: 'good',
      traits: ['财运亨通', '经商有道'],
    },
    shensha: {
      good: ['天德贵人', '月德贵人'],
      bad: ['劫煞'],
      neutral: ['华盖'],
    },
    interpretation: {
      summary: '此命格属于正财格，财运较好...',
      personality: {
        traits: ['稳重', '务实', '有经商头脑'],
        description: '性格稳重，做事踏实...',
      },
      career: {
        suitable: ['商业', '金融', '管理'],
        unsuitable: ['艺术', '创意'],
        advice: '适合从事与财务相关的工作...',
      },
      wealth: {
        level: 'good',
        advice: '财运亨通，但需要稳健投资...',
      },
      relationships: {
        marriage: '婚姻美满，配偶贤良...',
        family: '家庭和睦，子女孝顺...',
      },
      health: {
        attention: ['脾胃', '消化系统'],
        advice: '注意饮食规律，避免暴饮暴食...',
      },
    },
    credits: {
      used: 30,
      balance: 970,
    },
  },
};

// Mock fetch
global.fetch = vi.fn();

describe('八字分析前端集成测试', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('表单输入验证', () => {
    it('应该验证必填字段', async () => {
      const { getByRole, getByText } = render(<BaziAnalysisForm />);

      const submitButton = getByRole('button', { name: /开始分析/i });
      await user.click(submitButton);

      // 检查错误消息
      expect(getByText(/请输入姓名/i)).toBeInTheDocument();
      expect(getByText(/请选择出生日期/i)).toBeInTheDocument();
      expect(getByText(/请选择出生时间/i)).toBeInTheDocument();
    });

    it('应该验证日期范围', async () => {
      const { getByLabelText } = render(<BaziAnalysisForm />);

      const dateInput = getByLabelText(/出生日期/i);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      await user.type(dateInput, futureDate.toISOString().split('T')[0]);

      expect(screen.getByText(/日期不能在未来/i)).toBeInTheDocument();
    });

    it('应该处理农历转换', async () => {
      const { getByLabelText, getByRole } = render(<BaziAnalysisForm />);

      const lunarCheckbox = getByLabelText(/农历/i);
      await user.click(lunarCheckbox);

      const dateInput = getByLabelText(/出生日期/i);
      await user.type(dateInput, '2024-01-01');

      // 验证农历日期显示
      expect(screen.getByText(/癸卯年十一月二十/i)).toBeInTheDocument();
    });
  });

  describe('API调用集成', () => {
    it('应该成功调用API并显示结果', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaziAnalysis,
      });

      const { getByLabelText, getByRole, getByText } = render(
        <BaziAnalysisPage />
      );

      // 填写表单
      await user.type(getByLabelText(/姓名/i), '张三');
      await user.selectOptions(getByLabelText(/性别/i), 'male');
      await user.type(getByLabelText(/出生日期/i), '1990-01-01');
      await user.selectOptions(getByLabelText(/出生时间/i), '08:00');

      // 提交表单
      const submitButton = getByRole('button', { name: /开始分析/i });
      await user.click(submitButton);

      // 验证加载状态
      expect(getByText(/正在分析/i)).toBeInTheDocument();

      // 等待结果显示
      await waitFor(() => {
        expect(getByText(/甲子/i)).toBeInTheDocument();
        expect(getByText(/正财格/i)).toBeInTheDocument();
        expect(getByText(/天德贵人/i)).toBeInTheDocument();
      });

      // 验证API调用参数
      expect(fetch).toHaveBeenCalledWith('/api/bazi/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: '张三',
          gender: 'male',
          date: {
            year: 1990,
            month: 1,
            day: 1,
            hour: 8,
            minute: 0,
            isLunar: false,
          },
        }),
      });
    });

    it('应该处理API错误', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const { getByLabelText, getByRole, getByText } = render(
        <BaziAnalysisPage />
      );

      // 填写并提交表单
      await user.type(getByLabelText(/姓名/i), '李四');
      await user.click(getByRole('button', { name: /开始分析/i }));

      // 等待错误消息
      await waitFor(() => {
        expect(getByText(/分析失败，请稍后重试/i)).toBeInTheDocument();
      });
    });

    it('应该处理积分不足', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: async () => ({
          success: false,
          error: 'INSUFFICIENT_CREDITS',
          message: '积分不足',
        }),
      });

      const { getByRole, getByText } = render(<BaziAnalysisPage />);

      await user.click(getByRole('button', { name: /开始分析/i }));

      await waitFor(() => {
        expect(getByText(/积分不足/i)).toBeInTheDocument();
        expect(getByRole('button', { name: /充值积分/i })).toBeInTheDocument();
      });
    });
  });

  describe('结果展示交互', () => {
    beforeEach(async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaziAnalysis,
      });
    });

    it('应该切换选项卡显示不同内容', async () => {
      const { getByRole, getByText } = render(
        <BaziAnalysisResult result={mockBaziAnalysis.data} />
      );

      // 默认显示基础信息
      expect(getByText(/甲子/i)).toBeInTheDocument();

      // 切换到五行分析
      const wuxingTab = getByRole('tab', { name: /五行分析/i });
      await user.click(wuxingTab);
      expect(getByText(/木.*37.5%/i)).toBeInTheDocument();

      // 切换到性格分析
      const personalityTab = getByRole('tab', { name: /性格分析/i });
      await user.click(personalityTab);
      expect(getByText(/稳重/i)).toBeInTheDocument();
    });

    it('应该展开和折叠详细内容', async () => {
      const { getByRole, queryByText } = render(
        <BaziAnalysisResult result={mockBaziAnalysis.data} />
      );

      // 初始折叠状态
      expect(queryByText(/性格稳重，做事踏实/i)).not.toBeInTheDocument();

      // 展开性格分析
      const expandButton = getByRole('button', { name: /展开性格分析/i });
      await user.click(expandButton);

      // 验证内容显示
      expect(queryByText(/性格稳重，做事踏实/i)).toBeInTheDocument();

      // 再次点击折叠
      await user.click(expandButton);
      expect(queryByText(/性格稳重，做事踏实/i)).not.toBeInTheDocument();
    });

    it('应该复制分析结果', async () => {
      const mockClipboard = {
        writeText: vi.fn(),
      };
      Object.assign(navigator, { clipboard: mockClipboard });

      const { getByRole } = render(
        <BaziAnalysisResult result={mockBaziAnalysis.data} />
      );

      const copyButton = getByRole('button', { name: /复制结果/i });
      await user.click(copyButton);

      expect(mockClipboard.writeText).toHaveBeenCalled();
      expect(screen.getByText(/已复制到剪贴板/i)).toBeInTheDocument();
    });

    it('应该导出PDF报告', async () => {
      const { getByRole } = render(
        <BaziAnalysisResult result={mockBaziAnalysis.data} />
      );

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        blob: async () =>
          new Blob(['PDF content'], { type: 'application/pdf' }),
      });

      const exportButton = getByRole('button', { name: /导出PDF/i });
      await user.click(exportButton);

      // 验证API调用
      expect(fetch).toHaveBeenCalledWith(
        '/api/bazi/export',
        expect.any(Object)
      );

      // 验证下载触发
      await waitFor(() => {
        const link = document.querySelector('a[download]');
        expect(link).toHaveAttribute(
          'download',
          expect.stringContaining('.pdf')
        );
      });
    });
  });

  describe('历史记录功能', () => {
    it('应该保存分析历史', async () => {
      const { getByRole } = render(<BaziAnalysisPage />);

      // 执行分析
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBaziAnalysis,
      });

      await user.click(getByRole('button', { name: /开始分析/i }));

      // 检查历史记录
      const historyButton = getByRole('button', { name: /历史记录/i });
      await user.click(historyButton);

      await waitFor(() => {
        expect(screen.getByText(/张三/i)).toBeInTheDocument();
        expect(screen.getByText(/1990-01-01/i)).toBeInTheDocument();
      });
    });

    it('应该加载历史记录', async () => {
      localStorage.setItem(
        'bazi_history',
        JSON.stringify([
          {
            id: '1',
            name: '王五',
            date: '1985-05-05',
            result: mockBaziAnalysis.data,
          },
        ])
      );

      const { getByRole, getByText } = render(<BaziHistoryList />);

      // 验证历史记录显示
      expect(getByText(/王五/i)).toBeInTheDocument();

      // 点击查看详情
      const viewButton = getByRole('button', { name: /查看详情/i });
      await user.click(viewButton);

      // 验证结果显示
      expect(getByText(/正财格/i)).toBeInTheDocument();
    });

    it('应该删除历史记录', async () => {
      localStorage.setItem(
        'bazi_history',
        JSON.stringify([{ id: '1', name: '赵六', date: '1995-06-06' }])
      );

      const { getByRole, queryByText } = render(<BaziHistoryList />);

      const deleteButton = getByRole('button', { name: /删除/i });
      await user.click(deleteButton);

      // 确认删除
      const confirmButton = getByRole('button', { name: /确认删除/i });
      await user.click(confirmButton);

      // 验证记录已删除
      expect(queryByText(/赵六/i)).not.toBeInTheDocument();
      expect(getByText(/暂无历史记录/i)).toBeInTheDocument();
    });
  });

  describe('响应式布局', () => {
    it('应该在移动端正确显示', () => {
      // 设置移动端视口
      window.innerWidth = 375;
      window.innerHeight = 667;

      const { container } = render(<BaziAnalysisPage />);

      // 验证移动端样式
      const form = container.querySelector('.bazi-form');
      expect(form).toHaveClass('flex-col');

      // 验证导航菜单
      const mobileMenu = container.querySelector('.mobile-menu');
      expect(mobileMenu).toBeInTheDocument();
    });

    it('应该在平板端正确显示', () => {
      window.innerWidth = 768;
      window.innerHeight = 1024;

      const { container } = render(<BaziAnalysisPage />);

      // 验证平板样式
      const layout = container.querySelector('.main-layout');
      expect(layout).toHaveClass('md:flex-row');
    });
  });

  describe('无障碍测试', () => {
    it('应该支持键盘导航', async () => {
      const { getByRole, getByLabelText } = render(<BaziAnalysisForm />);

      // Tab导航
      const nameInput = getByLabelText(/姓名/i);
      const genderSelect = getByLabelText(/性别/i);
      const submitButton = getByRole('button', { name: /开始分析/i });

      nameInput.focus();
      expect(document.activeElement).toBe(nameInput);

      // Tab到下一个元素
      userEvent.tab();
      expect(document.activeElement).toBe(genderSelect);

      // 继续Tab到提交按钮
      userEvent.tab();
      userEvent.tab();
      userEvent.tab();
      expect(document.activeElement).toBe(submitButton);
    });

    it('应该有正确的ARIA标签', () => {
      const { container } = render(
        <BaziAnalysisResult result={mockBaziAnalysis.data} />
      );

      // 验证ARIA属性
      const tabs = container.querySelector('[role="tablist"]');
      expect(tabs).toBeInTheDocument();

      const tabPanels = container.querySelectorAll('[role="tabpanel"]');
      expect(tabPanels.length).toBeGreaterThan(0);

      // 验证标签关联
      const form = container.querySelector('form');
      const labels = form?.querySelectorAll('label[for]');
      labels?.forEach((label) => {
        const forId = label.getAttribute('for');
        const input = container.querySelector(`#${forId}`);
        expect(input).toBeInTheDocument();
      });
    });
  });
});

// Mock组件（实际应该导入真实组件）
function BaziAnalysisForm() {
  return <div>Form Component</div>;
}

function BaziAnalysisPage() {
  return <div>Page Component</div>;
}

function BaziAnalysisResult({ result }: any) {
  return <div>Result Component</div>;
}

function BaziHistoryList() {
  return <div>History Component</div>;
}
