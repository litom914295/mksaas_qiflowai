/**
 * 八字报告生成器辅助方法
 */

import type { ChartData, LuckPillarAnalysis } from './types';

export class BaziReportHelpers {
  // 生成四柱HTML显示
  static generatePillarsHtml(pillars: any): string {
    if (!pillars) return '<p>四柱信息暂不可用</p>';

    return `
      <div class="pillars-grid">
        <div class="pillar-item">
          <div class="pillar-label">年柱（根基）</div>
          <div class="pillar-value">${pillars.year?.chinese || '未知'}</div>
          <div class="pillar-meaning">家庭背景、祖辈影响</div>
        </div>
        <div class="pillar-item">
          <div class="pillar-label">月柱（性格）</div>
          <div class="pillar-value">${pillars.month?.chinese || '未知'}</div>
          <div class="pillar-meaning">性格特质、人生态度</div>
        </div>
        <div class="pillar-item">
          <div class="pillar-label">日柱（核心）</div>
          <div class="pillar-value">${pillars.day?.chinese || '未知'}</div>
          <div class="pillar-meaning">个人本质、核心特征</div>
        </div>
        <div class="pillar-item">
          <div class="pillar-label">时柱（发展）</div>
          <div class="pillar-value">${pillars.hour?.chinese || '未知'}</div>
          <div class="pillar-meaning">未来潜能、发展方向</div>
        </div>
      </div>
    `;
  }

  // 生成五行图表数据
  static generateElementsChart(baziAnalysis: any): ChartData {
    const elements = baziAnalysis.fiveElements || baziAnalysis.elements || {};

    return {
      type: 'pie',
      title: '五行能量分布',
      data: {
        木: elements.wood || 0,
        火: elements.fire || 0,
        土: elements.earth || 0,
        金: elements.metal || 0,
        水: elements.water || 0,
      },
      colors: ['#4ade80', '#f87171', '#fbbf24', '#94a3b8', '#60a5fa'],
    };
  }

  // 渲染五行图表
  static renderElementsChart(chartData: ChartData): string {
    const total = Object.values(chartData.data).reduce(
      (sum, val) => sum + val,
      0
    );
    if (total === 0) return '<p>五行数据暂不可用</p>';

    return `
      <div class="elements-chart-container">
        <div class="chart-legend">
          ${Object.entries(chartData.data)
            .map(([element, count], index) => {
              const percentage = ((count / total) * 100).toFixed(1);
              const color = chartData.colors?.[index] || '#gray';
              return `
              <div class="legend-item">
                <span class="legend-color" style="background-color: ${color}"></span>
                <span class="legend-label">${element}（${count}个，${percentage}%）</span>
              </div>
            `;
            })
            .join('')}
        </div>
      </div>
    `;
  }

  // 生成五行分析文字
  static generateElementsAnalysis(baziAnalysis: any): string {
    const favorableElements = baziAnalysis.favorableElements?.primary || [];
    const unfavorableElements =
      baziAnalysis.favorableElements?.unfavorable || [];

    return `
      <div class="elements-analysis">
        <div class="favorable-elements">
          <h4>✅ 有利元素</h4>
          <p>${favorableElements.map((el: string) => BaziReportHelpers.getElementName(el)).join('、')} - 建议多接触相关的颜色、方向和行业</p>
        </div>
        <div class="unfavorable-elements">
          <h4>⚠️ 需要平衡的元素</h4>
          <p>${unfavorableElements.map((el: string) => BaziReportHelpers.getElementName(el)).join('、')} - 建议适度减少相关元素的影响</p>
        </div>
      </div>
    `;
  }

  // 获取五行中文名称
  static getElementName(element: string): string {
    const names: Record<string, string> = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    return names[element] || element;
  }

  // 提取性格特质分析
  static extractPersonalityTraits(
    baziAnalysis: any,
    luckPillarsAnalysis: LuckPillarAnalysis[],
    birthDate: string
  ): {
    type: string;
    strengths: Array<{
      name: string;
      description: string;
      context: string;
      example: string;
    }>;
    challenges: Array<{ name: string; solution: string }>;
    recommendations: string[];
  } {
    const currentLuck = BaziReportHelpers.getCurrentLuckPillar(
      luckPillarsAnalysis,
      birthDate
    );
    const personalityImpacts =
      currentLuck?.tenGodRelation?.personalityImpact || [];

    return {
      type: '综合发展型',
      strengths: [
        {
          name: '适应能力强',
          description: '能够在不同环境中快速调整自己',
          context: '工作环境变化',
          example: '能够快速融入新团队，承担不同类型的工作任务',
        },
        {
          name: '学习能力突出',
          description: '对新知识和技能有强烈的好奇心',
          context: '技能提升',
          example: '主动学习新技术，不断提升专业水平',
        },
      ],
      challenges: [
        {
          name: '容易分散注意力',
          solution: '建立明确的优先级系统和时间管理方法',
        },
        {
          name: '决策时犹豫不决',
          solution: '制定决策框架，设定决策时间限制',
        },
      ],
      recommendations: personalityImpacts.slice(0, 3),
    };
  }

