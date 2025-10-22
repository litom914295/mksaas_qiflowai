/**
 * 玄空飞星智能诊断预警系统 (v6.0)
 *
 * 五级预警分类：
 * 🔴 危险级 (90-100分) - 立即处理，刻不容缓
 * 🟠 警告级 (70-89分) - 尽快处理，影响明显
 * 🟡 提示级 (50-69分) - 建议处理，有一定影响
 * 🟢 良好级 (30-49分) - 保持现状，略有吉利
 * ⭐ 优秀级 (0-29分) - 格局理想，大吉大利
 */

import type {
  EnhancedXuankongPlate,
  FlyingStar,
  FortuneRating,
  PalaceName,
} from './types';

// 预警级别
export type AlertLevel =
  | 'critical'
  | 'warning'
  | 'caution'
  | 'good'
  | 'excellent';

// 预警类型
export type AlertType =
  | 'wuhuang' // 五黄煞
  | 'erhei' // 二黑病符
  | 'sanbi' // 三碧是非
  | 'qichi' // 七赤破军
  | 'shangshan_xiashui' // 上山下水
  | 'wangshan_wangshui' // 旺山旺水
  | 'hesbi' // 合十组合
  | 'feiyin' // 伏吟
  | 'fanyin' // 反吟
  | 'general'; // 一般问题

// 诊断结果
export interface DiagnosticAlert {
  id: string;
  level: AlertLevel;
  type: AlertType;
  palace: PalaceName;
  title: string;
  description: string;
  severity: number; // 严重程度 0-100

  // 影响分析
  impacts: {
    health?: string;
    wealth?: string;
    career?: string;
    relationship?: string;
    general?: string;
  };

  // 化解方案
  remedies: {
    immediate: string[]; // 立即措施
    shortTerm: string[]; // 短期方案
    longTerm: string[]; // 长期调整
  };

  // 物品清单
  items?: string[];

  // 预估费用
  estimatedCost?: {
    min: number;
    max: number;
    currency: string;
  };

  // 紧急程度
  urgency: 'immediate' | 'soon' | 'moderate' | 'low';

  // 时效性
  validPeriod?: string;
}

// 诊断报告
export interface DiagnosticReport {
  // 整体评估
  overall: {
    score: number;
    level: AlertLevel;
    rating: FortuneRating;
    summary: string;
  };

  // 分级预警
  alerts: {
    critical: DiagnosticAlert[];
    warning: DiagnosticAlert[];
    caution: DiagnosticAlert[];
    good: DiagnosticAlert[];
    excellent: DiagnosticAlert[];
  };

  // 统计信息
  statistics: {
    totalAlerts: number;
    criticalCount: number;
    warningCount: number;
    cautionCount: number;
    avgSeverity: number;
  };

  // 优先级行动清单
  priorityActions: {
    now: string[]; // 立即处理
    thisWeek: string[]; // 本周内
    thisMonth: string[]; // 本月内
    longTerm: string[]; // 长期规划
  };

  // 生成时间
  generatedAt: Date;
}

/**
 * 执行综合诊断
 */
export function performDiagnostics(
  plate: EnhancedXuankongPlate,
  options: {
    includeMinorIssues?: boolean;
    focusAreas?: ('health' | 'wealth' | 'career' | 'relationship')[];
  } = {}
): DiagnosticReport {
  const alerts: DiagnosticAlert[] = [];

  // 分析每个宫位
  Object.entries(plate.palaces).forEach(([palaceName, info]) => {
    const palace = palaceName as PalaceName;

    // 检查五黄煞
    if (
      info.mountainStar === 5 ||
      info.facingStar === 5 ||
      info.timeStar === 5
    ) {
      alerts.push(
        diagnoseWuhuang(
          palace,
          info.mountainStar,
          info.facingStar,
          info.timeStar
        )
      );
    }

    // 检查二黑病符
    if (info.mountainStar === 2 || info.facingStar === 2) {
      alerts.push(diagnoseErhei(palace, info.mountainStar, info.facingStar));
    }

    // 检查三碧是非
    if (info.mountainStar === 3 || info.facingStar === 3) {
      alerts.push(diagnoseSanbi(palace, info.mountainStar, info.facingStar));
    }

    // 检查七赤破军
    if (info.mountainStar === 7 || info.facingStar === 7) {
      alerts.push(diagnoseQichi(palace, info.mountainStar, info.facingStar));
    }

    // 检查合十组合
    if (info.mountainStar + info.facingStar === 10) {
      alerts.push(diagnoseHesbi(palace, info.mountainStar, info.facingStar));
    }

    // 检查当旺星
    if (
      info.mountainStar === plate.period &&
      info.facingStar === plate.period
    ) {
      alerts.push(diagnoseWangqi(palace));
    }

    // 检查八白、九紫吉星
    if (
      info.mountainStar === 8 ||
      info.facingStar === 8 ||
      info.mountainStar === 9 ||
      info.facingStar === 9
    ) {
      alerts.push(diagnoseJixing(palace, info.mountainStar, info.facingStar));
    }
  });

  // 检查特殊格局
  if (plate.specialPatterns.includes('上山下水')) {
    alerts.push(diagnoseShangshan(plate));
  }

  if (plate.specialPatterns.includes('旺山旺水')) {
    alerts.push(diagnoseWangshan(plate));
  }

  // 分级归类
  const categorized = categorizeAlerts(alerts);

  // 计算统计
  const statistics = calculateStatistics(categorized);

  // 生成优先级行动
  const priorityActions = generatePriorityActions(categorized);

  // 整体评估
  const overall = generateOverallAssessment(plate.overallScore, statistics);

  return {
    overall,
    alerts: categorized,
    statistics,
    priorityActions,
    generatedAt: new Date(),
  };
}

