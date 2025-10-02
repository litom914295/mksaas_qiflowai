import { PALACE_TO_BAGUA } from './luoshu';
import { FlyingStar, PalaceIndex, Plate, StarStatus } from './types';

// 九星生旺死煞退状态判断
export function getStarStatus(star: FlyingStar, period: FlyingStar): StarStatus {
  const starNum = Number(star);
  const periodNum = Number(period);
  
  // 旺星：与运星相同
  if (starNum === periodNum) {
    return '旺';
  }
  
  // 生气星：运星+1
  if (starNum === (periodNum % 9) + 1) {
    return '生';
  }
  
  // 退气星：运星-1
  if (starNum === ((periodNum - 2 + 9) % 9) + 1) {
    return '退';
  }
  
  // 煞星：运星+2
  if (starNum === ((periodNum + 1) % 9) + 1) {
    return '煞';
  }
  
  // 死星：运星+3
  if (starNum === ((periodNum + 2) % 9) + 1) {
    return '死';
  }
  
  return '死'; // 默认为死星
}

// 获取文昌位
export function getWenchangwei(plate: Plate): string {
  const wenchangPositions: string[] = [];
  
  // 查找一四同宫的位置
  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];
    const tianpan = cell.periodStar;
    const shanpan = cell.mountainStar;
    const xiangpan = cell.facingStar;
    
    // 检查三盘是否包含一四组合
    const stars = [tianpan, shanpan, xiangpan].filter(Boolean);
    const hasOne = stars.includes(1);
    const hasFour = stars.includes(4);
    
    if (hasOne && hasFour) {
      wenchangPositions.push(bagua);
    }
  }
  
  // 如果找到一四同宫，返回这些位置
  if (wenchangPositions.length > 0) {
    // 优先选择巽宫
    if (wenchangPositions.includes('巽')) {
      return '巽' + wenchangPositions.join('');
    }
    return wenchangPositions.join('');
  }
  
  // 如果没有找到一四同宫，默认返回巽宫
  return '巽';
}

// 财位飞星组合
const CAIWEI_COMBINATIONS = [
  '一六', '六一', '二七', '七二', '三八', '八三', '四九', '九四'
];

// 获取财位
export function getCaiwei(plate: Plate, period: FlyingStar): string {
  const caiweiPositions: string[] = [];
  const caiweiDetails: string[] = [];
  
  // 获取生旺星
  const shengwangStars: FlyingStar[] = [];
  for (let i = 1; i <= 9; i++) {
    const star = i as FlyingStar;
    const status = getStarStatus(star, period);
    if (status === '生' || status === '旺') {
      shengwangStars.push(star);
    }
  }
  
  // 查找财位
  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];
    const shanpan = cell.mountainStar;
    const xiangpan = cell.facingStar;
    
    // 检查向盘是否为生旺星
    if (xiangpan && shengwangStars.includes(xiangpan)) {
      // 检查山向组合是否为财位组合
      if (shanpan && xiangpan) {
        const combination = `${shanpan}${xiangpan}`;
        const reverseCombination = `${xiangpan}${shanpan}`;
        
        if (CAIWEI_COMBINATIONS.includes(combination) || CAIWEI_COMBINATIONS.includes(reverseCombination)) {
          caiweiPositions.push(bagua);
          caiweiDetails.push(`${bagua}宫：${combination}组合`);
        } else {
          caiweiPositions.push(bagua);
          caiweiDetails.push(`${bagua}宫：相对强度较弱`);
        }
      }
    }
  }
  
  if (caiweiPositions.length > 0) {
    return caiweiDetails.join('；');
  }
  
  return '未找到明显财位';
}

// 获取各宫位的生旺死煞退状态
export function getPalaceStatus(plate: Plate, period: FlyingStar): Record<PalaceIndex, {
  bagua: string;
  tianpan: { star: FlyingStar; status: StarStatus };
  shanpan: { star: FlyingStar; status: StarStatus } | null;
  xiangpan: { star: FlyingStar; status: StarStatus } | null;
}> {
  const result: Record<PalaceIndex, any> = {} as Record<PalaceIndex, any>;
  
  for (const cell of plate) {
    const bagua = PALACE_TO_BAGUA[cell.palace];
    
    result[cell.palace] = {
      bagua,
      tianpan: {
        star: cell.periodStar!,
        status: getStarStatus(cell.periodStar!, period)
      },
      shanpan: cell.mountainStar ? {
        star: cell.mountainStar,
        status: getStarStatus(cell.mountainStar, period)
      } : null,
      xiangpan: cell.facingStar ? {
        star: cell.facingStar,
        status: getStarStatus(cell.facingStar, period)
      } : null
    };
  }
  
  return result;
}

// 获取九星寓意
export function getStarMeaning(star: FlyingStar, status: StarStatus): { name: string; meaning: string } {
  const starNames: Record<FlyingStar, string> = {
    1: '一白贪狼星',
    2: '二黑巨门星', 
    3: '三碧禄存星',
    4: '四绿文曲星',
    5: '五黄廉贞星',
    6: '六白武曲星',
    7: '七赤破军星',
    8: '八白左辅星',
    9: '九紫右弼星'
  };
  
  const meanings: Record<FlyingStar, Record<StarStatus, string>> = {
    1: {
      '旺': '主智慧、学业、官运',
      '生': '主聪明、机智、灵活',
      '死': '主愚昧、迟钝、失意',
      '煞': '主是非、口舌、小人',
      '退': '主智慧减退、思维迟缓'
    },
    2: {
      '旺': '主财富、田宅、母亲',
      '生': '主财运渐起、家业兴旺',
      '死': '主破财、疾病、母亲不利',
      '煞': '主疾病、意外、破财',
      '退': '主财运减退、家业衰落'
    },
    3: {
      '旺': '主事业、权力、长子',
      '生': '主事业起步、权力渐增',
      '死': '主事业受阻、权力丧失',
      '煞': '主是非、争斗、意外',
      '退': '主事业衰退、权力减弱'
    },
    4: {
      '旺': '主文昌、学业、名声',
      '生': '主学业进步、名声渐起',
      '死': '主学业受阻、名声败坏',
      '煞': '主是非、口舌、文书不利',
      '退': '主学业退步、名声下降'
    },
    5: {
      '旺': '主权威、中心、稳定',
      '生': '主权威渐起、中心稳固',
      '死': '主权威丧失、中心不稳',
      '煞': '主意外、疾病、破财',
      '退': '主权威减弱、中心动摇'
    },
    6: {
      '旺': '主权力、父亲、贵人',
      '生': '主权力渐增、贵人相助',
      '死': '主权力丧失、父亲不利',
      '煞': '主意外、争斗、破财',
      '退': '主权力减弱、贵人远离'
    },
    7: {
      '旺': '主口才、少女、娱乐',
      '生': '主口才渐佳、娱乐兴旺',
      '死': '主口才受阻、少女不利',
      '煞': '主是非、口舌、破财',
      '退': '主口才减退、娱乐衰落'
    },
    8: {
      '旺': '主财富、少男、稳定',
      '生': '主财运渐起、少男有利',
      '死': '主破财、少男不利',
      '煞': '主意外、疾病、破财',
      '退': '主财运减退、少男不利'
    },
    9: {
      '旺': '主名声、中女、文化',
      '生': '主名声渐起、文化兴旺',
      '死': '主名声败坏、中女不利',
      '煞': '主是非、口舌、破财',
      '退': '主名声下降、文化衰落'
    }
  };
  
  return {
    name: starNames[star],
    meaning: meanings[star][status]
  };
}
