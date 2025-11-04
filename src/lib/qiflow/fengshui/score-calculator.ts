/**
 * 智能评分计算模块
 *
 * 核心功能：
 * - 五维度加权评分（格局、八字匹配、流年、房间功能、化解）
 * - 结合个人八字的个性化评分
 * - 时间因素动态评分
 *
 * @author 玄空风水大师团队
 * @version 6.0.0
 */

import {
  ELEMENT_NAMES,
  type Element,
  type PersonalizedFengshuiInput,
  type ScoreBreakdown,
} from './personalized-engine';
import {
  type FlyingStarChart,
  XuankongCalculator,
} from './xuankong-calculator';

// ==================== 类型定义 ====================

/**
 * 评分详情
 */
export interface ScoreDetail {
  dimension: string;
  score: number;
  maxScore: number;
  weight: number;
  reasons: string[];
  suggestions: string[];
}

/**
 * 完整评分报告
 */
export interface CompleteScoreReport {
  breakdown: ScoreBreakdown;
  details: ScoreDetail[];
  overall: number;
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  summary: string;
}

// ==================== 核心计算类 ====================

/**
 * 评分计算器
 */
export class ScoreCalculator {
  /**
   * 计算完整评分
   */
  static async calculate(
    input: PersonalizedFengshuiInput
  ): Promise<CompleteScoreReport> {
    console.log('[评分计算] 开始计算...');

    // 1. 计算飞星盘
    const chart = XuankongCalculator.calculateFlyingStars(
      input.house.facing,
      input.house.period
    );

    // 2. 计算各维度评分
    const layoutScore = await ScoreCalculator.calculateLayoutScore(
      chart,
      input
    );
    const baziMatchScore = await ScoreCalculator.calculateBaziMatchScore(
      chart,
      input
    );
    const annualScore = await ScoreCalculator.calculateAnnualScore(
      chart,
      input
    );
    const roomFunctionScore = await ScoreCalculator.calculateRoomFunctionScore(
      chart,
      input
    );
    const remedyScore = await ScoreCalculator.calculateRemedyScore(
      chart,
      input
    );

    // 3. 组装评分明细
    const breakdown: ScoreBreakdown = {
      layout: layoutScore.score,
      baziMatch: baziMatchScore.score,
      annual: annualScore.score,
      roomFunction: roomFunctionScore.score,
      remedy: remedyScore.score,
    };

    const details = [
      layoutScore,
      baziMatchScore,
      annualScore,
      roomFunctionScore,
      remedyScore,
    ];

    // 4. 计算总分
    const overall = Math.round(
      layoutScore.score * 0.3 +
        baziMatchScore.score * 0.25 +
        annualScore.score * 0.2 +
        roomFunctionScore.score * 0.15 +
        remedyScore.score * 0.1
    );

    // 5. 确定等级
    let level: CompleteScoreReport['level'];
    if (overall >= 85) level = 'excellent';
    else if (overall >= 70) level = 'good';
    else if (overall >= 55) level = 'fair';
    else if (overall >= 40) level = 'poor';
    else level = 'critical';

    // 6. 生成总结
    const summary = ScoreCalculator.generateSummary(overall, level, details);

    console.log('[评分计算] 计算完成', { overall, level });

    return { breakdown, details, overall, level, summary };
  }

