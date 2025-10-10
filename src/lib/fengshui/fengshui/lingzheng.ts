import { PALACE_TO_BAGUA, getPalaceByMountain } from './luoshu';
import type {
  FlyingStar,
  LingzhengAnalysis,
  Mountain,
  PalaceIndex,
  Plate,
  Yun,
} from './types';

/**
 * 零正理论实现
 *
 * 零正理论是玄空飞星风水中的核心理论之一
 * 零神主水，正神主山，零正不可颠倒
 * 零神见水则吉，见山则凶；正神见山则吉，见水则凶
 */

// 三元九运的零正神对应表
export interface LingzhengPeriodInfo {
  period: Yun;
  positiveGod: FlyingStar; // 正神
  zeroGod: FlyingStar; // 零神
  description: string;
}

// 完整的三元九运零正神表
export const LINGZHENG_PERIOD_TABLE: LingzhengPeriodInfo[] = [
  {
    period: 1,
    positiveGod: 1,
    zeroGod: 7,
    description: '一运：一白为正神，七赤为零神',
  },
  {
    period: 2,
    positiveGod: 2,
    zeroGod: 8,
    description: '二运：二黑为正神，八白为零神',
  },
  {
    period: 3,
    positiveGod: 3,
    zeroGod: 9,
    description: '三运：三碧为正神，九紫为零神',
  },
  {
    period: 4,
    positiveGod: 4,
    zeroGod: 1,
    description: '四运：四绿为正神，一白为零神',
  },
  {
    period: 5,
    positiveGod: 5,
    zeroGod: 2,
    description: '五运：五黄为正神，二黑为零神',
  },
  {
    period: 6,
    positiveGod: 6,
    zeroGod: 3,
    description: '六运：六白为正神，三碧为零神',
  },
  {
    period: 7,
    positiveGod: 7,
    zeroGod: 4,
    description: '七运：七赤为正神，四绿为零神',
  },
  {
    period: 8,
    positiveGod: 8,
    zeroGod: 5,
    description: '八运：八白为正神，五黄为零神',
  },
  {
    period: 9,
    positiveGod: 9,
    zeroGod: 6,
    description: '九运：九紫为正神，六白为零神',
  },
];

// 获取指定运的零正神信息
export function getLingzhengInfo(period: Yun): LingzhengPeriodInfo {
  const info = LINGZHENG_PERIOD_TABLE.find((item) => item.period === period);
  if (!info) {
    throw new Error(`无效的运数: ${period}`);
  }
  return info;
}

// 分析飞星盘中的零正神位置
export function analyzeLingzhengPositions(
  plate: Plate,
  period: Yun
): {
  zeroGodPositions: PalaceIndex[];
  positiveGodPositions: PalaceIndex[];
  zeroGodDetails: {
    palace: PalaceIndex;
    bagua: string;
    starType: 'period' | 'mountain' | 'facing';
  }[];
  positiveGodDetails: {
    palace: PalaceIndex;
    bagua: string;
    starType: 'period' | 'mountain' | 'facing';
  }[];
} {
  const lingzhengInfo = getLingzhengInfo(period);
  const zeroGodPositions: PalaceIndex[] = [];
  const positiveGodPositions: PalaceIndex[] = [];
  const zeroGodDetails: {
    palace: PalaceIndex;
    bagua: string;
    starType: 'period' | 'mountain' | 'facing';
  }[] = [];
  const positiveGodDetails: {
    palace: PalaceIndex;
    bagua: string;
    starType: 'period' | 'mountain' | 'facing';
  }[] = [];

  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];

    // 检查各盘的零正神
    if (cell.periodStar === lingzhengInfo.zeroGod) {
      zeroGodPositions.push(cell.palace);
      zeroGodDetails.push({ palace: cell.palace, bagua, starType: 'period' });
    }
    if (cell.mountainStar === lingzhengInfo.zeroGod) {
      if (!zeroGodPositions.includes(cell.palace)) {
        zeroGodPositions.push(cell.palace);
      }
      zeroGodDetails.push({ palace: cell.palace, bagua, starType: 'mountain' });
    }
    if (cell.facingStar === lingzhengInfo.zeroGod) {
      if (!zeroGodPositions.includes(cell.palace)) {
        zeroGodPositions.push(cell.palace);
      }
      zeroGodDetails.push({ palace: cell.palace, bagua, starType: 'facing' });
    }

    // 检查正神
    if (cell.periodStar === lingzhengInfo.positiveGod) {
      positiveGodPositions.push(cell.palace);
      positiveGodDetails.push({
        palace: cell.palace,
        bagua,
        starType: 'period',
      });
    }
    if (cell.mountainStar === lingzhengInfo.positiveGod) {
      if (!positiveGodPositions.includes(cell.palace)) {
        positiveGodPositions.push(cell.palace);
      }
      positiveGodDetails.push({
        palace: cell.palace,
        bagua,
        starType: 'mountain',
      });
    }
    if (cell.facingStar === lingzhengInfo.positiveGod) {
      if (!positiveGodPositions.includes(cell.palace)) {
        positiveGodPositions.push(cell.palace);
      }
      positiveGodDetails.push({
        palace: cell.palace,
        bagua,
        starType: 'facing',
      });
    }
  }

  return {
    zeroGodPositions,
    positiveGodPositions,
    zeroGodDetails,
    positiveGodDetails,
  };
}

