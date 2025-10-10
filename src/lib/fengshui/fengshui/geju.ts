import { PALACE_TO_BAGUA, getPalaceByMountain } from './luoshu';
import {
  type FlyingStar,
  type GejuAnalysis,
  type GejuType,
  type Mountain,
  PalaceIndex,
  type Plate,
  type Yun,
} from './types';

// 格局解释
const GEJU_DESCRIPTIONS: Record<GejuType, string> = {
  旺山旺水: '山星和向星都得令，为最吉格局，主丁财两旺',
  上山下水: '山星和向星都失令，为最凶格局，主丁财两败',
  双星会坐: '山星和向星都会聚在坐山宫位，主坐山得气',
  双星会向: '山星和向星都会聚在向山宫位，主向山得气',
  全局合十: '山星、向星、天盘星三者相加都等于十，主全局和谐',
  对宫合十: '坐山和向山宫位的飞星相加等于十，主坐向平衡',
  连珠三般: '运星、山星、向星连续递增，主循序渐进',
  父母三般: '运星、山星、向星间隔递增，主世代传承',
  离宫打劫: '离宫形成特殊格局，主破财但可化解',
  坎宫打劫: '坎宫形成特殊格局，主破财但可化解',
  山星伏吟: '山星与地盘相同，主山星失令',
  向星伏吟: '向星与地盘相同，主向星失令',
  单宫伏吟: '某个宫位出现伏吟，主该宫位不利',
  单宫反吟: '某个宫位出现反吟，主该宫位动荡',
  替卦反伏吟: '替卦时出现反伏吟，主替卦不利',
  七星打劫: '七星打劫格局，主特殊变化',
  三般卦: '三般卦格局，主特殊组合',
  零正颠倒: '零正颠倒格局，主特殊状态',
  城门诀: '城门诀格局，主特殊位置',
};

// 检查旺山旺水格局
export function checkWangshanWangshui(
  plate: Plate,
  zuo: Mountain,
  xiang: Mountain,
  period: Yun
): { isMatch: boolean; description: string } {
  const zuoPalace = getPalaceByMountain(zuo);
  const xiangPalace = getPalaceByMountain(xiang);

  const zuoCell = plate.find((cell) => cell.palace === zuoPalace);
  const xiangCell = plate.find((cell) => cell.palace === xiangPalace);

  if (!zuoCell || !xiangCell) {
    return { isMatch: false, description: '无法找到坐向宫位' };
  }

  const isWangshan = zuoCell.mountainStar === period;
  const isWangshui = xiangCell.facingStar === period;

  if (isWangshan && isWangshui) {
    return { isMatch: true, description: '旺山旺水格局' };
  }

  return { isMatch: false, description: '非旺山旺水格局' };
}

// 检查上山下水格局
export function checkShangshanXiashui(
  plate: Plate,
  zuo: Mountain,
  xiang: Mountain,
  period: Yun
): { isMatch: boolean; description: string } {
  const zuoPalace = getPalaceByMountain(zuo);
  const xiangPalace = getPalaceByMountain(xiang);

  const zuoCell = plate.find((cell) => cell.palace === zuoPalace);
  const xiangCell = plate.find((cell) => cell.palace === xiangPalace);

  if (!zuoCell || !xiangCell) {
    return { isMatch: false, description: '无法找到坐向宫位' };
  }

  // 上山下水：山星在向位，向星在坐位，且都得令
  const isShangshan = zuoCell.facingStar === period;
  const isXiashui = xiangCell.mountainStar === period;

  if (isShangshan && isXiashui) {
    return { isMatch: true, description: '上山下水格局' };
  }

  return { isMatch: false, description: '非上山下水格局' };
}

// 检查双星会向格局
export function checkShuangxingHuixiang(
  plate: Plate,
  xiang: Mountain,
  period: Yun
): { isMatch: boolean; description: string } {
  const xiangPalace = getPalaceByMountain(xiang);
  const xiangCell = plate.find((cell) => cell.palace === xiangPalace);

  if (!xiangCell) {
    return { isMatch: false, description: '无法找到向山宫位' };
  }

  const isShuangxing =
    xiangCell.mountainStar === period && xiangCell.facingStar === period;

  if (isShuangxing) {
    return { isMatch: true, description: '双星会向格局' };
  }

  return { isMatch: false, description: '非双星会向格局' };
}

