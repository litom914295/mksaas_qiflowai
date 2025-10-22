/**
 * 玄空飞星分级化解方案生成器 (v6.0)
 *
 * 五级化解方案：
 * - 基础级：低成本简易化解（100-500元）
 * - 标准级：常规完整化解（500-2000元）
 * - 高级级：专业深度化解（2000-5000元）
 * - 大师级：大师级定制化解（5000-20000元）
 * - 终极级：终极全面改造（20000元以上）
 */

import type { EnhancedXuankongPlate, FlyingStar, PalaceName } from './types';

import type {
  AlertLevel,
  DiagnosticAlert,
  DiagnosticReport,
} from './diagnostic-system';

// 化解级别
export type RemedyLevel =
  | 'basic'
  | 'standard'
  | 'advanced'
  | 'master'
  | 'ultimate';

// 化解物品
export interface RemedyItem {
  name: string;
  description: string;
  placement: string;
  quantity: number;
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
  };
  alternatives?: string[];
  image?: string;
  purchaseLinks?: string[];
}

// 化解步骤
export interface RemedyStep {
  stepNumber: number;
  title: string;
  description: string;
  duration: string;
  precautions: string[];
  result: string;
}

// 化解方案
export interface RemedyPlan {
  id: string;
  level: RemedyLevel;
  alert: DiagnosticAlert;

  // 方案概述
  overview: {
    title: string;
    description: string;
    suitableFor: string[];
    duration: string;
    effectiveness: string;
  };

  // 物品清单
  items: RemedyItem[];

  // 实施步骤
  steps: RemedyStep[];

  // 费用估算
  totalCost: {
    items: number;
    labor?: number;
    total: number;
    currency: string;
  };

  // 注意事项
  precautions: string[];

  // 预期效果
  expectedOutcome: string;

  // 有效期
  validityPeriod: string;

  // 维护建议
  maintenance: string[];
}

// 综合化解方案
export interface ComprehensiveRemedyPlan {
  // 整体方案
  overall: {
    title: string;
    description: string;
    priority: 'immediate' | 'high' | 'medium' | 'low';
    estimatedDuration: string;
    totalBudget: {
      min: number;
      max: number;
      currency: string;
    };
  };

  // 分级方案
  plans: {
    basic: RemedyPlan[];
    standard: RemedyPlan[];
    advanced: RemedyPlan[];
    master: RemedyPlan[];
    ultimate: RemedyPlan[];
  };

  // 实施时间线
  timeline: {
    phase: string;
    duration: string;
    tasks: string[];
    budget: number;
  }[];

  // 专家建议
  expertAdvice: string[];

  // 生成时间
  generatedAt: Date;
}

/**
 * 生成综合化解方案
 */
export function generateComprehensiveRemedyPlans(
  plate: EnhancedXuankongPlate,
  diagnosticReport: DiagnosticReport,
  options: {
    maxBudget?: number;
    preferredLevel?: RemedyLevel;
    focusAreas?: ('health' | 'wealth' | 'career' | 'relationship')[];
  } = {}
): ComprehensiveRemedyPlan {
  const allAlerts = [
    ...diagnosticReport.alerts.critical,
    ...diagnosticReport.alerts.warning,
    ...diagnosticReport.alerts.caution,
  ];

  // 为每个预警生成五级方案
  const basicPlans: RemedyPlan[] = [];
  const standardPlans: RemedyPlan[] = [];
  const advancedPlans: RemedyPlan[] = [];
  const masterPlans: RemedyPlan[] = [];
  const ultimatePlans: RemedyPlan[] = [];

  allAlerts.forEach((alert) => {
    basicPlans.push(generateBasicPlan(alert));
    standardPlans.push(generateStandardPlan(alert));
    advancedPlans.push(generateAdvancedPlan(alert));
    masterPlans.push(generateMasterPlan(alert));
    ultimatePlans.push(generateUltimatePlan(alert));
  });

  // 计算总预算
  const calculateBudget = (plans: RemedyPlan[]) => {
    const total = plans.reduce((sum, p) => sum + p.totalCost.total, 0);
    return total;
  };

  const budgets = {
    basic: calculateBudget(basicPlans),
    standard: calculateBudget(standardPlans),
    advanced: calculateBudget(advancedPlans),
    master: calculateBudget(masterPlans),
    ultimate: calculateBudget(ultimatePlans),
  };

  // 生成时间线
  const timeline = generateTimeline(
    allAlerts,
    options.preferredLevel || 'standard'
  );

  // 专家建议
  const expertAdvice = generateExpertAdvice(plate, diagnosticReport);

  return {
    overall: {
      title: '玄空飞星综合化解方案',
      description: `针对当前${plate.period}运格局，共${allAlerts.length}个问题点的全面化解方案`,
      priority:
        diagnosticReport.statistics.criticalCount > 0 ? 'immediate' : 'high',
      estimatedDuration: calculateDuration(allAlerts.length),
      totalBudget: {
        min: budgets.basic,
        max: budgets.ultimate,
        currency: 'CNY',
      },
    },
    plans: {
      basic: basicPlans,
      standard: standardPlans,
      advanced: advancedPlans,
      master: masterPlans,
      ultimate: ultimatePlans,
    },
    timeline,
    expertAdvice,
    generatedAt: new Date(),
  };
}

