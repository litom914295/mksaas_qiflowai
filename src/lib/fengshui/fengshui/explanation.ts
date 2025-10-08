import { PALACE_TO_BAGUA } from './luoshu';
import { getPalaceStatus, getStarMeaning } from './positions';
import { FlyingStar, GejuAnalysis, PalaceIndex, Plate } from './types';

export interface PalaceExplanation {
  palace: PalaceIndex;
  bagua: string;
  tianpan: {
    star: FlyingStar;
    name: string;
    meaning: string;
  };
  shanpan: {
    star: FlyingStar;
    name: string;
    meaning: string;
  } | null;
  xiangpan: {
    star: FlyingStar;
    name: string;
    meaning: string;
  } | null;
  overall: {
    score: number;
    level: '大吉' | '吉' | '平' | '凶' | '大凶';
    summary: string;
    suggestions: string[];
  };
}

export interface FlyingStarExplanation {
  period: FlyingStar;
  periodName: string;
  geju: GejuAnalysis;
  wenchangwei: string;
  caiwei: string;
  palaces: PalaceExplanation[];
  summary: {
    favorablePalaces: string[];
    unfavorablePalaces: string[];
    keyPoints: string[];
    recommendations: string[];
  };
}

// 获取运星名称
export function getPeriodName(period: FlyingStar): string {
  const periodNames: Record<FlyingStar, string> = {
    1: '一运（1864-1883）',
    2: '二运（1884-1903）',
    3: '三运（1904-1923）',
    4: '四运（1924-1943）',
    5: '五运（1944-1963）',
    6: '六运（1964-1983）',
    7: '七运（1984-2003）',
    8: '八运（2004-2023）',
    9: '九运（2024-2043）'
  };
  return periodNames[period];
}

// 生成宫位解释
export function generatePalaceExplanation(
  plate: Plate,
  period: FlyingStar,
  palace: PalaceIndex
): PalaceExplanation {
  const cell = plate.find(c => c.palace === palace);
  if (!cell) {
    throw new Error(`找不到宫位 ${palace} 的数据`);
  }
  
  const bagua = PALACE_TO_BAGUA[palace];
  const palaceStatus = getPalaceStatus(plate, period)[palace];
  
  // 天盘解释
  const tianpan = {
    star: cell.periodStar!,
    name: getStarMeaning(cell.periodStar!, palaceStatus.tianpan.status).name,
    meaning: getStarMeaning(cell.periodStar!, palaceStatus.tianpan.status).meaning
  };
  
  // 山盘解释
  const shanpan = cell.mountainStar ? {
    star: cell.mountainStar,
    name: getStarMeaning(cell.mountainStar, palaceStatus.shanpan!.status).name,
    meaning: getStarMeaning(cell.mountainStar, palaceStatus.shanpan!.status).meaning
  } : null;
  
  // 向盘解释
  const xiangpan = cell.facingStar ? {
    star: cell.facingStar,
    name: getStarMeaning(cell.facingStar, palaceStatus.xiangpan!.status).name,
    meaning: getStarMeaning(cell.facingStar, palaceStatus.xiangpan!.status).meaning
  } : null;
  
  // 整体评价
  let score = 0;
  let level: '大吉' | '吉' | '平' | '凶' | '大凶' = '平';
  let summary = '';
  const suggestions: string[] = [];
  
  // 计算分数
  if (palaceStatus.tianpan.status === '旺') score += 3;
  else if (palaceStatus.tianpan.status === '生') score += 2;
  else if (palaceStatus.tianpan.status === '退') score += 1;
  else if (palaceStatus.tianpan.status === '煞') score -= 1;
  else if (palaceStatus.tianpan.status === '死') score -= 2;
  
  if (palaceStatus.shanpan) {
    if (palaceStatus.shanpan.status === '旺') score += 2;
    else if (palaceStatus.shanpan.status === '生') score += 1;
    else if (palaceStatus.shanpan.status === '退') score += 0.5;
    else if (palaceStatus.shanpan.status === '煞') score -= 1;
    else if (palaceStatus.shanpan.status === '死') score -= 2;
  }
  
  if (palaceStatus.xiangpan) {
    if (palaceStatus.xiangpan.status === '旺') score += 2;
    else if (palaceStatus.xiangpan.status === '生') score += 1;
    else if (palaceStatus.xiangpan.status === '退') score += 0.5;
    else if (palaceStatus.xiangpan.status === '煞') score -= 1;
    else if (palaceStatus.xiangpan.status === '死') score -= 2;
  }
  
  // 确定等级
  if (score >= 4) level = '大吉';
  else if (score >= 2) level = '吉';
  else if (score >= 0) level = '平';
  else if (score >= -2) level = '凶';
  else level = '大凶';
  
  // 生成总结
  if (level === '大吉') {
    summary = `${bagua}宫位得令，三盘皆旺，主大吉大利`;
    suggestions.push('此方位适合重要活动，如办公、学习、休息等');
  } else if (level === '吉') {
    summary = `${bagua}宫位得气，主吉利`;
    suggestions.push('此方位适合日常使用，可适当布置');
  } else if (level === '平') {
    summary = `${bagua}宫位平稳，无大吉大凶`;
    suggestions.push('此方位可正常使用，无需特别处理');
  } else if (level === '凶') {
    summary = `${bagua}宫位失令，主不利`;
    suggestions.push('此方位不宜重要活动，需要化解');
    suggestions.push('可在此方位放置化解物品，如植物、水晶等');
  } else {
    summary = `${bagua}宫位大凶，主严重不利`;
    suggestions.push('此方位绝对不宜使用，必须化解');
    suggestions.push('建议请专业风水师进行化解');
  }
  
  // 特殊建议
  if (cell.mountainStar === 5 || cell.facingStar === 5) {
    suggestions.push('五黄星出现，需要特别化解');
  }
  
  if (cell.mountainStar && cell.facingStar && cell.mountainStar === cell.facingStar) {
    suggestions.push('山向同星，主稳定但缺乏变化');
  }
  
  return {
    palace,
    bagua,
    tianpan,
    shanpan,
    xiangpan,
    overall: {
      score,
      level,
      summary,
      suggestions
    }
  };
}

