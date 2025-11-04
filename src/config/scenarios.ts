/**
 * 生活场景配置 - 6大场景助手
 * 从单一风水工具扩展为覆盖生活全场景的决策助手
 */

export interface ScenarioFeature {
  id: string;
  name: string;
  credits: number;
  frequency: string;
  description?: string;
}

export interface LifeScenario {
  label: string;
  icon: string;
  description: string;
  features: ScenarioFeature[];
  color: string; // Tailwind color class
}

export const lifeScenarios: Record<string, LifeScenario> = {
  // 🏠 居家生活（高频）
  home: {
    label: '居家助手',
    icon: '🏠',
    description: '优化家居布局，提升生活品质',
    color: 'blue',
    features: [
      {
        id: 'room-layout',
        name: '房间布局优化',
        credits: 50,
        frequency: '装修时',
        description: '根据飞星盘推荐最佳房间功能布局',
      },
      {
        id: 'furniture-place',
        name: '家具摆放建议',
        credits: 20,
        frequency: '月度调整',
        description: '床位、书桌、沙发等家具的最佳摆放位置',
      },
      {
        id: 'color-scheme',
        name: '装修色调推荐',
        credits: 30,
        frequency: '装修时',
        description: '根据个人八字推荐装修主色调与配色方案',
      },
      {
        id: 'plant-selection',
        name: '绿植摆放指南',
        credits: 15,
        frequency: '季度',
        description: '适合的绿植种类与摆放位置',
      },
    ],
  },

  // 💼 职场事业（中高频）
  career: {
    label: '事业助手',
    icon: '💼',
    description: '助力事业发展，提升职场运势',
    color: 'purple',
    features: [
      {
        id: 'office-layout',
        name: '办公桌摆放',
        credits: 30,
        frequency: '入职/换岗',
        description: '最佳办公桌朝向与文昌位催旺',
      },
      {
        id: 'meeting-timing',
        name: '重要会议择时',
        credits: 40,
        frequency: '周',
        description: '选择最佳会议时间，提升沟通效果',
      },
      {
        id: 'business-trip',
        name: '出差方向建议',
        credits: 25,
        frequency: '出差前',
        description: '根据流年推荐有利的出差方向',
      },
      {
        id: 'interview-luck',
        name: '面试吉时查询',
        credits: 20,
        frequency: '求职时',
        description: '选择面试吉时，增加录取概率',
      },
    ],
  },

  // 💰 财运管理（高频）
  wealth: {
    label: '财运助手',
    icon: '💰',
    description: '把握财运时机，稳步提升财富',
    color: 'yellow',
    features: [
      {
        id: 'investment-timing',
        name: '投资择时建议',
        credits: 60,
        frequency: '投资前',
        description: '分析流年流月财星，推荐投资时机',
      },
      {
        id: 'wealth-position',
        name: '财位催旺方案',
        credits: 50,
        frequency: '月度',
        description: '定位财位并提供催旺布局建议',
      },
      {
        id: 'business-open',
        name: '开业择日',
        credits: 80,
        frequency: '创业时',
        description: '选择生意兴隆的开业吉日',
      },
      {
        id: 'contract-sign',
        name: '签约吉时',
        credits: 40,
        frequency: '签约前',
        description: '重大合同签订的最佳时机',
      },
    ],
  },

  // 💕 情感关系（中频）
  relationship: {
    label: '情感助手',
    icon: '💕',
    description: '促进家庭和睦，提升情感运势',
    color: 'pink',
    features: [
      {
        id: 'date-timing',
        name: '约会吉时推荐',
        credits: 20,
        frequency: '约会前',
        description: '选择最佳约会时间与地点方向',
      },
      {
        id: 'wedding-date',
        name: '婚期择日',
        credits: 100,
        frequency: '结婚前',
        description: '百年好合的结婚吉日选择',
      },
      {
        id: 'bedroom-harmony',
        name: '卧室和睦布局',
        credits: 40,
        frequency: '季度',
        description: '主卧布局优化，促进夫妻感情',
      },
      {
        id: 'conflict-resolve',
        name: '化解矛盾建议',
        credits: 30,
        frequency: '需要时',
        description: '家庭矛盾的风水化解方案',
      },
    ],
  },

  // 📚 学业考试（中频）
  study: {
    label: '学业助手',
    icon: '📚',
    description: '提升学习效率，助力学业进步',
    color: 'green',
    features: [
      {
        id: 'study-position',
        name: '文昌位布置',
        credits: 30,
        frequency: '学期初',
        description: '定位文昌位并提供催旺方案',
      },
      {
        id: 'exam-timing',
        name: '考试吉时查询',
        credits: 25,
        frequency: '考前',
        description: '选择最佳考试时间段',
      },
      {
        id: 'focus-enhance',
        name: '专注力提升',
        credits: 20,
        frequency: '周',
        description: '书房/书桌布局优化，提升专注力',
      },
      {
        id: 'dorm-layout',
        name: '宿舍布局优化',
        credits: 35,
        frequency: '入学时',
        description: '学生宿舍的最佳布局建议',
      },
    ],
  },

  // 🏥 健康养生（高频）
  health: {
    label: '健康助手',
    icon: '🏥',
    description: '守护身心健康，预防疾病风险',
    color: 'red',
    features: [
      {
        id: 'sleep-quality',
        name: '睡眠质量改善',
        credits: 30,
        frequency: '睡眠差时',
        description: '床位调整与卧室优化方案',
      },
      {
        id: 'disease-prevent',
        name: '病位化解',
        credits: 50,
        frequency: '季度',
        description: '识别病位（二黑、五黄）并提供化解方案',
      },
      {
        id: 'exercise-direction',
        name: '运动方位建议',
        credits: 15,
        frequency: '周',
        description: '最佳运动时间与方向推荐',
      },
      {
        id: 'health-checkup',
        name: '体检择时',
        credits: 20,
        frequency: '年度',
        description: '选择有利的体检时间',
      },
    ],
  },
};

/**
 * 获取所有场景列表
 */
export function getAllScenarios(): LifeScenario[] {
  return Object.values(lifeScenarios);
}

/**
 * 根据ID获取场景
 */
export function getScenarioById(id: string): LifeScenario | undefined {
  return lifeScenarios[id];
}

/**
 * 获取场景的颜色类
 */
export function getScenarioColorClasses(color: string) {
  const colorMap: Record<
    string,
    { bg: string; text: string; border: string; hover: string }
  > = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:border-blue-400',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:border-purple-400',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      hover: 'hover:border-yellow-400',
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-600',
      border: 'border-pink-200',
      hover: 'hover:border-pink-400',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      hover: 'hover:border-green-400',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      hover: 'hover:border-red-400',
    },
  };

  return colorMap[color] || colorMap.blue;
}