// ========== 诊断函数 ==========

function diagnoseWuhuang(
  palace: PalaceName,
  mountain: FlyingStar,
  facing: FlyingStar,
  time: FlyingStar
): DiagnosticAlert {
  const hasMultiple = [mountain, facing, time].filter((s) => s === 5).length;
  const severity = hasMultiple > 1 ? 95 : 85;

  return {
    id: `wuhuang-${palace}`,
    level: 'critical',
    type: 'wuhuang',
    palace,
    title: `${palace}宫五黄大煞`,
    description: `${palace}宫出现五黄廉贞星${hasMultiple > 1 ? '（叠加）' : ''}，为最凶煞气，主灾祸、疾病、官司`,
    severity,
    impacts: {
      health: '严重威胁健康，易患重病、意外伤害',
      wealth: '破财、损失惨重、投资失败',
      career: '事业受阻、官司缠身、小人陷害',
      relationship: '家庭不和、争吵频繁',
    },
    remedies: {
      immediate: [
        '立即在该方位放置铜铃或铜风铃（6寸以上）',
        '摆放六帝钱（顺治→乾隆，必须真品）',
        '避免在此方位动土、装修、钻孔',
        '保持该区域安静，减少活动',
      ],
      shortTerm: [
        '增加金属制品（铜盆、铜葫芦、铜麒麟）',
        '播放金属音乐或佛经（每天30分钟）',
        '放置大型铜器（如大铜盆装水）',
        '避免红色、黄色物品',
      ],
      longTerm: [
        '考虑改变房间功能（避免主卧、书房）',
        '流年变化后重新评估',
        '咨询专业风水师进行现场勘测',
      ],
    },
    items: ['六帝钱', '铜铃', '铜风铃', '铜葫芦', '铜麒麟', '大铜盆'],
    estimatedCost: { min: 500, max: 3000, currency: 'CNY' },
    urgency: 'immediate',
    validPeriod: '全年有效，流年叠加时更需注意',
  };
}

function diagnoseErhei(
  palace: PalaceName,
  mountain: FlyingStar,
  facing: FlyingStar
): DiagnosticAlert {
  return {
    id: `erhei-${palace}`,
    level: 'warning',
    type: 'erhei',
    palace,
    title: `${palace}宫二黑病符`,
    description: `${palace}宫出现二黑巨门星，主疾病、慢性病、体弱`,
    severity: 75,
    impacts: {
      health: '易患疾病，特别是慢性病、妇科病、肠胃病',
      general: '身体虚弱，抵抗力下降',
    },
    remedies: {
      immediate: ['摆放铜葫芦（开口）', '放置六帝钱', '保持该区域明亮通风'],
      shortTerm: ['使用白色、金色装饰', '避免堆放杂物', '定期清洁消毒'],
      longTerm: ['不宜长期居住', '考虑改为储物间'],
    },
    items: ['铜葫芦', '六帝钱', '水晶'],
    estimatedCost: { min: 200, max: 1000, currency: 'CNY' },
    urgency: 'soon',
  };
}

