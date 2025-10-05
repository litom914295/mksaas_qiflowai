/**
 * QiFlow AI - 八字格局分析系统
 *
 * 基于传统命理学经典理论的格局分析引擎
 * 实现《滴天髓》《穷通宝鉴》等权威典籍的格局判断方法
 *
 * 核心功能：
 * 1. 正格（八格）分析：正官、偏官、正财、偏财、食神、伤官、正印、偏印
 * 2. 从格分析：从财、从官、从儿、从势、从化
 * 3. 化格分析：化印、化伤、化财、化官、化比
 * 4. 特殊格局：曲直、炎上、润下、从革、稼穑等
 */

import type { Branch, FiveElement, Pillars, Stem } from './types';

// 十神枚举
export type TenGod =
  | '比肩'
  | '劫财' // 比劫
  | '食神'
  | '伤官' // 食伤
  | '偏财'
  | '正财' // 财星
  | '偏官'
  | '正官' // 官杀
  | '偏印'
  | '正印'; // 印星

// 格局类型
export type PatternType =
  | 'standard' // 正格
  | 'follow' // 从格
  | 'transform' // 化格
  | 'special'; // 特殊格局

// 格局强度
export type PatternStrength = 'strong' | 'medium' | 'weak';

// 格局纯度
export type PatternPurity = 'pure' | 'mixed' | 'broken';

// 格局分析结果
export interface PatternAnalysis {
  // 基础格局信息
  primaryPattern: string;
  patternType: PatternType;
  strength: PatternStrength;
  purity: PatternPurity;

  // 格局成败
  isValid: boolean;
  formation: string[]; // 成格条件
  destruction: string[]; // 破格因素

  // 详细分析
  monthlyOrder: {
    element: FiveElement;
    god: TenGod;
    isTransparent: boolean; // 是否透干
    rootStrength: number; // 月令根气强度
  };

  // 用神分析
  usefulGod: {
    primary: TenGod[];
    secondary: TenGod[];
    avoidance: TenGod[];
    explanation: string;
  };

  // 格局特征
  characteristics: string[];

  // 理论依据
  theoretical: {
    classic: string; // 经典出处
    principle: string; // 判断原理
    confidence: number; // 判断置信度 0-100
  };

  // 调候用神
  seasonalAdjustment?: {
    needed: boolean;
    element: FiveElement;
    reason: string;
  };
}

// 天干五行映射
const STEM_ELEMENTS: Record<string, FiveElement> = {
  甲: '木',
  乙: '木',
  丙: '火',
  丁: '火',
  戊: '土',
  己: '土',
  庚: '金',
  辛: '金',
  壬: '水',
  癸: '水',
};

// 地支五行映射（主气）
const BRANCH_ELEMENTS: Record<string, FiveElement> = {
  子: '水',
  亥: '水',
  寅: '木',
  卯: '木',
  巳: '火',
  午: '火',
  申: '金',
  酉: '金',
  丑: '土',
  辰: '土',
  未: '土',
  戌: '土',
};

// 地支藏干系统（详细版本）
const BRANCH_HIDDEN_STEMS: Record<
  string,
  Array<{ stem: string; strength: number }>
> = {
  子: [{ stem: '癸', strength: 1.0 }],
  丑: [
    { stem: '己', strength: 0.6 },
    { stem: '癸', strength: 0.2 },
    { stem: '辛', strength: 0.2 },
  ],
  寅: [
    { stem: '甲', strength: 0.6 },
    { stem: '丙', strength: 0.2 },
    { stem: '戊', strength: 0.2 },
  ],
  卯: [{ stem: '乙', strength: 1.0 }],
  辰: [
    { stem: '戊', strength: 0.6 },
    { stem: '乙', strength: 0.2 },
    { stem: '癸', strength: 0.2 },
  ],
  巳: [
    { stem: '丙', strength: 0.6 },
    { stem: '戊', strength: 0.2 },
    { stem: '庚', strength: 0.2 },
  ],
  午: [
    { stem: '丁', strength: 0.7 },
    { stem: '己', strength: 0.3 },
  ],
  未: [
    { stem: '己', strength: 0.6 },
    { stem: '丁', strength: 0.2 },
    { stem: '乙', strength: 0.2 },
  ],
  申: [
    { stem: '庚', strength: 0.6 },
    { stem: '壬', strength: 0.2 },
    { stem: '戊', strength: 0.2 },
  ],
  酉: [{ stem: '辛', strength: 1.0 }],
  戌: [
    { stem: '戊', strength: 0.6 },
    { stem: '辛', strength: 0.2 },
    { stem: '丁', strength: 0.2 },
  ],
  亥: [
    { stem: '壬', strength: 0.7 },
    { stem: '甲', strength: 0.3 },
  ],
};

// 十神关系矩阵（从日主视角）
const TEN_GOD_MATRIX: Record<string, Record<string, TenGod>> = {
  甲: {
    甲: '比肩',
    乙: '劫财',
    丙: '食神',
    丁: '伤官',
    戊: '偏财',
    己: '正财',
    庚: '偏官',
    辛: '正官',
    壬: '偏印',
    癸: '正印',
  },
  乙: {
    甲: '劫财',
    乙: '比肩',
    丙: '伤官',
    丁: '食神',
    戊: '正财',
    己: '偏财',
    庚: '正官',
    辛: '偏官',
    壬: '正印',
    癸: '偏印',
  },
  丙: {
    甲: '偏印',
    乙: '正印',
    丙: '比肩',
    丁: '劫财',
    戊: '食神',
    己: '伤官',
    庚: '偏财',
    辛: '正财',
    壬: '偏官',
    癸: '正官',
  },
  丁: {
    甲: '正印',
    乙: '偏印',
    丙: '劫财',
    丁: '比肩',
    戊: '伤官',
    己: '食神',
    庚: '正财',
    辛: '偏财',
    壬: '正官',
    癸: '偏官',
  },
  戊: {
    甲: '偏官',
    乙: '正官',
    丙: '偏印',
    丁: '正印',
    戊: '比肩',
    己: '劫财',
    庚: '食神',
    辛: '伤官',
    壬: '偏财',
    癸: '正财',
  },
  己: {
    甲: '正官',
    乙: '偏官',
    丙: '正印',
    丁: '偏印',
    戊: '劫财',
    己: '比肩',
    庚: '伤官',
    辛: '食神',
    壬: '正财',
    癸: '偏财',
  },
  庚: {
    甲: '偏财',
    乙: '正财',
    丙: '偏官',
    丁: '正官',
    戊: '偏印',
    己: '正印',
    庚: '比肩',
    辛: '劫财',
    壬: '食神',
    癸: '伤官',
  },
  辛: {
    甲: '正财',
    乙: '偏财',
    丙: '正官',
    丁: '偏官',
    戊: '正印',
    己: '偏印',
    庚: '劫财',
    辛: '比肩',
    壬: '伤官',
    癸: '食神',
  },
  壬: {
    甲: '食神',
    乙: '伤官',
    丙: '偏财',
    丁: '正财',
    戊: '偏官',
    己: '正官',
    庚: '偏印',
    辛: '正印',
    壬: '比肩',
    癸: '劫财',
  },
  癸: {
    甲: '伤官',
    乙: '食神',
    丙: '正财',
    丁: '偏财',
    戊: '正官',
    己: '偏官',
    庚: '正印',
    辛: '偏印',
    壬: '劫财',
    癸: '比肩',
  },
};

