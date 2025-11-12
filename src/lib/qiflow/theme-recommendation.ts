/**
 * 主题推荐算法
 * 基于用户八字特征（五行、年龄、性别）智能推荐最适合的 3 个主题
 */

import type { ThemeId } from "./reports/essential-report";

export type BaziElements = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type RecommendationInput = {
  birthDate: string; // YYYY-MM-DD
  gender: "male" | "female";
  elements: BaziElements;
};

type ThemeScores = Record<ThemeId, number>;

/**
 * 计算年龄
 */
function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 基于五行分析推荐主题 (40% 权重)
 */
function analyzeByElements(elements: BaziElements): ThemeScores {
  const scores: ThemeScores = {
    career: 0,
    relationship: 0,
    health: 0,
    education: 0,
    family: 0,
  };

  // 木 (Wood): 代表成长、发展 → 事业
  if (elements.wood >= 3) {
    scores.career += 20;
    scores.education += 10;
  } else if (elements.wood >= 2) {
    scores.career += 15;
  }

  // 火 (Fire): 代表热情、活力 → 感情
  if (elements.fire >= 3) {
    scores.relationship += 20;
    scores.family += 10;
  } else if (elements.fire >= 2) {
    scores.relationship += 15;
  }

  // 土 (Earth): 代表稳定、健康 → 健康
  if (elements.earth >= 3) {
    scores.health += 20;
    scores.family += 10;
  } else if (elements.earth >= 2) {
    scores.health += 15;
  }

  // 金 (Metal): 代表理性、智慧 → 学业
  if (elements.metal >= 3) {
    scores.education += 20;
    scores.career += 10;
  } else if (elements.metal >= 2) {
    scores.education += 15;
  }

  // 水 (Water): 代表智慧、流动 → 家庭
  if (elements.water >= 3) {
    scores.family += 20;
    scores.relationship += 10;
  } else if (elements.water >= 2) {
    scores.family += 15;
  }

  // 五行平衡检查
  const maxElement = Math.max(...Object.values(elements));
  const minElement = Math.min(...Object.values(elements));
  
  if (maxElement - minElement <= 1) {
    // 五行平衡，所有主题加分
    Object.keys(scores).forEach((theme) => {
      scores[theme as ThemeId] += 5;
    });
  }

  return scores;
}

/**
 * 基于年龄分析推荐主题 (30% 权重)
 */
function analyzeByAge(birthDate: string): ThemeScores {
  const age = calculateAge(birthDate);
  const scores: ThemeScores = {
    career: 0,
    relationship: 0,
    health: 0,
    education: 0,
    family: 0,
  };

  if (age < 25) {
    // 青年期：学业、事业起步
    scores.education += 15;
    scores.career += 10;
    scores.relationship += 5;
  } else if (age < 35) {
    // 成长期：事业上升、感情稳定
    scores.career += 15;
    scores.relationship += 10;
    scores.family += 5;
  } else if (age < 45) {
    // 成熟期：事业巅峰、家庭责任
    scores.career += 10;
    scores.family += 10;
    scores.health += 10;
  } else if (age < 60) {
    // 稳定期：健康、家庭、财富管理
    scores.health += 15;
    scores.family += 10;
    scores.career += 5;
  } else {
    // 晚年期：健康、家庭和睦
    scores.health += 20;
    scores.family += 15;
  }

  return scores;
}

/**
 * 基于性别分析推荐主题 (20% 权重)
 */
function analyzeByGender(gender: "male" | "female"): ThemeScores {
  const scores: ThemeScores = {
    career: 0,
    relationship: 0,
    health: 0,
    education: 0,
    family: 0,
  };

  if (gender === "male") {
    // 男性：事业、教育相对更重要
    scores.career += 10;
    scores.education += 5;
    scores.health += 5;
  } else {
    // 女性：感情、家庭相对更重要
    scores.relationship += 10;
    scores.family += 5;
    scores.health += 5;
  }

  return scores;
}

/**
 * 合并分数
 */
function mergeScores(...scoreArrays: ThemeScores[]): ThemeScores {
  const merged: ThemeScores = {
    career: 0,
    relationship: 0,
    health: 0,
    education: 0,
    family: 0,
  };

  for (const scores of scoreArrays) {
    for (const theme in scores) {
      merged[theme as ThemeId] += scores[theme as ThemeId];
    }
  }

  return merged;
}

/**
 * 智能推荐主题
 * @returns 推荐的 3 个主题 ID，按优先级排序
 */
export function recommendThemes(input: RecommendationInput): ThemeId[] {
  // 1. 基于五行分析 (40% 权重)
  const elementScores = analyzeByElements(input.elements);

  // 2. 基于年龄分析 (30% 权重)
  const ageScores = analyzeByAge(input.birthDate);

  // 3. 基于性别分析 (20% 权重)
  const genderScores = analyzeByGender(input.gender);

  // 4. 合并所有分数
  const totalScores = mergeScores(elementScores, ageScores, genderScores);

  // 5. 选择得分最高的 3 个主题
  const sortedThemes = Object.entries(totalScores)
    .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
    .slice(0, 3)
    .map(([theme]) => theme as ThemeId);

  console.log("[ThemeRec] Recommendation scores:", totalScores);
  console.log("[ThemeRec] Recommended themes:", sortedThemes);

  return sortedThemes;
}

/**
 * 获取默认推荐 (Control 组)
 */
export function getDefaultThemes(): ThemeId[] {
  return ["career", "relationship", "health"];
}

/**
 * 解释推荐原因
 */
export function explainRecommendation(input: RecommendationInput): string {
  const age = calculateAge(input.birthDate);
  const dominantElement = Object.entries(input.elements)
    .sort(([, a], [, b]) => b - a)[0][0];

  const elementNames: Record<string, string> = {
    wood: "木",
    fire: "火",
    earth: "土",
    metal: "金",
    water: "水",
  };

  const elementDescriptions: Record<string, string> = {
    wood: "木旺者适合发展事业，追求成长",
    fire: "火旺者热情洋溢，感情丰富",
    earth: "土旺者注重稳定，关注健康",
    metal: "金旺者理性睿智，适合学习",
    water: "水旺者灵活变通，重视家庭",
  };

  let explanation = `根据您的八字特征，您的五行以${elementNames[dominantElement]}为主，${elementDescriptions[dominantElement]}。`;

  if (age < 25) {
    explanation += "您正值青年，建议关注学业和事业发展。";
  } else if (age < 35) {
    explanation += "您处于成长期，事业上升和感情稳定是重点。";
  } else if (age < 45) {
    explanation += "您已步入成熟期，事业和家庭并重。";
  } else if (age < 60) {
    explanation += "您处于稳定期，健康和家庭和睦最为重要。";
  } else {
    explanation += "您已进入晚年，健康和家庭幸福是首要关注。";
  }

  return explanation;
}