function diagnoseSanbi(
  palace: PalaceName,
  mountain: FlyingStar,
  facing: FlyingStar
): DiagnosticAlert {
  return {
    id: `sanbi-${palace}`,
    level: 'caution',
    type: 'sanbi',
    palace,
    title: `${palace}宫三碧是非`,
    description: `${palace}宫有三碧禄存星，主口舌是非、官司纠纷`,
    severity: 60,
    impacts: {
      career: '口舌是非、官司纠纷、同事不和',
      relationship: '争吵、误会、沟通不畅',
    },
    remedies: {
      immediate: ['避免在此争论、签约', '放置红色物品化解'],
      shortTerm: ['使用粉色、紫色装饰', '放置水晶', '保持和谐气氛'],
      longTerm: ['不宜作为办公室', '可改为休闲区'],
    },
    items: ['红色摆件', '紫水晶', '粉晶'],
    estimatedCost: { min: 100, max: 500, currency: 'CNY' },
    urgency: 'moderate',
  };
}

function diagnoseQichi(
  palace: PalaceName,
  mountain: FlyingStar,
  facing: FlyingStar
): DiagnosticAlert {
  return {
    id: `qichi-${palace}`,
    level: 'warning',
    type: 'qichi',
    palace,
    title: `${palace}宫七赤破军`,
    description: `${palace}宫出现七赤破军星，主盗窃、口舌、桃花劫`,
    severity: 70,
    impacts: {
      wealth: '易遭盗窃、破财',
      relationship: '烂桃花、感情纠纷',
      general: '口舌是非、意外损伤（特别是口部）',
    },
    remedies: {
      immediate: ['加强防盗措施', '放置蓝色水养植物'],
      shortTerm: ['使用蓝色、黑色装饰', '保持该区域整洁', '避免红色物品'],
      longTerm: ['不宜作为财位', '注意流年变化'],
    },
    items: ['蓝色摆件', '水养植物', '黑曜石'],
    estimatedCost: { min: 150, max: 800, currency: 'CNY' },
    urgency: 'soon',
  };
}

function diagnoseHesbi(
  palace: PalaceName,
  mountain: FlyingStar,
  facing: FlyingStar
): DiagnosticAlert {
  return {
    id: `hesbi-${palace}`,
    level: 'good',
    type: 'hesbi',
    palace,
    title: `${palace}宫合十吉祥`,
    description: `${palace}宫山向合十（${mountain}+${facing}=10），为吉利组合`,
    severity: 25,
    impacts: {
      general: '阴阳调和，运势平衡，诸事顺利',
    },
    remedies: {
      immediate: ['保持该区域整洁', '可适当催旺'],
      shortTerm: ['根据宫位五行选择装饰', '保持明亮通风'],
      longTerm: ['作为重要功能区使用', '长期保持'],
    },
    items: ['根据宫位选择', '吉祥物'],
    estimatedCost: { min: 0, max: 300, currency: 'CNY' },
    urgency: 'low',
  };
}

function diagnoseWangqi(palace: PalaceName): DiagnosticAlert {
  return {
    id: `wangqi-${palace}`,
    level: 'excellent',
    type: 'general',
    palace,
    title: `${palace}宫当旺星临`,
    description: `${palace}宫山向皆为当旺星，格局极佳`,
    severity: 10,
    impacts: {
      general: '旺财旺丁，事业兴旺，家运昌隆',
    },
    remedies: {
      immediate: ['充分利用该方位', '可设为主卧或办公室'],
      shortTerm: ['根据功能催旺', '保持最佳状态'],
      longTerm: ['长期重点使用', '定期维护'],
    },
    items: ['催旺物品', '招财摆件', '水晶'],
    estimatedCost: { min: 300, max: 2000, currency: 'CNY' },
    urgency: 'low',
  };
}

function diagnoseJixing(
  palace: PalaceName,
  mountain: FlyingStar,
  facing: FlyingStar
): DiagnosticAlert {
  const star = mountain === 8 || mountain === 9 ? mountain : facing;
  const name = star === 8 ? '八白左辅财星' : '九紫右弼喜庆星';

  return {
    id: `jixing-${palace}-${star}`,
    level: 'excellent',
    type: 'general',
    palace,
    title: `${palace}宫${name}`,
    description: `${palace}宫有${name}，主吉利喜庆`,
    severity: 15,
    impacts: {
      wealth: star === 8 ? '财运亨通，投资顺利' : undefined,
      general: star === 9 ? '喜事临门，婚嫁喜庆' : undefined,
    },
    remedies: {
      immediate: ['保持明亮', '可适当催旺'],
      shortTerm:
        star === 8
          ? ['放置招财物品', '保持流动能量']
          : ['使用红色装饰', '增加喜庆气氛'],
      longTerm: ['长期重点使用'],
    },
    items:
      star === 8
        ? ['招财树', '貔貅', '金蟾']
        : ['红色摆件', '鲜花', '喜庆装饰'],
    estimatedCost: { min: 200, max: 1500, currency: 'CNY' },
    urgency: 'low',
  };
}