// ========== 方案生成函数 ==========

/**
 * 基础级化解方案（100-500元）
 */
function generateBasicPlan(alert: DiagnosticAlert): RemedyPlan {
  const items: RemedyItem[] = [];
  const steps: RemedyStep[] = [];

  if (alert.type === 'wuhuang') {
    items.push({
      name: '六帝钱挂件',
      description: '顺治、康熙、雍正、乾隆、嘉庆、道光六位皇帝的铜钱',
      placement: `挂于${alert.palace}宫位置或门上`,
      quantity: 1,
      estimatedCost: { min: 50, max: 200, currency: 'CNY' },
      alternatives: ['五帝钱', '铜铃'],
    });

    items.push({
      name: '铜铃小挂件',
      description: '纯铜制小铃铛，可发出清脆声音',
      placement: `悬挂于${alert.palace}宫窗户或门框`,
      quantity: 2,
      estimatedCost: { min: 30, max: 100, currency: 'CNY' },
      alternatives: ['风铃'],
    });

    steps.push({
      stepNumber: 1,
      title: '清洁准备',
      description: `彻底清洁${alert.palace}宫区域，移除杂物`,
      duration: '30分钟',
      precautions: ['保持通风', '选择吉日进行'],
      result: '区域干净整洁，气场清爽',
    });

    steps.push({
      stepNumber: 2,
      title: '安置化解物品',
      description: '按照方位放置六帝钱和铜铃',
      duration: '15分钟',
      precautions: ['保持恭敬心态', '避免喧哗'],
      result: '化解物品就位，开始发挥作用',
    });

    steps.push({
      stepNumber: 3,
      title: '日常维护',
      description: '每周擦拭一次化解物品，保持光洁',
      duration: '持续',
      precautions: ['使用干净软布', '避免水洗'],
      result: '长期保持化解效果',
    });
  } else if (alert.type === 'erhei') {
    items.push({
      name: '小铜葫芦',
      description: '纯铜葫芦摆件（高度8-10cm）',
      placement: `放置于${alert.palace}宫书桌或柜子上`,
      quantity: 1,
      estimatedCost: { min: 40, max: 150, currency: 'CNY' },
      alternatives: ['铜铃', '六帝钱'],
    });

    steps.push({
      stepNumber: 1,
      title: '清洁并保持通风',
      description: `彻底清洁${alert.palace}宫，打开窗户通风`,
      duration: '1小时',
      precautions: ['选择晴天', '避免阴雨天'],
      result: '空气清新，病气消散',
    });

    steps.push({
      stepNumber: 2,
      title: '摆放铜葫芦',
      description: '将铜葫芦放置在适当位置',
      duration: '5分钟',
      precautions: ['葫芦口朝上', '位置稳定'],
      result: '开始吸收病气',
    });
  } else if (alert.type === 'sanbi') {
    items.push({
      name: '红色摆件',
      description: '红色陶瓷或水晶摆件',
      placement: `放置于${alert.palace}宫显眼位置`,
      quantity: 1,
      estimatedCost: { min: 50, max: 200, currency: 'CNY' },
      alternatives: ['粉晶球', '红色台灯'],
    });

    steps.push({
      stepNumber: 1,
      title: '营造和谐氛围',
      description: `在${alert.palace}宫播放轻音乐，摆放鲜花`,
      duration: '持续',
      precautions: ['选择舒缓音乐', '定期更换鲜花'],
      result: '气氛和谐，减少冲突',
    });

    steps.push({
      stepNumber: 2,
      title: '放置红色化解物',
      description: '摆放红色装饰品',
      duration: '10分钟',
      precautions: ['颜色鲜艳', '形状圆润'],
      result: '火克木，化解是非',
    });
  }

  // 默认步骤（如果上面没有覆盖）
  if (steps.length === 0) {
    steps.push({
      stepNumber: 1,
      title: '清洁整理',
      description: `清洁${alert.palace}宫区域`,
      duration: '30分钟',
      precautions: ['保持通风'],
      result: '环境整洁',
    });

    steps.push({
      stepNumber: 2,
      title: '放置化解物品',
      description: '根据煞气类型放置相应物品',
      duration: '15分钟',
      precautions: ['选择吉日'],
      result: '化解生效',
    });
  }

  const totalCost = items.reduce(
    (sum, item) => sum + (item.estimatedCost.min + item.estimatedCost.max) / 2,
    0
  );

  return {
    id: `basic-${alert.id}`,
    level: 'basic',
    alert,
    overview: {
      title: `${alert.title}基础化解方案`,
      description: '简单经济的入门级化解方案，适合预算有限的情况',
      suitableFor: ['预算有限', '租房族', '快速临时化解'],
      duration: '1-2小时',
      effectiveness: '40-60%化解效果',
    },
    items,
    steps,
    totalCost: {
      items: totalCost,
      total: totalCost,
      currency: 'CNY',
    },
    precautions: [
      '物品必须是真品，避免塑料或假货',
      '保持化解物品清洁',
      '定期检查是否位移',
      '若效果不明显，考虑升级方案',
    ],
    expectedOutcome: '减轻不良影响，维持基本平稳',
    validityPeriod: '1-3年，需定期维护',
    maintenance: [
      '每周擦拭一次化解物品',
      '每月检查位置是否正确',
      '流年变化时重新评估',
    ],
  };
}

