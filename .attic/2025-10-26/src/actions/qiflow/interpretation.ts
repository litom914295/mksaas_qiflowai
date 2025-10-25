'use server';

import { z } from 'zod';

const InputSchema = z.object({
  type: z.enum(['bazi', 'xuankong']),
  language: z.enum(['zh', 'en']).default('zh'),
  result: z.any(),
});

export async function generateQiflowInterpretation(formData: FormData) {
  const parsed = InputSchema.safeParse({
    type: (formData.get('type') || '').toString() as any,
    language: (formData.get('language') || 'zh') as string as any,
    result: formData.get('result')
      ? JSON.parse(formData.get('result') as string)
      : undefined,
  });
  if (!parsed.success)
    return {
      ok: false as const,
      error: 'INVALID_INPUT',
      issues: parsed.error.issues,
    };
  const { type, language, result } = parsed.data;

  // 轻量规则型“AI”解读（无外部依赖），保证性能与稳定
  if (type === 'bazi') {
    const score = result?.score || {};
    const pillars = result?.pillars || {};
    const ten = result?.tenGods || result?.ten_gods || {};
    const na = result?.naYin || result?.na_yin || [];
    const overview =
      language === 'zh'
        ? '根据四柱与评分，生成结构化解读提示。'
        : 'Structured interpretation based on pillars and scores.';
    const highlights = [
      `${language === 'zh' ? '综合评分' : 'Overall'}: ${Math.round((score.overall || 0) * 100)}%`,
      `${language === 'zh' ? '财运' : 'Wealth'}: ${Math.round((score.wealth || 0) * 100)}%`,
    ];
    const suggestions = [
      language === 'zh'
        ? '本月宜稳健规划财务，关注身心平衡。'
        : 'Plan finance steadily this month and keep a balanced lifestyle.',
    ];
    const relations = Object.keys(ten)
      .slice(0, 5)
      .map((k) => `${k}: ${ten[k]}`);
    const nayin = (na || [])
      .slice(0, 4)
      .map((x: any) => `${x.pillar || ''} ${x.nayin || ''}`);
    return {
      ok: true as const,
      data: { overview, highlights, suggestions, relations, nayin },
    };
  }
  const geju = result?.geju || {};
  const yun = result?.yun || {};
  const overview =
    language === 'zh'
      ? '根据运盘与格局，生成结构化解读提示。'
      : 'Structured interpretation based on period and pattern.';
  const highlights = [
    `${language === 'zh' ? '格局强度' : 'Pattern Strength'}: ${Math.round((geju.strength || 0) * 100)}%`,
    `${language === 'zh' ? '运期数' : 'Periods'}: ${yun?.periods?.length || 0}`,
  ];
  const suggestions = [
    language === 'zh'
      ? '建议在高峰期进行关键决策，保持良好通风与采光。'
      : 'Make key decisions during peak periods; ensure ventilation and lighting.',
  ];
  const breakdown = (yun?.periods || [])
    .slice(0, 5)
    .map((p: any) => p.name + (p.note ? ` - ${p.note}` : ''));
  return {
    ok: true as const,
    data: { overview, highlights, suggestions, breakdown },
  };
}