// 检查双星会坐格局
export function checkShuangxingHuizuo(
  plate: Plate,
  zuo: Mountain,
  period: Yun
): { isMatch: boolean; description: string } {
  const zuoPalace = getPalaceByMountain(zuo);
  const zuoCell = plate.find((cell) => cell.palace === zuoPalace);

  if (!zuoCell) {
    return { isMatch: false, description: '无法找到坐山宫位' };
  }

  const isShuangxing =
    zuoCell.mountainStar === period && zuoCell.facingStar === period;

  if (isShuangxing) {
    return { isMatch: true, description: '双星会坐格局' };
  }

  return { isMatch: false, description: '非双星会坐格局' };
}

// 检查全局合十格局
export function checkQuanjuHeshi(plate: Plate): {
  isMatch: boolean;
  description: string;
} {
  let heshiCount = 0;

  for (const cell of plate) {
    const sum =
      (cell.mountainStar || 0) +
      (cell.facingStar || 0) +
      (cell.periodStar || 0);
    if (sum === 10) {
      heshiCount++;
    }
  }

  if (heshiCount === 9) {
    return { isMatch: true, description: '全局合十格局' };
  }

  return { isMatch: false, description: '非全局合十格局' };
}

// 检查对宫合十格局
export function checkDuigongHeshi(
  plate: Plate,
  zuo: Mountain,
  xiang: Mountain
): { isMatch: boolean; description: string } {
  const zuoPalace = getPalaceByMountain(zuo);
  const xiangPalace = getPalaceByMountain(xiang);

  const zuoCell = plate.find((cell) => cell.palace === zuoPalace);
  const xiangCell = plate.find((cell) => cell.palace === xiangPalace);

  if (!zuoCell || !xiangCell) {
    return { isMatch: false, description: '无法找到坐向宫位' };
  }

  const zuoSum = (zuoCell.mountainStar || 0) + (zuoCell.facingStar || 0);
  const xiangSum = (xiangCell.mountainStar || 0) + (xiangCell.facingStar || 0);

  if (zuoSum === 10 && xiangSum === 10) {
    return { isMatch: true, description: '对宫合十格局' };
  }

  return { isMatch: false, description: '非对宫合十格局' };
}

// 检查连珠三般格局
export function checkLianzhuSanban(
  period: Yun,
  shanStar: FlyingStar,
  xiangStar: FlyingStar
): { isMatch: boolean; description: string } {
  const periodNum = Number(period);
  const shanNum = Number(shanStar);
  const xiangNum = Number(xiangStar);

  const sorted = [periodNum, shanNum, xiangNum].sort((a, b) => a - b);

  if (sorted[1] - sorted[0] === 1 && sorted[2] - sorted[1] === 1) {
    return { isMatch: true, description: '连珠三般格局' };
  }

  return { isMatch: false, description: '非连珠三般格局' };
}

// 检查父母三般格局
export function checkFumuSanban(
  period: Yun,
  shanStar: FlyingStar,
  xiangStar: FlyingStar
): { isMatch: boolean; description: string } {
  const periodNum = Number(period);
  const shanNum = Number(shanStar);
  const xiangNum = Number(xiangStar);

  const sorted = [periodNum, shanNum, xiangNum].sort((a, b) => a - b);

  if (sorted[1] - sorted[0] === 3 && sorted[2] - sorted[1] === 3) {
    return { isMatch: true, description: '父母三般格局' };
  }

  return { isMatch: false, description: '非父母三般格局' };
}

// 检查伏吟格局
export function checkFuyin(plate: Plate): {
  isMatch: boolean;
  description: string;
  locations: string[];
} {
  const fuyinLocations: string[] = [];

  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];

    // 山星伏吟
    if (cell.mountainStar === cell.periodStar) {
      fuyinLocations.push(`${bagua}宫山星伏吟`);
    }

    // 向星伏吟
    if (cell.facingStar === cell.periodStar) {
      fuyinLocations.push(`${bagua}宫向星伏吟`);
    }
  }

  if (fuyinLocations.length > 0) {
    return {
      isMatch: true,
      description: '伏吟格局',
      locations: fuyinLocations,
    };
  }

  return { isMatch: false, description: '非伏吟格局', locations: [] };
}

// 检查反吟格局
export function checkFanyin(plate: Plate): {
  isMatch: boolean;
  description: string;
  locations: string[];
} {
  const fanyinLocations: string[] = [];

  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];

    // 山星反吟（山星+地盘=10）
    if (cell.mountainStar && cell.periodStar) {
      const sum = Number(cell.mountainStar) + Number(cell.periodStar);
      if (sum === 10) {
        fanyinLocations.push(`${bagua}宫山星反吟`);
      }
    }

    // 向星反吟（向星+地盘=10）
    if (cell.facingStar && cell.periodStar) {
      const sum = Number(cell.facingStar) + Number(cell.periodStar);
      if (sum === 10) {
        fanyinLocations.push(`${bagua}宫向星反吟`);
      }
    }
  }

  if (fanyinLocations.length > 0) {
    return {
      isMatch: true,
      description: '反吟格局',
      locations: fanyinLocations,
    };
  }

  return { isMatch: false, description: '非反吟格局', locations: [] };
}