  /**
   * 1. 计算格局评分（30%权重）
   *
   * 考虑因素：
   * - 特殊格局（旺山旺向、双星到向等）
   * - 向首、坐首星曜组合
   * - 是否有凶煞格局
   */
  private static async calculateLayoutScore(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): Promise<ScoreDetail> {
    let score = 60; // 基础分
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // 1. 特殊格局加分/扣分
    if (chart.patterns.isWangShanWangXiang) {
      score += 30;
      reasons.push('格局为旺山旺向，人财两旺');
      suggestions.push('保持现有格局，定期维护');
    } else if (chart.patterns.isDoubleStarsToFacing) {
      score += 25;
      reasons.push('格局为双星到向，财运亨通');
      suggestions.push('可在向首设置水景催财');
    } else if (chart.patterns.isDoubleStarsToMountain) {
      score += 15;
      reasons.push('格局为双星到山，人丁兴旺');
      suggestions.push('可在坐首设置高大家具');
    } else if (chart.patterns.isUpMountainDownWater) {
      score -= 40;
      reasons.push('格局为上山下水，人财两败');
      suggestions.push('需要化解：调整坐向或用五行化解');
    }

    // 2. 检查凶煞
    const facingPalace = XuankongCalculator.degreesToPalace(
      input.house.facing
    ).palace;
    const mountainPalace = XuankongCalculator.degreesToPalace(
      input.house.mountain || (input.house.facing + 180) % 360
    ).palace;

    // 检查五黄、二黑
    if (
      chart.palaces[facingPalace].facingStar === 5 ||
      chart.palaces[facingPalace].mountainStar === 5
    ) {
      score -= 15;
      reasons.push('向首有五黄凶星');
      suggestions.push('需挂铜葫芦或六帝钱化解');
    }

    if (
      chart.palaces[facingPalace].facingStar === 2 ||
      chart.palaces[facingPalace].mountainStar === 2
    ) {
      score -= 10;
      reasons.push('向首有二黑病符');
      suggestions.push('需放置金属风铃或铜葫芦');
    }

    // 3. 向首星曜组合评估
    const facingEval = XuankongCalculator.evaluateStarCombination(
      chart.palaces[facingPalace].mountainStar,
      chart.palaces[facingPalace].facingStar,
      chart.period
    );
    score += (facingEval.score - 50) * 0.3; // 转换为加减分
    reasons.push(`向首星曜：${facingEval.description}`);

    // 确保分数在合理范围
    score = Math.max(0, Math.min(100, score));

    return {
      dimension: '格局评分',
      score: Math.round(score),
      maxScore: 100,
      weight: 0.3,
      reasons,
      suggestions,
    };
  }

  /**
   * 2. 计算八字匹配度评分（25%权重）
   *
   * 考虑因素：
   * - 喜用神五行与方位的匹配
   * - 忌神五行是否出现在关键位置
   * - 家人综合匹配度
   */
  private static async calculateBaziMatchScore(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): Promise<ScoreDetail> {
    let score = 70; // 基础分
    const reasons: string[] = [];
    const suggestions: string[] = [];

    const { bazi } = input;

    // 1. 检查喜用神匹配
    const favorableCount = ScoreCalculator.countFavorableElementsInChart(
      chart,
      bazi.favorableElements
    );
    const favorableBonus = favorableCount * 5;
    score += favorableBonus;

    if (favorableCount > 0) {
      reasons.push(
        `飞星盘中有 ${favorableCount} 个宫位与您的喜用神（${bazi.favorableElements
          .map((e) => ELEMENT_NAMES[e])
          .join('、')}）匹配`
      );
    }

    // 2. 检查忌神冲突
    const unfavorableCount = ScoreCalculator.countUnfavorableElementsInChart(
      chart,
      bazi.unfavorableElements
    );
    const unfavorablePenalty = unfavorableCount * 8;
    score -= unfavorablePenalty;

    if (unfavorableCount > 0) {
      reasons.push(
        `飞星盘中有 ${unfavorableCount} 个宫位与您的忌神（${bazi.unfavorableElements
          .map((e) => ELEMENT_NAMES[e])
          .join('、')}）冲突`
      );
      suggestions.push('需在忌神方位放置化解物品');
    }

    // 3. 检查向首方位与喜用神
    const facingPalace = XuankongCalculator.degreesToPalace(
      input.house.facing
    ).palace;
    const facingElement = ScoreCalculator.getElementByPalace(facingPalace);

    if (bazi.favorableElements.includes(facingElement)) {
      score += 15;
      reasons.push(
        `房屋朝向（${ELEMENT_NAMES[facingElement]}）与您的喜用神匹配`
      );
    } else if (bazi.unfavorableElements.includes(facingElement)) {
      score -= 15;
      reasons.push(`房屋朝向（${ELEMENT_NAMES[facingElement]}）与您的忌神冲突`);
      suggestions.push('建议调整入户方位或加强门口风水布局');
    }

    // 4. 如果有家人，计算综合匹配度
    if (input.family && input.family.length > 0) {
      const familyScore = ScoreCalculator.calculateFamilyMatch(
        chart,
        input.family
      );
      score = score * 0.6 + familyScore * 0.4; // 主人占60%，家人占40%
      reasons.push(`已考虑 ${input.family.length} 位家人的八字综合匹配`);
    }

    // 确保分数在合理范围
    score = Math.max(0, Math.min(100, score));

    return {
      dimension: '八字匹配度',
      score: Math.round(score),
      maxScore: 100,
      weight: 0.25,
      reasons,
      suggestions,
    };
  }