// 检查是否存在零正颠倒
export function checkZeroPositiveReversed(
  plate: Plate,
  period: Yun,
  zuo: Mountain,
  xiang: Mountain,
  environmentInfo?: {
    waterPositions?: PalaceIndex[]; // 实际见水的位置
    mountainPositions?: PalaceIndex[]; // 实际见山的位置
  }
): {
  isReversed: boolean;
  issues: string[];
  severity: 'critical' | 'major' | 'minor' | 'none';
} {
  const lingzhengPositions = analyzeLingzhengPositions(plate, period);
  const issues: string[] = [];

  if (!environmentInfo) {
    return {
      isReversed: false,
      issues: ['缺乏环境信息，无法判断零正颠倒'],
      severity: 'none',
    };
  }

  const { waterPositions = [], mountainPositions = [] } = environmentInfo;

  // 检查零神是否见山（凶）
  const zeroGodSeesMountain = lingzhengPositions.zeroGodPositions.some(
    (palace) => mountainPositions.includes(palace)
  );

  // 检查正神是否见水（凶）
  const positiveGodSeesWater = lingzhengPositions.positiveGodPositions.some(
    (palace) => waterPositions.includes(palace)
  );

  if (zeroGodSeesMountain) {
    const affectedPalaces = lingzhengPositions.zeroGodPositions
      .filter((palace) => mountainPositions.includes(palace))
      .map((palace) => PALACE_TO_BAGUA[palace]);
    issues.push(
      `零神见山：${affectedPalaces.join('、')}宫零神见山，主破财损丁`
    );
  }

  if (positiveGodSeesWater) {
    const affectedPalaces = lingzhengPositions.positiveGodPositions
      .filter((palace) => waterPositions.includes(palace))
      .map((palace) => PALACE_TO_BAGUA[palace]);
    issues.push(
      `正神见水：${affectedPalaces.join('、')}宫正神见水，主散财败家`
    );
  }

  const isReversed = zeroGodSeesMountain || positiveGodSeesWater;

  let severity: 'critical' | 'major' | 'minor' | 'none' = 'none';
  if (zeroGodSeesMountain && positiveGodSeesWater) {
    severity = 'critical';
  } else if (zeroGodSeesMountain || positiveGodSeesWater) {
    severity = 'major';
  }

  return {
    isReversed,
    issues,
    severity,
  };
}