// 综合分析格局
export function analyzeGeju(
  plate: Plate,
  zuo: Mountain,
  xiang: Mountain,
  period: Yun,
  isJian = false
): GejuAnalysis {
  const gejuTypes: GejuType[] = [];
  const descriptions: string[] = [];

  // 检查各种格局
  const wangshanWangshui = checkWangshanWangshui(plate, zuo, xiang, period);
  if (wangshanWangshui.isMatch) {
    gejuTypes.push('旺山旺水');
    descriptions.push(wangshanWangshui.description);
  }

  const shangshanXiashui = checkShangshanXiashui(plate, zuo, xiang, period);
  if (shangshanXiashui.isMatch) {
    gejuTypes.push('上山下水');
    descriptions.push(shangshanXiashui.description);
  }

  const shuangxingHuixiang = checkShuangxingHuixiang(plate, xiang, period);
  if (shuangxingHuixiang.isMatch) {
    gejuTypes.push('双星会向');
    descriptions.push(shuangxingHuixiang.description);
  }

  const shuangxingHuizuo = checkShuangxingHuizuo(plate, zuo, period);
  if (shuangxingHuizuo.isMatch) {
    gejuTypes.push('双星会坐');
    descriptions.push(shuangxingHuizuo.description);
  }

  const quanjuHeshi = checkQuanjuHeshi(plate);
  if (quanjuHeshi.isMatch) {
    gejuTypes.push('全局合十');
    descriptions.push(quanjuHeshi.description);
  }

  const duigongHeshi = checkDuigongHeshi(plate, zuo, xiang);
  if (duigongHeshi.isMatch) {
    gejuTypes.push('对宫合十');
    descriptions.push(duigongHeshi.description);
  }

  // 获取山向星用于三般格局检查
  const zuoPalace = getPalaceByMountain(zuo);
  const xiangPalace = getPalaceByMountain(xiang);
  const zuoCell = plate.find((cell) => cell.palace === zuoPalace);
  const xiangCell = plate.find((cell) => cell.palace === xiangPalace);

  if (zuoCell && xiangCell) {
    const lianzhuSanban = checkLianzhuSanban(
      period,
      zuoCell.mountainStar,
      xiangCell.facingStar
    );
    if (lianzhuSanban.isMatch) {
      gejuTypes.push('连珠三般');
      descriptions.push(lianzhuSanban.description);
    }

    const fumusanban = checkFumuSanban(
      period,
      zuoCell.mountainStar,
      xiangCell.facingStar
    );
    if (fumusanban.isMatch) {
      gejuTypes.push('父母三般');
      descriptions.push(fumusanban.description);
    }
  }

  const fuyin = checkFuyin(plate);
  if (fuyin.isMatch) {
    gejuTypes.push('单宫伏吟');
    descriptions.push(fuyin.description + '：' + fuyin.locations.join('、'));
  }

  const fanyin = checkFanyin(plate);
  if (fanyin.isMatch) {
    gejuTypes.push('单宫反吟');
    descriptions.push(fanyin.description + '：' + fanyin.locations.join('、'));
  }

  // 替卦反伏吟
  if (isJian && period === 5) {
    const specialPairs = ['乾巽', '巽乾', '亥巳', '巳亥', '辰戌', '戌辰'];
    const zuoXiang = zuo + xiang;
    if (specialPairs.includes(zuoXiang)) {
      gejuTypes.push('替卦反伏吟');
      descriptions.push('替卦反伏吟格局');
    }
  }

  // 判断整体吉凶
  const favorableGeju = [
    '旺山旺水',
    '双星会向',
    '双星会坐',
    '全局合十',
    '对宫合十',
    '连珠三般',
    '父母三般',
  ];
  const unfavorableGeju = [
    '上山下水',
    '山星伏吟',
    '向星伏吟',
    '单宫伏吟',
    '单宫反吟',
    '替卦反伏吟',
  ];

  const hasFavorable = gejuTypes.some((type) => favorableGeju.includes(type));
  const hasUnfavorable = gejuTypes.some((type) =>
    unfavorableGeju.includes(type)
  );

  const isFavorable = hasFavorable && !hasUnfavorable;

  return {
    types: gejuTypes,
    descriptions,
    isFavorable,
  };
}