  /**
   * 3. 计算流年吉凶评分（20%权重）
   *
   * 考虑因素：
   * - 当前年份的流年星
   * - 流年五黄、太岁方位
   * - 与宅主八字的流年运势
   */
  private static async calculateAnnualScore(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): Promise<ScoreDetail> {
    let score = 65; // 基础分
    const reasons: string[] = [];
    const suggestions: string[] = [];

    const { currentYear } = input.time;

    // 1. 流年五黄位（简化算法：用年份对9取余）
    const wuhuangPalace = ((currentYear - 1) % 9) + 1;
    reasons.push(`${currentYear}年五黄在${wuhuangPalace}宫`);

    // 检查五黄是否在关键位置
    const facingPalace = XuankongCalculator.degreesToPalace(
      input.house.facing
    ).palace;
    const bedrooms =
      input.house.layout?.filter((r) => r.type === 'bedroom') || [];

    if (wuhuangPalace === facingPalace) {
      score -= 20;
      reasons.push('流年五黄到向首，需注意财运和健康');
      suggestions.push('在向首悬挂六帝钱或铜葫芦化解五黄');
    }

    for (const bedroom of bedrooms) {
      if (bedroom.position === wuhuangPalace) {
        score -= 15;
        reasons.push(`${bedroom.name}在流年五黄位`);
        suggestions.push(`在${bedroom.name}放置金属风铃或铜钟化解`);
      }
    }

    // 2. 检查流年太岁（简化：用生肖推算）
    // TODO: 这里可以接入更复杂的太岁方位算法

    // 3. 流年与宅主八字
    const annualElement = ScoreCalculator.getElementByYear(currentYear);
    if (input.bazi.favorableElements.includes(annualElement)) {
      score += 15;
      reasons.push(
        `${currentYear}年流年五行（${ELEMENT_NAMES[annualElement]}）对您有利`
      );
    } else if (input.bazi.unfavorableElements.includes(annualElement)) {
      score -= 10;
      reasons.push(
        `${currentYear}年流年五行（${ELEMENT_NAMES[annualElement]}）对您不利`
      );
      suggestions.push('今年需谨慎行事，加强防护');
    }

    // 确保分数在合理范围
    score = Math.max(0, Math.min(100, score));

    return {
      dimension: '流年吉凶',
      score: Math.round(score),
      maxScore: 100,
      weight: 0.2,
      reasons,
      suggestions,
    };
  }