/**
 * 标准级化解方案（500-2000元）
 */
function generateStandardPlan(alert: DiagnosticAlert): RemedyPlan {
  const items: RemedyItem[] = [];
  const steps: RemedyStep[] = [];

  if (alert.type === 'wuhuang') {
    items.push({
      name: '大型铜风铃',
      description: '纯铜风铃（直径15cm以上，带6-8根铜管）',
      placement: `悬挂于${alert.palace}宫天花板或窗户`,
      quantity: 1,
      estimatedCost: { min: 300, max: 800, currency: 'CNY' },
    });

    items.push({
      name: '真品六帝钱（完整串）',
      description: '顺治→乾隆六位皇帝真品铜钱，带红绳串联',
      placement: `挂于${alert.palace}宫入口或窗户`,
      quantity: 1,
      estimatedCost: { min: 200, max: 600, currency: 'CNY' },
    });

    items.push({
      name: '铜葫芦（大号）',
      description: '纯铜葫芦（高度15-20cm）',
      placement: `放置于${alert.palace}宫地面或矮柜上`,
      quantity: 2,
      estimatedCost: { min: 150, max: 400, currency: 'CNY' },
    });

    steps.push({
      stepNumber: 1,
      title: '选择吉日',
      description: '查阅黄历，选择适合化煞的吉日吉时',
      duration: '1天准备',
      precautions: ['避开个人冲煞日', '选择天德、月德日更佳'],
      result: '时机得当，事半功倍',
    });

    steps.push({
      stepNumber: 2,
      title: '深度清洁与净化',
      description: `彻底清洁${alert.palace}宫，使用香薰或檀香净化空间`,
      duration: '2小时',
      precautions: ['保持通风', '避免烟雾过浓'],
      result: '空间净化，负能量清除',
    });

    steps.push({
      stepNumber: 3,
      title: '化解物品安置',
      description: '按照风水方位准确放置所有化解物品',
      duration: '1小时',
      precautions: ['使用罗盘精确定位', '保持恭敬心态'],
      result: '化解阵法形成',
    });

    steps.push({
      stepNumber: 4,
      title: '诵经加持（可选）',
      description: '播放或诵读《心经》《大悲咒》等佛经',
      duration: '30分钟',
      precautions: ['保持安静', '心诚则灵'],
      result: '增强化解效果',
    });

    steps.push({
      stepNumber: 5,
      title: '定期维护',
      description: '每月清洁化解物品，每季度检查效果',
      duration: '持续',
      precautions: ['保持光洁', '位置不可随意移动'],
      result: '长期稳定化解',
    });
  } else if (alert.type === 'erhei') {
    items.push({
      name: '开光铜葫芦（特大号）',
      description: '纯铜葫芦（高度20-25cm），经过寺庙开光',
      placement: `放置于${alert.palace}宫中心位置`,
      quantity: 1,
      estimatedCost: { min: 300, max: 800, currency: 'CNY' },
    });

    items.push({
      name: '白水晶簇',
      description: '天然白水晶簇（重量1-2kg）',
      placement: `放置于${alert.palace}宫书桌或床头柜`,
      quantity: 1,
      estimatedCost: { min: 200, max: 600, currency: 'CNY' },
    });

    items.push({
      name: '五行盐灯',
      description: '喜马拉雅粉盐灯（重量2-3kg）',
      placement: `放置于${alert.palace}宫角落，插电使用`,
      quantity: 1,
      estimatedCost: { min: 150, max: 400, currency: 'CNY' },
    });

    steps.push({
      stepNumber: 1,
      title: '选择吉日净化',
      description: '选择适合化解病符的吉日，深度清洁空间',
      duration: '半天',
      precautions: ['避开病符加临日', '使用艾草或檀香净化'],
      result: '病气消散',
    });

    steps.push({
      stepNumber: 2,
      title: '摆放化解阵法',
      description: '按照金生水、水润土的五行原理布置',
      duration: '1小时',
      precautions: ['铜葫芦居中', '水晶和盐灯辅助'],
      result: '化解阵法启动',
    });

    steps.push({
      stepNumber: 3,
      title: '增加光照与通风',
      description: '保持该区域明亮通风，盐灯每天开启4-6小时',
      duration: '持续',
      precautions: ['避免潮湿', '定期通风'],
      result: '病气无法聚集',
    });

    steps.push({
      stepNumber: 4,
      title: '定期净化水晶',
      description: '每月满月时将水晶放在月光下净化',
      duration: '持续',
      precautions: ['避免阳光直射', '清水冲洗后晾干'],
      result: '保持化解效果',
    });
  }

  // 默认标准方案
  if (steps.length === 0) {
    items.push({
      name: '标准化解套装',
      description: '根据煞气类型配置的专业化解物品',
      placement: `${alert.palace}宫适当位置`,
      quantity: 1,
      estimatedCost: { min: 500, max: 1500, currency: 'CNY' },
    });

    steps.push({
      stepNumber: 1,
      title: '专业勘察',
      description: '现场勘察确定最佳化解方案',
      duration: '1-2小时',
      precautions: ['请专业人士', '测量准确'],
      result: '方案精准',
    });

    steps.push({
      stepNumber: 2,
      title: '实施化解',
      description: '按照专业方案实施',
      duration: '2-3小时',
      precautions: ['选择吉日', '严格按方案执行'],
      result: '化解到位',
    });

    steps.push({
      stepNumber: 3,
      title: '定期维护',
      description: '按照维护计划执行',
      duration: '持续',
      precautions: ['记录维护日期', '及时调整'],
      result: '效果持久',
    });
  }

  const itemsCost = items.reduce(
    (sum, item) => sum + (item.estimatedCost.min + item.estimatedCost.max) / 2,
    0
  );
  const laborCost = 300;

  return {
    id: `standard-${alert.id}`,
    level: 'standard',
    alert,
    overview: {
      title: `${alert.title}标准化解方案`,
      description: '完整专业的化解方案，包含多种化解物品和详细步骤',
      suitableFor: ['自住房产', '长期居住', '追求稳定效果'],
      duration: '半天到1天',
      effectiveness: '70-85%化解效果',
    },
    items,
    steps,
    totalCost: {
      items: itemsCost,
      labor: laborCost,
      total: itemsCost + laborCost,
      currency: 'CNY',
    },
    precautions: [
      '所有物品必须是真品',
      '安置时使用罗盘精确定位',
      '定期维护和净化',
      '流年变化时加强化解',
      '若家人有不适反应，立即调整',
    ],
    expectedOutcome: '大幅减轻不良影响，运势明显改善',
    validityPeriod: '3-5年，需定期维护',
    maintenance: [
      '每月清洁所有化解物品',
      '每季度检查位置和效果',
      '每年流年变化时重新评估',
      '水晶类每月满月净化一次',
    ],
  };
}