// 季节调候用神表（基于《穷通宝鉴》）
const SEASONAL_ADJUSTMENTS: Record<
  string,
  Record<
    FiveElement,
    {
      primary: FiveElement[];
      secondary: FiveElement[];
      avoid: FiveElement[];
      principle: string;
    }
  >
> = {
  // 春季（寅卯辰月）
  寅: {
    木: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '春木向荣，喜火泄秀，用水济根，忌金克伐',
    },
    火: {
      primary: ['木'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '春火虚焰，用木生扶，金财为辅，忌水克制',
    },
    土: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['木'],
      principle: '春土虚湿，用火暖土，金泄土气，忌木克伤',
    },
    金: {
      primary: ['土'],
      secondary: ['火'],
      avoid: ['火'],
      principle: '春金软弱，用土生金，火炼成器，但不宜过旺',
    },
    水: {
      primary: ['金'],
      secondary: ['土'],
      avoid: ['土'],
      principle: '春水泛滥，用金发水源，土制水势，过土则塞',
    },
  },
  卯: {
    木: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['金'],
      principle: '卯木当令，喜火显达，用水调济，忌金砍伐',
    },
    火: {
      primary: ['木'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '春火得木，势能舒展，金财为用，忌水浇灭',
    },
    土: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['木'],
      principle: '春土喜暖，用火温土，金疏土质，忌木太旺',
    },
    金: {
      primary: ['土'],
      secondary: ['火'],
      avoid: ['木'],
      principle: '春金失令，赖土滋生，火炼成材，忌木旺克金',
    },
    水: {
      primary: ['金'],
      secondary: ['土'],
      avoid: ['土'],
      principle: '春水清澈，金水相涵，土适可止，不宜过厚',
    },
  },
  辰: {
    木: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['土'],
      principle: '辰为湿土，木喜火疏，金制为美，忌土重埋',
    },
    火: {
      primary: ['木', '土'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '辰月火进气，木土并用，金财相济，忌水克身',
    },
    土: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '辰土当令，用火燥土，金疏为佳，忌水湿重',
    },
    金: {
      primary: ['火', '土'],
      secondary: ['水'],
      avoid: ['木'],
      principle: '辰月金墓，火土并举，水润有情，忌木克伤',
    },
    水: {
      primary: ['金'],
      secondary: ['火'],
      avoid: ['土'],
      principle: '辰月水库，金发其源，火暖有生，忌土壅塞',
    },
  },

  // 夏季（巳午未月）
  巳: {
    木: {
      primary: ['水'],
      secondary: ['金'],
      avoid: ['火'],
      principle: '巳月木焦，最喜壬水，金发水源，火多则燥',
    },
    火: {
      primary: ['土', '金'],
      secondary: ['水'],
      avoid: ['木'],
      principle: '巳火司权，土泄其势，金为财源，水济其威',
    },
    土: {
      primary: ['金', '水'],
      secondary: ['火'],
      avoid: ['木'],
      principle: '夏土燥烈，金水润泽，火虽生土，过旺则焦',
    },
    金: {
      primary: ['水'],
      secondary: ['土'],
      avoid: ['火'],
      principle: '夏金畏熔，最喜壬癸，土生有源，火旺则危',
    },
    水: {
      primary: ['金'],
      secondary: ['土'],
      avoid: ['火'],
      principle: '夏水易干，赖金发源，土止有节，火炎则竭',
    },
  },
  午: {
    木: {
      primary: ['水'],
      secondary: ['金'],
      avoid: ['火'],
      principle: '午火炎炎，木焦叶萎，壬水为救，金水相济',
    },
    火: {
      primary: ['土', '金'],
      secondary: ['水'],
      avoid: ['木'],
      principle: '午火当权，土金并用，水调有制，木助则炎',
    },
    土: {
      primary: ['金', '水'],
      secondary: [],
      avoid: ['火'],
      principle: '夏土亢燥，金水双清，火旺土焦，不可再助',
    },
    金: {
      primary: ['水'],
      secondary: ['土'],
      avoid: ['火'],
      principle: '午月金熔，非水不救，土生有情，火多必损',
    },
    水: {
      primary: ['金'],
      secondary: ['土'],
      avoid: ['火'],
      principle: '夏水涸竭，金为水源，土止其流，火克为病',
    },
  },
  未: {
    木: {
      primary: ['水'],
      secondary: ['金'],
      avoid: ['土'],
      principle: '未土燥热，木根焦枯，水润为先，金发水源',
    },
    火: {
      primary: ['土'],
      secondary: ['金', '水'],
      avoid: ['木'],
      principle: '火至未宫，土泄有情，金水相济，木助太燥',
    },
    土: {
      primary: ['金', '水'],
      secondary: ['火'],
      avoid: ['木'],
      principle: '未土司令，金水润泽，火燥须制，忌木克伤',
    },
    金: {
      primary: ['水'],
      secondary: ['土'],
      avoid: ['火'],
      principle: '夏末金柔，水洗成器，土生有根，火炼过头',
    },
    水: {
      primary: ['金'],
      secondary: ['土'],
      avoid: ['土'],
      principle: '未月水弱，金生为美，土多则浊，不清不贵',
    },
  },

  // 秋季（申酉戌月）
  申: {
    木: {
      primary: ['水'],
      secondary: ['火'],
      avoid: ['金'],
      principle: '申金司权，木被克伐，水润有救，火暖有生',
    },
    火: {
      primary: ['木'],
      secondary: ['土'],
      avoid: ['金', '水'],
      principle: '秋火渐微，木助其势，土泄有制，金水无情',
    },
    土: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['木'],
      principle: '秋土子旺，火暖土温，金泄有情，忌木克伤',
    },
    金: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['土'],
      principle: '申金当令，火炼成器，水泄有制，土生过厚',
    },
    水: {
      primary: ['金'],
      secondary: ['木'],
      avoid: ['土'],
      principle: '秋水通源，金白水清，木疏土制，不宜壅塞',
    },
  },
  酉: {
    木: {
      primary: ['水', '火'],
      secondary: [],
      avoid: ['金'],
      principle: '酉金强旺，木最受伤，水火并用，方保其生',
    },
    火: {
      primary: ['木'],
      secondary: ['土'],
      avoid: ['金', '水'],
      principle: '秋火衰微，专用甲木，土泄为病，金水敌对',
    },
    土: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '秋土金旺，火暖为妙，金泄有节，水湿无功',
    },
    金: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['土'],
      principle: '酉金专旺，丁火必用，水泄成器，土重难清',
    },
    水: {
      primary: ['金'],
      secondary: ['木'],
      avoid: ['土'],
      principle: '秋水得源，金水相涵，木疏有情，土厚为病',
    },
  },
  戌: {
    木: {
      primary: ['水'],
      secondary: ['金'],
      avoid: ['土'],
      principle: '戌为火库，木易被焚，壬水为救，金发水源',
    },
    火: {
      primary: ['木'],
      secondary: ['金'],
      avoid: ['土'],
      principle: '火入戌库，木发其焰，金财相配，土多则晦',
    },
    土: {
      primary: ['金', '火'],
      secondary: ['水'],
      avoid: ['木'],
      principle: '戌土当旺，金火并用，水润有节，忌木克伤',
    },
    金: {
      primary: ['火', '水'],
      secondary: ['土'],
      avoid: ['木'],
      principle: '秋末金藏，火炼水洗，土生有根，木克为病',
    },
    水: {
      primary: ['金'],
      secondary: ['火'],
      avoid: ['土'],
      principle: '戌月水库，金发为贵，火暖有生，土重难清',
    },
  },

  // 冬季（亥子丑月）
  亥: {
    木: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '亥水司权，木水伤官，火调暖局，金发水源',
    },
    火: {
      primary: ['木'],
      secondary: ['土'],
      avoid: ['水'],
      principle: '冬火微弱，木助其焰，土泄有制，水多则灭',
    },
    土: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '冬土寒冻，火暖为先，金泄有节，水多则湿',
    },
    金: {
      primary: ['火'],
      secondary: ['土'],
      avoid: ['水'],
      principle: '冬金寒冷，火暖为妙，土生有情，水冷金寒',
    },
    水: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['金'],
      principle: '亥水当令，最喜火暖，金多水寒，不成大器',
    },
  },
  子: {
    木: {
      primary: ['火'],
      secondary: ['土'],
      avoid: ['水'],
      principle: '子水旺极，木漂不实，火暖成器，土止其流',
    },
    火: {
      primary: ['木'],
      secondary: ['土'],
      avoid: ['水'],
      principle: '冬火遇水，木生为急，土制水势，方能成器',
    },
    土: {
      primary: ['火'],
      secondary: ['木'],
      avoid: ['水'],
      principle: '冬土极寒，火暖为要，木疏为辅，水冻不流',
    },
    金: {
      primary: ['火'],
      secondary: ['土'],
      avoid: ['水'],
      principle: '子月金寒，丙火解冻，土生有情，水冷无用',
    },
    水: {
      primary: ['火'],
      secondary: ['土'],
      avoid: ['金'],
      principle: '子水专旺，火暖为贵，土制有节，金多反寒',
    },
  },
  丑: {
    木: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['土'],
      principle: '丑为湿土，木气不舒，丙火解冻，水润有生',
    },
    火: {
      primary: ['木'],
      secondary: ['土'],
      avoid: ['水'],
      principle: '冬火衰微，甲木为生，土泄有节，水克为病',
    },
    土: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['水'],
      principle: '丑土湿寒，火暖燥土，金泄有情，水湿为病',
    },
    金: {
      primary: ['火'],
      secondary: ['水'],
      avoid: ['土'],
      principle: '丑月金库，火炼成器，水洗有节，土厚金埋',
    },
    水: {
      primary: ['火'],
      secondary: ['金'],
      avoid: ['土'],
      principle: '冬末水寒，火暖为先，金发有源，土厚则浊',
    },
  },
};

