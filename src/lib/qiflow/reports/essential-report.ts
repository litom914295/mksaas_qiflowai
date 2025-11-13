/**
 * Phase 3: 精华报告生成引擎
 *
 * 功能:
 * 1. 调用八字和玄空算法
 * 2. AI 生成 3 个主题故事
 * 3. 综合分析与建议
 * 4. 质量审核
 */

import {
  addComplianceConstraints,
  checkAICompliance,
  generateRejectionMessage,
  shouldReject,
} from '@/lib/ai-compliance';
import {
  type BirthInfo,
  FourPillarsCalculator,
} from '@/lib/bazi-pro/core/calculator/four-pillars';
import { FlyingStarCalculator } from '@/lib/fengshui/flying-star';
import {
  type FengshuiData,
  type SynthesisInput,
  type SynthesisOutput,
  generateSynthesisAnalysis,
} from '@/lib/qiflow/ai/synthesis-prompt';
import { resolveModel } from '@/server/ai/providers';
import { generateText } from 'ai';

/**
 * 主题定义
 */
export const REPORT_THEMES = {
  career: {
    id: 'career',
    title: '事业财运',
    description: '职场发展、财富机遇、事业转折点',
  },
  relationship: {
    id: 'relationship',
    title: '感情姻缘',
    description: '爱情运势、婚姻状况、人际关系',
  },
  health: {
    id: 'health',
    title: '健康养生',
    description: '身体状况、疾病预防、养生建议',
  },
  education: {
    id: 'education',
    title: '学业智慧',
    description: '学习能力、考试运势、知识领域',
  },
  family: {
    id: 'family',
    title: '家庭子女',
    description: '家庭和睦、子女运势、长辈关系',
  },
} as const;

export type ThemeId = keyof typeof REPORT_THEMES;

/**
 * 报告生成输入
 */
export interface EssentialReportInput {
  birthInfo: BirthInfo;
  selectedThemes?: ThemeId[]; // 用户选择的 3 个主题，默认 ['career', 'relationship', 'health']

  // 风水数据（用于人宅合一分析）
  fengshuiData?: {
    mountain: string; // 坐山
    facing: string; // 朝向
    buildYear?: number; // 建造年份
  };
}

/**
 * 主题内容
 */
export interface ThemeContent {
  id: ThemeId;
  title: string;
  story: string; // AI 生成的故事化解读
  synthesis: string; // 综合分析
  recommendations: string[]; // 具体建议列表
}

/**
 * 报告输出
 */
export interface EssentialReportOutput {
  // 基础数据
  baziData: any;
  flyingStarData: any;

  // 主题内容
  themes: ThemeContent[];

  // 人宅合一分析（核心卖点）
  synthesis?: SynthesisOutput;

  // 质量分数
  qualityScore: number; // 0-100

  // 元数据
  metadata: {
    aiModel: string;
    generationTimeMs: number;
    aiCostUSD: number;
  };
}

/**
 * 生成精华报告
 */