/**
 * 高级级化解方案（2000-5000元）
 */
function generateAdvancedPlan(alert: DiagnosticAlert): RemedyPlan {
  return {
    id: `advanced-${alert.id}`,
    level: 'advanced',
    alert,
    overview: {
      title: `${alert.title}高级化解方案`,
      description: '专业深度化解方案，由资深风水师指导实施',
      suitableFor: ['高档住宅', '企业办公', '追求最佳效果'],
      duration: '1-2天',
      effectiveness: '85-95%化解效果',
    },
    items: [
      {
        name: '定制化解阵法',
        description: '根据具体情况定制的专业化解布局',
        placement: `${alert.palace}宫及周边区域`,
        quantity: 1,
        estimatedCost: { min: 2000, max: 4000, currency: 'CNY' },
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '专业风水师现场勘察',
        description: '资深风水师上门详细勘察',
        duration: '2-3小时',
        precautions: ['提供准确户型图', '说明居住情况'],
        result: '精准诊断',
      },
      {
        stepNumber: 2,
        title: '定制化解方案',
        description: '根据实际情况制定专属方案',
        duration: '1-2天',
        precautions: ['充分沟通', '确认方案细节'],
        result: '方案完美契合',
      },
      {
        stepNumber: 3,
        title: '专业实施',
        description: '由专业团队实施化解',
        duration: '1天',
        precautions: ['选择最吉日期', '全程监督'],
        result: '化解到位',
      },
      {
        stepNumber: 4,
        title: '开光加持',
        description: '邀请高僧或道士开光加持',
        duration: '1-2小时',
        precautions: ['心诚则灵', '保持恭敬'],
        result: '效力倍增',
      },
      {
        stepNumber: 5,
        title: '后续跟踪服务',
        description: '风水师提供一年跟踪指导',
        duration: '1年',
        precautions: ['及时反馈情况', '遵循调整建议'],
        result: '持续优化',
      },
    ],
    totalCost: {
      items: 3000,
      labor: 1500,
      total: 4500,
      currency: 'CNY',
    },
    precautions: [
      '选择资质齐全的专业风水师',
      '化解物品必须由风水师指定',
      '严格按照方案和时间实施',
      '定期接受风水师指导',
    ],
    expectedOutcome: '全面化解不良影响，运势大幅提升',
    validityPeriod: '5-10年，有专业维护',
    maintenance: [
      '风水师每季度上门检查',
      '流年变化时及时调整',
      '重大变动时咨询风水师',
    ],
  };
}

