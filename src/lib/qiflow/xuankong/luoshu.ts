import type { FlyingStar, Mountain, PalaceIndex, Plate } from './types';

// 洛书九宫顺序（中心→西北→西→东北→南→北→西南→东→东南）
export const LUOSHU_ORDER: PalaceIndex[] = [
  5, 6, 7, 8, 9, 1, 2, 3, 4,
] as PalaceIndex[];

// 九宫八卦对应关系
export const PALACE_TO_BAGUA: Record<PalaceIndex, string> = {
  1: '坎',
  2: '坤',
  3: '震',
  4: '巽',
  5: '中',
  6: '乾',
  7: '兑',
  8: '艮',
  9: '离',
};

// 八卦对应九宫
export const BAGUA_TO_PALACE: Record<string, PalaceIndex> = {
  坎: 1,
  坤: 2,
  震: 3,
  巽: 4,
  中: 5,
  乾: 6,
  兑: 7,
  艮: 8,
  离: 9,
};

// 二十四山对应八卦
export const MOUNTAIN_TO_BAGUA: Record<Mountain, string> = {
  子: '坎',
  癸: '坎',
  丑: '艮',
  艮: '艮',
  寅: '艮',
  甲: '震',
  卯: '震',
  乙: '震',
  辰: '巽',
  巽: '巽',
  巳: '巽',
  丙: '离',
  午: '离',
  丁: '离',
  未: '坤',
  坤: '坤',
  申: '坤',
  庚: '兑',
  酉: '兑',
  辛: '兑',
  戌: '乾',
  乾: '乾',
  亥: '乾',
  壬: '坎',
};

// 九星顺飞函数（按1..9循环，前进steps）
export function shunFei(start: FlyingStar, steps: number): FlyingStar {
  // 正确公式：((start - 1 + steps) % 9) + 1
  const result = ((start - 1 + (steps % 9) + 9) % 9) + 1;
  return result as FlyingStar;
}

// 九星逆飞函数（按1..9循环，后退steps）
export function niFei(start: FlyingStar, steps: number): FlyingStar {
  // 正确公式：((start - 1 - steps) % 9 + 9) % 9 再 +1
  const result = ((start - 1 - (steps % 9) + 9 * 2) % 9) + 1;
  return result as FlyingStar;
}

// 生成天盘（运盘）
export function generateTianpan(period: FlyingStar): Plate {
  const plate: Plate = [];
  let current = period;

  for (let idx = 0; idx < 9; idx++) {
    const palace = LUOSHU_ORDER[idx];
    plate.push({
      palace,
      mountainStar: current as FlyingStar,
      facingStar: current as FlyingStar,
      periodStar: current as FlyingStar,
    });
    current = shunFei(current, 1);
  }

  return plate.sort((a, b) => a.palace - b.palace) as Plate;
}

// 根据山向获取对应的九宫位置
export function getPalaceByMountain(mountain: Mountain): PalaceIndex {
  const bagua = MOUNTAIN_TO_BAGUA[mountain];
  return BAGUA_TO_PALACE[bagua];
}

// 获取山向的元龙属性（用于判断顺逆飞）
export function getYuanLong(mountain: Mountain): '天' | '人' | '地' {
  // 天元龙：子午卯酉乾坤艮巽
  if (['子', '午', '卯', '酉', '乾', '坤', '艮', '巽'].includes(mountain)) {
    return '天';
  }
  // 人元龙：乙辛丁癸
  if (['乙', '辛', '丁', '癸'].includes(mountain)) {
    return '人';
  }
  // 地元龙：甲庚丙壬辰戌丑未
  return '地';
}

// 获取九星对应的八卦
export function getBaguaByStar(star: FlyingStar): string {
  const starToBagua: Record<FlyingStar, string> = {
    1: '坎',
    2: '坤',
    3: '震',
    4: '巽',
    5: '中',
    6: '乾',
    7: '兑',
    8: '艮',
    9: '离',
  };
  return starToBagua[star];
}

// 获取八卦的阴阳属性
export function getBaguaYinYang(bagua: string): '阴' | '阳' {
  const yinBagua = ['坤', '巽', '离', '兑'];
  return yinBagua.includes(bagua) ? '阴' : '阳';
}

/**
 * 获取飞星的对宫星（用于简单替卦）
 *
 * 对宫星映射规则：
 * - 1 ↔ 9 (坎 ↔ 离)
 * - 2 ↔ 8 (坤 ↔ 艮)
 * - 3 ↔ 7 (震 ↔ 兑)
 * - 4 ↔ 6 (巽 ↔ 乾)
 * - 5 ↔ 5 (中宫，无对宫)
 *
 * @param star - 原始飞星（1-9）
 * @returns 对宫飞星
 *
 * @example
 * ```typescript
 * getOppositeStar(1); // 返回 9
 * getOppositeStar(8); // 返回 2
 * getOppositeStar(5); // 返回 5（特殊情况）
 * ```
 *
 * @internal 此函数为内部实现，不对外导出
 */
