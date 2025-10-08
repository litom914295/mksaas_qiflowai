import { Mountain, FlyingStar, Yun, PalaceIndex, Plate, ChengmenjueAnalysis } from './types';
import { getPalaceByMountain, PALACE_TO_BAGUA, BAGUA_TO_PALACE } from './luoshu';

/**
 * 城门诀算法实现
 * 
 * 城门诀是玄空飞星中的催旺秘法
 * 通过在特定位置开门、放水或进行其他动作来催旺财运或丁运
 * 主要原理是利用生旺之气的流通来增强吉星的力量
 */

// 城门诀的基本类型
export type ChengmenType = 'cai_men' | 'ding_men' | 'gui_men' | 'lu_men';
export type ChengmenMethod = 'kai_men' | 'fang_shui' | 'dong_zuo' | 'she_zhi';

// 城门诀规则接口
export interface ChengmenRule {
  period: Yun;
  triggerCondition: {
    zuo?: Mountain;
    xiang?: Mountain;
    starCombination?: {
      mountain?: FlyingStar;
      facing?: FlyingStar;
      period?: FlyingStar;
    };
  };
  chengmenPosition: PalaceIndex;
  chengmenType: ChengmenType;
  method: ChengmenMethod;
  effectiveness: 'high' | 'medium' | 'low';
  description: string;
  activationRequirements: string[];
  taboos: string[];
}

// 基础城门诀规则表
export const CHENGMEN_RULES: ChengmenRule[] = [
  // 八运城门诀规则
  {
    period: 8,
    triggerCondition: {
      starCombination: { facing: 8 }
    },
    chengmenPosition: 6,  // 乾宫
    chengmenType: 'cai_men',
    method: 'fang_shui',
    effectiveness: 'high',
    description: '八运向星到乾宫开财门',
    activationRequirements: ['在乾宫放置流动的水', '保持乾宫清洁整齐', '避免乾宫有阻挡'],
    taboos: ['不可在乾宫放置污秽物品', '不可在乾宫堆放杂物']
  },
  {
    period: 8,
    triggerCondition: {
      starCombination: { mountain: 8 }
    },
    chengmenPosition: 4,  // 巽宫
    chengmenType: 'ding_men',
    method: 'dong_zuo',
    effectiveness: 'high',
    description: '八运山星到巽宫开丁门',
    activationRequirements: ['在巽宫安排经常活动的空间', '可放置绿植或木制品', '保持巽宫光线充足'],
    taboos: ['不可在巽宫放置重物', '不可让巽宫过于阴暗']
  },
  
  // 九运城门诀规则
  {
    period: 9,
    triggerCondition: {
      starCombination: { facing: 9 }
    },
    chengmenPosition: 1,  // 坎宫
    chengmenType: 'cai_men',
    method: 'fang_shui',
    effectiveness: 'high',
    description: '九运向星到坎宫开财门',
    activationRequirements: ['在坎宫放置流动的水', '可设置鱼缸或水景', '保持水质清洁'],
    taboos: ['不可让水停滞不流', '不可让坎宫过于干燥']
  },
  {
    period: 9,
    triggerCondition: {
      starCombination: { mountain: 9 }
    },
    chengmenPosition: 3,  // 震宫
    chengmenType: 'ding_men',
    method: 'dong_zuo',
    effectiveness: 'high',
    description: '九运山星到震宫开丁门',
    activationRequirements: ['在震宫安排活动空间', '可放置音响设备', '适合作为家庭聚会场所'],
    taboos: ['不可让震宫过于安静', '不可在震宫放置尖锐物品']
  },
  
  // 七运城门诀规则（历史参考）
  {
    period: 7,
    triggerCondition: {
      starCombination: { facing: 7 }
    },
    chengmenPosition: 3,  // 震宫
    chengmenType: 'cai_men',
    method: 'dong_zuo',
    effectiveness: 'medium',
    description: '七运向星到震宫开财门',
    activationRequirements: ['在震宫安排动态活动', '可放置运动器材', '保持震宫活力'],
    taboos: ['不可让震宫过于安静', '不可在震宫放置阴性物品']
  },
  
  // 特殊组合城门诀
  {
    period: 8,
    triggerCondition: {
      starCombination: { mountain: 1, facing: 8 }
    },
    chengmenPosition: 7,  // 兑宫
    chengmenType: 'gui_men',
    method: 'she_zhi',
    effectiveness: 'medium',
    description: '一八组合兑宫开贵门',
    activationRequirements: ['在兑宫设置文昌用品', '可放置书籍或学习用品', '保持兑宫文雅'],
    taboos: ['不可在兑宫放置刀剑利器', '不可让兑宫过于嘈杂']
  }
];