export async function generateEssentialReport(
  input: EssentialReportInput
): Promise<EssentialReportOutput> {
  const startTime = Date.now();
  let totalCost = 0;

  // 1. 计算八字数据
  console.log('[Report] 步骤 1/5: 计算八字...');
  const calculator = new FourPillarsCalculator();
  const baziData = calculator.calculate(input.birthInfo);

  // 2. 计算玄空飞星
  console.log('[Report] 步骤 2/5: 计算玄空飞星...');
  const flyingStarCalc = new FlyingStarCalculator();
  const currentYear = new Date().getFullYear();
  const flyingStarData = flyingStarCalc.calculateYearStar(currentYear);

  // 3. 生成人宅合一分析（如果提供了风水数据）
  let synthesisOutput: SynthesisOutput | undefined;
  if (input.fengshuiData) {
    console.log('[Report] 步骤 3/7: 生成人宅合一AI分析...');

    try {
      // 构建风水数据
      const fengshuiData: FengshuiData = {
        mountain: input.fengshuiData.mountain,
        facing: input.fengshuiData.facing,
        period: calculatePeriod(
          input.fengshuiData.buildYear || new Date().getFullYear()
        ),
        flyingStars: convertFlyingStarData(flyingStarData),
      };

      // 调用人宅合一分析
      synthesisOutput = await generateSynthesisAnalysis({
        baziData: baziData as any,
        fengshuiData,
        config: {
          year: new Date().getFullYear(),
          language: 'zh-CN',
        },
      });

      totalCost += synthesisOutput.metadata.estimatedCost;
      console.log(
        `[Report] ✅ 人宅合一分析完成，成本: $${synthesisOutput.metadata.estimatedCost.toFixed(4)}`
      );
    } catch (error) {
      console.error('[Report] ❌ 人宅合一分析失败:', error);
      // 不阻断报告生成，继续后续步骤
    }
  }

  // 4. 选择主题（默认前 3 个）
  const selectedThemes = input.selectedThemes || [
    'career',
    'relationship',
    'health',
  ];
  console.log(
    `[Report] 步骤 ${synthesisOutput ? '4' : '3'}/7: 生成主题内容...`,
    selectedThemes
  );

  // 5. 为每个主题生成内容（并发）
  const themes: ThemeContent[] = await Promise.all(
    selectedThemes.map(async (themeId) => {
      const theme = REPORT_THEMES[themeId];

      // StoryWeaver: 生成故事化解读
      const storyResult = await generateThemeStory({
        themeId,
        baziData,
        flyingStarData,
      });
      totalCost += storyResult.cost;

      // Synthesis: 生成综合分析
      const synthesisResult = await generateThemeSynthesis({
        themeId,
        story: storyResult.story,
        baziData,
      });
      totalCost += synthesisResult.cost;

      return {
        id: themeId,
        title: theme.title,
        story: storyResult.story,
        synthesis: synthesisResult.synthesis,
        recommendations: synthesisResult.recommendations,
      };
    })
  );

  // 6. 质量审核（条件触发）
  console.log(`[Report] 步骤 ${synthesisOutput ? '6' : '5'}/7: 质量审核...`);
  const qualityScore = await auditReportQuality({
    themes,
    baziData,
    synthesis: synthesisOutput,
  });
  totalCost += qualityScore.cost;

  console.log(`[Report] 步骤 ${synthesisOutput ? '7' : '6'}/7: 报告生成完成`);
  console.log(
    `[Report] 📊 总成本: $${totalCost.toFixed(4)} | 质量分: ${qualityScore.score} | 耗时: ${Date.now() - startTime}ms`
  );

  const generationTimeMs = Date.now() - startTime;

  return {
    baziData,
    flyingStarData,
    themes,
    synthesis: synthesisOutput,
    qualityScore: qualityScore.score,
    metadata: {
      aiModel: 'deepseek-chat',
      generationTimeMs,
      aiCostUSD: totalCost,
    },
  };
}

/**
 * StoryWeaver: 生成主题故事
 */
async function generateThemeStory(params: {
  themeId: ThemeId;
  baziData: any;
  flyingStarData: any;
}): Promise<{ story: string; cost: number }> {
  const theme = REPORT_THEMES[params.themeId];

  // 添加合规约束到提示词
  const basePrompt = `你是一位资深的八字命理分析师。请基于以下信息，为用户生成【${theme.title}】方面的故事化解读。

## 用户八字信息
${JSON.stringify(params.baziData, null, 2)}

## 玄空飞星信息
${JSON.stringify(params.flyingStarData, null, 2)}

## 要求
1. 使用通俗易懂的语言，避免过多术语
2. 采用故事化叙述，引人入胜
3. 长度控制在 300-500 字
4. 重点突出【${theme.description}】相关内容
5. 语气温和、积极，传递希望

请生成故事化解读:`;

  const prompt = addComplianceConstraints(basePrompt);

  const model = resolveModel('deepseek', 'deepseek-chat');

  const result = await generateText({
    model,
    prompt,
    temperature: 0.8, // 提高创造性
  });

  // AI 合规检查
  const complianceCheck = checkAICompliance({
    userInput: `${theme.title} ${theme.description}`,
    aiOutput: result.text,
  });

  // 如果不合规，使用过滤后的内容
  const finalStory = complianceCheck.compliant
    ? result.text
    : complianceCheck.filtered;

  // 成本估算: DeepSeek ~$0.002/1K tokens output
  const estimatedTokens = result.text.length / 2; // 粗略估算
  const cost = (estimatedTokens / 1000) * 0.002;

  return {
    story: finalStory,
    cost,
  };
}