function getOppositeStar(star: FlyingStar): FlyingStar {
  const oppositeMap: Record<FlyingStar, FlyingStar> = {
    1: 9,
    2: 8,
    3: 7,
    4: 6,
    5: 5,
    6: 4,
    7: 3,
    8: 2,
    9: 1,
  };
  return oppositeMap[star];
}

/**
 * 判断是否需要简单替卦（伏吟检测）
 *
 * 替卦触发条件：
 * - 天盘（运盘）的飞星与该宫位的本宫星相同
 * - 即：会造成伏吟格局
 *
 * 伏吟含义：
 * - 运盘与山盘/向盘的飞星完全一致
 * - 风水上主停滞、重复、无突破
 * - 需要通过替卦化解
 *
 * @param palace - 宫位（1-9）
 * @param tianpan - 天盘（运盘）
 * @returns 是否需要替卦
 *
 * @example
 * ```typescript
 * // 八运（8入中宫），艮宫（8宫）
 * const tianpan = generateTianpan(8);
 * shouldApplySimpleTigua(8, tianpan); // true（8宫天盘星为8，伏吟）
 * shouldApplySimpleTigua(1, tianpan); // false（1宫天盘星为7，非伏吟）
 * ```
 *
 * @internal 此函数为内部实现，不对外导出
 */
function shouldApplySimpleTigua(palace: PalaceIndex, tianpan: Plate): boolean {
  const tianpanCell = tianpan.find((c) => c.palace === palace);
  if (!tianpanCell || !tianpanCell.periodStar) return false;

  // 伏吟判断：天盘星 === 本宫星
  return tianpanCell.periodStar === (palace as FlyingStar);
}

/**
 * 生成山盘（山星飞星排盘）
 *
 * 山盘生成流程：
 * 1. 根据坐山找到对应宫位
 * 2. 获取该宫位的天盘飞星作为起始星
 * 3. 如果启用替卦且检测到伏吟，使用对宫星替代
 * 4. 根据起始星的八卦阴阳属性和元龙属性决定顺飞或逆飞
 * 5. 按洛书顺序（5→6→7→8→9→1→2→3→4）排布飞星
 *
 * @param tianpan - 天盘（运盘）
 * @param zuo - 坐山（二十四山之一）
 * @param isJian - 是否兼向（默认 false）
 * @param applyTigua - 是否启用简单替卦（默认 false）
 * @returns 山盘
 *
 * @example
 * ```typescript
 * // 八运，艮山坤向，不启用替卦
 * const tianpan = generateTianpan(8);
 * const shanpan = generateShanpan(tianpan, '艮', false, false);
 * // 艮宫山星为8（伏吟但未启用替卦）
 *
 * // 八运，艮山坤向，启用替卦
 * const shanpanWithTigua = generateShanpan(tianpan, '艮', false, true);
 * // 艮宫山星为2（伏吟触发，8替换为对宫星2）
 * ```
 *
 * @remarks
 * - 兼向（isJian）暂不影响飞星起始点，仅用于格局分析
 * - 简单替卦采用对宫星替换法，与增强替卦（规则表法）互补
 * - 默认不启用替卦以保持向后兼容
 */
export function generateShanpan(
  tianpan: Plate,
  zuo: Mountain,
  isJian = false,
  applyTigua = false
): Plate {
  const zuoPalace = getPalaceByMountain(zuo);
  const zuoYuanLong = getYuanLong(zuo);

  // 获取坐山对应的天盘飞星
  const tianpanCell = tianpan.find((cell) => cell.palace === zuoPalace);
  if (!tianpanCell) throw new Error('找不到坐山对应的天盘飞星');

  let shanStar = tianpanCell.periodStar!;

  // 替卦处理：如果启用且检测到伏吟，使用对宫星
  if (applyTigua && shouldApplySimpleTigua(zuoPalace, tianpan)) {
    shanStar = getOppositeStar(shanStar);
  }

  // 注意：兼向（isJian）暂不影响飞星起始点
  // 兼向主要用于格局分析和风水评价，不改变基础飞星排盘
  // 如需实现兼向影响飞星，可在 enhanced-tigua.ts 中处理

  // 根据元龙属性决定顺逆飞
  const bagua = getBaguaByStar(shanStar);
  const baguaYinYang = getBaguaYinYang(bagua);
  const isShun =
    (baguaYinYang === '阳' && zuoYuanLong === '天') ||
    (baguaYinYang === '阴' && zuoYuanLong === '人');

  const plate: Plate = [];
  let current = shanStar;

  for (let idx = 0; idx < 9; idx++) {
    const palace = LUOSHU_ORDER[idx];
    plate.push({
      palace,
      mountainStar: current as FlyingStar,
      facingStar: 0 as FlyingStar, // 山盘不设置向星
      periodStar: tianpan.find((c) => c.palace === palace)?.periodStar,
    });

    if (isShun) {
      current = shunFei(current, 1);
    } else {
      current = niFei(current, 1);
    }
  }

  return plate.sort((a, b) => a.palace - b.palace) as Plate;
}