function diagnoseShangshan(plate: EnhancedXuankongPlate): DiagnosticAlert {
  return {
    id: 'shangshan-xiashui',
    level: 'critical',
    type: 'shangshan_xiashui',
    palace: '中',
    title: '上山下水格局',
    description: '整体格局为上山下水，财丁两败，非常不利',
    severity: 90,
    impacts: {
      wealth: '严重破财，投资失败',
      health: '人丁不旺，健康受损',
      general: '整体运势低迷',
    },
    remedies: {
      immediate: ['全面化解', '请专业风水师勘察'],
      shortTerm: ['调整房间布局', '重新规划功能分区'],
      longTerm: ['考虑重大改造', '或择吉搬迁'],
    },
    estimatedCost: { min: 10000, max: 100000, currency: 'CNY' },
    urgency: 'immediate',
  };
}

function diagnoseWangshan(plate: EnhancedXuankongPlate): DiagnosticAlert {
  return {
    id: 'wangshan-wangshui',
    level: 'excellent',
    type: 'wangshan_wangshui',
    palace: '中',
    title: '旺山旺水格局',
    description: '整体格局为旺山旺水，财丁两旺，大吉之局',
    severity: 5,
    impacts: {
      general: '财丁两旺，事业兴旺，家运昌隆',
    },
    remedies: {
      immediate: ['充分利用', '保持最佳状态'],
      shortTerm: ['适当催旺', '长期维护'],
      longTerm: ['珍惜格局', '定期调整'],
    },
    estimatedCost: { min: 500, max: 5000, currency: 'CNY' },
    urgency: 'low',
  };
}

// ========== 辅助函数 ==========

function categorizeAlerts(alerts: DiagnosticAlert[]) {
  return {
    critical: alerts.filter((a) => a.level === 'critical'),
    warning: alerts.filter((a) => a.level === 'warning'),
    caution: alerts.filter((a) => a.level === 'caution'),
    good: alerts.filter((a) => a.level === 'good'),
    excellent: alerts.filter((a) => a.level === 'excellent'),
  };
}

function calculateStatistics(categorized: ReturnType<typeof categorizeAlerts>) {
  const allAlerts = [
    ...categorized.critical,
    ...categorized.warning,
    ...categorized.caution,
    ...categorized.good,
    ...categorized.excellent,
  ];

  const avgSeverity =
    allAlerts.length > 0
      ? allAlerts.reduce((sum, a) => sum + a.severity, 0) / allAlerts.length
      : 50;

  return {
    totalAlerts: allAlerts.length,
    criticalCount: categorized.critical.length,
    warningCount: categorized.warning.length,
    cautionCount: categorized.caution.length,
    avgSeverity: Math.round(avgSeverity),
  };
}

function generatePriorityActions(
  categorized: ReturnType<typeof categorizeAlerts>
) {
  return {
    now: categorized.critical.flatMap((a) => a.remedies.immediate).slice(0, 5),
    thisWeek: categorized.warning
      .flatMap((a) => a.remedies.immediate)
      .slice(0, 5),
    thisMonth: categorized.caution
      .flatMap((a) => a.remedies.shortTerm)
      .slice(0, 5),
    longTerm: [
      ...categorized.critical.flatMap((a) => a.remedies.longTerm),
      ...categorized.warning.flatMap((a) => a.remedies.longTerm),
    ].slice(0, 5),
  };
}

function generateOverallAssessment(
  overallScore: number,
  statistics: ReturnType<typeof calculateStatistics>
) {
  let level: AlertLevel;
  let rating: FortuneRating;

  if (overallScore >= 90) {
    level = 'excellent';
    rating = '大吉';
  } else if (overallScore >= 70) {
    level = 'good';
    rating = '吉';
  } else if (overallScore >= 50) {
    level = 'caution';
    rating = '平';
  } else if (overallScore >= 30) {
    level = 'warning';
    rating = '凶';
  } else {
    level = 'critical';
    rating = '大凶';
  }

  let summary = `综合评分${overallScore}分（${rating}），`;
  summary += `共发现${statistics.totalAlerts}个问题点，`;
  summary += `其中危险级${statistics.criticalCount}个，`;
  summary += `警告级${statistics.warningCount}个。`;

  return {
    score: overallScore,
    level,
    rating,
    summary,
  };
}
