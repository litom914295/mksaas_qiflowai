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

// 生成山盘
export function generateShanpan(
  tianpan: Plate,
  zuo: Mountain,
  isJian = false
): Plate {
  const zuoPalace = getPalaceByMountain(zuo);
  const zuoYuanLong = getYuanLong(zuo);

  // 获取坐山对应的天盘飞星
  const tianpanCell = tianpan.find((cell) => cell.palace === zuoPalace);
  if (!tianpanCell) throw new Error('找不到坐山对应的天盘飞星');

  let shanStar = tianpanCell.periodStar!;

  // 替卦处理
  if (isJian) {
    // 这里需要根据替卦规则调整飞星
    // 简化实现，实际需要更复杂的替卦表
    shanStar = shanStar; // 暂时保持原样
  }

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

// 生成向盘
export function generateXiangpan(
  tianpan: Plate,
  xiang: Mountain,
  isJian = false
): Plate {
  const xiangPalace = getPalaceByMountain(xiang);
  const xiangYuanLong = getYuanLong(xiang);

  // 获取向山对应的天盘飞星
  const tianpanCell = tianpan.find((cell) => cell.palace === xiangPalace);
  if (!tianpanCell) throw new Error('找不到向山对应的天盘飞星');

  let xiangStar = tianpanCell.periodStar!;

  // 替卦处理
  if (isJian) {
    // 这里需要根据替卦规则调整飞星
    xiangStar = xiangStar; // 暂时保持原样
  }

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