  // 获取当前大运
  static getCurrentLuckPillar(
    luckPillarsAnalysis: LuckPillarAnalysis[],
    birthDate: string
  ): LuckPillarAnalysis | undefined {
    const currentYear = new Date().getFullYear();
    const currentAge = currentYear - Number.parseInt(birthDate.split('-')[0]);

    return luckPillarsAnalysis.find(
      (lp) => currentAge >= lp.pillar.startAge && currentAge <= lp.pillar.endAge
    );
  }

  // 提取事业分析
  static extractCareerAnalysis(
    luckPillarsAnalysis: LuckPillarAnalysis[],
    birthDate: string
  ): {
    preferredIndustries: Array<{
      name: string;
      reason: string;
      rating: number;
      timing: string;
    }>;
    strategy: { strengths: string; improvements: string; partners: string };
    recommendations: string[];
  } {
    const currentLuck = BaziReportHelpers.getCurrentLuckPillar(
      luckPillarsAnalysis,
      birthDate
    );
    const careerImpacts = currentLuck?.tenGodRelation?.careerImpact || [];

    return {
      preferredIndustries: [
        {
          name: '科技创新',
          reason: '逻辑思维能力和学习能力',
          rating: 4,
          timing: '当前大运期间',
        },
        {
          name: '教育培训',
          reason: '沟通能力和耐心细致',
          rating: 4,
          timing: '长期适合发展',
        },
      ],
      strategy: {
        strengths: '发挥学习能力强的优势，不断提升专业技能',
        improvements: '加强决策能力和团队管理经验',
        partners: '执行力强、决断力强',
      },
      recommendations: careerImpacts.slice(0, 3),
    };
  }

  // 提取财运分析
  static extractWealthAnalysis(
    luckPillarsAnalysis: LuckPillarAnalysis[],
    birthDate: string
  ): {
    pattern: { type: string; characteristics: string };
    opportunities: Array<{
      period: string;
      description: string;
      probability: string;
    }>;
    advice: string[];
    recommendations: string[];
  } {
    const currentLuck = BaziReportHelpers.getCurrentLuckPillar(
      luckPillarsAnalysis,
      birthDate
    );
    const wealthImpacts = currentLuck?.tenGodRelation?.wealthImpact || [];

    return {
      pattern: {
        type: '稳步上升型',
        characteristics: '财运整体呈现稳步上升趋势，适合长期投资和技能变现',
      },
      opportunities: [
        {
          period: '近期3-6个月',
          description: '技能提升带来的收入增长机会',
          probability: '中等',
        },
        {
          period: '下个大运期间',
          description: '事业发展带来的财富积累',
          probability: '较高',
        },
      ],
      advice: [
        '建议将收入的20%用于技能提升和学习投资',
        '可以考虑稳健的理财产品，避免高风险投机',
        '注重建立多元化的收入来源',
      ],
      recommendations: wealthImpacts.slice(0, 3),
    };
  }

  // 获取运势影响描述
  static getInfluenceDescription(influence: string): string {
    const descriptions: Record<string, string> = {
      positive: '吉利',
      negative: '需注意',
      neutral: '平和',
    };
    return descriptions[influence] || '平和';
  }

  // 生成行动指南
  static generateActionPlan(): {
    phases: Array<{
      title: string;
      tasks: Array<{ id: string; description: string; tip?: string }>;
    }>;
    longTermReminders: Array<{ period: string; description: string }>;
    keyRecommendations: string[];
  } {
    return {
      phases: [
        {
          title: '【第1周：认知觉醒】',
          tasks: [
            {
              id: 'observe-behavior',
              description: '每日观察自己的决策模式和行为习惯',
              tip: '可以用手机备忘录记录每天的重要决策和想法',
            },
            {
              id: 'element-awareness',
              description: '留意生活中五行元素的分布和影响',
              tip: '注意工作和生活环境中的颜色、材质搭配',
            },
          ],
        },
        {
          title: '【第2-3周：习惯建立】',
          tasks: [
            {
              id: 'strength-application',
              description: '在工作中主动运用个人优势特质',
              tip: '找机会展现学习能力和适应能力',
            },
            {
              id: 'timing-awareness',
              description: '避免在个人低能量时段做重要决策',
            },
          ],
        },
        {
          title: '【第4周：效果验证】',
          tasks: [
            {
              id: 'progress-review',
              description: '评估改变带来的积极影响',
              tip: '可以请信任的朋友给出反馈',
            },
            {
              id: 'plan-adjustment',
              description: '根据实际效果调整行动方案',
            },
          ],
        },
      ],
      longTermReminders: [
        {
          period: '3个月后',
          description: '重新评估当前大运的影响，调整发展策略',
        },
        {
          period: '下个大运开始前',
          description: '提前准备新阶段的发展规划',
        },
      ],
      keyRecommendations: [
        '保持学习的热情，不断提升专业技能',
        '建立稳定的决策框架，提高执行效率',
        '注重人际关系的建设和维护',
      ],
    };
  }
}
