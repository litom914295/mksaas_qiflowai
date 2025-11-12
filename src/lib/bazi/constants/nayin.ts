/**
 * 纳音五行查找表
 * 基于60甲子顺序构建,确保查找准确性
 * 
 * 参考资料:
 * - 《渊海子平》
 * - 《三命通会》
 * 
 * @module bazi/constants/nayin
 */

/** 60甲子顺序表 */
export const SEXAGENARY_CYCLE = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
] as const;

/** 纳音五行表 (30组,每组对应2个干支) */
export const NAYIN_LIST = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
  '山头火', '涧下水', '城墙土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
  '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '佛灯火', '天河水', '大驿土', '钗钏金', '桑柘木',
  '大溪水', '沙中土', '天上火', '石榴木', '大海水',
] as const;

/** 纳音查找Map (预计算,性能最优 O(1) 查找) */
const NAYIN_MAP = new Map<string, string>();

// 初始化纳音映射
for (let i = 0; i < SEXAGENARY_CYCLE.length; i++) {
  const ganZhi = SEXAGENARY_CYCLE[i];
  const nayinIndex = Math.floor(i / 2); // 每2个干支对应1个纳音
  NAYIN_MAP.set(ganZhi, NAYIN_LIST[nayinIndex]);
}

/**
 * 获取纳音五行
 * @param gan 天干
 * @param zhi 地支
 * @returns 纳音五行名称,如"海中金"
 * 
 * @example
 * ```ts
 * getNayin('甲', '子') // => '海中金'
 * getNayin('乙', '丑') // => '海中金'
 * getNayin('壬', '戌') // => '大海水'
 * getNayin('癸', '亥') // => '大海水'
 * ```
 */
export function getNayin(gan: string, zhi: string): string {
  const ganZhi = gan + zhi;
  return NAYIN_MAP.get(ganZhi) || '未知';
}

/**
 * 获取纳音五行(基于60甲子索引)
 * @param index 60甲子索引 (0-59)
 * @returns 纳音五行名称
 * 
 * @example
 * ```ts
 * getNayinByIndex(0) // => '海中金' (甲子)
 * getNayinByIndex(1) // => '海中金' (乙丑)
 * getNayinByIndex(59) // => '大海水' (癸亥)
 * ```
 */
export function getNayinByIndex(index: number): string {
  if (index < 0 || index >= 60) return '未知';
  const nayinIndex = Math.floor(index / 2);
  return NAYIN_LIST[nayinIndex];
}

/**
 * 验证纳音表完整性
 * @returns 验证结果
 * 
 * @example
 * ```ts
 * const { isValid, errors } = validateNayinTable();
 * if (!isValid) {
 *   console.error('纳音表验证失败:', errors);
 * }
 * ```
 */
export function validateNayinTable(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 检查60甲子是否都有纳音
  for (const ganZhi of SEXAGENARY_CYCLE) {
    if (!NAYIN_MAP.has(ganZhi)) {
      errors.push(`缺少${ganZhi}的纳音定义`);
    }
  }

  // 检查纳音数量
  if (NAYIN_LIST.length !== 30) {
    errors.push(`纳音应该有30组,当前有${NAYIN_LIST.length}组`);
  }

  // 检查60甲子数量
  if (SEXAGENARY_CYCLE.length !== 60) {
    errors.push(`60甲子应该有60个,当前有${SEXAGENARY_CYCLE.length}个`);
  }

  // 检查Map完整性
  if (NAYIN_MAP.size !== 60) {
    errors.push(`纳音Map应该有60个映射,当前有${NAYIN_MAP.size}个`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 获取纳音五行的详细信息
 * @param nayin 纳音名称
 * @returns 纳音详细信息
 */
export function getNayinInfo(nayin: string): {
  name: string;
  element: '金' | '木' | '水' | '火' | '土' | '未知';
  description: string;
} {
  const nayinMap: Record<string, { element: '金' | '木' | '水' | '火' | '土'; description: string }> = {
    海中金: { element: '金', description: '海中金,深藏不露,需要开采方能显现价值' },
    炉中火: { element: '火', description: '炉中火,炽热旺盛,光明磊落' },
    大林木: { element: '木', description: '大林木,根基深厚,成就大业' },
    路旁土: { element: '土', description: '路旁土,稳重踏实,任劳任怨' },
    剑锋金: { element: '金', description: '剑锋金,锋利无比,性格刚毅' },
    山头火: { element: '火', description: '山头火,光芒万丈,热情奔放' },
    涧下水: { element: '水', description: '涧下水,清澈流动,智慧灵活' },
    城墙土: { element: '土', description: '城墙土,厚重稳固,具有防护力' },
    白蜡金: { element: '金', description: '白蜡金,温润柔和,内敛含蓄' },
    杨柳木: { element: '木', description: '杨柳木,柔韧坚强,适应力强' },
    泉中水: { element: '水', description: '泉中水,源源不断,生生不息' },
    屋上土: { element: '土', description: '屋上土,遮风挡雨,具有保护性' },
    霹雳火: { element: '火', description: '霹雳火,爆发力强,雷厉风行' },
    松柏木: { element: '木', description: '松柏木,坚韧不拔,傲雪凌霜' },
    长流水: { element: '水', description: '长流水,源远流长,持续不断' },
    沙中金: { element: '金', description: '沙中金,隐藏深邃,需要淘洗' },
    山下火: { element: '火', description: '山下火,温暖人心,聚集力量' },
    平地木: { element: '木', description: '平地木,平易近人,生机勃勃' },
    壁上土: { element: '土', description: '壁上土,稳固可靠,具有支撑力' },
    金箔金: { element: '金', description: '金箔金,光彩夺目,华丽显贵' },
    佛灯火: { element: '火', description: '佛灯火,神圣光明,智慧之光' },
    天河水: { element: '水', description: '天河水,浩瀚无垠,包容万物' },
    大驿土: { element: '土', description: '大驿土,承载厚重,路途遥远' },
    钗钏金: { element: '金', description: '钗钏金,精美细腻,贵重典雅' },
    桑柘木: { element: '木', description: '桑柘木,培育生命,默默奉献' },
    大溪水: { element: '水', description: '大溪水,奔腾不息,势不可挡' },
    沙中土: { element: '土', description: '沙中土,细腻松散,易于变化' },
    天上火: { element: '火', description: '天上火,照耀大地,威力无穷' },
    石榴木: { element: '木', description: '石榴木,果实累累,硕果丰收' },
    大海水: { element: '水', description: '大海水,广阔深邃,包罗万象' },
  };

  const info = nayinMap[nayin];
  if (!info) {
    return {
      name: nayin,
      element: '未知',
      description: '未知纳音',
    };
  }

  return {
    name: nayin,
    ...info,
  };
}

/**
 * 导出所有纳音五行
 * @returns 所有纳音五行数组
 */
export function getAllNayin(): string[] {
  return [...NAYIN_LIST];
}

/**
 * 获取指定纳音五行对应的干支
 * @param nayin 纳音五行名称
 * @returns 对应的干支数组
 * 
 * @example
 * ```ts
 * getGanZhiByNayin('海中金') // => ['甲子', '乙丑']
 * getGanZhiByNayin('大海水') // => ['壬戌', '癸亥']
 * ```
 */
export function getGanZhiByNayin(nayin: string): string[] {
  const ganZhiList: string[] = [];
  
  for (const [ganZhi, nayinValue] of NAYIN_MAP) {
    if (nayinValue === nayin) {
      ganZhiList.push(ganZhi);
    }
  }
  
  return ganZhiList;
}
