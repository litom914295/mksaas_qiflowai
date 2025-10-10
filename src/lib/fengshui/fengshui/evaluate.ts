import { getStarMeaning, getStarStatus } from './positions';
import {
  type Evaluation,
  type FlyingStar,
  type PalaceIndex,
  type Plate,
  StarStatus,
} from './types';

export function evaluatePlate(
  plate: Plate,
  period: FlyingStar
): Record<PalaceIndex, Evaluation> {
  const result = {} as Record<PalaceIndex, Evaluation>;

  for (const cell of plate) {
    let score = 0;
    const tags: string[] = [];
    const reasons: string[] = [];

    // 评价天盘（运盘）
    if (cell.periodStar) {
      const tianpanStatus = getStarStatus(cell.periodStar, period);
      const tianpanMeaning = getStarMeaning(cell.periodStar, tianpanStatus);

      switch (tianpanStatus) {
        case '旺':
          score += 3;
          tags.push('旺星');
          reasons.push(
            `天盘${tianpanMeaning.name}得令，${tianpanMeaning.meaning}`
          );
          break;
        case '生':
          score += 2;
          tags.push('生气星');
          reasons.push(
            `天盘${tianpanMeaning.name}生气，${tianpanMeaning.meaning}`
          );
          break;
        case '退':
          score += 1;
          tags.push('退气星');
          reasons.push(
            `天盘${tianpanMeaning.name}退气，${tianpanMeaning.meaning}`
          );
          break;
        case '煞':
          score -= 1;
          tags.push('煞星');
          reasons.push(
            `天盘${tianpanMeaning.name}为煞，${tianpanMeaning.meaning}`
          );
          break;
        case '死':
          score -= 2;
          tags.push('死星');
          reasons.push(
            `天盘${tianpanMeaning.name}失令，${tianpanMeaning.meaning}`
          );
          break;
      }
    }

    // 评价山盘
    if (cell.mountainStar) {
      const shanpanStatus = getStarStatus(cell.mountainStar, period);
      const shanpanMeaning = getStarMeaning(cell.mountainStar, shanpanStatus);

      switch (shanpanStatus) {
        case '旺':
          score += 2;
          tags.push('山星旺');
          reasons.push(
            `山星${shanpanMeaning.name}得令，${shanpanMeaning.meaning}`
          );
          break;
        case '生':
          score += 1;
          tags.push('山星生');
          reasons.push(
            `山星${shanpanMeaning.name}生气，${shanpanMeaning.meaning}`
          );
          break;
        case '退':
          score += 0.5;
          tags.push('山星退');
          reasons.push(
            `山星${shanpanMeaning.name}退气，${shanpanMeaning.meaning}`
          );
          break;
        case '煞':
          score -= 1;
          tags.push('山星煞');
          reasons.push(
            `山星${shanpanMeaning.name}为煞，${shanpanMeaning.meaning}`
          );
          break;
        case '死':
          score -= 2;
          tags.push('山星死');
          reasons.push(
            `山星${shanpanMeaning.name}失令，${shanpanMeaning.meaning}`
          );
          break;
      }
    }

    // 评价向盘
    if (cell.facingStar) {
      const xiangpanStatus = getStarStatus(cell.facingStar, period);
      const xiangpanMeaning = getStarMeaning(cell.facingStar, xiangpanStatus);

      switch (xiangpanStatus) {
        case '旺':
          score += 2;
          tags.push('向星旺');
          reasons.push(
            `向星${xiangpanMeaning.name}得令，${xiangpanMeaning.meaning}`
          );
          break;
        case '生':
          score += 1;
          tags.push('向星生');
          reasons.push(
            `向星${xiangpanMeaning.name}生气，${xiangpanMeaning.meaning}`
          );
          break;
        case '退':
          score += 0.5;
          tags.push('向星退');
          reasons.push(
            `向星${xiangpanMeaning.name}退气，${xiangpanMeaning.meaning}`
          );
          break;
        case '煞':
          score -= 1;
          tags.push('向星煞');
          reasons.push(
            `向星${xiangpanMeaning.name}为煞，${xiangpanMeaning.meaning}`
          );
          break;
        case '死':
          score -= 2;
          tags.push('向星死');
          reasons.push(
            `向星${xiangpanMeaning.name}失令，${xiangpanMeaning.meaning}`
          );
          break;
      }
    }

    // 特殊组合评价
    if (cell.mountainStar && cell.facingStar) {
      // 山向合十
      if (Number(cell.mountainStar) + Number(cell.facingStar) === 10) {
        score += 1;
        tags.push('山向合十');
        reasons.push('山向两星合十，主和谐');
      }

      // 山向相同
      if (cell.mountainStar === cell.facingStar) {
        score += 0.5;
        tags.push('山向同星');
        reasons.push('山向两星相同，主稳定');
      }

      // 五黄星特殊处理
      if (cell.mountainStar === 5 || cell.facingStar === 5) {
        score -= 3;
        tags.push('五黄星');
        reasons.push('五黄星出现，需要化解');
      }
    }

    // 根据总分确定整体评价
    if (score >= 4) {
      tags.push('大吉');
      reasons.push('此宫位整体评价为大吉');
    } else if (score >= 2) {
      tags.push('吉');
      reasons.push('此宫位整体评价为吉');
    } else if (score >= 0) {
      tags.push('平');
      reasons.push('此宫位整体评价为平');
    } else if (score >= -2) {
      tags.push('凶');
      reasons.push('此宫位整体评价为凶');
    } else {
      tags.push('大凶');
      reasons.push('此宫位整体评价为大凶');
    }

    result[cell.palace] = { score, tags, reasons };
  }

  return result;
}
