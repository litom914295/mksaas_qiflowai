import { evaluatePlate } from './evaluate';
import type { PalaceIndex, Plate } from './types';

export type TemporalWeights = {
  year?: number;
  month?: number;
  day?: number;
};

export type Personalization = {
  favorableElements?: string[]; // '木','火','土','金','水'
  unfavorableElements?: string[];
};

// 九宫与先天五行对应（正统八卦五行配宫）
const PALACE_ELEMENT: Record<PalaceIndex, string> = {
  1: '水', // 坎 北
  2: '土', // 艮 东北
  3: '木', // 震 东
  4: '木', // 巽 东南
  5: '土', // 中
  6: '金', // 乾 西北
  7: '金', // 兑 西
  8: '土', // 坤 西南
  9: '火', // 离 南
};

export type LayeredInput = {
  periodPlate: Plate; // 基础运盘（必需）
  yearPlate?: Plate;
  monthPlate?: Plate;
  dayPlate?: Plate;
  temporalWeights?: TemporalWeights; // 默认 {year:0.3, month:0.2, day:0.1}
  personalization?: Personalization;
};

export type LayeredEvaluation = {
  perPalace: Record<
    PalaceIndex,
    { score: number; tags: string[]; reasons: string[] }
  >;
  notes: string[];
};

export function computeLayeredEvaluation(
  input: LayeredInput
): LayeredEvaluation {
  const { periodPlate, yearPlate, monthPlate, dayPlate } = input;
  const weights: Required<TemporalWeights> = {
    year: input.temporalWeights?.year ?? 0.3,
    month: input.temporalWeights?.month ?? 0.2,
    day: input.temporalWeights?.day ?? 0.1,
  };

  const baseEval = evaluatePlate(periodPlate, 1);
  const yearEval = yearPlate ? evaluatePlate(yearPlate, 1) : undefined;
  const monthEval = monthPlate ? evaluatePlate(monthPlate, 1) : undefined;
  const dayEval = dayPlate ? evaluatePlate(dayPlate, 1) : undefined;

  const result: LayeredEvaluation = { perPalace: {} as any, notes: [] };

  for (let p = 1 as PalaceIndex; p <= 9; p = (p + 1) as PalaceIndex) {
    const base = baseEval[p];
    let score = base?.score ?? 0;
    const tags = new Set<string>(base?.tags ?? []);
    const reasons: string[] = [...(base?.reasons ?? [])];

    if (yearEval?.[p]) {
      score = score * (1 - weights.year) + yearEval[p].score * weights.year;
      yearEval[p].tags.forEach((t) => tags.add(`year:${t}`));
    }
    if (monthEval?.[p]) {
      score = score * (1 - weights.month) + monthEval[p].score * weights.month;
      monthEval[p].tags.forEach((t) => tags.add(`month:${t}`));
    }
    if (dayEval?.[p]) {
      score = score * (1 - weights.day) + dayEval[p].score * weights.day;
      dayEval[p].tags.forEach((t) => tags.add(`day:${t}`));
    }

    // 个性化加权：宫位五行与喜/忌匹配
    const pe = PALACE_ELEMENT[p];
    if (input.personalization?.favorableElements?.includes(pe)) {
      score += 6; // 小幅加权
      reasons.push(`个性化喜用加权：宫位五行${pe}`);
    }
    if (input.personalization?.unfavorableElements?.includes(pe)) {
      score -= 6;
      reasons.push(`个性化忌神扣分：宫位五行${pe}`);
    }

    // 归一
    score = Math.max(0, Math.min(100, Math.round(score)));
    result.perPalace[p] = { score, tags: Array.from(tags), reasons };
  }

  if (input.personalization?.favorableElements?.length) {
    result.notes.push(
      `个性化：喜用${input.personalization.favorableElements.join('、')}优先布局`
    );
  }
  if (input.personalization?.unfavorableElements?.length) {
    result.notes.push(
      `个性化：忌${input.personalization.unfavorableElements.join('、')}方位宜化解`
    );
  }

  return result;
}