// 动态识别城门位置
export function identifyChengmenPositions(
  plate: Plate,
  period: Yun,
  zuo: Mountain,
  xiang: Mountain
): {
  palace: PalaceIndex;
  rule: ChengmenRule;
  strength: number;  // 城门强度评分
}[] {
  const chengmenPositions: {
    palace: PalaceIndex;
    rule: ChengmenRule;
    strength: number;
  }[] = [];

  // 查找适用的城门诀规则
  const applicableRules = CHENGMEN_RULES.filter(rule => rule.period === period);
  
  for (const rule of applicableRules) {
    let isMatched = true;
    let strength = 0;
    
    // 检查触发条件
    if (rule.triggerCondition.zuo && rule.triggerCondition.zuo !== zuo) {
      isMatched = false;
    }
    if (rule.triggerCondition.xiang && rule.triggerCondition.xiang !== xiang) {
      isMatched = false;
    }
    
    // 检查星组合条件
    if (rule.triggerCondition.starCombination && isMatched) {
      const targetCell = plate.find(cell => cell.palace === rule.chengmenPosition);
      if (targetCell) {
        const { mountain, facing, period: periodStar } = rule.triggerCondition.starCombination;
        
        if (mountain && targetCell.mountainStar !== mountain) {
          if (facing || periodStar) {
            continue; // 如果还有其他条件，则继续检查
          } else {
            isMatched = false;
          }
        } else if (mountain && targetCell.mountainStar === mountain) {
          strength += 3;
        }
        
        if (facing && targetCell.facingStar !== facing) {
          if (mountain || periodStar) {
            continue; // 如果还有其他条件，则继续检查
          } else {
            isMatched = false;
          }
        } else if (facing && targetCell.facingStar === facing) {
          strength += 3;
        }
        
        if (periodStar && targetCell.periodStar !== periodStar) {
          if (mountain || facing) {
            continue; // 如果还有其他条件，则继续检查
          } else {
            isMatched = false;
          }
        } else if (periodStar && targetCell.periodStar === periodStar) {
          strength += 2;
        }
      }
    }
    
    if (isMatched) {
      // 根据当运星增加强度
      const targetCell = plate.find(cell => cell.palace === rule.chengmenPosition);
      if (targetCell) {
        // 当运星加分
        if (targetCell.periodStar === period || 
            targetCell.mountainStar === period || 
            targetCell.facingStar === period) {
          strength += 2;
        }
        
        // 生旺星加分
        const nextStar = (period % 9) + 1 as FlyingStar;
        if (targetCell.mountainStar === nextStar || targetCell.facingStar === nextStar) {
          strength += 1;
        }
      }
      
      // 根据效果级别调整强度
      switch (rule.effectiveness) {
        case 'high':
          strength += 3;
          break;
        case 'medium':
          strength += 2;
          break;
        case 'low':
          strength += 1;
          break;
      }
      
      chengmenPositions.push({
        palace: rule.chengmenPosition,
        rule,
        strength
      });
    }
  }
  
  // 按强度排序
  return chengmenPositions.sort((a, b) => b.strength - a.strength);
}

// 检查城门诀的特殊组合
export function checkSpecialChengmenCombinations(
  plate: Plate,
  period: Yun
): {
  combination: string;
  positions: PalaceIndex[];
  description: string;
  effectiveness: 'high' | 'medium' | 'low';
}[] {
  const specialCombinations: {
    combination: string;
    positions: PalaceIndex[];
    description: string;
    effectiveness: 'high' | 'medium' | 'low';
  }[] = [];

  // 检查"三般卦城门"
  const sanbanPositions = checkSanbanChengmen(plate, period);
  if (sanbanPositions.length > 0) {
    specialCombinations.push({
      combination: '三般卦城门',
      positions: sanbanPositions,
      description: '三般卦位形成城门，主大利财丁',
      effectiveness: 'high'
    });
  }
  
  // 检查"七星打劫城门"
  const qixingPositions = checkQixingDajieChengmen(plate, period);
  if (qixingPositions.length > 0) {
    specialCombinations.push({
      combination: '七星打劫城门',
      positions: qixingPositions,
      description: '七星打劫格局的城门，催财力量极强',
      effectiveness: 'high'
    });
  }
  
  // 检查"合十城门"
  const heshiPositions = checkHeshiChengmen(plate);
  if (heshiPositions.length > 0) {
    specialCombinations.push({
      combination: '合十城门',
      positions: heshiPositions,
      description: '山向合十的位置可作城门，主和谐发展',
      effectiveness: 'medium'
    });
  }

  return specialCombinations;
}