/**
 * 获取十神关系
 */
function getTenGod(dayMaster: string, targetStem: string): TenGod {
  return TEN_GOD_MATRIX[dayMaster]?.[targetStem] || '比肩';
}

/**
 * 检查月令透干情况
 * 判断月令中的十神是否在天干中透出
 */
function checkMonthlyTransparency(pillars: Pillars): {
  isTransparent: boolean;
  transparentStems: string[];
  hiddenGods: Array<{ stem: string; god: TenGod; strength: number }>;
} {
  const dayMaster = pillars.day.stem;
  const monthBranch = pillars.month.branch;
  const hiddenStems = BRANCH_HIDDEN_STEMS[monthBranch] || [];

  // 获取天干列表
  const transparentStems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.hour.stem,
  ];

  const hiddenGods = hiddenStems.map(({ stem, strength }) => ({
    stem,
    god: getTenGod(dayMaster, stem),
    strength,
  }));

  // 检查是否有藏干透干
  const isTransparent = hiddenStems.some(({ stem }) =>
    transparentStems.includes(stem as Stem)
  );

  return {
    isTransparent,
    transparentStems,
    hiddenGods,
  };
}

/**
 * 分析正格（八格）
 * 基于月令藏干和透干情况判断格局
 */
function analyzeStandardPattern(pillars: Pillars): {
  pattern: string | null;
  confidence: number;
  formation: string[];
  destruction: string[];
  usefulGods: TenGod[];
} {
  const dayMaster = pillars.day.stem;
  const monthBranch = pillars.month.branch;
  const transparency = checkMonthlyTransparency(pillars);

  // 按藏干强度排序，找主要十神
  const sortedGods = transparency.hiddenGods.sort(
    (a, b) => b.strength - a.strength
  );

  if (sortedGods.length === 0) {
    return {
      pattern: null,
      confidence: 0,
      formation: [],
      destruction: [],
      usefulGods: [],
    };
  }

  const primaryGod = sortedGods[0];
  let pattern: string | null = null;
  let confidence = 60; // 基础置信度
  const formation: string[] = [];
  const destruction: string[] = [];
  let usefulGods: TenGod[] = [];

  // 根据主要十神确定格局
  switch (primaryGod.god) {
    case '正官':
      pattern = '正官格';
      usefulGods = ['正印', '食神', '正财'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为正官，以正官格论`
      );
      break;

    case '偏官':
      pattern = '偏官格';
      usefulGods = ['食神', '正印', '劫财'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为偏官，以偏官格论`
      );
      break;

    case '正财':
      pattern = '正财格';
      usefulGods = ['正官', '食神', '比肩'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为正财，以正财格论`
      );
      break;

    case '偏财':
      pattern = '偏财格';
      usefulGods = ['偏官', '伤官', '劫财'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为偏财，以偏财格论`
      );
      break;

    case '食神':
      pattern = '食神格';
      usefulGods = ['偏财', '正印'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为食神，以食神格论`
      );
      break;

    case '伤官':
      pattern = '伤官格';
      usefulGods = ['正财', '正印'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为伤官，以伤官格论`
      );
      break;

    case '正印':
      pattern = '正印格';
      usefulGods = ['偏官', '伤官'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为正印，以正印格论`
      );
      break;

    case '偏印':
      pattern = '偏印格';
      usefulGods = ['偏财', '食神'];
      formation.push(
        `月令${monthBranch}藏${primaryGod.stem}为偏印，以偏印格论`
      );
      break;

    default:
      // 比肩劫财当令，寻其他格局或特殊格局
      if (primaryGod.god === '比肩' || primaryGod.god === '劫财') {
        // 查看其他藏干
        for (let i = 1; i < sortedGods.length; i++) {
          const secondaryGod = sortedGods[i];
          if (secondaryGod.god !== '比肩' && secondaryGod.god !== '劫财') {
            pattern = `${secondaryGod.god}格`;
            formation.push(
              `月令虽以${primaryGod.god}为主，但取${secondaryGod.god}为格`
            );
            confidence -= 15; // 降低置信度
            break;
          }
        }
      }
      break;
  }

  // 检查透干情况，提升格局纯度
  if (transparency.isTransparent) {
    const transparentGod = transparency.transparentStems.find(
      (stem) => stem === primaryGod.stem
    );
    if (transparentGod) {
      confidence += 20;
      formation.push('格局之神透干，格局纯正');
    }
  }

  // 检查破格因素
  checkPatternDestruction(pillars, primaryGod.god, destruction);

  if (destruction.length > 0) {
    confidence -= destruction.length * 15;
  }

  return {
    pattern,
    confidence: Math.max(0, Math.min(100, confidence)),
    formation,
    destruction,
    usefulGods,
  };
}

/**
 * 检查格局破坏因素
 */
function checkPatternDestruction(
  pillars: Pillars,
  patternGod: TenGod,
  destruction: string[]
): void {
  const dayMaster = pillars.day.stem;
  const allStems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.day.stem,
    pillars.hour.stem,
  ];

  // 检查具体的破格情况
  switch (patternGod) {
    case '正官':
      // 官格最忌伤官见官
      if (allStems.some((stem) => getTenGod(dayMaster, stem) === '伤官')) {
        destruction.push('伤官见官，格局受损');
      }
      // 官格忌官杀混杂
      if (allStems.some((stem) => getTenGod(dayMaster, stem) === '偏官')) {
        destruction.push('官杀混杂，格局不清');
      }
      break;

    case '偏官': {
      // 杀格忌官杀混杂
      if (allStems.some((stem) => getTenGod(dayMaster, stem) === '正官')) {
        destruction.push('官杀混杂，格局不清');
      }
      // 杀无制化则凶
      const hasControl = allStems.some((stem) =>
        ['食神', '伤官', '正印', '偏印'].includes(getTenGod(dayMaster, stem))
      );
      if (!hasControl) {
        destruction.push('七杀无制化，凶不可言');
      }
      break;
    }

    case '食神':
      // 食神格忌偏印夺食
      if (allStems.some((stem) => getTenGod(dayMaster, stem) === '偏印')) {
        destruction.push('偏印夺食，格局破败');
      }
      break;

    case '伤官': {
      // 伤官格的复杂变化
      const dayElement = STEM_ELEMENTS[dayMaster];
      const monthElement = BRANCH_ELEMENTS[pillars.month.branch];

      // 金水伤官、木火伤官等特殊情况
      if (dayElement === '金' && monthElement === '水') {
        // 金水伤官要见官
        if (!allStems.some((stem) => getTenGod(dayMaster, stem) === '正官')) {
          destruction.push('金水伤官格，不见官则不贵');
        }
      } else {
        // 其他伤官不宜见官
        if (allStems.some((stem) => getTenGod(dayMaster, stem) === '正官')) {
          destruction.push('伤官见官，为祸百端');
        }
      }
      break;
    }

    case '正印':
    case '偏印':
      // 印格忌财破印
      if (
        allStems.some((stem) =>
          ['正财', '偏财'].includes(getTenGod(dayMaster, stem))
        )
      ) {
        destruction.push('财星破印，格局受损');
      }
      break;

    case '正财':
    case '偏财':
      // 财格忌比劫夺财
      if (
        allStems.filter((stem) =>
          ['比肩', '劫财'].includes(getTenGod(dayMaster, stem))
        ).length > 1
      ) {
        destruction.push('比劫夺财，格局破败');
      }
      break;
  }
}

/**
 * 分析从格
 * 当日主极弱，不得月令，四柱中某种五行特别强旺时形成从格
 */
function analyzeFollowPattern(pillars: Pillars): {
  pattern: string | null;
  confidence: number;
  formation: string[];
  usefulGods: TenGod[];
} {
  const dayMaster = pillars.day.stem;
  const dayElement = STEM_ELEMENTS[dayMaster];

  // 统计各十神出现次数和强度
  const godCounts: Record<TenGod, number> = {} as any;
  const allStems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.hour.stem, // 不计日主
  ];

  allStems.forEach((stem) => {
    const god = getTenGod(dayMaster, stem);
    godCounts[god] = (godCounts[god] || 0) + 1;
  });

  // 检查地支中的力量
  const allBranches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  let followType: string | null = null;
  let confidence = 0;
  const formation: string[] = [];
  let usefulGods: TenGod[] = [];

  // 从财格：财星极旺
  const wealthCount = (godCounts.正财 || 0) + (godCounts.偏财 || 0);
  if (wealthCount >= 2) {
    followType = '从财格';
    confidence = 65;
    formation.push(`财星透干${wealthCount}位，日主无根从财`);
    usefulGods = ['正财', '偏财', '食神', '伤官'];
  }

  // 从官格：官杀极旺
  const officialCount = (godCounts.正官 || 0) + (godCounts.偏官 || 0);
  if (officialCount >= 2 && officialCount > wealthCount) {
    followType = '从官格';
    confidence = 65;
    formation.push(`官杀透干${officialCount}位，日主无根从官`);
    usefulGods = ['正官', '偏官', '正财', '偏财'];
  }

  // 从儿格：食伤极旺
  const childCount = (godCounts.食神 || 0) + (godCounts.伤官 || 0);
  if (childCount >= 2 && childCount > Math.max(wealthCount, officialCount)) {
    followType = '从儿格';
    confidence = 65;
    formation.push(`食伤透干${childCount}位，日主无根从儿`);
    usefulGods = ['食神', '伤官', '正财', '偏财'];
  }

  // 从势格：某种五行势众
  if (!followType) {
    const elementCounts: Record<FiveElement, number> = {} as any;

    allStems.forEach((stem) => {
      const element = STEM_ELEMENTS[stem];
      elementCounts[element] = (elementCounts[element] || 0) + 1;
    });

    allBranches.forEach((branch) => {
      const element = BRANCH_ELEMENTS[branch];
      elementCounts[element] = (elementCounts[element] || 0) + 0.8; // 地支力量稍弱
    });

    // 找出最强的五行
    const maxElement = Object.entries(elementCounts)
      .filter(([elem]) => elem !== dayElement)
      .sort((a, b) => b[1] - a[1])[0];

    if (maxElement && maxElement[1] >= 3) {
      followType = '从势格';
      confidence = 55;
      formation.push(`${maxElement[0]}势力强盛，日主无根从势`);
      // 根据从势的五行确定用神
      usefulGods = getUsefulGodsForElement(
        dayMaster,
        maxElement[0] as FiveElement
      );
    }
  }

  // 验证从格成立条件
  if (followType) {
    // 检查日主是否真的无根
    const dayRoot = checkDayMasterRoots(pillars);
    if (dayRoot.strength > 30) {
      confidence -= 30;
      formation.push('日主尚有根气，从格不真');
    }

    // 检查是否有生扶日主的因素
    const supportCount =
      (godCounts.比肩 || 0) +
      (godCounts.劫财 || 0) +
      (godCounts.正印 || 0) +
      (godCounts.偏印 || 0);
    if (supportCount > 0) {
      confidence -= supportCount * 15;
      formation.push(`有${supportCount}位生扶，从格不纯`);
    }
  }

  return {
    pattern: followType,
    confidence: Math.max(0, Math.min(100, confidence)),
    formation,
    usefulGods,
  };
}

/**
 * 获取某五行对应的有用十神
 */
function getUsefulGodsForElement(
  dayMaster: string,
  element: FiveElement
): TenGod[] {
  const allStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const elementStems = allStems.filter(
    (stem) => STEM_ELEMENTS[stem] === element
  );

  return elementStems
    .map((stem) => getTenGod(dayMaster, stem))
    .filter((god, index, array) => array.indexOf(god) === index); // 去重
}

/**
 * 检查日主根气强度
 */
function checkDayMasterRoots(pillars: Pillars): {
  strength: number;
  roots: string[];
} {
  const dayMaster = pillars.day.stem;
  const dayElement = STEM_ELEMENTS[dayMaster];
  let strength = 0;
  const roots: string[] = [];

  // 检查地支藏干中的同类根气
  const allBranches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  allBranches.forEach((branch, index) => {
    const hiddenStems = BRANCH_HIDDEN_STEMS[branch] || [];
    hiddenStems.forEach(({ stem, strength: hiddenStrength }) => {
      if (STEM_ELEMENTS[stem] === dayElement) {
        const rootStrength = hiddenStrength * (index === 1 ? 1.5 : 1); // 月支根气更强
        strength += rootStrength * 20;
        roots.push(`${['年', '月', '日', '时'][index]}支${branch}藏${stem}`);
      }
    });
  });

  return { strength, roots };
}

/**
 * 分析化格
 * 化格是指某些特定的天干组合能够化合成另一种五行
 */
function analyzeTransformPattern(pillars: Pillars): {
  pattern: string | null;
  confidence: number;
  formation: string[];
  usefulGods: TenGod[];
} {
  const allStems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.day.stem,
    pillars.hour.stem,
  ];

  const dayMaster = pillars.day.stem;
  const monthBranch = pillars.month.branch;
  const monthElement = BRANCH_ELEMENTS[monthBranch];

  // 化合关系表
  const transformations: Record<
    string,
    {
      partner: string;
      result: FiveElement;
      name: string;
      conditions: string[];
    }
  > = {
    甲: {
      partner: '己',
      result: '土',
      name: '甲己化土',
      conditions: ['需要土旺之时', '辰戌丑未月最佳'],
    },
    己: {
      partner: '甲',
      result: '土',
      name: '甲己化土',
      conditions: ['需要土旺之时', '辰戌丑未月最佳'],
    },
    乙: {
      partner: '庚',
      result: '金',
      name: '乙庚化金',
      conditions: ['需要金旺之时', '申酉月最佳'],
    },
    庚: {
      partner: '乙',
      result: '金',
      name: '乙庚化金',
      conditions: ['需要金旺之时', '申酉月最佳'],
    },
    丙: {
      partner: '辛',
      result: '水',
      name: '丙辛化水',
      conditions: ['需要水旺之时', '亥子月最佳'],
    },
    辛: {
      partner: '丙',
      result: '水',
      name: '丙辛化水',
      conditions: ['需要水旺之时', '亥子月最佳'],
    },
    丁: {
      partner: '壬',
      result: '木',
      name: '丁壬化木',
      conditions: ['需要木旺之时', '寅卯月最佳'],
    },
    壬: {
      partner: '丁',
      result: '木',
      name: '丁壬化木',
      conditions: ['需要木旺之时', '寅卯月最佳'],
    },
    戊: {
      partner: '癸',
      result: '火',
      name: '戊癸化火',
      conditions: ['需要火旺之时', '巳午月最佳'],
    },
    癸: {
      partner: '戊',
      result: '火',
      name: '戊癸化火',
      conditions: ['需要火旺之时', '巳午月最佳'],
    },
  };

  const transformation = transformations[dayMaster];
  if (!transformation) {
    return { pattern: null, confidence: 0, formation: [], usefulGods: [] };
  }

  // 检查是否有化合伙伴
  const hasPartner = allStems.includes(transformation.partner as Stem);
  if (!hasPartner) {
    return { pattern: null, confidence: 0, formation: [], usefulGods: [] };
  }

  let confidence = 40;
  const formation: string[] = [];

  // 检查化合条件
  formation.push(
    `${transformation.name}：${dayMaster}与${transformation.partner}相合`
  );

  // 检查月令是否有利于化合
  const resultElement = transformation.result;
  if (monthElement === resultElement) {
    confidence += 30;
    formation.push(
      `月令${monthBranch}为${monthElement}，有利于化${resultElement}`
    );
  } else {
    confidence -= 15;
    formation.push(
      `月令${monthBranch}为${monthElement}，不利化${resultElement}`
    );
  }

  // 检查其他地支是否支持化合
  const allBranches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  const supportingBranches = allBranches.filter(
    (branch) => BRANCH_ELEMENTS[branch] === resultElement
  );

  if (supportingBranches.length >= 2) {
    confidence += 20;
    formation.push(`地支${supportingBranches.join('、')}助化`);
  }

  // 检查是否有阻化因素
  const conflictingElements = getConflictingElements(resultElement);
  const hasConflict = allStems.some((stem) =>
    conflictingElements.includes(STEM_ELEMENTS[stem])
  );

  if (hasConflict) {
    confidence -= 25;
    formation.push('有冲突元素阻化，化合不真');
  }

  // 确定用神
  const usefulGods = getTransformPatternUsefulGods(dayMaster, transformation);

  return {
    pattern: confidence >= 50 ? `${transformation.name}格` : null,
    confidence,
    formation,
    usefulGods,
  };
}

/**
 * 获取冲突元素
 */
function getConflictingElements(element: FiveElement): FiveElement[] {
  const conflicts: Record<FiveElement, FiveElement[]> = {
    木: ['金'], // 金克木
    火: ['水'], // 水克火
    土: ['木'], // 木克土
    金: ['火'], // 火克金
    水: ['土'], // 土克水
  };

  return conflicts[element] || [];
}

/**
 * 获取化格用神
 */
function getTransformPatternUsefulGods(
  dayMaster: string,
  transformation: any
): TenGod[] {
  const resultElement = transformation.result;

  // 化格成功后，以化神为主，取生助化神的为用
  const usefulElements = getProductionChain(resultElement);
  const allStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

  const usefulGods: TenGod[] = [];
  usefulElements.forEach((element) => {
    const elementStems = allStems.filter(
      (stem) => STEM_ELEMENTS[stem] === element
    );
    elementStems.forEach((stem) => {
      const god = getTenGod(dayMaster, stem);
      if (!usefulGods.includes(god)) {
        usefulGods.push(god);
      }
    });
  });

  return usefulGods;
}

/**
 * 获取生产链（生我和我生的元素）
 */
function getProductionChain(element: FiveElement): FiveElement[] {
  const production: Record<FiveElement, FiveElement> = {
    木: '火',
    火: '土',
    土: '金',
    金: '水',
    水: '木',
  };

  const mother = Object.entries(production).find(
    ([k, v]) => v === element
  )?.[0] as FiveElement;
  const child = production[element];

  return [element, mother, child].filter(Boolean) as FiveElement[];
}

/**
 * 分析特殊格局
 * 包括曲直格、炎上格、润下格、从革格、稼穑格等
 */
function analyzeSpecialPattern(pillars: Pillars): {
  pattern: string | null;
  confidence: number;
  formation: string[];
  usefulGods: TenGod[];
} {
  const dayMaster = pillars.day.stem;
  const dayElement = STEM_ELEMENTS[dayMaster];

  const allStems = [
    pillars.year.stem,
    pillars.month.stem,
    pillars.day.stem,
    pillars.hour.stem,
  ];

  const allBranches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  // 统计各元素的出现次数
  const stemElements: Record<FiveElement, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  const branchElements: Record<FiveElement, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  allStems.forEach((stem) => {
    stemElements[STEM_ELEMENTS[stem]]++;
  });

  allBranches.forEach((branch) => {
    branchElements[BRANCH_ELEMENTS[branch]]++;
  });

  // 检查各种特殊格局

  // 曲直格（木局）：寅卯辰三会东方木，或亥卯未三合木局
  if (checkWoodPattern(pillars, stemElements, branchElements)) {
    return {
      pattern: '曲直格',
      confidence: 75,
      formation: ['木气专旺，天干多见甲乙，地支会合木局'],
      usefulGods: ['食神', '伤官', '偏财', '正财'], // 木生火，火生土
    };
  }

  // 炎上格（火局）：巳午未三会南方火，或寅午戌三合火局
  if (checkFirePattern(pillars, stemElements, branchElements)) {
    return {
      pattern: '炎上格',
      confidence: 75,
      formation: ['火势炎上，天干多见丙丁，地支会合火局'],
      usefulGods: ['食神', '伤官', '偏财', '正财'], // 火生土，土生金
    };
  }

  // 润下格（水局）：申子辰三合水局，或亥子丑三会北方水
  if (checkWaterPattern(pillars, stemElements, branchElements)) {
    return {
      pattern: '润下格',
      confidence: 75,
      formation: ['水势润下，天干多见壬癸，地支会合水局'],
      usefulGods: ['食神', '伤官', '偏财', '正财'], // 水生木，木生火
    };
  }

  // 从革格（金局）：巳酉丑三合金局，或申酉戌三会西方金
  if (checkMetalPattern(pillars, stemElements, branchElements)) {
    return {
      pattern: '从革格',
      confidence: 75,
      formation: ['金气从革，天干多见庚辛，地支会合金局'],
      usefulGods: ['食神', '伤官', '偏财', '正财'], // 金生水，水生木
    };
  }

  // 稼穑格（土局）：辰戌丑未四土全，或天干多土
  if (checkEarthPattern(pillars, stemElements, branchElements)) {
    return {
      pattern: '稼穑格',
      confidence: 70,
      formation: ['土气稼穑，天干多见戊己，地支土局成立'],
      usefulGods: ['食神', '伤官', '偏财', '正财'], // 土生金，金生水
    };
  }

  return { pattern: null, confidence: 0, formation: [], usefulGods: [] };
}

/**
 * 检查木局格局
 */
function checkWoodPattern(
  pillars: Pillars,
  stemElements: Record<FiveElement, number>,
  branchElements: Record<FiveElement, number>
): boolean {
  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  // 寅卯辰三会木局
  if (
    branches.includes('寅') &&
    branches.includes('卯') &&
    branches.includes('辰')
  ) {
    return true;
  }

  // 亥卯未三合木局
  if (
    branches.includes('亥') &&
    branches.includes('卯') &&
    branches.includes('未')
  ) {
    return true;
  }

  // 天干木多且地支有根
  if (stemElements.木 >= 2 && branchElements.木 >= 1) {
    return true;
  }

  return false;
}

/**
 * 检查火局格局
 */
function checkFirePattern(
  pillars: Pillars,
  stemElements: Record<FiveElement, number>,
  branchElements: Record<FiveElement, number>
): boolean {
  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  // 巳午未三会火局
  if (
    branches.includes('巳') &&
    branches.includes('午') &&
    branches.includes('未')
  ) {
    return true;
  }

  // 寅午戌三合火局
  if (
    branches.includes('寅') &&
    branches.includes('午') &&
    branches.includes('戌')
  ) {
    return true;
  }

  // 天干火多且地支有根
  if (stemElements.火 >= 2 && branchElements.火 >= 1) {
    return true;
  }

  return false;
}

/**
 * 检查水局格局
 */
function checkWaterPattern(
  pillars: Pillars,
  stemElements: Record<FiveElement, number>,
  branchElements: Record<FiveElement, number>
): boolean {
  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  // 申子辰三合水局
  if (
    branches.includes('申') &&
    branches.includes('子') &&
    branches.includes('辰')
  ) {
    return true;
  }

  // 亥子丑三会水局
  if (
    branches.includes('亥') &&
    branches.includes('子') &&
    branches.includes('丑')
  ) {
    return true;
  }

  // 天干水多且地支有根
  if (stemElements.水 >= 2 && branchElements.水 >= 1) {
    return true;
  }

  return false;
}

/**
 * 检查金局格局
 */
function checkMetalPattern(
  pillars: Pillars,
  stemElements: Record<FiveElement, number>,
  branchElements: Record<FiveElement, number>
): boolean {
  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  // 巳酉丑三合金局
  if (
    branches.includes('巳') &&
    branches.includes('酉') &&
    branches.includes('丑')
  ) {
    return true;
  }

  // 申酉戌三会金局
  if (
    branches.includes('申') &&
    branches.includes('酉') &&
    branches.includes('戌')
  ) {
    return true;
  }

  // 天干金多且地支有根
  if (stemElements.金 >= 2 && branchElements.金 >= 1) {
    return true;
  }

  return false;
}

/**
 * 检查土局格局
 */
function checkEarthPattern(
  pillars: Pillars,
  stemElements: Record<FiveElement, number>,
  branchElements: Record<FiveElement, number>
): boolean {
  const branches = [
    pillars.year.branch,
    pillars.month.branch,
    pillars.day.branch,
    pillars.hour.branch,
  ];

  // 辰戌丑未四土全
  const earthBranches = ['辰', '戌', '丑', '未'];
  const earthCount = earthBranches.filter((eb) =>
    branches.includes(eb as Branch)
  ).length;

  if (earthCount >= 3) {
    return true;
  }

  // 天干土多
  if (stemElements.土 >= 2) {
    return true;
  }

  return false;
}

/**
 * 主要的格局分析函数
 */
export function analyzePattern(pillars: Pillars): PatternAnalysis {
  const dayMaster = pillars.day.stem;
  const dayElement = STEM_ELEMENTS[dayMaster];
  const monthBranch = pillars.month.branch;
  const monthElement = BRANCH_ELEMENTS[monthBranch];

  // 分析标准格局
  const standardResult = analyzeStandardPattern(pillars);

  // 分析从格
  const followResult = analyzeFollowPattern(pillars);

  // 分析化格
  const transformResult = analyzeTransformPattern(pillars);

  // 分析特殊格局
  const specialResult = analyzeSpecialPattern(pillars);

  // 选择最佳格局（按置信度排序）
  const allResults = [
    { ...standardResult, type: 'standard' as PatternType },
    { ...followResult, type: 'follow' as PatternType },
    { ...transformResult, type: 'transform' as PatternType },
    { ...specialResult, type: 'special' as PatternType },
  ]
    .filter((r) => r.pattern)
    .sort((a, b) => b.confidence - a.confidence);

  let finalPattern: string;
  let patternType: PatternType;
  let confidence: number;
  let formation: string[];
  let destruction: string[];
  let usefulGods: TenGod[];

  if (allResults.length > 0) {
    const best = allResults[0];
    finalPattern = best.pattern!;
    patternType = best.type;
    confidence = best.confidence;
    formation = best.formation;
    destruction =
      best.type === 'standard' ? (best as any).destruction || [] : [];
    usefulGods = best.usefulGods;
  } else {
    finalPattern = '不入格局';
    patternType = 'special';
    confidence = 20;
    formation = ['四柱结构复杂，未能成明确格局'];
    destruction = [];
    usefulGods = [];
  }

  // 分析月令情况
  const transparency = checkMonthlyTransparency(pillars);
  const primaryHiddenGod = transparency.hiddenGods[0];

  // 格局强度和纯度评估
  let strength: PatternStrength = 'medium';
  let purity: PatternPurity = 'mixed';

  if (confidence >= 80) {
    strength = 'strong';
    purity = destruction.length === 0 ? 'pure' : 'mixed';
  } else if (confidence >= 60) {
    strength = 'medium';
    purity = destruction.length <= 1 ? 'mixed' : 'broken';
  } else {
    strength = 'weak';
    purity = 'broken';
  }

  // 季节调候分析
  const seasonalAdjustment = analyzeSeasonalAdjustment(pillars);

  // 生成特征描述
  const characteristics = generatePatternCharacteristics(
    finalPattern,
    patternType,
    strength,
    purity
  );

  return {
    primaryPattern: finalPattern,
    patternType,
    strength,
    purity,
    isValid: confidence >= 50,
    formation,
    destruction,
    monthlyOrder: {
      element: monthElement,
      god: primaryHiddenGod
        ? primaryHiddenGod.god
        : getTenGod(dayMaster, pillars.month.stem),
      isTransparent: transparency.isTransparent,
      rootStrength: primaryHiddenGod ? primaryHiddenGod.strength * 100 : 50,
    },
    usefulGod: {
      primary: usefulGods.slice(0, 2),
      secondary: usefulGods.slice(2),
      avoidance: getAvoidanceGods(usefulGods, dayMaster),
      explanation: generateUsefulGodExplanation(finalPattern, usefulGods),
    },
    characteristics,
    theoretical: {
      classic: getClassicReference(finalPattern),
      principle: getTheoreticalPrinciple(finalPattern, patternType),
      confidence,
    },
    seasonalAdjustment,
  };
}

/**
 * 分析季节调候
 */
function analyzeSeasonalAdjustment(pillars: Pillars): {
  needed: boolean;
  element: FiveElement;
  reason: string;
} {
  const dayElement = STEM_ELEMENTS[pillars.day.stem];
  const monthBranch = pillars.month.branch;
  const adjustment = SEASONAL_ADJUSTMENTS[monthBranch]?.[dayElement];

  if (adjustment) {
    return {
      needed: true,
      element: adjustment.primary[0],
      reason: adjustment.principle,
    };
  }

  return {
    needed: false,
    element: '水',
    reason: '无需特别调候',
  };
}

/**
 * 获取忌神
 */
function getAvoidanceGods(usefulGods: TenGod[], dayMaster: string): TenGod[] {
  const allGods: TenGod[] = [
    '比肩',
    '劫财',
    '食神',
    '伤官',
    '偏财',
    '正财',
    '偏官',
    '正官',
    '偏印',
    '正印',
  ];

  return allGods.filter((god) => !usefulGods.includes(god));
}

/**
 * 生成用神说明
 */
function generateUsefulGodExplanation(
  pattern: string,
  usefulGods: TenGod[]
): string {
  if (usefulGods.length === 0) return '格局不明，用神难定';

  const primary = usefulGods[0];

  switch (pattern) {
    case '正官格':
      return `${pattern}以${primary}为用神，官印相生或官食制杀为美`;
    case '偏官格':
      return `${pattern}以${primary}为用神，食制杀或印化杀为要`;
    case '正财格':
    case '偏财格':
      return `${pattern}以${primary}为用神，财官相生或食财生官为佳`;
    case '食神格':
      return `${pattern}以${primary}为用神，食生财或食制杀为妙`;
    case '伤官格':
      return `${pattern}以${primary}为用神，伤生财或伤配印为要`;
    case '正印格':
    case '偏印格':
      return `${pattern}以${primary}为用神，印护身或印制食为美`;
    case '从财格':
      return `${pattern}顺其势，以财星及食伤生财为用`;
    case '从官格':
      return `${pattern}顺其势，以官星及财星生官为用`;
    case '从儿格':
      return `${pattern}顺其势，以食伤及财星为用`;
    case '从势格':
      return `${pattern}顺其势，以当令之神为用`;
    default:
      return `${pattern}以${primary}为主要用神`;
  }
}

/**
 * 生成格局特征
 */
function generatePatternCharacteristics(
  pattern: string,
  type: PatternType,
  strength: PatternStrength,
  purity: PatternPurity
): string[] {
  const characteristics: string[] = [];

  // 格局类型特征
  switch (type) {
    case 'standard':
      characteristics.push('属正格八格，格局正统');
      break;
    case 'follow':
      characteristics.push('属从格，需顺势而为');
      break;
    case 'transform':
      characteristics.push('属化格，变化玄妙');
      break;
    case 'special':
      characteristics.push('属特殊格局或不入正格');
      break;
  }

  // 强度特征
  switch (strength) {
    case 'strong':
      characteristics.push('格局强旺，气势充足');
      break;
    case 'medium':
      characteristics.push('格局中和，力量适中');
      break;
    case 'weak':
      characteristics.push('格局偏弱，需要扶助');
      break;
  }

  // 纯度特征
  switch (purity) {
    case 'pure':
      characteristics.push('格局纯粹，无破坏因素');
      break;
    case 'mixed':
      characteristics.push('格局有破有立，喜忌参半');
      break;
    case 'broken':
      characteristics.push('格局有破损，需要修复');
      break;
  }

  return characteristics;
}

/**
 * 获取经典依据
 */
function getClassicReference(pattern: string): string {
  const references: Record<string, string> = {
    正官格: '《滴天髓》：正官配印，十有九贵',
    偏官格: '《神峰通考》：七杀有制化为权',
    正财格: '《三命通会》：财配官印，富贵双全',
    偏财格: '《穷通宝鉴》：偏财配杀，英雄独压万人',
    食神格: '《神峰通考》：食神生财，富贵自然',
    伤官格: '《滴天髓》：伤官见官，为祸百端',
    正印格: '《三命通会》：印护身强，贵而有寿',
    偏印格: '《神峰通考》：偏印夺食，凶不可言',
    从财格: '《滴天髓》：从财喜财，宜其冲盈',
    从官格: '《三命通会》：从官喜官，忌其党众',
    从儿格: '《穷通宝鉴》：从儿不杂，此为贵格',
    从势格: '《滴天髓》：从势为贵，反不为佳',
  };

  return references[pattern] || '《三命通会》等古典命理著作';
}

/**
 * 获取理论原理
 */
function getTheoreticalPrinciple(pattern: string, type: PatternType): string {
  switch (type) {
    case 'standard':
      return '正格以月令为主，取月令所藏之神为格局，配合年时干支，以成格局之美';
    case 'follow':
      return '从格者，日主衰弱无根，不能自立，只得从旺神而去，顺势而为';
    case 'transform':
      return '化格者，月令与日时发生特殊组合，能够化合成另一种五行，变化无穷';
    case 'special':
      return '特殊格局不拘常法，需要特殊的判断方法和用神配置';
    default:
      return '格局分析以传统命理学为基础，结合现代实践总结';
  }
}
