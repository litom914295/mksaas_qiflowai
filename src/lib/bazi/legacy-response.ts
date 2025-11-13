import type { EnhancedBaziResult } from './enhanced-calculator';

type MaybeStrings = string | string[] | undefined | null;

const toArray = (value: MaybeStrings): string[] => {
  if (!value) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [String(value)];
};

const joinText = (value: MaybeStrings, separator = '；'): string => {
  const arr = toArray(value);
  return arr.join(separator);
};

const normalizePillar = (pillar: any) => {
  if (!pillar) {
    return { gan: '', zhi: '' };
  }

  return {
    gan: pillar.heavenlyStem ?? pillar.stem ?? pillar.gan ?? '',
    zhi: pillar.earthlyBranch ?? pillar.branch ?? pillar.zhi ?? '',
    nayin: pillar.naYin ?? pillar.nayin ?? '',
  };
};

const normalizeElements = (analysis: EnhancedBaziResult) => {
  const elements: Record<string, any> = analysis.elements || {};

  const getValue = (...keys: string[]) => {
    for (const key of keys) {
      if (typeof elements[key] === 'number') {
        return elements[key];
      }
    }
    return 0;
  };

  return {
    wood: getValue('wood', 'WOOD', 'ľ'),
    fire: getValue('fire', 'FIRE', '火', '��'),
    earth: getValue('earth', 'EARTH', '土', '��'),
    metal: getValue('metal', 'METAL', '金', '��'),
    water: getValue('water', 'WATER', '水', 'ˮ'),
    analysis: elements.analysis,
    balance: elements.balance,
  };
};

const buildPersonality = (analysis: EnhancedBaziResult) => {
  const interpretation = analysis.interpretation || {};
  const personality = interpretation.personality || {};
  const summary = interpretation.summary || {};

  return {
    summary: summary.overview || '',
    traits: toArray(personality.traits),
    strengths: toArray(summary.strengths),
    weaknesses: toArray(summary.challenges),
    suggestions: toArray(personality.mindset || personality.behavior),
  };
};

const buildCareer = (analysis: EnhancedBaziResult) => {
  const interpretation = analysis.interpretation || {};
  const career = interpretation.career || {};
  const fortune = interpretation.fortune || {};

  return {
    suitable: toArray(career.suitable || career.talents),
    direction: joinText(career.development),
    timing: joinText(fortune.critical),
    potential: joinText(career.talents),
    challenges: joinText(fortune.guidance),
  };
};

const buildWealth = (analysis: EnhancedBaziResult) => {
  const interpretation = analysis.interpretation || {};
  const wealth = interpretation.wealth || {};
  const fortune = interpretation.fortune || {};

  return {
    overall: joinText(wealth.patterns),
    advice: joinText(wealth.advice),
    timing: joinText(fortune.upcoming),
    opportunities: toArray(wealth.opportunities),
    risks: toArray(wealth.risks),
  };
};

const buildHealth = (analysis: EnhancedBaziResult) => {
  const interpretation = analysis.interpretation || {};
  const health = interpretation.health || {};

  return {
    concerns: toArray(health.vulnerabilities),
    advice: joinText(health.wellness),
    prevention: joinText(health.constitution),
    wellness: toArray(health.mental),
  };
};

const buildRelationships = (analysis: EnhancedBaziResult) => {
  const interpretation = analysis.interpretation || {};
  const relationships = interpretation.relationships || {};

  return {
    love: joinText(relationships.love),
    family: joinText(relationships.family),
    friends: joinText(relationships.social),
    social: joinText(relationships.compatibility),
    compatibility: toArray(relationships.compatibility),
  };
};

interface LegacyMetadata {
  creditsUsed: number;
  isFreeTrial: boolean;
  analysisDate?: string;
  inputData?: {
    name: string;
    birthDate: string;
    birthTime: string;
    gender: string;
    birthCity?: string;
    calendarType?: string;
    longitude?: number;
    latitude?: number;
  };
}

export interface LegacyBaziResponse {
  bazi: {
    year: ReturnType<typeof normalizePillar>;
    month: ReturnType<typeof normalizePillar>;
    day: ReturnType<typeof normalizePillar>;
    hour: ReturnType<typeof normalizePillar>;
  };
  wuxing: ReturnType<typeof normalizeElements>;
  personality: ReturnType<typeof buildPersonality>;
  career: ReturnType<typeof buildCareer>;
  wealth: ReturnType<typeof buildWealth>;
  health: ReturnType<typeof buildHealth>;
  relationships: ReturnType<typeof buildRelationships>;
  pattern?: EnhancedBaziResult['pattern'];
  yongshen?: EnhancedBaziResult['yongshen'];
  tenGods?: EnhancedBaziResult['tenGodsAnalysis'];
  luckPillars?: EnhancedBaziResult['luckPillars'];
  dailyAnalysis?: EnhancedBaziResult['dailyAnalysis'];
  shensha?: EnhancedBaziResult['shensha'];
  creditsUsed: number;
  isFreeTrial: boolean;
  analysisDate: string;
  inputData?: LegacyMetadata['inputData'];
  enhancedResult: EnhancedBaziResult;
}

export function buildLegacyBaziResponse(options: {
  analysis: EnhancedBaziResult;
  metadata: LegacyMetadata;
}): LegacyBaziResponse {
  const { analysis, metadata } = options;
  const pillars = analysis.pillars || {};

  return {
    bazi: {
      year: normalizePillar(pillars.year),
      month: normalizePillar(pillars.month),
      day: normalizePillar(pillars.day),
      hour: normalizePillar(pillars.hour),
    },
    wuxing: normalizeElements(analysis),
    personality: buildPersonality(analysis),
    career: buildCareer(analysis),
    wealth: buildWealth(analysis),
    health: buildHealth(analysis),
    relationships: buildRelationships(analysis),
    pattern: analysis.pattern,
    yongshen: analysis.yongshen,
    tenGods: analysis.tenGodsAnalysis,
    luckPillars: analysis.luckPillars,
    dailyAnalysis: analysis.dailyAnalysis,
    shensha: analysis.shensha,
    creditsUsed: metadata.creditsUsed,
    isFreeTrial: metadata.isFreeTrial,
    analysisDate: metadata.analysisDate ?? new Date().toISOString(),
    inputData: metadata.inputData,
    enhancedResult: analysis,
  };
}