// 生成完整解释
export function generateFlyingStarExplanation(
  plate: Plate,
  period: FlyingStar,
  geju: GejuAnalysis,
  wenchangwei: string,
  caiwei: string
): FlyingStarExplanation {
  const periodName = getPeriodName(period);
  
  // 生成各宫位解释
  const palaces: PalaceExplanation[] = [];
  for (let i = 1; i <= 9; i++) {
    palaces.push(generatePalaceExplanation(plate, period, i as PalaceIndex));
  }
  
  // 分析有利和不利宫位
  const favorablePalaces = palaces
    .filter(p => p.overall.level === '大吉' || p.overall.level === '吉')
    .map(p => p.bagua);
  
  const unfavorablePalaces = palaces
    .filter(p => p.overall.level === '凶' || p.overall.level === '大凶')
    .map(p => p.bagua);
  
  // 关键要点
  const keyPoints: string[] = [];
  
  if (geju.isFavorable) {
    keyPoints.push('整体格局吉利，符合风水要求');
  } else {
    keyPoints.push('整体格局需要调整，存在不利因素');
  }
  
  if (geju.types.includes('旺山旺水')) {
    keyPoints.push('旺山旺水格局，主丁财两旺');
  }
  
  if (geju.types.includes('上山下水')) {
    keyPoints.push('上山下水格局，主丁财两败，需要化解');
  }
  
  if (favorablePalaces.length > 0) {
    keyPoints.push(`有利方位：${favorablePalaces.join('、')}`);
  }
  
  if (unfavorablePalaces.length > 0) {
    keyPoints.push(`不利方位：${unfavorablePalaces.join('、')}`);
  }
  
  // 建议
  const recommendations: string[] = [];
  
  recommendations.push(`文昌位在${wenchangwei}，适合学习、工作`);
  recommendations.push(`财位在${caiwei}，适合布置财位`);
  
  if (favorablePalaces.length > 0) {
    recommendations.push(`建议在${favorablePalaces.join('、')}方位布置重要功能区`);
  }
  
  if (unfavorablePalaces.length > 0) {
    recommendations.push(`建议在${unfavorablePalaces.join('、')}方位进行化解`);
  }
  
  // 检查是否有五黄星相关的凶险格局
  if (geju.types.some(type => ['上山下水', '山星伏吟', '向星伏吟'].includes(type))) {
    recommendations.push('存在凶险格局，需要特别化解');
  }
  
  return {
    period,
    periodName,
    geju,
    wenchangwei,
    caiwei,
    palaces,
    summary: {
      favorablePalaces,
      unfavorablePalaces,
      keyPoints,
      recommendations
    }
  };
}
