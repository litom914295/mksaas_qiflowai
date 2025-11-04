/**
 * AI增强分析服务
 * 使用AI SDK提供更深入的八字命理解读
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { BaziAnalysisResult } from './bazi-calculator-service';

/**
 * AI增强分析配置
 */
const AI_CONFIG = {
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1500,
  systemPrompt: `你是一位经验丰富的命理大师，精通八字命理学。
你的分析应该：
1. 基于传统命理理论，结合现代生活实际
2. 语言通俗易懂，避免过多专业术语
3. 提供具体可行的建议
4. 保持客观中立，不做绝对判断
5. 突出积极正面的指引

请用专业而温和的语气，帮助用户更好地理解自己的命理特点。`,
};

/**
 * 生成性格分析
 */
async function generatePersonalityAnalysis(
  baziResult: BaziAnalysisResult
): Promise<string> {
  const prompt = `基于以下八字信息，请分析此人的性格特点：

日主：${(baziResult as any).dayMaster}
木${(baziResult as any).fiveElements?.wood}、火${(baziResult as any).fiveElements?.fire}、土${(baziResult as any).fiveElements?.earth}、金${(baziResult as any).fiveElements?.metal}、水${(baziResult as any).fiveElements?.water}
喜用神：${((baziResult as any).favorableElements || []).join('、')}
${(baziResult as any).strength === 'strong' ? '身强' : '身弱'}

请提供：
1. 核心性格特征（2-3点）
2. 优势与天赋
3. 需要注意的性格倾向
4. 性格发展建议

请用300字以内完成分析，语言简洁明了。`;

  const { text } = await generateText({
    model: openai(AI_CONFIG.model),
    system: AI_CONFIG.systemPrompt,
    prompt,
    temperature: AI_CONFIG.temperature,
  } as any);

  return text;
}

/**
 * 生成事业发展分析
 */
async function generateCareerAnalysis(
  baziResult: BaziAnalysisResult
): Promise<string> {
  const prompt = `基于以下八字信息，请分析此人的事业发展：

日主：${(baziResult as any).dayMaster}
木${(baziResult as any).fiveElements?.wood}、火${(baziResult as any).fiveElements?.fire}、土${(baziResult as any).fiveElements?.earth}、金${(baziResult as any).fiveElements?.metal}、水${(baziResult as any).fiveElements?.water}
喜用神：${((baziResult as any).favorableElements || []).join('、')}

请提供：
1. 适合的职业方向（3-5个具体领域）
2. 事业发展特点
3. 成功关键因素
4. 职业规划建议

请用300字以内完成分析，提供实用建议。`;

  const { text } = await generateText({
    model: openai(AI_CONFIG.model),
    system: AI_CONFIG.systemPrompt,
    prompt,
    temperature: AI_CONFIG.temperature,
  } as any);

  return text;
}

/**
 * 生成财运分析
 */
async function generateWealthAnalysis(
  baziResult: BaziAnalysisResult
): Promise<string> {
  const prompt = `基于以下八字信息，请分析此人的财运状况：

日主：${(baziResult as any).dayMaster}
木${(baziResult as any).fiveElements?.wood}、火${(baziResult as any).fiveElements?.fire}、土${(baziResult as any).fiveElements?.earth}、金${(baziResult as any).fiveElements?.metal}、水${(baziResult as any).fiveElements?.water}
喜用神：${((baziResult as any).favorableElements || []).join('、')}

请提供：
1. 财运特点与模式
2. 理财建议
3. 适合的投资方向
4. 需要注意的事项

请用250字以内完成分析，提供实用建议。`;

  const { text } = await generateText({
    model: openai(AI_CONFIG.model),
    system: AI_CONFIG.systemPrompt,
    prompt,
    temperature: AI_CONFIG.temperature,
  } as any);

  return text;
}

/**
 * 生成感情分析
 */
async function generateRelationshipAnalysis(
  baziResult: BaziAnalysisResult
): Promise<string> {
  const prompt = `基于以下八字信息，请分析此人的感情婚姻：

日主：${(baziResult as any).dayMaster}
木${(baziResult as any).fiveElements?.wood}、火${(baziResult as any).fiveElements?.fire}、土${(baziResult as any).fiveElements?.earth}、金${(baziResult as any).fiveElements?.metal}、水${(baziResult as any).fiveElements?.water}
喜用神：${((baziResult as any).favorableElements || []).join('、')}

请提供：
1. 感情特点与倾向
2. 适合的伴侣类型
3. 感情相处建议
4. 婚姻经营要点

请用250字以内完成分析，提供温馨建议。`;

  const { text } = await generateText({
    model: openai(AI_CONFIG.model),
    system: AI_CONFIG.systemPrompt,
    prompt,
    temperature: AI_CONFIG.temperature,
  } as any);

  return text;
}

