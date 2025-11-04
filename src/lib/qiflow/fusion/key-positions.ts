// 风水关键位置分析模块 - 简化版本

export interface KeyPosition {
  name: string;
  position: string;
  significance: 'high' | 'medium' | 'low';
  element: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  favorableActivities: string[];
  unfavorableActivities: string[];
  idealPlacement: string[];
  avoidPlacement: string[];
}

export interface PositionAnalysis {
  position: string;
  currentState: 'favorable' | 'neutral' | 'unfavorable';
  energyLevel: number; // 0-100
  recommendations: string[];
  warnings: string[];
  enhancementOptions: string[];
}

// 导出关键位置分析函数
export function analyzeKeyPositions(
  direction: string,
  currentUsage?: string,
  currentObjects?: string[]
): PositionAnalysis {
  return KeyPositions.analyzePosition(direction, currentUsage, currentObjects);
}

export class KeyPositions {
  private static readonly EIGHT_DIRECTIONS: KeyPosition[] = [
    {
      name: '正北方',
      position: 'north',
      significance: 'high',
      element: 'water',
      favorableActivities: ['休息', '冥想', '学习', '睡眠'],
      unfavorableActivities: ['烹饪', '剧烈运动', '争吵'],
      idealPlacement: ['水景', '镜子', '黑色装饰', '波浪图案'],
      avoidPlacement: ['火炉', '红色装饰', '尖锐物品'],
    },
    {
      name: '东北方',
      position: 'northeast',
      significance: 'medium',
      element: 'earth',
      favorableActivities: ['学习', '工作', '规划', '储藏'],
      unfavorableActivities: ['娱乐', '嬉戏', '浪费'],
      idealPlacement: ['书籍', '陶瓷', '黄色装饰', '方形物品'],
      avoidPlacement: ['垃圾桶', '杂物', '绿色植物'],
    },
    {
      name: '正东方',
      position: 'east',
      significance: 'high',
      element: 'wood',
      favorableActivities: ['运动', '成长', '创新', '晨练'],
      unfavorableActivities: ['休息', '静止', '消极'],
      idealPlacement: ['植物', '木制品', '绿色装饰', '长形物品'],
      avoidPlacement: ['金属制品', '白色装饰', '干燥物品'],
    },
    {
      name: '东南方',
      position: 'southeast',
      significance: 'high',
      element: 'wood',
      favorableActivities: ['财务管理', '商务', '成长', '沟通'],
      unfavorableActivities: ['争执', '破坏', '浪费'],
      idealPlacement: ['财位装饰', '绿色植物', '流水摆件'],
      avoidPlacement: ['尖锐物品', '枯萎植物', '破损物品'],
    },
    {
      name: '正南方',
      position: 'south',
      significance: 'high',
      element: 'fire',
      favorableActivities: ['社交', '娱乐', '表现', '庆祝'],
      unfavorableActivities: ['休息', '冷静思考', '孤独'],
      idealPlacement: ['灯具', '红色装饰', '尖锐装饰', '三角形'],
      avoidPlacement: ['水景', '蓝色装饰', '圆形物品'],
    },
    {
      name: '西南方',
      position: 'southwest',
      significance: 'medium',
      element: 'earth',
      favorableActivities: ['关系培养', '团队合作', '稳定'],
      unfavorableActivities: ['独立工作', '创新', '变动'],
      idealPlacement: ['成对摆件', '土制品', '黄色装饰'],
      avoidPlacement: ['单独摆件', '金属制品', '移动物品'],
    },
    {
      name: '正西方',
      position: 'west',
      significance: 'medium',
      element: 'metal',
      favorableActivities: ['创作', '收获', '享受', '休闲'],
      unfavorableActivities: ['开始', '种植', '学习'],
      idealPlacement: ['金属装饰', '白色装饰', '圆形物品'],
      avoidPlacement: ['火源', '红色装饰', '尖锐物品'],
    },
    {
      name: '西北方',
      position: 'northwest',
      significance: 'high',
      element: 'metal',
      favorableActivities: ['领导', '决策', '权威', '规划'],
      unfavorableActivities: ['服从', '娱乐', '轻浮'],
      idealPlacement: ['办公用品', '金属饰品', '权威象征'],
      avoidPlacement: ['垃圾', '破损物品', '儿童玩具'],
    },
  ];

  static getKeyPosition(direction: string): KeyPosition | null {
    return (
      KeyPositions.EIGHT_DIRECTIONS.find((pos) => pos.position === direction) ||
      null
    );
  }

  static getAllPositions(): KeyPosition[] {
    return [...KeyPositions.EIGHT_DIRECTIONS];
  }