/**
 * 大师级化解方案（5000-20000元）
 */
function generateMasterPlan(alert: DiagnosticAlert): RemedyPlan {
  return {
    id: `master-${alert.id}`,
    level: 'master',
    alert,
    overview: {
      title: `${alert.title}大师级定制方案`,
      description: '顶级风水大师亲自操刀，深度定制化解',
      suitableFor: ['豪宅别墅', '企业总部', '追求完美'],
      duration: '3-7天',
      effectiveness: '95-98%化解效果',
    },
    items: [
      {
        name: '大师定制化解阵',
        description: '风水大师亲自设计的独特化解布局',
        placement: '全屋布局',
        quantity: 1,
        estimatedCost: { min: 8000, max: 18000, currency: 'CNY' },
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '风水大师多次勘察',
        description: '顶级风水大师多次上门，全面勘察',
        duration: '3-5次，每次3-4小时',
        precautions: ['提供详细资料', '充分配合'],
        result: '精准掌握所有细节',
      },
      {
        stepNumber: 2,
        title: '大师级方案设计',
        description: '大师亲自设计独一无二的化解方案',
        duration: '1-2周',
        precautions: ['耐心等待', '信任大师'],
        result: '方案完美无瑕',
      },
      {
        stepNumber: 3,
        title: '定制化解法器',
        description: '定制专属化解法器和摆件',
        duration: '2-4周',
        precautions: ['使用上等材料', '严格监制'],
        result: '法器独特有效',
      },
      {
        stepNumber: 4,
        title: '择吉日实施',
        description: '大师亲自择定最吉日时，现场指导实施',
        duration: '1-2天',
        precautions: ['务必在指定时间', '全程配合'],
        result: '化解完美实施',
      },
      {
        stepNumber: 5,
        title: '高规格开光仪式',
        description: '邀请知名寺庙或道观举行开光法会',
        duration: '半天',
        precautions: ['保持虔诚', '遵守仪轨'],
        result: '法力加持',
      },
      {
        stepNumber: 6,
        title: '终身VIP服务',
        description: '大师提供终身咨询和调整服务',
        duration: '终身',
        precautions: ['保持联系', '定期沟通'],
        result: '永续优化',
      },
    ],
    totalCost: {
      items: 12000,
      labor: 5000,
      total: 17000,
      currency: 'CNY',
    },
    precautions: [
      '选择真正的风水大师（需验证资质和口碑）',
      '化解过程严格保密',
      '严格遵守大师所有指示',
      '定期向大师汇报效果',
    ],
    expectedOutcome: '彻底化解不良影响，运势质的飞跃',
    validityPeriod: '10-20年，终身维护',
    maintenance: [
      '大师每年亲自上门检查',
      '流年变化提前预警和调整',
      '终身享受大师咨询服务',
    ],
  };
}

