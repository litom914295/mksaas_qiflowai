/**
 * Phase 8: AI 驱动的月度运势生成引擎
 * 
 * 使用 DeepSeek API 基于飞星数据和八字信息生成个性化运势文本
 * 
 * 成本目标: <$0.05/运势
 */

import { generateText } from 'ai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import type { MonthlyFortuneResult } from './engine';
import type { BaziChart } from '../bazi/types';

// ==================== AI 配置 ====================

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

const MODEL = 'deepseek-chat'; // 便宜又好用

// ==================== Prompt 模板 ====================

function buildMonthlyFortunePrompt(
  year: number,
  month: number,
  baziChart: BaziChart,
  fortuneData: MonthlyFortuneResult
): string {
  const { flyingStarAnalysis, baziTimeliness, fortuneData: basicData } = fortuneData;
  
  return `你是一位资深的命理师，精通八字命理和玄空风水。现在需要为用户生成 ${year}年${month}月 的个性化月度运势分析。

## 用户八字信息
${formatBaziInfo(baziChart)}

## ${year}年${month}月 流年流月信息
- 流年: ${baziTimeliness.yearPillar}
- 流月: ${baziTimeliness.monthPillar}
- 综合评分: ${basicData.overallScore}/100

## 当月飞星布局
${formatFlyingStarGrid(flyingStarAnalysis)}

## 凶煞方位警示
${formatWarnings(flyingStarAnalysis.criticalWarnings)}

## 吉祥元素
- 吉祥方位: ${basicData.luckyDirections.join('、')}
- 幸运颜色: ${basicData.luckyColors.join('、')}
- 幸运数字: ${basicData.luckyNumbers.join('、')}

---

请根据以上信息，为用户生成详细的月度运势分析，包含以下四个方面：

### 1. 事业运势 (200-300字)
结合流年流月干支与用户八字的关系，以及当月飞星中有利事业发展的方位，分析本月事业运势。
- 是否有贵人相助？
- 适合主动进取还是稳扎稳打？
- 需要注意的事业陷阱？
- 重要决策的最佳时机？

### 2. 健康警示 (150-200字)
重点关注五黄二黑等病符星的影响，结合八字五行强弱变化。
- 需要特别注意的健康部位？
- 本月易患的疾病类型？
- 日常保健建议？
- 凶煞方位的避免建议？

### 3. 感情关系 (150-200字)
分析桃花星、孤辰寡宿等对感情的影响。
- 单身者的桃花运如何？
- 已婚者的夫妻关系趋势？
- 家庭关系和谐度？
- 改善感情的风水建议？

### 4. 财运建议 (150-200字)
结合八白财星、七赤破军等星曜，分析财运走势。
- 正财运还是偏财运更旺？
- 是否适合投资理财？
- 需要警惕的破财风险？
- 催财的风水布局建议？

---

**输出要求**:
1. 语言通俗易懂，避免过于专业的术语
2. 语气温和友善，给予积极正面的引导
3. 每个方面的建议要具体可行
4. 总字数控制在 800-1200 字
5. 使用 JSON 格式输出，格式如下：

\`\`\`json
{
  "careerForecast": "事业运势内容...",
  "healthWarnings": ["健康警示1", "健康警示2", "健康警示3"],
  "relationshipTips": ["感情建议1", "感情建议2"],
  "wealthAdvice": "财运建议内容..."
}
\`\`\``;
}

// ==================== 格式化函数 ====================

function formatBaziInfo(baziChart: BaziChart): string {
  // 简化版，实际应该更详细
  return `
- 日主: ${baziChart.dayMaster || '未知'}
- 用神: ${baziChart.usefulGod || '未知'}
- 喜用神: ${baziChart.favorableElements?.join('、') || '未知'}
`;
}

function formatFlyingStarGrid(analysis: MonthlyFortuneResult['flyingStarAnalysis']): string {
  return analysis.monthlyGrid
    .map(palace => {
      const emoji = getAuspiciousnessEmoji(palace.auspiciousness);
      return `- ${palace.direction} ${emoji}: ${palace.meaning}`;
    })
    .join('\n');
}

function getAuspiciousnessEmoji(level: string): string {
  const emojiMap: Record<string, string> = {
    excellent: '⭐⭐⭐',
    good: '⭐⭐',
    neutral: '⭐',
    poor: '⚠️',
    dangerous: '🚫',
  };
  return emojiMap[level] || '';
}

function formatWarnings(warnings: Array<{ direction: string; issue: string; remedy: string }>): string {
  if (warnings.length === 0) {
    return '本月无重大凶煞，运势较为平顺。';
  }
  
  return warnings
    .map(w => `- ${w.direction}: ${w.issue}\n  化解: ${w.remedy}`)
    .join('\n');
}