  static analyzePosition(
    direction: string,
    currentUsage?: string,
    currentObjects?: string[]
  ): PositionAnalysis {
    const keyPos = KeyPositions.getKeyPosition(direction);
    if (!keyPos) {
      throw new Error(`未知方位: ${direction}`);
    }

    let currentState: PositionAnalysis['currentState'] = 'neutral';
    let energyLevel = 50;
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const enhancementOptions: string[] = [];

    // 分析当前使用情况
    if (currentUsage) {
      if (
        keyPos.favorableActivities.some((activity) =>
          currentUsage.toLowerCase().includes(activity)
        )
      ) {
        currentState = 'favorable';
        energyLevel += 20;
        recommendations.push(`${direction}方位很适合${currentUsage}，继续保持`);
      } else if (
        keyPos.unfavorableActivities.some((activity) =>
          currentUsage.toLowerCase().includes(activity)
        )
      ) {
        currentState = 'unfavorable';
        energyLevel -= 20;
        warnings.push(`${direction}方位不适合${currentUsage}，建议调整`);
      }
    }

    // 分析当前物品
    if (currentObjects && currentObjects.length > 0) {
      const hasIdealItems = currentObjects.some((obj) =>
        keyPos.idealPlacement.some(
          (ideal) =>
            obj.toLowerCase().includes(ideal) ||
            ideal.includes(obj.toLowerCase())
        )
      );

      const hasAvoidItems = currentObjects.some((obj) =>
        keyPos.avoidPlacement.some(
          (avoid) =>
            obj.toLowerCase().includes(avoid) ||
            avoid.includes(obj.toLowerCase())
        )
      );

      if (hasIdealItems) {
        energyLevel += 15;
        recommendations.push('当前物品摆放与此方位能量匹配良好');
      }

      if (hasAvoidItems) {
        energyLevel -= 15;
        warnings.push('某些物品与此方位能量冲突，建议移除或调整');
      }
    }

    // 生成增强建议
    enhancementOptions.push(`增加${keyPos.element}元素的装饰`);
    enhancementOptions.push(
      ...keyPos.idealPlacement.map((item) => `放置${item}`)
    );

    // 根据五行相生原理添加建议
    const supportingElement = KeyPositions.getSupportingElement(keyPos.element);
    if (supportingElement) {
      enhancementOptions.push(
        `添加${supportingElement}元素来生旺${keyPos.element}能量`
      );
    }

    return {
      position: direction,
      currentState,
      energyLevel: Math.max(0, Math.min(100, energyLevel)),
      recommendations,
      warnings,
      enhancementOptions,
    };
  }

  private static getSupportingElement(
    element: KeyPosition['element']
  ): string | null {
    const supportMap: Record<string, string> = {
      wood: '水', // 水生木
      fire: '木', // 木生火
      earth: '火', // 火生土
      metal: '土', // 土生金
      water: '金', // 金生水
    };
    return supportMap[element] || null;
  }

  static getOptimalLayout(
    priorities: string[] = ['wealth', 'health', 'career', 'relationship']
  ): Record<string, string[]> {
    const layout: Record<string, string[]> = {};

    priorities.forEach((priority) => {
      switch (priority) {
        case 'wealth':
          layout.southeast = ['财位布置', '绿色植物', '流水装饰'];
          layout.north = ['水景', '蓝色装饰'];
          break;
        case 'health':
          layout.center = ['保持整洁', '土黄色装饰'];
          layout.east = ['绿色植物', '晨光充足'];
          break;
        case 'career':
          layout.northwest = ['办公区域', '金属装饰'];
          layout.north = ['深色装饰', '静谧环境'];
          break;
        case 'relationship':
          layout.southwest = ['成对摆件', '粉色装饰'];
          layout.west = ['休闲区域', '舒适摆设'];
          break;
      }
    });

    return layout;
  }

  static generatePositionReport(analyses: PositionAnalysis[]): string {
    const totalEnergy = analyses.reduce(
      (sum, analysis) => sum + analysis.energyLevel,
      0
    );
    const averageEnergy = totalEnergy / analyses.length;

    return `
风水方位分析报告
================

整体能量评估: ${averageEnergy.toFixed(1)}/100

各方位详情:
${analyses
  .map(
    (analysis) => `
${analysis.position}方位 - 能量: ${analysis.energyLevel}/100
状态: ${analysis.currentState}
建议: ${analysis.recommendations.join('; ')}
警告: ${analysis.warnings.join('; ')}
增强选项: ${analysis.enhancementOptions.slice(0, 3).join('; ')}
`
  )
  .join('\n')}

总体建议:
${
  averageEnergy >= 80
    ? '整体风水格局良好，继续保持'
    : averageEnergy >= 60
      ? '整体格局中等，有改善空间'
      : '整体格局需要调整，建议优先处理警告事项'
}

注：此分析基于传统风水理论，实际效果因人而异。
`;
  }
}