  /**
   * 4. 计算房间功能评分（15%权重）
   *
   * 考虑因素：
   * - 各房间是否在适合的宫位
   * - 主卧、厨房、厕所的位置
   * - 功能区与飞星的匹配度
   */
  private static async calculateRoomFunctionScore(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): Promise<ScoreDetail> {
    let score = 70; // 基础分
    const reasons: string[] = [];
    const suggestions: string[] = [];

    if (!input.house.layout || input.house.layout.length === 0) {
      return {
        dimension: '房间功能',
        score: 70,
        maxScore: 100,
        weight: 0.15,
        reasons: ['未提供房间布局信息'],
        suggestions: ['请提供详细的房间布局以获得更精准的评分'],
      };
    }

    // 遍历房间，评估每个房间的位置
    for (const room of input.house.layout) {
      const palace = chart.palaces[room.position];

      // 检查宫位是否存在
      if (!palace) {
        console.warn(`找不到位置 ${room.position} 的宫位数据`);
        continue;
      }

      const evaluation = XuankongCalculator.evaluateStarCombination(
        palace.mountainStar,
        palace.facingStar,
        chart.period
      );

      // 主卧评估
      if (room.type === 'bedroom' && room.isPrimary) {
        if (evaluation.level === 'excellent' || evaluation.level === 'good') {
          score += 10;
          reasons.push(
            `主卧位置佳（${palace.name}，${evaluation.description}）`
          );
        } else if (
          evaluation.level === 'bad' ||
          evaluation.level === 'terrible'
        ) {
          score -= 15;
          reasons.push(
            `主卧位置不利（${palace.name}，${evaluation.description}）`
          );
          suggestions.push('建议更换主卧位置或加强化解');
        }
      }

      // 厨房评估（火旺之地，不宜在五黄、二黑）
      if (room.type === 'kitchen') {
        if (palace.facingStar === 5 || palace.mountainStar === 5) {
          score -= 12;
          reasons.push(`厨房在五黄位（${palace.name}），易生灾厄`);
          suggestions.push('厨房需挂铜葫芦或六帝钱');
        }
        if (palace.facingStar === 2 || palace.mountainStar === 2) {
          score -= 8;
          reasons.push(`厨房在二黑位（${palace.name}），易生疾病`);
          suggestions.push('厨房需放置金属物品');
        }
      }

      // 厕所评估（污秽之地，不宜在向首、中宫）
      if (room.type === 'bathroom') {
        if (room.position === 5) {
          score -= 20;
          reasons.push('厕所在中宫，大凶');
          suggestions.push('厕所需保持极度清洁，并放置盐水化解');
        }
        const facingPalace = XuankongCalculator.degreesToPalace(
          input.house.facing
        ).palace;
        if (room.position === facingPalace) {
          score -= 15;
          reasons.push('厕所在向首，影响财运');
          suggestions.push('厕所门需常闭，挂五帝钱');
        }
      }

      // 书房评估（宜在文昌位）
      if (room.type === 'study') {
        // TODO: 接入文昌位计算
        if (palace.facingStar === 4 || palace.mountainStar === 4) {
          score += 8;
          reasons.push(`书房在四绿文昌星位（${palace.name}）`);
        }
      }
    }

    // 确保分数在合理范围
    score = Math.max(0, Math.min(100, score));

    return {
      dimension: '房间功能',
      score: Math.round(score),
      maxScore: 100,
      weight: 0.15,
      reasons,
      suggestions,
    };
  }

  /**
   * 5. 计算化解措施评分（10%权重）
   *
   * 考虑因素：
   * - 现有化解布局的效果
   * - 是否已针对凶位进行化解
   * - 化解物品是否与八字匹配
   */
  private static async calculateRemedyScore(
    chart: FlyingStarChart,
    input: PersonalizedFengshuiInput
  ): Promise<ScoreDetail> {
    let score = 50; // 基础分（假设未做化解）
    const reasons: string[] = [];
    const suggestions: string[] = [];

    // TODO: 这部分需要接入用户已有的化解布局数据
    // 目前先给出建议性评分

    reasons.push('未检测到现有化解布局');
    suggestions.push('建议根据紧急问题清单进行针对性化解');

    // 检查是否有严重凶位需要化解
    let severeIssueCount = 0;

    // 检查五黄位
    for (const [pos, palace] of Object.entries(chart.palaces)) {
      if (palace.facingStar === 5 || palace.mountainStar === 5) {
        severeIssueCount++;
        suggestions.push(`${palace.name}有五黄凶星，需铜制化解物`);
      }
      if (palace.facingStar === 2 || palace.mountainStar === 2) {
        severeIssueCount++;
        suggestions.push(`${palace.name}有二黑病符，需金属风铃`);
      }
    }

    // 检查上山下水
    if (chart.patterns.isUpMountainDownWater) {
      severeIssueCount++;
      suggestions.push('格局为上山下水，需调整坐向或用五行化解');
    }

    // 如果有严重问题未化解，扣分
    score -= severeIssueCount * 5;

    // 确保分数在合理范围
    score = Math.max(0, Math.min(100, score));

    return {
      dimension: '化解措施',
      score: Math.round(score),
      maxScore: 100,
      weight: 0.1,
      reasons,
      suggestions,
    };
  }

