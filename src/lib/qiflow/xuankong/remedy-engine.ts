// 风水化解引擎 - 简化版本

import type { Issue, Recommendation } from './diagnostic-engine';

export interface RemedyInput {
  issues: Issue[];
  budget?: 'low' | 'medium' | 'high' | 'unlimited';
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  preferences?: {
    allowFurnitureMove?: boolean;
    allowDecoration?: boolean;
    allowColorChange?: boolean;
    preferTraditional?: boolean;
  };
}

export interface RemedyPlan {
  immediate: Recommendation[];
  shortTerm: Recommendation[];
  longTerm: Recommendation[];
  emergency: Recommendation[];
  effectiveness: number; // 0-100
  totalCost: 'free' | 'low' | 'medium' | 'high';
}

export interface RemedyItem {
  name: string;
  type: 'placement' | 'color' | 'element' | 'symbol' | 'crystal' | 'plant';
  position: string;
  description: string;
  cost: 'free' | 'low' | 'medium' | 'high';
  effectiveness: number;
  instructions: string[];
  alternatives?: string[];
}

// 导出生成化解方案函数
export function generateRemedyPlans(input: RemedyInput): RemedyPlan {
  return RemedyEngine.generateRemedyPlan(input);
}

export class RemedyEngine {
  private static readonly REMEDY_DATABASE: Record<string, RemedyItem[]> = {
    五黄煞: [
      {
        name: '六帝钱',
        type: 'symbol',
        position: '煞气方位',
        description: '传统化解五黄煞的最佳工具',
        cost: 'low',
        effectiveness: 90,
        instructions: [
          '选择真正的清朝六帝钱',
          '用红绳串连',
          '悬挂或放置在五黄方位',
          '定期清洁和净化',
        ],
        alternatives: ['铜钱', '金属风铃', '铜葫芦'],
      },
      {
        name: '金属饰品',
        type: 'element',
        position: '煞气方位',
        description: '金属属性化解土煞',
        cost: 'medium',
        effectiveness: 75,
        instructions: [
          '选择纯铜或不锈钢制品',
          '放置在五黄飞临的方位',
          '保持金属表面光洁',
          '定期擦拭维护',
        ],
        alternatives: ['铜钟', '金属摆件', '钢制装饰'],
      },
    ],
    三碧煞: [
      {
        name: '红色装饰',
        type: 'color',
        position: '三碧方位',
        description: '火克木，化解三碧木煞',
        cost: 'low',
        effectiveness: 70,
        instructions: [
          '在三碧方位增加红色元素',
          '可以是窗帘、抱枕、装饰画',
          '避免过度使用，适量即可',
          '定期更换保持新鲜感',
        ],
        alternatives: ['紫色装饰', '粉色点缀', '暖色灯光'],
      },
    ],
    二五交加: [
      {
        name: '铜葫芦',
        type: 'symbol',
        position: '病星方位',
        description: '专门化解疾病煞气',
        cost: 'low',
        effectiveness: 85,
        instructions: [
          '选择开口的铜葫芦',
          '放置在病星飞临方位',
          '葫芦口朝向煞气来源',
          '每月清洁一次',
        ],
        alternatives: ['天然葫芦', '水晶葫芦', '木制葫芦'],
      },
    ],
  };

  static generateRemedyPlan(input: RemedyInput): RemedyPlan {
    const {
      issues,
      budget = 'medium',
      urgency = 'medium',
      preferences = {},
    } = input;

    const immediate: Recommendation[] = [];
    const shortTerm: Recommendation[] = [];
    const longTerm: Recommendation[] = [];
    const emergency: Recommendation[] = [];

    let totalEffectiveness = 0;
    let maxCostLevel = 0;

    issues.forEach((issue) => {
      const remedies = RemedyEngine.getRemediesForIssue(
        issue,
        budget,
        preferences
      );

      remedies.forEach((remedy) => {
        const recommendation: Recommendation = {
          type: remedy.type as any,
          priority: RemedyEngine.mapSeverityToPriority(issue.severity),
          position: remedy.position,
          action: remedy.name,
          explanation: remedy.description,
          cost: remedy.cost,
        };

        // 根据严重程度和紧急性分类
        if (issue.severity === 'critical' || urgency === 'critical') {
          emergency.push(recommendation);
        } else if (issue.severity === 'high' || remedy.cost === 'free') {
          immediate.push(recommendation);
        } else if (remedy.cost === 'low' || remedy.cost === 'medium') {
          shortTerm.push(recommendation);
        } else {
          longTerm.push(recommendation);
        }

        totalEffectiveness += remedy.effectiveness;
        maxCostLevel = Math.max(
          maxCostLevel,
          RemedyEngine.costToNumber(remedy.cost)
        );
      });
    });

    return {
      immediate,
      shortTerm,
      longTerm,
      emergency,
      effectiveness: Math.min(100, totalEffectiveness / issues.length),
      totalCost: RemedyEngine.numberToCost(maxCostLevel),
    };
  }