/**
 * 生成健康养生分析
 */
async function generateHealthAnalysis(
  baziResult: BaziAnalysisResult
): Promise<string> {
  const prompt = `基于以下八字信息，请分析此人的健康养生：

日主：${(baziResult as any).dayMaster}
木${(baziResult as any).fiveElements?.wood}、火${(baziResult as any).fiveElements?.fire}、土${(baziResult as any).fiveElements?.earth}、金${(baziResult as any).fiveElements?.metal}、水${(baziResult as any).fiveElements?.water}
喜用神：${((baziResult as any).favorableElements || []).join('、')}

请提供：
1. 体质特点
2. 需要关注的健康方面
3. 养生建议
4. 适合的运动方式

请用200字以内完成分析，提供实用建议。`;

  const { text } = await generateText({
    model: openai(AI_CONFIG.model),
    system: AI_CONFIG.systemPrompt,
    prompt,
    temperature: AI_CONFIG.temperature,
  } as any);

  return text;
}

/**
 * AI增强分析结果
 */
export interface AIEnhancedAnalysis {
  personality: string; // 性格分析
  career: string; // 事业分析
  wealth: string; // 财运分析
  relationship: string; // 感情分析
  health: string; // 健康分析
  summary: string; // 综合总结
  generatedAt: Date; // 生成时间
}

/**
 * 生成AI增强的完整分析
 *
 * @param baziResult 八字分析结果
 * @returns AI增强分析
 */
export async function generateAIEnhancedAnalysis(
  baziResult: BaziAnalysisResult
): Promise<AIEnhancedAnalysis> {
  try {
    // 并行生成所有分析
    const [personality, career, wealth, relationship, health] =
      await Promise.all([
        generatePersonalityAnalysis(baziResult),
        generateCareerAnalysis(baziResult),
        generateWealthAnalysis(baziResult),
        generateRelationshipAnalysis(baziResult),
        generateHealthAnalysis(baziResult),
      ]);

    // 生成综合总结
    const summaryPrompt =
      '基于以上所有分析，请用150字以内总结此人的整体命理特点和人生建议。';

    const { text: summary } = await generateText({
      model: openai(AI_CONFIG.model),
      system: AI_CONFIG.systemPrompt,
      prompt: `${personality}\n${career}\n${wealth}\n${relationship}\n${health}\n\n${summaryPrompt}`,
      temperature: AI_CONFIG.temperature,
    } as any);

    return {
      personality,
      career,
      wealth,
      relationship,
      health,
      summary,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error('AI增强分析生成失败:', error);

    // 返回基础分析作为后备
    const fallback = baziResult as any;
    return {
      personality: '性格温和稳重，善于思考。',
      career: fallback?.careerGuidance ?? '事业平稳发展。',
      wealth: fallback?.wealthGuidance ?? '财运逐步提升。',
      relationship: fallback?.relationshipGuidance ?? '感情关系良好。',
      health: fallback?.healthGuidance ?? '注意身体健康。',
      summary: fallback?.analysis ?? '命理特点鲜明。',
      generatedAt: new Date(),
    };
  }
}

/**
 * 生成简短的AI分析（适用于快速预览）
 */
export async function generateQuickAIAnalysis(
  baziResult: BaziAnalysisResult
): Promise<string> {
  const result = baziResult as any;
  const prompt = `基于以下八字信息，请用50字以内提供精简的命理分析：

日主：${result?.dayMaster ?? ''}
五行：木${result?.fiveElements?.wood ?? 0}、火${result?.fiveElements?.fire ?? 0}、土${result?.fiveElements?.earth ?? 0}、金${result?.fiveElements?.metal ?? 0}、水${result?.fiveElements?.water ?? 0}
喜用神：${(result?.favorableElements ?? []).join('、')}

请突出最重要的特点和建议。`;

  try {
    const { text } = await generateText({
      model: openai(AI_CONFIG.model),
      system: AI_CONFIG.systemPrompt,
      prompt,
      temperature: AI_CONFIG.temperature,
    } as any);

    return text;
  } catch (error) {
    console.error('快速AI分析生成失败:', error);
    return (baziResult as any)?.analysis ?? '命理特点鲜明。';
  }
}