// 生成零正理论的环境布局建议
export function generateLingzhengRecommendations(
  plate: Plate,
  period: Yun,
  zuo: Mountain,
  xiang: Mountain
): {
  waterPlacement: {
    favorable: PalaceIndex[];
    unfavorable: PalaceIndex[];
    details: string[];
  };
  mountainPlacement: {
    favorable: PalaceIndex[];
    unfavorable: PalaceIndex[];
    details: string[];
  };
  generalAdvice: string[];
} {
  const lingzhengInfo = getLingzhengInfo(period);
  const positions = analyzeLingzhengPositions(plate, period);

  // 零神见水吉，正神见山吉
  const waterPlacement = {
    favorable: positions.zeroGodPositions,
    unfavorable: positions.positiveGodPositions,
    details: [] as string[],
  };

  const mountainPlacement = {
    favorable: positions.positiveGodPositions,
    unfavorable: positions.zeroGodPositions,
    details: [] as string[],
  };

  // 详细说明
  positions.zeroGodDetails.forEach((detail) => {
    const bagua = PALACE_TO_BAGUA[detail.palace];
    waterPlacement.details.push(
      `${bagua}宫${detail.starType === 'period' ? '天盘' : detail.starType === 'mountain' ? '山盘' : '向盘'}有零神${lingzhengInfo.zeroGod}，宜见水`
    );
  });

  positions.positiveGodDetails.forEach((detail) => {
    const bagua = PALACE_TO_BAGUA[detail.palace];
    mountainPlacement.details.push(
      `${bagua}宫${detail.starType === 'period' ? '天盘' : detail.starType === 'mountain' ? '山盘' : '向盘'}有正神${lingzhengInfo.positiveGod}，宜见山`
    );
  });

  const generalAdvice = [
    `当运零神为${lingzhengInfo.zeroGod}，正神为${lingzhengInfo.positiveGod}`,
    '零神宜动不宜静，宜见水不宜见山',
    '正神宜静不宜动，宜见山不宜见水',
    '零正不可颠倒，否则主破财败运',
  ];

  // 特殊运的建议
  if (period === 5) {
    generalAdvice.push('五运五黄为正神，特别注意化解五黄煞气');
  }

  return {
    waterPlacement,
    mountainPlacement,
    generalAdvice,
  };
}

// 零正理论的时运变化分析
export function analyzeLingzhengTimeChange(
  currentPeriod: Yun,
  futurePeriod: Yun,
  plate: Plate
): {
  currentAnalysis: LingzhengAnalysis;
  futureAnalysis: LingzhengAnalysis;
  transitionAdvice: string[];
  riskAssessment: {
    level: 'high' | 'medium' | 'low';
    description: string;
  };
} {
  const currentPositions = analyzeLingzhengPositions(plate, currentPeriod);
  const futurePositions = analyzeLingzhengPositions(plate, futurePeriod);

  const transitionAdvice: string[] = [];

  // 分析变化的影响
  const currentZeroGod = getLingzhengInfo(currentPeriod).zeroGod;
  const futureZeroGod = getLingzhengInfo(futurePeriod).zeroGod;
  const currentPositiveGod = getLingzhengInfo(currentPeriod).positiveGod;
  const futurePositiveGod = getLingzhengInfo(futurePeriod).positiveGod;

  if (currentZeroGod !== futureZeroGod) {
    transitionAdvice.push(
      `零神将从${currentZeroGod}变为${futureZeroGod}，需要调整水位布置`
    );
  }

  if (currentPositiveGod !== futurePositiveGod) {
    transitionAdvice.push(
      `正神将从${currentPositiveGod}变为${futurePositiveGod}，需要调整山位布置`
    );
  }

  // 评估风险
  let riskLevel: 'high' | 'medium' | 'low' = 'low';
  let riskDescription = '运转变化影响较小';

  const impactedPositions = [
    ...currentPositions.zeroGodPositions,
    ...currentPositions.positiveGodPositions,
    ...futurePositions.zeroGodPositions,
    ...futurePositions.positiveGodPositions,
  ];

  const uniqueImpacted = [...new Set(impactedPositions)];

  if (uniqueImpacted.length >= 6) {
    riskLevel = 'high';
    riskDescription = '运转变化影响较大，需要重新规划布局';
  } else if (uniqueImpacted.length >= 3) {
    riskLevel = 'medium';
    riskDescription = '运转变化有一定影响，建议适当调整';
  }

  // 生成分析结果
  const currentRecommendations = generateLingzhengRecommendations(
    plate,
    currentPeriod,
    '子',
    '午'
  );
  const futureRecommendations = generateLingzhengRecommendations(
    plate,
    futurePeriod,
    '子',
    '午'
  );

  const currentAnalysis: LingzhengAnalysis = {
    zeroGodPosition: currentPositions.zeroGodPositions,
    positiveGodPosition: currentPositions.positiveGodPositions,
    isZeroPositiveReversed: false,
    waterPlacement: currentRecommendations.waterPlacement,
    mountainPlacement: currentRecommendations.mountainPlacement,
    recommendations: currentRecommendations.generalAdvice,
  };

  const futureAnalysis: LingzhengAnalysis = {
    zeroGodPosition: futurePositions.zeroGodPositions,
    positiveGodPosition: futurePositions.positiveGodPositions,
    isZeroPositiveReversed: false,
    waterPlacement: futureRecommendations.waterPlacement,
    mountainPlacement: futureRecommendations.mountainPlacement,
    recommendations: futureRecommendations.generalAdvice,
  };

  return {
    currentAnalysis,
    futureAnalysis,
    transitionAdvice,
    riskAssessment: {
      level: riskLevel,
      description: riskDescription,
    },
  };
}