/**
 * Synthesis: 生成综合分析与建议
 */
async function generateThemeSynthesis(params: {
  themeId: ThemeId;
  story: string;
  baziData: any;
}): Promise<{ synthesis: string; recommendations: string[]; cost: number }> {
  const theme = REPORT_THEMES[params.themeId];

  const prompt = `基于以下故事化解读，提炼出精炼的综合分析和具体建议。

## 故事化解读
${params.story}

## 要求
1. 综合分析: 100-200 字，提炼核心要点
2. 具体建议: 列出 3-5 条可执行的行动建议
3. 建议需具体、可操作，避免泛泛而谈

请以 JSON 格式返回:
{
  "synthesis": "综合分析内容",
  "recommendations": ["建议1", "建议2", "建议3"]
}`;

  const model = resolveModel('deepseek', 'deepseek-chat');

  const result = await generateText({
    model,
    prompt,
    temperature: 0.5, // 降低创造性，确保结构化输出
  });

  // 解析 JSON
  let parsed: any;
  try {
    parsed = JSON.parse(result.text);
  } catch (error) {
    // 容错处理
    parsed = {
      synthesis: result.text.substring(0, 200),
      recommendations: ['请根据自身情况调整', '保持积极心态', '持续学习成长'],
    };
  }

  const estimatedTokens = result.text.length / 2;
  const cost = (estimatedTokens / 1000) * 0.002;

  return {
    synthesis: parsed.synthesis,
    recommendations: parsed.recommendations,
    cost,
  };
}

/**
 * Quality Audit: 质量审核
 */
async function auditReportQuality(params: {
  themes: ThemeContent[];
  baziData: any;
  synthesis?: SynthesisOutput;
}): Promise<{ score: number; cost: number }> {
  // 简单启发式评分（后续可用 AI 增强）
  let score = 80; // 基础分

  // 检查每个主题的内容长度
  for (const theme of params.themes) {
    if (theme.story.length < 200) score -= 5;
    if (theme.synthesis.length < 80) score -= 5;
    if (theme.recommendations.length < 3) score -= 5;
  }

  // 检查人宅合一分析（如果存在）
  if (params.synthesis) {
    // 有超级吉位加分
    score += Math.min(10, params.synthesis.superLuckySpots.length * 3);

    // 有布局建议加分
    score += Math.min(5, params.synthesis.layoutAdvice.length);

    // 使用人宅合一质量分
    score = Math.round((score + params.synthesis.metadata.qualityScore) / 2);
  }

  // 确保分数在 0-100 范围内
  score = Math.max(0, Math.min(100, score));

  console.log(`[Quality Audit] 质量分数: ${score}`);

  return {
    score,
    cost: 0, // 暂时不调用 AI
  };
}

/**
 * 成本估算工具
 */
export function estimateReportCost(
  themeCount = 3,
  includeSynthesis = true
): number {
  let cost = 0;

  // StoryWeaver: ~$0.02/主题
  cost += themeCount * 0.02;

  // Theme Synthesis: ~$0.01/主题
  cost += themeCount * 0.01;

  // Person-House Synthesis: ~$0.25
  if (includeSynthesis) {
    cost += 0.25;
  }

  // Quality Audit: ~$0.005
  cost += 0.005;

  return cost;
}

/**
 * 辅助函数：计算运数
 */
function calculatePeriod(year: number): number {
  // 九运周期：每 20 年一运
  // 下元八运: 2004-2023
  // 下元九运: 2024-2043
  if (year >= 2024) return 9;
  if (year >= 2004) return 8;
  if (year >= 1984) return 7;
  if (year >= 1964) return 6;
  if (year >= 1944) return 5;
  return 8; // 默认八运
}

/**
 * 辅助函数：转换飞星数据格式
 */
function convertFlyingStarData(
  flyingStarData: any
): FengshuiData['flyingStars'] {
  // 如果飞星数据已经是数组格式，直接返回
  if (Array.isArray(flyingStarData?.palaces)) {
    return flyingStarData.palaces.map((palace: any) => ({
      palace: palace.position || palace.palace,
      mountainStar: palace.mountainStar,
      facingStar: palace.facingStar,
      periodStar: palace.periodStar,
      meaning: palace.meaning,
    }));
  }

  // 否则返回空数组，让分析降级处理
  return [];
}