// 三般卦城门检查
function checkSanbanChengmen(plate: Plate, period: Yun): PalaceIndex[] {
  const sanbanPositions: PalaceIndex[] = [];
  
  // 三般卦：1,4,7 或 2,5,8 或 3,6,9
  const sanbanGroups = [
    [1, 4, 7],
    [2, 5, 8],
    [3, 6, 9]
  ];
  
  for (const cell of plate) {
    const stars = [cell.periodStar, cell.mountainStar, cell.facingStar].filter(Boolean) as FlyingStar[];
    
    for (const group of sanbanGroups) {
      if (stars.length >= 2 && stars.every(star => group.includes(star))) {
        sanbanPositions.push(cell.palace);
        break;
      }
    }
  }
  
  return sanbanPositions;
}

// 七星打劫城门检查
function checkQixingDajieChengmen(plate: Plate, period: Yun): PalaceIndex[] {
  const qixingPositions: PalaceIndex[] = [];
  
  // 七星打劫的特殊条件
  for (const cell of plate) {
    // 简化的七星打劫判断：山向星与运星形成特殊组合
    if (cell.mountainStar && cell.facingStar) {
      const sum = Number(cell.mountainStar) + Number(cell.facingStar);
      if (sum === 10 && (cell.mountainStar === period || cell.facingStar === period)) {
        qixingPositions.push(cell.palace);
      }
    }
  }
  
  return qixingPositions;
}

// 合十城门检查
function checkHeshiChengmen(plate: Plate): PalaceIndex[] {
  const heshiPositions: PalaceIndex[] = [];
  
  for (const cell of plate) {
    if (cell.mountainStar && cell.facingStar) {
      const sum = Number(cell.mountainStar) + Number(cell.facingStar);
      if (sum === 10) {
        heshiPositions.push(cell.palace);
      }
    }
  }
  
  return heshiPositions;
}

// 城门诀的催旺方法建议
export function generateChengmenActivationMethods(
  chengmenType: ChengmenType,
  method: ChengmenMethod,
  palace: PalaceIndex
): string[] {
  const bagua = PALACE_TO_BAGUA[palace];
  const methods: string[] = [];
  
  const baseMethodMap: Record<ChengmenMethod, string[]> = {
    'kai_men': [`在${bagua}宫开门或增加出入口`, '确保门的开合顺畅', '保持门口整洁明亮'],
    'fang_shui': [`在${bagua}宫放置流动的水`, '可设置鱼缸、水景或流水装置', '保持水质清洁'],
    'dong_zuo': [`在${bagua}宫安排经常活动的场所`, '可设置会客区或活动区域', '增加人气和动感'],
    'she_zhi': [`在${bagua}宫放置相应的风水用品`, '根据具体需求选择摆设', '定期检查和调整']
  };
  
  methods.push(...baseMethodMap[method]);
  
  // 根据城门类型添加特殊建议
  const typeSpecificMethods: Record<ChengmenType, string[]> = {
    'cai_men': ['重点催旺财运', '可放置财神摆件或招财植物', '保持该方位的清洁和光亮'],
    'ding_men': ['重点催旺人丁和健康', '可放置健康植物或家庭照片', '适合安排家庭聚会区域'],
    'gui_men': ['重点催旺贵人运和官运', '可放置文昌用品或学习用具', '保持该方位的文雅和整洁'],
    'lu_men': ['重点催旺事业和职位', '可放置事业相关的象征物品', '适合安排办公或学习区域']
  };
  
  methods.push(...typeSpecificMethods[chengmenType]);
  
  return methods;
}

// 城门诀的禁忌事项
export function generateChengmenTaboos(
  palace: PalaceIndex,
  chengmenType: ChengmenType
): string[] {
  const bagua = PALACE_TO_BAGUA[palace];
  const taboos: string[] = [
    `不可在${bagua}宫堆放杂物`,
    `避免${bagua}宫过于阴暗或潮湿`,
    `不可让${bagua}宫有破损或污秽`
  ];
  
  // 根据八卦方位添加特殊禁忌
  const baguaTaboos: Record<string, string[]> = {
    '坎': ['避免过度干燥', '不可放置火性物品'],
    '坤': ['避免过于动荡', '不可放置尖锐物品'],
    '震': ['避免过于安静', '不可放置重物压制'],
    '巽': ['避免阻挡通风', '不可放置金属利器'],
    '中': ['避免杂乱无章', '不可作为储物间'],
    '乾': ['避免污秽不净', '不可放置阴性物品'],
    '兑': ['避免嘈杂吵闹', '不可放置破损物品'],
    '艮': ['避免频繁移动', '不可放置不稳物品'],
    '离': ['避免过度阴暗', '不可放置水性太重的物品']
  };
  
  if (baguaTaboos[bagua]) {
    taboos.push(...baguaTaboos[bagua]);
  }
  
  return taboos;
}