// 完整的零正理论分析
export function analyzeLingzheng(
  plate: Plate,
  period: Yun,
  zuo: Mountain,
  xiang: Mountain,
  environmentInfo?: {
    waterPositions?: PalaceIndex[];
    mountainPositions?: PalaceIndex[];
  }
): LingzhengAnalysis {
  const positions = analyzeLingzhengPositions(plate, period);
  const recommendations = generateLingzhengRecommendations(
    plate,
    period,
    zuo,
    xiang
  );
  const reversedCheck = checkZeroPositiveReversed(
    plate,
    period,
    zuo,
    xiang,
    environmentInfo
  );

  const analysis: LingzhengAnalysis = {
    zeroGodPosition: positions.zeroGodPositions,
    positiveGodPosition: positions.positiveGodPositions,
    isZeroPositiveReversed: reversedCheck.isReversed,
    waterPlacement: recommendations.waterPlacement,
    mountainPlacement: recommendations.mountainPlacement,
    recommendations: [
      ...recommendations.generalAdvice,
      ...reversedCheck.issues,
    ],
  };

  // 根据零正颠倒情况添加特殊建议
  if (reversedCheck.isReversed) {
    switch (reversedCheck.severity) {
      case 'critical':
        analysis.recommendations.push(
          '零正严重颠倒，建议重新选择坐向或大幅调整环境布局'
        );
        break;
      case 'major':
        analysis.recommendations.push(
          '零正颠倒，需要化解不利因素，调整水山位置'
        );
        break;
      case 'minor':
        analysis.recommendations.push('有轻微零正不协调，建议微调环境布置');
        break;
    }
  }

  return analysis;
}

// 零正理论的实用指导原则
export const LINGZHENG_PRINCIPLES = {
  basic: [
    '零神主动主水，正神主静主山',
    '零神见水大吉，见山大凶',
    '正神见山大吉，见水大凶',
    '零正不可颠倒，颠倒必主凶祸',
  ],
  advanced: [
    '零神宜有情环抱，不宜直冲',
    '正神宜端正庄严，不宜破碎',
    '零正之气贵在流通，不宜阻滞',
    '运转之时零正互换，需及时调整',
  ],
  practical: [
    '零神位可放鱼缸、水景、流水',
    '正神位宜放高柜、书架、靠山',
    '避免在零神位放置重物、高物',
    '避免在正神位放置水器、镜子',
  ],
};