// ==================== AI 生成主函数 ====================

export async function generateFortuneWithAI(
  year: number,
  month: number,
  baziChart: BaziChart,
  fortuneData: MonthlyFortuneResult
): Promise<{
  careerForecast: string;
  healthWarnings: string[];
  relationshipTips: string[];
  wealthAdvice: string;
  aiCostUSD: number;
  tokensUsed: { prompt: number; completion: number };
}> {
  const startTime = Date.now();
  
  try {
    const prompt = buildMonthlyFortunePrompt(year, month, baziChart, fortuneData);
    
    const result = await generateText({
      model: deepseek(MODEL),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    });
    
    // 解析 JSON 输出
    const jsonMatch = result.text.match(/```json\n([\s\S]*?)\n```/);
    let parsedResult;
    
    if (jsonMatch) {
      parsedResult = JSON.parse(jsonMatch[1]);
    } else {
      // 尝试直接解析
      parsedResult = JSON.parse(result.text);
    }
    
    // 计算成本（DeepSeek 价格：$0.14/1M input, $0.28/1M output）
    const inputCost = (result.usage?.promptTokens || 0) / 1_000_000 * 0.14;
    const outputCost = (result.usage?.completionTokens || 0) / 1_000_000 * 0.28;
    const totalCost = inputCost + outputCost;
    
    console.log(`✅ AI 运势生成成功 (${Date.now() - startTime}ms)`);
    console.log(`   Tokens: ${result.usage?.promptTokens} input + ${result.usage?.completionTokens} output`);
    console.log(`   Cost: $${totalCost.toFixed(6)}`);
    
    return {
      careerForecast: parsedResult.careerForecast,
      healthWarnings: Array.isArray(parsedResult.healthWarnings) 
        ? parsedResult.healthWarnings 
        : [parsedResult.healthWarnings],
      relationshipTips: Array.isArray(parsedResult.relationshipTips)
        ? parsedResult.relationshipTips
        : [parsedResult.relationshipTips],
      wealthAdvice: parsedResult.wealthAdvice,
      aiCostUSD: totalCost,
      tokensUsed: {
        prompt: result.usage?.promptTokens || 0,
        completion: result.usage?.completionTokens || 0,
      },
    };
  } catch (error) {
    console.error('❌ AI 运势生成失败:', error);
    
    // 降级方案：返回基础分析
    return {
      careerForecast: fortuneData.fortuneData.careerForecast,
      healthWarnings: fortuneData.fortuneData.healthWarnings,
      relationshipTips: fortuneData.fortuneData.relationshipTips,
      wealthAdvice: fortuneData.fortuneData.wealthAdvice,
      aiCostUSD: 0,
      tokensUsed: { prompt: 0, completion: 0 },
    };
  }
}

// ==================== 成本优化函数 ====================

/**
 * 批量生成运势（用于 Cron Job）
 * 可以进一步优化成本
 */
export async function batchGenerateFortunesWithAI(
  requests: Array<{
    userId: string;
    year: number;
    month: number;
    baziChart: BaziChart;
    fortuneData: MonthlyFortuneResult;
  }>
): Promise<Array<{
  userId: string;
  result: Awaited<ReturnType<typeof generateFortuneWithAI>>;
}>> {
  console.log(`📦 批量生成 ${requests.length} 个月度运势...`);
  
  const results = [];
  
  // 串行处理，避免并发过多导致 API 限流
  for (const req of requests) {
    try {
      const result = await generateFortuneWithAI(
        req.year,
        req.month,
        req.baziChart,
        req.fortuneData
      );
      
      results.push({
        userId: req.userId,
        result,
      });
      
      // 间隔 100ms，避免触发速率限制
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`❌ 用户 ${req.userId} 运势生成失败:`, error);
      
      // 继续处理下一个
      results.push({
        userId: req.userId,
        result: {
          careerForecast: req.fortuneData.fortuneData.careerForecast,
          healthWarnings: req.fortuneData.fortuneData.healthWarnings,
          relationshipTips: req.fortuneData.fortuneData.relationshipTips,
          wealthAdvice: req.fortuneData.fortuneData.wealthAdvice,
          aiCostUSD: 0,
          tokensUsed: { prompt: 0, completion: 0 },
        },
      });
    }
  }
  
  const totalCost = results.reduce((sum, r) => sum + r.result.aiCostUSD, 0);
  console.log(`✅ 批量生成完成！总成本: $${totalCost.toFixed(4)}`);
  
  return results;
}

// ==================== 导出 ====================

export type { MonthlyFortuneResult };