// 完整的城门诀分析
export function analyzeChengmenjue(
  plate: Plate,
  period: Yun,
  zuo: Mountain,
  xiang: Mountain
): ChengmenjueAnalysis {
  const chengmenPositions = identifyChengmenPositions(plate, period, zuo, xiang);
  const specialCombinations = checkSpecialChengmenCombinations(plate, period);
  
  const analysis: ChengmenjueAnalysis = {
    hasChengmen: chengmenPositions.length > 0 || specialCombinations.length > 0,
    chengmenPositions: [],
    activationMethods: [],
    taboos: []
  };
  
  // 处理常规城门位置
  for (const position of chengmenPositions) {
    const bagua = PALACE_TO_BAGUA[position.palace];
    analysis.chengmenPositions.push({
      palace: position.palace,
      description: `${bagua}宫：${position.rule.description}（强度：${position.strength}）`,
      effectiveness: position.rule.effectiveness
    });
    
    const methods = generateChengmenActivationMethods(
      position.rule.chengmenType,
      position.rule.method,
      position.palace
    );
    analysis.activationMethods.push(...methods);
    
    const taboos = generateChengmenTaboos(position.palace, position.rule.chengmenType);
    analysis.taboos.push(...taboos);
  }
  
  // 处理特殊组合城门
  for (const combination of specialCombinations) {
    for (const palace of combination.positions) {
      const bagua = PALACE_TO_BAGUA[palace];
      analysis.chengmenPositions.push({
        palace,
        description: `${bagua}宫：${combination.combination}（${combination.description}）`,
        effectiveness: combination.effectiveness
      });
    }
  }
  
  // 去重
  analysis.activationMethods = [...new Set(analysis.activationMethods)];
  analysis.taboos = [...new Set(analysis.taboos)];
  
  return analysis;
}

// 城门诀的时效性分析
export function analyzeChengmenTimeline(
  plate: Plate,
  period: Yun,
  targetYear: number
): {
  currentEffectiveness: 'peak' | 'good' | 'declining' | 'ineffective';
  remainingYears: number;
  transitionAdvice: string[];
} {
  const periodStartYear = 1864 + (period - 1) * 20;
  const periodEndYear = periodStartYear + 19;
  const currentYear = new Date().getFullYear();
  
  let effectiveness: 'peak' | 'good' | 'declining' | 'ineffective';
  const transitionAdvice: string[] = [];
  
  const yearsInPeriod = currentYear - periodStartYear;
  const remainingYears = periodEndYear - currentYear;
  
  if (yearsInPeriod <= 5) {
    effectiveness = 'peak';
    transitionAdvice.push('当前处于运的前期，城门诀效果最佳');
  } else if (yearsInPeriod <= 15) {
    effectiveness = 'good';
    transitionAdvice.push('当前处于运的中期，城门诀效果良好');
  } else if (remainingYears > 0) {
    effectiveness = 'declining';
    transitionAdvice.push('当前处于运的后期，城门诀效果开始减弱');
    transitionAdvice.push('建议提前准备下一运的布局调整');
  } else {
    effectiveness = 'ineffective';
    transitionAdvice.push('当前运已结束，需要重新布局城门诀');
  }
  
  return {
    currentEffectiveness: effectiveness,
    remainingYears: Math.max(0, remainingYears),
    transitionAdvice
  };
}

// 城门诀实用原则
export const CHENGMEN_PRINCIPLES = {
  basic: [
    '城门一诀最为良，能使贫者立富强',
    '城门诀重在得水得气，不在形式',
    '城门位必须清洁整齐，不可杂乱',
    '城门诀需配合当运，过运则失效'
  ],
  advanced: [
    '城门诀贵在巧用，不可生搬硬套',
    '城门位的开启需要渐进，不可急进',
    '城门诀需要定期维护和调整',
    '特殊格局的城门诀威力更强'
  ],
  timing: [
    '运的前五年是城门诀的黄金期',
    '运的中期城门诀依然有效',
    '运的后期需要谨慎使用城门诀',
    '换运前需要提前调整城门布局'
  ]
};