  private static getRemediesForIssue(
    issue: Issue,
    budget: string,
    preferences: any
  ): RemedyItem[] {
    const remedies: RemedyItem[] = [];

    // 根据问题类型查找对应的化解方法
    if (issue.description.includes('五黄')) {
      remedies.push(...(RemedyEngine.REMEDY_DATABASE.五黄煞 || []));
    }
    if (issue.description.includes('三碧')) {
      remedies.push(...(RemedyEngine.REMEDY_DATABASE.三碧煞 || []));
    }
    if (
      issue.description.includes('二五') ||
      issue.description.includes('疾病')
    ) {
      remedies.push(...(RemedyEngine.REMEDY_DATABASE.二五交加 || []));
    }

    // 根据预算筛选
    const budgetLevel = RemedyEngine.costToNumber(budget as any);
    const filteredRemedies = remedies.filter(
      (remedy) => RemedyEngine.costToNumber(remedy.cost) <= budgetLevel
    );

    // 根据偏好筛选
    return filteredRemedies.filter((remedy) => {
      if (!preferences.allowDecoration && remedy.type === 'color') return false;
      if (!preferences.allowFurnitureMove && remedy.type === 'placement')
        return false;
      return true;
    });
  }

  private static mapSeverityToPriority(
    severity: Issue['severity']
  ): Recommendation['priority'] {
    switch (severity) {
      case 'critical':
        return 'high';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'medium';
    }
  }

  private static costToNumber(cost: RemedyItem['cost']): number {
    switch (cost) {
      case 'free':
        return 0;
      case 'low':
        return 1;
      case 'medium':
        return 2;
      case 'high':
        return 3;
      default:
        return 1;
    }
  }

  private static numberToCost(num: number): RemedyPlan['totalCost'] {
    switch (num) {
      case 0:
        return 'free';
      case 1:
        return 'low';
      case 2:
        return 'medium';
      case 3:
        return 'high';
      default:
        return 'medium';
    }
  }

  static generateRemedyReport(plan: RemedyPlan): string {
    const {
      immediate,
      shortTerm,
      longTerm,
      emergency,
      effectiveness,
      totalCost,
    } = plan;

    return `
风水化解方案
============

总体效果预期: ${effectiveness}%
预计总成本: ${totalCost}

紧急处理 (立即执行):
${emergency.map((r) => `• ${r.position}: ${r.action}\n  ${r.explanation}`).join('\n\n')}

立即改善 (本周内):
${immediate.map((r) => `• ${r.position}: ${r.action}\n  ${r.explanation}`).join('\n\n')}

短期规划 (本月内):
${shortTerm.map((r) => `• ${r.position}: ${r.action}\n  ${r.explanation}`).join('\n\n')}

长期规划 (3个月内):
${longTerm.map((r) => `• ${r.position}: ${r.action}\n  ${r.explanation}`).join('\n\n')}

实施提醒:
1. 按照优先级顺序执行
2. 观察改善效果后再进行下一步
3. 如有不适应立即停止并咨询专业人士
4. 定期维护化解物品的清洁和完整

注：化解效果因人因地而异，请理性对待。
`;
  }

  static getAlternativeRemedies(issueType: string): RemedyItem[] {
    return RemedyEngine.REMEDY_DATABASE[issueType] || [];
  }

  static validateRemedyPlan(plan: RemedyPlan): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    if (plan.effectiveness < 60) {
      warnings.push('化解效果可能不够理想，建议咨询专业风水师');
    }

    if (plan.emergency.length > 3) {
      warnings.push('紧急问题过多，建议分阶段处理');
    }

    if (plan.totalCost === 'high') {
      warnings.push('总成本较高，建议考虑分期实施');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
    };
  }
}