/**
 * 生成向盘（向星飞星排盘）
 *
 * 向盘生成流程：
 * 1. 根据向山找到对应宫位
 * 2. 获取该宫位的天盘飞星作为起始星
 * 3. 如果启用替卦且检测到伏吟，使用对宫星替代
 * 4. 根据起始星的八卦阴阳属性和元龙属性决定顺飞或逆飞
 * 5. 按洛书顺序（5→6→7→8→9→1→2→3→4）排布飞星
 *
 * @param tianpan - 天盘（运盘）
 * @param xiang - 向山（二十四山之一）
 * @param isJian - 是否兼向（默认 false）
 * @param applyTigua - 是否启用简单替卦（默认 false）
 * @returns 向盘
 *
 * @example
 * ```typescript
 * // 九运，午山子向，不启用替卦
 * const tianpan = generateTianpan(9);
 * const xiangpan = generateXiangpan(tianpan, '午', false, false);
 * // 午向离宫向星为9（伏吟但未启用替卦）
 *
 * // 九运，午山子向，启用替卦
 * const xiangpanWithTigua = generateXiangpan(tianpan, '午', false, true);
 * // 午向离宫向星为1（伏吟触发，9替换为对宫星1）
 * ```
 *
 * @remarks
 * - 向盘替卦逻辑与山盘一致
 * - 兼向（isJian）暂不影响飞星起始点
 */
export function generateXiangpan(
  tianpan: Plate,
  xiang: Mountain,
  isJian = false,
  applyTigua = false
): Plate {
  const xiangPalace = getPalaceByMountain(xiang);
  const xiangYuanLong = getYuanLong(xiang);

  // 获取向山对应的天盘飞星
  const tianpanCell = tianpan.find((cell) => cell.palace === xiangPalace);
  if (!tianpanCell) throw new Error('找不到向山对应的天盘飞星');

  let xiangStar = tianpanCell.periodStar!;

  // 替卦处理：如果启用且检测到伏吟，使用对宫星
  if (applyTigua && shouldApplySimpleTigua(xiangPalace, tianpan)) {
    xiangStar = getOppositeStar(xiangStar);
  }

  // 注意：兼向（isJian）暂不影响飞星起始点

  // 根据元龙属性决定顺逆飞
  const bagua = getBaguaByStar(xiangStar);
  const baguaYinYang = getBaguaYinYang(bagua);
  const isShun =
    (baguaYinYang === '阳' && xiangYuanLong === '天') ||
    (baguaYinYang === '阴' && xiangYuanLong === '人');

  const plate: Plate = [];
  let current = xiangStar;

  for (let idx = 0; idx < 9; idx++) {
    const palace = LUOSHU_ORDER[idx];
    plate.push({
      palace,
      mountainStar: 0 as FlyingStar, // 向盘不设置山星
      facingStar: current as FlyingStar,
      periodStar: tianpan.find((c) => c.palace === palace)?.periodStar,
    });

    if (isShun) {
      current = shunFei(current, 1);
    } else {
      current = niFei(current, 1);
    }
  }

  return plate.sort((a, b) => a.palace - b.palace) as Plate;
}

// 合并山盘和向盘
export function mergePlates(
  tianpan: Plate,
  shanpan: Plate,
  xiangpan: Plate
): Plate {
  const plate: Plate = [];

  for (let i = 1; i <= 9; i++) {
    const palace = i as PalaceIndex;
    const tianCell = tianpan.find((c) => c.palace === palace);
    const shanCell = shanpan.find((c) => c.palace === palace);
    const xiangCell = xiangpan.find((c) => c.palace === palace);

    plate.push({
      palace,
      mountainStar: shanCell?.mountainStar || (0 as FlyingStar),
      facingStar: xiangCell?.facingStar || (0 as FlyingStar),
      periodStar: tianCell?.periodStar,
    });
  }

  return plate;
}