/**
 * 终极级化解方案（20000元以上）
 */
function generateUltimatePlan(alert: DiagnosticAlert): RemedyPlan {
  return {
    id: `ultimate-${alert.id}`,
    level: 'ultimate',
    alert,
    overview: {
      title: `${alert.title}终极全面改造`,
      description: '涉及建筑结构改造的终极解决方案',
      suitableFor: ['新建或大装修', '不计成本追求完美'],
      duration: '1-6个月',
      effectiveness: '99%以上化解效果',
    },
    items: [
      {
        name: '建筑结构优化',
        description: '调整建筑格局，从根本上化解煞气',
        placement: '全屋',
        quantity: 1,
        estimatedCost: { min: 50000, max: 500000, currency: 'CNY' },
      },
    ],
    steps: [
      {
        stepNumber: 1,
        title: '顶级大师团队勘察',
        description: '多位顶级风水大师联合勘察',
        duration: '1-2周',
        precautions: ['提供所有设计图纸', '充分配合'],
        result: '全方位诊断',
      },
      {
        stepNumber: 2,
        title: '结构改造方案设计',
        description: '设计师和风水师联合制定改造方案',
        duration: '1-2个月',
        precautions: ['确保结构安全', '兼顾美观和风水'],
        result: '完美方案',
      },
      {
        stepNumber: 3,
        title: '专业施工团队实施',
        description: '由专业施工队伍进行改造',
        duration: '1-6个月',
        precautions: ['严格监督', '确保质量'],
        result: '彻底改造',
      },
      {
        stepNumber: 4,
        title: '顶级风水布局',
        description: '大师亲自布置全屋风水格局',
        duration: '1-2周',
        precautions: ['使用顶级材料', '精确定位'],
        result: '格局完美',
      },
      {
        stepNumber: 5,
        title: '盛大开光法会',
        description: '举行盛大开光祈福法会',
        duration: '1天',
        precautions: ['邀请贵宾', '隆重举行'],
        result: '气场圆满',
      },
    ],
    totalCost: {
      items: 200000,
      labor: 50000,
      total: 250000,
      currency: 'CNY',
    },
    precautions: [
      '需获得相关部门审批',
      '确保结构改造安全',
      '聘请顶级专业团队',
      '预算充足，量力而行',
    ],
    expectedOutcome: '从根本上化解所有问题，打造完美风水格局',
    validityPeriod: '永久有效',
    maintenance: ['大师团队定期巡检', '终身VIP服务', '子孙后代永续受益'],
  };
}

