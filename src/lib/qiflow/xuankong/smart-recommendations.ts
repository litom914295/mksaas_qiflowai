import type { FlyingStar, PalaceIndex, Plate } from './types';

// 智能建议系统
export interface SmartRecommendation {
  id: string;
  type: 'urgent' | 'important' | 'suggestion' | 'enhancement';
  title: string;
  description: string;
  palace?: PalaceIndex;
  priority: number; // 1-10, 10最高
  category:
    | 'health'
    | 'wealth'
    | 'career'
    | 'relationship'
    | 'study'
    | 'general';
  actions: string[];
  timing?: string;
  materials?: string[];
}

// 飞星吉凶判断
function getStarFortune(
  star: FlyingStar,
  period: FlyingStar
):
  | 'very_auspicious'
  | 'auspicious'
  | 'neutral'
  | 'inauspicious'
  | 'very_inauspicious' {
  // 当旺星
  if (star === period) return 'very_auspicious';

  // 生气星（下一个运星）
  const nextPeriod = ((period % 9) + 1) as FlyingStar;
  if (star === nextPeriod) return 'auspicious';

  // 退气星（上一个运星）
  const prevPeriod = ((period + 7) % 9 || 9) as FlyingStar;
  if (star === prevPeriod) return 'neutral';

  // 死气星（前两个运星）
  const deadPeriod = ((period + 5) % 9 || 9) as FlyingStar;
  if (star === deadPeriod) return 'inauspicious';

  // 煞气星（五黄）
  if (star === 5) return 'very_inauspicious';

  // 其他星
  if (star === 8 || star === 9) return 'auspicious';
  if (star === 1 || star === 6) return 'neutral';
  if (star === 2 || star === 3 || star === 7) return 'inauspicious';

  return 'neutral';
}

// 宫位重要性权重
const palaceWeights: Record<PalaceIndex, number> = {
  1: 8, // 坎宫 - 事业、健康
  2: 6, // 坤宫 - 母亲、土地
  3: 7, // 震宫 - 长子、事业
  4: 6, // 巽宫 - 长女、学业
  5: 5, // 中宫 - 中心
  6: 9, // 乾宫 - 父亲、领导
  7: 6, // 兑宫 - 少女、口舌
  8: 7, // 艮宫 - 少男、山
  9: 8, // 离宫 - 中女、名声
};

// 生成智能建议
export function generateSmartRecommendations(
  plate: Plate,
  period: FlyingStar,
  wenchangwei: string,
  caiwei: string
): SmartRecommendation[] {
  const recommendations: SmartRecommendation[] = [];

  // 分析每个宫位
  plate.forEach((cell) => {
    const { palace, periodStar, mountainStar, facingStar } = cell;
    const weight = palaceWeights[palace];

    // 分析天盘星
    const periodFortune = getStarFortune(periodStar || 1, period || 1);
    const mountainFortune = getStarFortune(mountainStar, period);
    const facingFortune = getStarFortune(facingStar, period);

    // 五黄星特别处理
    if (periodStar === 5 || mountainStar === 5 || facingStar === 5) {
      recommendations.push({
        id: `wuhuang-${palace}`,
        type: 'urgent',
        title: `${palace}宫五黄星化解`,
        description: `${palace}宫出现五黄星，需要立即化解，避免灾祸`,
        palace,
        priority: 10,
        category: 'health',
        actions: [
          '放置金属化解物品（如铜钱、铜铃）',
          '避免在此方位进行重要活动',
          '保持该方位整洁安静',
          '可放置植物进行化解',
        ],
        timing: '立即执行',
        materials: ['铜钱', '铜铃', '金属摆件', '绿色植物'],
      });
    }

    // 当旺星处理
    if (periodStar === period) {
      recommendations.push({
        id: `wangqi-${palace}`,
        type: 'enhancement',
        title: `${palace}宫当旺星利用`,
        description: `${palace}宫为当旺星，应充分利用其能量`,
        palace,
        priority: 8,
        category: 'wealth',
        actions: [
          '在此方位放置招财物品',
          '保持该方位明亮通风',
          '可在此方位办公或学习',
          '定期清洁保持能量流动',
        ],
        timing: '持续进行',
        materials: ['招财物品', '水晶', '植物', '灯光'],
      });
    }

    // 文昌位特别建议
    if (wenchangwei.includes(palace.toString())) {
      recommendations.push({
        id: `wenchang-${palace}`,
        type: 'important',
        title: `${palace}宫文昌位布局`,
        description: `${palace}宫为文昌位，适合学习工作布局`,
        palace,
        priority: 9,
        category: 'study',
        actions: [
          '放置书桌或学习用品',
          '保持该方位安静整洁',
          '可放置文昌塔或文房四宝',
          '避免在此方位放置杂物',
        ],
        timing: '长期布局',
        materials: ['文昌塔', '文房四宝', '书籍', '学习用品'],
      });
    }

    // 财位特别建议
    if (caiwei.includes(palace.toString())) {
      recommendations.push({
        id: `caiwei-${palace}`,
        type: 'important',
        title: `${palace}宫财位布局`,
        description: `${palace}宫为财位，适合财运布局`,
        palace,
        priority: 9,
        category: 'wealth',
        actions: [
          '放置招财物品（如貔貅、金蟾）',
          '保持该方位干净整洁',
          '可放置植物或水晶',
          '避免在此方位放置垃圾或杂物',
        ],
        timing: '长期布局',
        materials: ['貔貅', '金蟾', '招财树', '水晶', '金鱼'],
      });
    }

    // 凶星化解
    if (
      periodFortune === 'very_inauspicious' ||
      mountainFortune === 'very_inauspicious' ||
      facingFortune === 'very_inauspicious'
    ) {
      recommendations.push({
        id: `xiongxing-${palace}`,
        type: 'urgent',
        title: `${palace}宫凶星化解`,
        description: `${palace}宫出现凶星，需要化解不利影响`,
        palace,
        priority: 8,
        category: 'health',
        actions: [
          '放置化解物品（如葫芦、八卦镜）',
          '避免在此方位居住或办公',
          '保持该方位整洁',
          '可放置植物进行化解',
        ],
        timing: '尽快执行',
        materials: ['葫芦', '八卦镜', '植物', '水晶'],
      });
    }

    // 山向合十检查
    if (
      mountainStar &&
      facingStar &&
      Number(mountainStar) + Number(facingStar) === 10
    ) {
      recommendations.push({
        id: `heshi-${palace}`,
        type: 'suggestion',
        title: `${palace}宫山向合十`,
        description: `${palace}宫山向合十，为吉利格局`,
        palace,
        priority: 6,
        category: 'general',
        actions: ['保持该格局不变', '可在此方位进行重要活动', '保持该方位整洁'],
        timing: '持续维护',
      });
    }
  });

  // 按优先级排序
  return recommendations.sort((a, b) => b.priority - a.priority);
}

// 根据用户需求筛选建议
export function filterRecommendationsByCategory(
  recommendations: SmartRecommendation[],
  category: SmartRecommendation['category']
): SmartRecommendation[] {
  return recommendations.filter((rec) => rec.category === category);
}

// 获取紧急建议
export function getUrgentRecommendations(
  recommendations: SmartRecommendation[]
): SmartRecommendation[] {
  return recommendations.filter((rec) => rec.type === 'urgent');
}

// 获取今日建议
export function getTodayRecommendations(
  recommendations: SmartRecommendation[]
): SmartRecommendation[] {
  return recommendations.filter((rec) => rec.priority >= 8);
}