  // ==================== 辅助方法 ====================

  /**
   * 统计飞星盘中有利五行的宫位数量
   */
  private static countFavorableElementsInChart(
    chart: FlyingStarChart,
    elements: Element[]
  ): number {
    let count = 0;
    for (const palace of Object.values(chart.palaces)) {
      const palaceElement = ScoreCalculator.getElementByPalace(palace.position);
      if (elements.includes(palaceElement)) {
        count++;
      }
    }
    return count;
  }

  /**
   * 统计飞星盘中不利五行的宫位数量
   */
  private static countUnfavorableElementsInChart(
    chart: FlyingStarChart,
    elements: Element[]
  ): number {
    let count = 0;
    for (const palace of Object.values(chart.palaces)) {
      const palaceElement = ScoreCalculator.getElementByPalace(palace.position);
      if (elements.includes(palaceElement)) {
        count++;
      }
    }
    return count;
  }

  /**
   * 根据宫位获取五行
   */
  private static getElementByPalace(palace: number): Element {
    // 后天八卦五行归属
    const palaceElements: Record<number, Element> = {
      1: 'water', // 坎
      2: 'earth', // 坤
      3: 'wood', // 震
      4: 'wood', // 巽
      5: 'earth', // 中宫
      6: 'metal', // 乾
      7: 'metal', // 兑
      8: 'earth', // 艮
      9: 'fire', // 离
    };
    return palaceElements[palace] || 'earth';
  }

  /**
   * 根据年份获取五行（天干纳音简化）
   */
  private static getElementByYear(year: number): Element {
    const elements: Element[] = [
      'metal',
      'metal',
      'water',
      'water',
      'wood',
      'wood',
      'fire',
      'fire',
      'earth',
      'earth',
    ];
    return elements[year % 10];
  }

  /**
   * 计算家人综合匹配度
   */
  private static calculateFamilyMatch(
    chart: FlyingStarChart,
    family: PersonalizedFengshuiInput['bazi'][]
  ): number {
    let totalScore = 0;

    for (const member of family) {
      const favorableCount = ScoreCalculator.countFavorableElementsInChart(
        chart,
        member.favorableElements
      );
      const unfavorableCount = ScoreCalculator.countUnfavorableElementsInChart(
        chart,
        member.unfavorableElements
      );

      const memberScore = 70 + favorableCount * 5 - unfavorableCount * 8;
      totalScore += Math.max(0, Math.min(100, memberScore));
    }

    return totalScore / family.length;
  }

  /**
   * 生成总结
   */
  private static generateSummary(
    overall: number,
    level: CompleteScoreReport['level'],
    details: ScoreDetail[]
  ): string {
    const levelTexts = {
      excellent: '风水格局优秀',
      good: '风水格局良好',
      fair: '风水格局一般',
      poor: '风水格局较差',
      critical: '风水格局危险',
    };

    const mainText = `${levelTexts[level]}，综合评分 ${overall} 分。`;

    // 找出最高分和最低分维度
    const sorted = [...details].sort((a, b) => b.score - a.score);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];

    const detailText = `其中${best.dimension}表现最佳（${best.score}分），${worst.dimension}需要改进（${worst.score}分）。`;

    return mainText + detailText;
  }
}

// ==================== 导出 ====================
