/**
 * A/B测试框架
 *
 * 支持多变体实验，优化转化率
 */

/**
 * 实验配置
 */
export interface Experiment {
  id: string;
  name: string;
  description: string;

  // 变体配置
  variants: Variant[];

  // 流量分配（百分比）
  trafficAllocation: number; // 0-100，参与实验的用户比例

  // 实验状态
  status: 'draft' | 'running' | 'paused' | 'completed';

  // 时间范围
  startDate?: Date;
  endDate?: Date;

  // 目标指标
  primaryMetric: string; // 例如：'conversion_rate'
  secondaryMetrics?: string[];
}

/**
 * 变体配置
 */
export interface Variant {
  id: string;
  name: string;
  description: string;

  // 流量权重（用于分配）
  weight: number; // 0-100

  // 变体配置（具体参数）
  config: Record<string, any>;

  // 是否为对照组
  isControl?: boolean;
}

/**
 * 用户分配结果
 */
export interface Assignment {
  experimentId: string;
  variantId: string;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

/**
 * A/B测试管理器
 */
export class ABTestManager {
  private experiments: Map<string, Experiment> = new Map();
  private assignments: Map<string, Assignment> = new Map(); // key: userId or sessionId

  /**
   * 注册实验
   */
  register(experiment: Experiment): void {
    // 验证权重总和
    const totalWeight = experiment.variants.reduce(
      (sum, v) => sum + v.weight,
      0
    );
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`实验 ${experiment.id} 的变体权重总和必须为100%`);
    }

    this.experiments.set(experiment.id, experiment);
    console.log(`[ABTest] 注册实验: ${experiment.name}`);
  }

  /**
   * 获取用户分配的变体
   */
  getVariant(
    experimentId: string,
    userId?: string,
    sessionId?: string
  ): Variant | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // 检查是否在实验流量范围内
    const key = userId || sessionId;
    if (!key) return null;

    if (!this.shouldEnroll(key, experiment.trafficAllocation)) {
      return null;
    }

    // 检查是否已有分配
    const existingAssignment = this.assignments.get(`${experimentId}:${key}`);
    if (existingAssignment) {
      return (
        experiment.variants.find(
          (v) => v.id === existingAssignment.variantId
        ) || null
      );
    }

    // 执行新分配
    const variant = this.assignVariant(experiment, key);

    // 记录分配
    this.assignments.set(`${experimentId}:${key}`, {
      experimentId,
      variantId: variant.id,
      timestamp: new Date(),
      userId,
      sessionId,
    });

    return variant;
  }

  /**
   * 判断用户是否应该参与实验
   */
  private shouldEnroll(key: string, trafficAllocation: number): boolean {
    // 使用简单哈希来决定是否参与（确保稳定性）
    const hash = this.hashString(key);
    const enrollment = (hash % 100) / 100;
    return enrollment < trafficAllocation / 100;
  }

  /**
   * 为用户分配变体
   */
  private assignVariant(experiment: Experiment, key: string): Variant {
    const hash = this.hashString(key + experiment.id);
    const position = hash % 100;

    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (position < cumulative) {
        return variant;
      }
    }

    // 降级到第一个变体
    return experiment.variants[0];
  }

  /**
   * 简单哈希函数（用于分配）
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
  }

  /**
   * 获取实验统计
   */
  getStats(experimentId: string): {
    totalAssignments: number;
    variantCounts: Record<string, number>;
  } {
    const assignments = Array.from(this.assignments.values()).filter(
      (a) => a.experimentId === experimentId
    );

    const variantCounts: Record<string, number> = {};
    for (const assignment of assignments) {
      variantCounts[assignment.variantId] =
        (variantCounts[assignment.variantId] || 0) + 1;
    }

    return {
      totalAssignments: assignments.length,
      variantCounts,
    };
  }

  /**
   * 完成实验
   */
  complete(experimentId: string): void {
    const experiment = this.experiments.get(experimentId);
    if (experiment) {
      experiment.status = 'completed';
      experiment.endDate = new Date();
      console.log(`[ABTest] 实验完成: ${experiment.name}`);
    }
  }
}

/**
 * 全局实例
 */
export const globalABTest = new ABTestManager();

/**
 * Paywall A/B测试实验配置
 */
export const PAYWALL_EXPERIMENT: Experiment = {
  id: 'paywall_optimization_v1',
  name: 'Paywall优化实验',
  description: '测试不同Paywall变体对转化率的影响',
  variants: [
    {
      id: 'control',
      name: '对照组（默认）',
      description: '标准Paywall设计',
      weight: 25,
      isControl: true,
      config: { variant: 'default' },
    },
    {
      id: 'urgency',
      name: '紧迫感变体',
      description: '强调限时优惠和紧迫性',
      weight: 25,
      config: {
        variant: 'urgency',
        discountEndsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    },
    {
      id: 'value',
      name: '价值导向变体',
      description: '突出性价比和物有所值',
      weight: 25,
      config: { variant: 'value' },
    },
    {
      id: 'social_proof',
      name: '社会证明变体',
      description: '展示其他用户的选择',
      weight: 25,
      config: { variant: 'social_proof' },
    },
  ],
  trafficAllocation: 100,
  status: 'running',
  primaryMetric: 'conversion_rate',
  secondaryMetrics: ['time_to_conversion', 'bounce_rate'],
};

// 注册实验
globalABTest.register(PAYWALL_EXPERIMENT);