// ========== 辅助函数 ==========

function generateTimeline(
  alerts: DiagnosticAlert[],
  level: RemedyLevel
): ComprehensiveRemedyPlan['timeline'] {
  const timeline: ComprehensiveRemedyPlan['timeline'] = [];

  const critical = alerts.filter((a) => a.level === 'critical');
  const warning = alerts.filter((a) => a.level === 'warning');
  const caution = alerts.filter((a) => a.level === 'caution');

  if (critical.length > 0) {
    timeline.push({
      phase: '第一阶段：紧急化解（立即执行）',
      duration: '1-3天',
      tasks: critical.map((a) => `化解${a.title}`),
      budget:
        critical.length *
        (level === 'basic' ? 300 : level === 'standard' ? 1200 : 4000),
    });
  }

  if (warning.length > 0) {
    timeline.push({
      phase: '第二阶段：重点化解（本周内）',
      duration: '1周',
      tasks: warning.map((a) => `化解${a.title}`),
      budget:
        warning.length *
        (level === 'basic' ? 250 : level === 'standard' ? 1000 : 3500),
    });
  }

  if (caution.length > 0) {
    timeline.push({
      phase: '第三阶段：全面优化（本月内）',
      duration: '1个月',
      tasks: caution.map((a) => `化解${a.title}`),
      budget:
        caution.length *
        (level === 'basic' ? 200 : level === 'standard' ? 800 : 3000),
    });
  }

  timeline.push({
    phase: '第四阶段：长期维护',
    duration: '持续',
    tasks: ['定期检查', '流年调整', '效果评估'],
    budget: level === 'basic' ? 500 : level === 'standard' ? 2000 : 5000,
  });

  return timeline;
}

function generateExpertAdvice(
  plate: EnhancedXuankongPlate,
  report: DiagnosticReport
): string[] {
  const advice: string[] = [];

  advice.push(`您的住宅为${plate.period}运格局，${report.overall.rating}。`);

  if (report.statistics.criticalCount > 0) {
    advice.push(
      `发现${report.statistics.criticalCount}个危险级问题，必须立即处理！`
    );
    advice.push('建议至少选择【标准级】化解方案，危险问题不可小觑。');
  }

  if (plate.specialPatterns.includes('上山下水')) {
    advice.push(
      '上山下水格局非常不利，建议选择【高级】以上方案，或考虑重大改造。'
    );
  } else if (plate.specialPatterns.includes('旺山旺水')) {
    advice.push('旺山旺水格局极佳，只需针对性化解个别问题，整体保持即可。');
  }

  advice.push('化解风水是一个系统工程，不可急于求成，需要耐心和坚持。');
  advice.push(
    '所有化解物品必须使用真品，假货或劣质品不仅无效，反而可能带来反作用。'
  );
  advice.push('化解后需要定期维护，保持化解物品的清洁和能量。');
  advice.push('流年变化会影响化解效果，建议每年请专业人士复查一次。');
  advice.push('化解风水只是改善环境的手段，还需结合个人努力和积德行善。');

  return advice;
}

function calculateDuration(problemCount: number): string {
  if (problemCount === 1) return '1-2天';
  if (problemCount <= 3) return '3-7天';
  if (problemCount <= 5) return '1-2周';
  return '2-4周';
}
