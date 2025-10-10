/**
 * AI Chat API Route
 *
 * 核心原则：风水判断必须基于用户的八字命理
 * - 所有风水分析都基于用户八字定制
 * - 财位根据日主确定，不是通用位置
 * - 颜色基于用神选择，不是一般配色
 * - 方位依据五行喜忌，完全个性化
 */

import { getLocalizedRouteFromRequest } from '@/lib/i18n-routes';
import {
  AlgorithmFirstGuard,
  type AnalysisContext,
  AuditLogger,
  type QuestionType,
  SensitiveTopicFilter,
} from '@/lib/qiflow/ai/guardrails';
// 导入现有的八字算法
import { type EnhancedBaziResult, computeBaziSmart } from '@/lib/qiflow/bazi';
import { generateId } from '@/lib/utils';
import { Routes } from '@/routes';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// Edge Runtime兼容的简单解析逻辑
function parseUserInput(text: string) {
  const dateMatch = text.match(
    /(\d{4})[年\-\/](\d{1,2})[月\-\/](\d{1,2})[日号]?/
  );
  const timeMatch = text.match(/(\d{1,2})[点时:](\d{2})[分]?/);
  const hasGender = text.includes('男') || text.includes('女');
  const hasMale = text.includes('男');
  const hasFemale = text.includes('女');

  if (!dateMatch) return null;

  const date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
  const time = timeMatch
    ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2].padStart(2, '0')}`
    : null;
  const gender = hasMale ? '男' : hasFemale ? '女' : null;

  return { date, time, gender, hasComplete: !!time && !!gender };
}

// 请求验证Schema
const ChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
  context: z
    .object({
      baziData: z.any().optional(),
      fengshuiData: z.any().optional(),
      birthInfo: z
        .object({
          date: z.string(),
          time: z.string().nullable(),
          gender: z.string().nullable(),
          hasComplete: z.boolean(),
        })
        .optional(),
      calculatedBazi: z.any().optional(), // 存储计算结果
    })
    .optional(),
});

// 响应类型
interface ChatResponse {
  success: boolean;
  data?: {
    response: string;
    questionType: QuestionType;
    hasData: boolean;
    needsAction?: 'REDIRECT_TO_ANALYSIS' | 'REFRESH_ANALYSIS' | 'PROVIDE_INFO';
    actionUrl?: string;
    sessionId: string;
    confidence?: number;
    birthInfo?: {
      date: string;
      time: string | null;
      gender: string | null;
      hasComplete: boolean;
    };
    calculatedBazi?: any; // 计算的八字数据
  };
  error?: string;
}

// AI API配置 - 优先使用DeepSeek，其次OpenAI，最后Gemini
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL =
  process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL =
  process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * 基于八字数据生成智能回答（无需AI API）
 */
function generateSmartResponse(message: string, baziData: any): string {
  if (!baziData) return '抱歉，我需要先了解您的八字信息才能回答这个问题。';

  const { fourPillars, yongShen, fiveElements } = baziData;

  // 用神相关问题
  if (
    message.includes('用神') ||
    message.includes('喜') ||
    message.includes('五行')
  ) {
    let response = '**基于您的八字分析：**\n\n';
    response += '📊 **四柱八字**\n';
    response += `- 年柱：${fourPillars?.year?.stem}${fourPillars?.year?.branch}\n`;
    response += `- 月柱：${fourPillars?.month?.stem}${fourPillars?.month?.branch}\n`;
    response += `- 日柱：${fourPillars?.day?.stem}${fourPillars?.day?.branch}\n`;
    response += `- 时柱：${fourPillars?.hour?.stem}${fourPillars?.hour?.branch}\n\n`;

    response += '🔮 **用神分析**\n';
    response += `您的日主是 **${fourPillars?.day?.stem}** 属${yongShen?.primary === '金' ? '金' : yongShen?.primary === '木' ? '木' : yongShen?.primary === '水' ? '水' : yongShen?.primary === '火' ? '火' : '土'}。\n\n`;

    // 五行强弱分析
    const elements = fiveElements || {};
    response += '五行分布：';
    const elementNames = {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    };
    for (const [key, value] of Object.entries(elements)) {
      const cnName = elementNames[key as keyof typeof elementNames] || key;
      response += `${cnName}(${value}) `;
    }
    response += '\n\n';

    response += `✨ **您的用神是：${yongShen?.primary}**\n\n`;
    response += `- 喜用五行：${yongShen?.favorable?.join('、')}\n`;
    response += `- 忌用五行：${yongShen?.unfavorable?.join('、')}\n\n`;

    response += '**开运建议：**\n';
    response += `🎨 吉利颜色：${yongShen?.colors?.join('、')}\n`;
    response += `🧭 吉利方位：${yongShen?.directions?.join('、')}\n`;
    response += `🔢 幸运数字：${yongShen?.numbers?.join('、')}\n\n`;

    response += '💡 **生活建议：**\n';
    response +=
      yongShen?.suggestions ||
      `建议您多接触${yongShen?.favorable?.join('、')}属性的事物，避免${yongShen?.unfavorable?.join('、')}属性的环境。`;

    return response;
  }

  // 财运相关问题
  if (
    message.includes('财') ||
    message.includes('钱') ||
    message.includes('收入')
  ) {
    const favorable = yongShen?.favorable || [];
    const currentYear = new Date().getFullYear();

    let response = `**财运分析（${currentYear}年）：**\n\n`;
    response += `根据您的八字，用神为${yongShen?.primary}，喜${favorable.join('、')}。\n\n`;

    response += '💰 **财运指引：**\n';
    response += `- 有利投资方向：${favorable.includes('金') ? '金融、科技、机械' : favorable.includes('水') ? '贸易、运输、传媒' : favorable.includes('木') ? '教育、文化、医疗' : favorable.includes('火') ? '娱乐、餐饮、能源' : '房地产、农业、建筑'}\n`;
    response += `- 财位方向：${yongShen?.directions?.[0] || '东方'}\n`;
    response += `- 开运颜色：穿着或使用${yongShen?.colors?.join('、')}色物品可增强财运\n`;
    response += `- 幸运数字：${yongShen?.numbers?.join('、')}\n\n`;

    response += '📅 **时机把握：**\n';
    response += `- 有利月份：${favorable.includes('水') ? '11月、12月、1月' : favorable.includes('木') ? '2月、3月、4月' : favorable.includes('火') ? '5月、6月、7月' : favorable.includes('金') ? '8月、9月、10月' : '3月、6月、9月、12月'}\n`;
    response += `- 每日吉时：根据您的用神，建议在${favorable.includes('水') ? '子时(23-1点)、亥时(21-23点)' : favorable.includes('木') ? '寅时(3-5点)、卯时(5-7点)' : favorable.includes('火') ? '巳时(9-11点)、午时(11-13点)' : favorable.includes('金') ? '申时(15-17点)、酉时(17-19点)' : '辰戌丑未时'}进行重要财务决策\n`;

    return response;
  }

  // 事业相关问题
  if (
    message.includes('事业') ||
    message.includes('工作') ||
    message.includes('职业')
  ) {
    const favorable = yongShen?.favorable || [];

    let response = '**事业发展分析：**\n\n';
    response += `根据您的八字特点，日主${fourPillars?.day?.stem}，用神${yongShen?.primary}。\n\n`;

    response += '💼 **职业方向建议：**\n';
    if (favorable.includes('金')) {
      response += '- 适合行业：金融、科技、法律、机械、汽车、金属加工\n';
      response += '- 职业特点：需要理性思维、精确计算、严谨态度的工作\n';
    } else if (favorable.includes('水')) {
      response += '- 适合行业：贸易、物流、传媒、旅游、航运、水产\n';
      response += '- 职业特点：需要灵活变通、沟通协调、流动性强的工作\n';
    } else if (favorable.includes('木')) {
      response += '- 适合行业：教育、医疗、文化、出版、园林、家具\n';
      response += '- 职业特点：需要创新思维、培育发展、成长性的工作\n';
    } else if (favorable.includes('火')) {
      response += '- 适合行业：娱乐、餐饮、能源、照明、化工、美容\n';
      response += '- 职业特点：需要热情活力、创意表现、影响力的工作\n';
    } else {
      response += '- 适合行业：房地产、农业、建筑、陶瓷、仓储、中介\n';
      response += '- 职业特点：需要稳重踏实、资源整合、协调能力的工作\n';
    }

    response += '\n🎯 **发展策略：**\n';
    response += `- 有利方位：${yongShen?.directions?.join('、')}\n`;
    response += `- 贵人生肖：根据您的八字，容易得到属${fourPillars?.year?.animal === 'Rat' ? '牛、龙、猴' : fourPillars?.year?.animal === 'Ox' ? '鼠、蛇、鸡' : '马、狗、猪'}的人帮助\n`;
    response += `- 开运建议：办公环境多用${yongShen?.colors?.join('、')}色装饰\n`;

    return response;
  }

  // 感情婚姻问题
  if (
    message.includes('感情') ||
    message.includes('婚姻') ||
    message.includes('爱情') ||
    message.includes('对象')
  ) {
    let response = '**感情婚姻分析：**\n\n';
    response += `您的日支${fourPillars?.day?.branch}为婚姻宫，反映感情状况。\n\n`;

    response += '💝 **感情特质：**\n';
    response += `- 日主${fourPillars?.day?.stem}的人，感情${fourPillars?.day?.stem === '甲' || fourPillars?.day?.stem === '丙' || fourPillars?.day?.stem === '戊' || fourPillars?.day?.stem === '庚' || fourPillars?.day?.stem === '壬' ? '主动积极，敢于表达' : '含蓄内敛，重视感受'}\n`;
    response += `- 适合对象：八字中${yongShen?.favorable?.join('、')}旺的人\n`;
    response += `- 有利方位：${yongShen?.directions?.[0] || ''}方向容易遇到合适对象\n\n`;

    response += '🌸 **增进感情建议：**\n';
    response += `- 穿着${yongShen?.colors?.join('、')}色服装增加魅力\n`;
    response += `- 选择${yongShen?.numbers?.join('、')}相关的日子约会\n`;
    response += '- 布置环境时多用喜用五行的元素\n';

    return response;
  }

  // 健康相关问题
  if (
    message.includes('健康') ||
    message.includes('身体') ||
    message.includes('疾病')
  ) {
    const unfavorable = yongShen?.unfavorable || [];

    let response = '**健康养生分析：**\n\n';
    response += '根据您的五行分布，需要特别关注以下方面：\n\n';

    response += '🏥 **健康提示：**\n';
    if (unfavorable.includes('金')) {
      response += '- 注意呼吸系统、皮肤问题\n';
    }
    if (unfavorable.includes('木')) {
      response += '- 注意肝胆、神经系统\n';
    }
    if (unfavorable.includes('水')) {
      response += '- 注意肾脏、泌尿系统\n';
    }
    if (unfavorable.includes('火')) {
      response += '- 注意心脏、血液循环\n';
    }
    if (unfavorable.includes('土')) {
      response += '- 注意脾胃、消化系统\n';
    }

    response += '\n💪 **养生建议：**\n';
    response += `- 有利运动时间：${yongShen?.favorable?.includes('水') ? '晚上' : yongShen?.favorable?.includes('火') ? '中午' : '早晨'}\n`;
    response += `- 适合的运动：${yongShen?.favorable?.includes('水') ? '游泳、太极' : yongShen?.favorable?.includes('木') ? '瑜伽、慢跑' : yongShen?.favorable?.includes('火') ? '有氧运动' : yongShen?.favorable?.includes('金') ? '器械健身' : '散步、登山'}\n`;
    response += `- 饮食调理：多食${yongShen?.favorable?.includes('水') ? '黑色食物、海鲜' : yongShen?.favorable?.includes('木') ? '绿色蔬菜、酸味食物' : yongShen?.favorable?.includes('火') ? '红色食物、苦味食物' : yongShen?.favorable?.includes('金') ? '白色食物、辛味食物' : '黄色食物、甘味食物'}\n`;

    return response;
  }

  // 默认回答
  let response = '**八字综合分析：**\n\n';
  response += '📊 您的四柱八字：\n';
  response += `${fourPillars?.year?.stem}${fourPillars?.year?.branch} ${fourPillars?.month?.stem}${fourPillars?.month?.branch} ${fourPillars?.day?.stem}${fourPillars?.day?.branch} ${fourPillars?.hour?.stem}${fourPillars?.hour?.branch}\n\n`;
  response += `✨ 用神：${yongShen?.primary}\n`;
  response += `喜用：${yongShen?.favorable?.join('、')}\n`;
  response += `忌用：${yongShen?.unfavorable?.join('、')}\n\n`;
  response += '您可以问我更具体的问题，比如财运、事业、感情、健康等方面。';

  return response;
}

/**
 * 调用AI模型
 */
async function callAIModel(
  prompt: string,
  systemPrompt?: string,
  baziData?: any
): Promise<string> {
  // 如果没有配置任何AI API密钥，使用智能备用方案
  if (!OPENAI_API_KEY && !DEEPSEEK_API_KEY && !GEMINI_API_KEY) {
    // 使用基于算法的智能回答
    if (baziData) {
      return generateSmartResponse(prompt, baziData);
    }
    return '请先提供您的出生信息（出生日期、时间、性别），我才能为您进行八字分析。';
  }

  // 优先使用DeepSeek
  if (DEEPSEEK_API_KEY) {
    try {
      console.log('🤖 [DEBUG] 使用DeepSeek API');
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                systemPrompt ||
                '你是一位专业的易学顾问，精通八字命理和风水学。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] DeepSeek API error:', errorText);
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ [DEBUG] DeepSeek 响应成功');
      return (
        data.choices[0]?.message?.content || '抱歉，我暂时无法回答您的问题。'
      );
    } catch (error) {
      console.error('DeepSeek Error:', error);
      // 如果DeepSeek失败，尝试其他API
    }
  }

  // 如果DeepSeek不可用，尝试OpenAI
  if (OPENAI_API_KEY) {
    try {
      console.log('🤖 [DEBUG] 使用OpenAI API');
      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // 使用更经济的模型
          messages: [
            {
              role: 'system',
              content:
                systemPrompt ||
                '你是一位专业的易学顾问，精通八字命理和风水学。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [DEBUG] OpenAI 响应成功');
      return (
        data.choices[0]?.message?.content || '抱歉，我暂时无法回答您的问题。'
      );
    } catch (error) {
      console.error('OpenAI Error:', error);
    }
  }

  // 最后尝试Gemini
  if (GEMINI_API_KEY) {
    try {
      console.log('🤖 [DEBUG] 使用Gemini API');
      // Gemini API的调用方式略有不同
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemPrompt}\n\n${prompt}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2000,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ [DEBUG] Gemini 响应成功');
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        '抱歉，我暂时无法回答您的问题。'
      );
    } catch (error) {
      console.error('Gemini Error:', error);
    }
  }

  // 如果所有API都失败，使用智能备用方案
  console.log('⚠️ [DEBUG] 所有AI API失败，使用本地智能回答');
  if (baziData) {
    return generateSmartResponse(prompt, baziData);
  }

  throw new Error('AI服务暂时不可用');
}

/**
 * 生成系统提示词 - 包含完整的八字数据供AI使用
 */
function generateSystemPrompt(
  questionType: QuestionType,
  hasData: boolean,
  baziData?: any
): string {
  const basePrompt = `你是QiFlow AI的专业易学顾问，专注于提供基于数据的专业分析。

## 核心原则
1. **算法优先**：所有个性化建议必须基于已计算的结构化数据
2. **科学态度**：以现代视角解释传统文化，避免迷信色彩
3. **实用导向**：提供可执行的建议和改善方案
4. **隐私保护**：不记录、不外传用户个人信息

## 回答规范
1. 使用通俗易懂的语言，避免过度专业术语
2. 提供具体可行的建议，而非空泛论述
3. 适当使用表情符号增加亲和力
4. 每个回答控制在800字以内
5. 重要建议用加粗或列表形式突出`;

  if (questionType === 'bazi' && hasData && baziData) {
    // 将计算好的八字数据嵌入到系统提示词中
    const baziContext = `
## 用户八字命盘数据（由算法精确计算）

### 四柱八字
- 年柱：${baziData.fourPillars?.year?.stem || ''}${baziData.fourPillars?.year?.branch || ''}
- 月柱：${baziData.fourPillars?.month?.stem || ''}${baziData.fourPillars?.month?.branch || ''}
- 日柱：${baziData.fourPillars?.day?.stem || ''}${baziData.fourPillars?.day?.branch || ''}
- 时柱：${baziData.fourPillars?.hour?.stem || ''}${baziData.fourPillars?.hour?.branch || ''}

### 五行分析
${
  baziData.fiveElements
    ? Object.entries(baziData.fiveElements)
        .map(([k, v]) => `- ${k}: ${v}`)
        .join('\n')
    : ''
}

### 用神分析
- 日主：${baziData.fourPillars?.day?.stem || ''}属${baziData.dayMasterElement || ''}
- 用神：${baziData.yongShen?.primary || ''}
- 喜用五行：${baziData.yongShen?.favorable?.join('、') || ''}
- 忌用五行：${baziData.yongShen?.unfavorable?.join('、') || ''}

### 吉利方向
- 吉利颜色：${baziData.yongShen?.colors?.join('、') || ''}
- 吉利方位：${baziData.yongShen?.directions?.join('、') || ''}
- 吉利数字：${baziData.yongShen?.numbers?.join('、') || ''}

## 你的任务
基于以上精确计算的八字数据，回答用户关于命理的任何问题。你需要：
1. 理解并运用传统八字理论
2. 结合现代生活给出实用建议
3. 根据用户问题的具体内容，灵活运用以上数据
4. 不要重复显示原始数据，而是解释其含义
5. 对于财运、事业、感情、健康等问题，结合用神和五行生克关系分析`;

    return `${basePrompt}\n${baziContext}`;
  }

  if (questionType === 'fengshui' && hasData) {
    return `${basePrompt}

## 风水专业知识  
- 精通玄空飞星、九宫八卦布局
- 能够分析房屋坐向、飞星组合吉凶
- 擅长居家布局、办公环境优化建议
- 基于提供的风水数据进行精准分析`;
  }

  return `${basePrompt}

## 通用咨询模式
- 提供易学文化知识普及
- 解释基础理论和概念
- 引导用户进行专业分析
- 不进行无数据的个人预测`;
}

/**
 * 处理聊天请求
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证请求数据
    const validationResult = ChatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json<ChatResponse>(
        {
          success: false,
          error: '请求参数无效',
        },
        { status: 400 }
      );
    }

    const { message, context: providedContext } = validationResult.data;
    const sessionId = validationResult.data.sessionId || generateId('session');

    // 敏感话题检查
    if (SensitiveTopicFilter.isSensitive(message)) {
      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        sessionId,
        userId: validationResult.data.userId,
        questionType: 'unknown',
        hasValidData: false,
        responseType: 'SENSITIVE_FILTER',
      });

      return NextResponse.json<ChatResponse>({
        success: true,
        data: {
          response: SensitiveTopicFilter.getSensitiveWarning(),
          questionType: 'unknown',
          hasData: false,
          sessionId,
          confidence: 1,
        },
      });
    }

    // 【简化版】智能解析用户输入
    console.log('📝 [DEBUG] User message:', message);
    console.log('📦 [DEBUG] Context birthInfo:', providedContext?.birthInfo);
    const parsedBirth = parseUserInput(message);
    console.log('🎯 [DEBUG] Parsed birth info:', parsedBirth);

    // 如果上下文中有birthInfo，优先使用
    const savedBirthInfo = providedContext?.birthInfo;
    let savedBaziData = providedContext?.calculatedBazi; // 保存的八字计算结果 (可变变量)
    const birthInfoToUse = parsedBirth || savedBirthInfo;
    console.log('💾 [DEBUG] birthInfoToUse:', birthInfoToUse);
    console.log('✅ [DEBUG] hasComplete?', birthInfoToUse?.hasComplete);

    let baziResult: EnhancedBaziResult | null = null; // 在外部声明

    // 如果有完整的生辰信息（新解析或保存的）
    if (birthInfoToUse?.hasComplete) {
      console.log('🚀 [DEBUG] Entering birthInfo complete logic');

      // 判断是新识别还是使用已保存的
      const isNewParse = !!parsedBirth;
      baziResult = savedBaziData; // 使用已保存的结果

      // 如果是新识别或还没有计算过八字，立即计算
      if (isNewParse || !baziResult) {
        console.log('🆕 [DEBUG] 计算八字数据...');
        try {
          // 调用现有的八字算法 - 使用正确的参数格式
          // 构建ISO格式的日期时间字符串
          const isoDateTime = `${birthInfoToUse.date}T${birthInfoToUse.time || '00:00'}:00`;

          const rawBaziResult = await computeBaziSmart({
            datetime: isoDateTime, // 使用datetime字段（注意：小写）
            gender: birthInfoToUse.gender === '男' ? 'male' : 'female',
            timezone: 'Asia/Shanghai', // 中国时区
            isTimeKnown: !!birthInfoToUse.time, // 是否知道出生时间
          });
          console.log('✅ [DEBUG] 八字计算完成');

          // 调试：查看实际返回的数据结构
          console.log(
            '🔍 [DEBUG] 原始数据结构 pillars:',
            JSON.stringify(rawBaziResult?.pillars, null, 2)
          );

          // 映射数据结构以兼容我们的代码
          if (rawBaziResult) {
            // 创建一个新对象，保留原始数据并添加fourPillars作为一个属性
            const fourPillarsData = (() => {
              const pillars =
                rawBaziResult.pillars ||
                (rawBaziResult as any).fourPillars ||
                (rawBaziResult as any).mainPillars;
              if (!pillars) return null;

              // 确保每个柱子都有 stem 和 branch
              const ensurePillar = (pillar: any) => {
                if (!pillar) return { stem: '', branch: '' };

                // 如果已经有 stem 和 branch，直接返回
                if (pillar.stem && pillar.branch) return pillar;

                // 如果有 heavenlyStem 和 earthlyBranch，映射过来
                if (pillar.heavenlyStem && pillar.earthlyBranch) {
                  return {
                    ...pillar,
                    stem: pillar.heavenlyStem,
                    branch: pillar.earthlyBranch,
                  };
                }

                // 如果有 chinese 字段，解析出天干地支
                if (pillar.chinese && pillar.chinese.length >= 2) {
                  return {
                    ...pillar,
                    stem: pillar.chinese.charAt(0), // 第一个字符是天干
                    branch: pillar.chinese.charAt(1), // 第二个字符是地支
                  };
                }

                // 如果有 element 但没有 stem/branch，尝试从其他字段获取
                if (pillar.element) {
                  return {
                    ...pillar,
                    stem: pillar.stem || pillar.heavenlyStem || '',
                    branch: pillar.branch || pillar.earthlyBranch || '',
                  };
                }

                return { stem: '', branch: '' };
              };

              return {
                year: ensurePillar(pillars.year),
                month: ensurePillar(pillars.month),
                day: ensurePillar(pillars.day),
                hour: ensurePillar(pillars.hour || (pillars as any).time),
              };
            })();

            // 创建一个带有fourPillars属性的新对象，但不修改类型
            baziResult = {
              ...rawBaziResult,
              // 映射 yongshen 到 yongShen（处理英文到中文的转换）
              yongshen: (() => {
                // 五行英中文映射
                const elementMap: Record<string, string> = {
                  METAL: '金',
                  WOOD: '木',
                  WATER: '水',
                  FIRE: '火',
                  EARTH: '土',
                  金: '金',
                  木: '木',
                  水: '水',
                  火: '火',
                  土: '土',
                };

                // 五行对应颜色
                const colorMap: Record<string, string[]> = {
                  金: ['白色', '金色', '银色'],
                  木: ['绿色', '青色', '蓝色'],
                  水: ['黑色', '蓝色', '灰色'],
                  火: ['红色', '紫色', '橙色'],
                  土: ['黄色', '棕色', '咖啡色'],
                };

                // 五行对应方位
                const directionMap: Record<string, string> = {
                  金: '西方',
                  木: '东方',
                  水: '北方',
                  火: '南方',
                  土: '中央',
                };

                // 获取喜用五行
                let favorable: any[] =
                  rawBaziResult.yongshen?.favorable ||
                  (rawBaziResult as any).favorableElements?.primary ||
                  (rawBaziResult as any).basicAnalysis?.favorableElements
                    ?.primary ||
                  [];
                // 确保是数组
                if (!Array.isArray(favorable)) favorable = [favorable];
                const favorableMapped = favorable
                  .map((e: string) => elementMap[e] || e)
                  .filter(Boolean);

                // 获取忌用五行
                let unfavorable: any[] =
                  rawBaziResult.yongshen?.unfavorable ||
                  (rawBaziResult as any).favorableElements?.unfavorable ||
                  (rawBaziResult as any).basicAnalysis?.favorableElements
                    ?.unfavorable ||
                  [];
                // 确保是数组
                if (!Array.isArray(unfavorable)) unfavorable = [unfavorable];
                const unfavorableMapped = unfavorable
                  .map((e: string) => elementMap[e] || e)
                  .filter(Boolean);

                // 获取用神
                const primaryElement = favorableMapped[0] || '火';

                return {
                  primary: primaryElement,
                  favorable: favorableMapped as any,
                  unfavorable: unfavorableMapped as any,
                  colors: favorableMapped.flatMap(
                    (e: string) => colorMap[e] || []
                  ),
                  directions: favorableMapped
                    .map((e: string) => directionMap[e])
                    .filter(Boolean),
                  numbers:
                    primaryElement === '火'
                      ? ['2', '7']
                      : primaryElement === '水'
                        ? ['1', '6']
                        : primaryElement === '木'
                          ? ['3', '8']
                          : primaryElement === '金'
                            ? ['4', '9']
                            : ['5', '0'],
                  suggestions: `根据您的八字，用神为${primaryElement}，建议多接触${favorableMapped.join('、')}属性的事物。`,
                };
              })(),
              // 映射五行统计
              fiveElements:
                rawBaziResult.elements ||
                (rawBaziResult as any).fiveElements ||
                (rawBaziResult as any).basicAnalysis?.fiveFactors,
              // 映射日主元素
              dayMasterElement:
                (rawBaziResult as any).basicAnalysis?.dayMaster?.element ||
                '水',
            } as EnhancedBaziResult & {
              fourPillars?: any;
              fiveElements?: any;
              dayMasterElement?: any;
            }; // 使用交叉类型

            // 在baziResult上添加fourPillars属性，但不改变类型
            (baziResult as any).fourPillars = fourPillarsData;
            console.log('🔄 [DEBUG] 数据结构映射完成');
          }
          savedBaziData = baziResult; // 更新保存的数据
        } catch (error) {
          console.error('❌ [DEBUG] 八字计算失败:', error);
        }
      }

      // 如果用户问了具体问题（不只是提供生辰信息），直接回答
      const hasQuestion =
        message.includes('？') ||
        message.includes('?') ||
        message.includes('什么') ||
        message.includes('如何') ||
        message.includes('怎么') ||
        message.includes('用神') ||
        message.includes('五行') ||
        message.includes('喜') ||
        message.includes('财运') ||
        message.includes('财富') ||
        message.includes('运势') ||
        message.includes('运程') ||
        message.includes('今年') ||
        message.includes('明年') ||
        message.includes('事业') ||
        message.includes('健康') ||
        message.includes('感情') ||
        message.includes('婚姻') ||
        message.includes('工作') ||
        message.includes('学业');

      if (baziResult && (hasQuestion || !isNewParse)) {
        console.log('🎯 [DEBUG] 基于八字数据回答问题');
        console.log('🤖 [DEBUG] 准备调用AI模型解读八字数据');

        let response = '';

        // 如果是新解析，先显示识别确认
        if (isNewParse) {
          response += '✨ **已识别并计算您的八字信息！**\n\n';
          response += '📅 **出生资料**\n';
          response += `- 日期：${birthInfoToUse.date}\n`;
          response += `- 时间：${birthInfoToUse.time}\n`;
          response += `- 性别：${birthInfoToUse.gender}\n\n`;

          // 如果用户同时提出了问题，继续回答
          if (!hasQuestion) {
            // 只是识别了信息，没有具体问题
            response += '📊 **八字已计算完成**\n';
            response += '我已经为您计算好八字命盘。\n\n';
            response += '💡 **您可以直接问我：**\n';
            response += `- "我的用神是什么？"\n`;
            response += `- "今年财运怎么样？"\n`;
            response += `- "我适合什么职业？"\n`;
            response += `- "我的性格特点是什么？"\n`;
            response += `- "我的婚姻运势如何？"`;

            return NextResponse.json({
              success: true,
              data: {
                response,
                questionType: 'bazi',
                hasData: true,
                sessionId,
                confidence: 0.9,
                birthInfo: birthInfoToUse,
                calculatedBazi: baziResult,
              },
            });
          }
        }

        // 调用AI模型解读八字数据并回答问题
        try {
          const systemPrompt = generateSystemPrompt('bazi', true, baziResult);
          const userPrompt = `用户问题：${message}\n\n请基于已计算的八字数据回答。如果用户刚刚提供了生辰信息，先简要确认，然后回答问题。`;

          // 传递baziResult给callAIModel
          const aiResponse = await callAIModel(
            userPrompt,
            systemPrompt,
            baziResult
          );

          // 如果是新解析的，在AI回答前加上识别确认
          if (isNewParse && aiResponse) {
            response += aiResponse;
          } else {
            response = aiResponse || '抱歉，我暂时无法回答您的问题。';
          }
        } catch (error) {
          console.error('❗ [DEBUG] AI模型调用失败:', error);
          // 如果AI调用失败，使用备用的简单回复
          response += '📊 **您的八字命盘**\n\n';

          const baziWithPillars = baziResult as any;
          if (baziWithPillars.fourPillars) {
            response += '**四柱八字：**\n';
            response += `- 年柱：${baziWithPillars.fourPillars.year.stem}${baziWithPillars.fourPillars.year.branch}\n`;
            response += `- 月柱：${baziWithPillars.fourPillars.month.stem}${baziWithPillars.fourPillars.month.branch}\n`;
            response += `- 日柱：${baziWithPillars.fourPillars.day.stem}${baziWithPillars.fourPillars.day.branch}\n`;
            response += `- 时柱：${baziWithPillars.fourPillars.hour.stem}${baziWithPillars.fourPillars.hour.branch}\n\n`;
          }

          if (baziResult.yongshen) {
            response += '**用神分析：**\n';
            response += `- 日主：${baziWithPillars.fourPillars?.day?.stem || ''}属${baziWithPillars.dayMasterElement || ''}\n`;
            response += `- 用神：${(baziResult.yongshen as any).primary || baziResult.yongshen.favorable?.[0] || ''}\n`;
            response += `- 喜用五行：${baziResult.yongshen.favorable?.join('、') || ''}\n`;
            response += `- 忌用五行：${baziResult.yongshen.unfavorable?.join('、') || ''}\n\n`;
          }

          response += `\n关于您的问题“${message}”，我建议您参考以上八字数据进行分析。`;
        }

        response +=
          '\n\n---\n*💡 以上分析基于传统八字算法，仅供参考。人生掌握在自己手中。*';

        return NextResponse.json({
          success: true,
          data: {
            response,
            questionType: 'bazi',
            hasData: true,
            sessionId,
            confidence: 0.95,
            birthInfo: birthInfoToUse,
            calculatedBazi: baziResult, // 返回计算结果供前端保存
          },
        });
      }

      // 使用已保存的birthInfo，直接进入回答流程
      console.log('✅ [DEBUG] 使用已保存的birthInfo:', savedBirthInfo);
      // 继续执行后续逻辑，不要返回，让AI回答问题
    } else if (parsedBirth && !parsedBirth.hasComplete) {
      // 信息不完整，提示补充
      const missing = [];
      if (!parsedBirth.time) missing.push('出生时间');
      if (!parsedBirth.gender) missing.push('性别');

      return NextResponse.json<ChatResponse>({
        success: true,
        data: {
          response:
            `🔍 我识别到您的出生日期是 **${parsedBirth.date}**\n\n` +
            '但还需要以下信息才能进行完整分析：\n' +
            missing.map((m) => `- ${m}`).join('\n') +
            '\n\n' +
            '请补充完整信息，例如：\n' +
            `"${parsedBirth.date} ${parsedBirth.time || '8:30'} ${parsedBirth.gender || '男'}"`,
          questionType: 'bazi',
          hasData: false,
          sessionId,
          confidence: 0.7,
        },
      });
    }

    // 【重要】风水分析前置验证
    const isFengShuiQuestion =
      message.includes('风水') ||
      message.includes('财位') ||
      message.includes('文昌位') ||
      message.includes('布局') ||
      message.includes('朝向') ||
      message.includes('方位') ||
      message.includes('玄空') ||
      message.includes('飞星');

    const hasBaziData =
      providedContext?.baziData || savedBaziData || baziResult;

    // 核心原则：风水必须基于八字
    if (isFengShuiQuestion && !hasBaziData) {
      return NextResponse.json<ChatResponse>({
        success: true,
        data: {
          response:
            '🌟 **核心原则：风水分析必须基于您的八字命理**\n\n' +
            '我们的风水服务与众不同：\n' +
            '• 不提供千篇一律的通用建议\n' +
            '• 财位根据您的日主确定\n' +
            '• 颜色基于您的用神选择\n' +
            '• 方位依据您的五行喜忌\n\n' +
            '请先提供您的出生信息（年月日时、性别、出生地），让我为您进行真正个性化的风水分析。',
          questionType: 'fengshui',
          hasData: false,
          sessionId,
          confidence: 1,
        },
      });
    }

    // 构建分析上下文 - 包含计算的八字数据
    const analysisContext: AnalysisContext = {
      sessionId,
      userId: validationResult.data.userId,
      baziData: hasBaziData, // 使用验证后的数据
      fengshuiData: providedContext?.fengshuiData || null,
      timestamp: new Date().toISOString(),
    };

    // 创建护栏实例并验证
    const guard = new AlgorithmFirstGuard();
    const validation = await guard.validateContext(message, analysisContext);
    const questionType = AlgorithmFirstGuard.identifyQuestionType(message);

    // 如果不能回答，返回引导信息
    if (!validation.canAnswer) {
      const guidanceMessage =
        AlgorithmFirstGuard.generateGuidanceMessage(validation);

      await AuditLogger.log({
        timestamp: new Date().toISOString(),
        sessionId,
        userId: validationResult.data.userId,
        questionType,
        hasValidData: false,
        responseType: 'GUIDANCE',
      });

      let actionUrl: string | undefined;
      if (validation.action === 'REDIRECT_TO_ANALYSIS') {
        // 根据缺失的数据类型，生成对应的国际化路由
        const targetRoute =
          validation.reason === 'NO_BAZI_DATA'
            ? Routes.QiflowBazi
            : Routes.QiflowXuankong;
        actionUrl = getLocalizedRouteFromRequest(targetRoute, request);
      }

      return NextResponse.json<ChatResponse>({
        success: true,
        data: {
          response: guidanceMessage,
          questionType,
          hasData: false,
          needsAction: validation.action,
          actionUrl,
          sessionId,
          confidence: 1,
        },
      });
    }

    // 构建AI上下文和调用
    let aiContext = AlgorithmFirstGuard.buildAIContext(
      message,
      analysisContext,
      validation
    );

    // 如果有birthInfo，添加到上下文中
    if (birthInfoToUse?.hasComplete) {
      const birthContext = `\n\n用户的出生信息：
- 日期：${birthInfoToUse.date}
- 时间：${birthInfoToUse.time}
- 性别：${birthInfoToUse.gender}

请基于这些信息和八字命理的通用知识回答用户的问题。`;
      aiContext = (aiContext || message) + birthContext;
    }

    const systemPrompt = generateSystemPrompt(
      questionType,
      validation.hasData || !!birthInfoToUse
    );

    // 调用AI模型
    let aiResponse: string;
    try {
      aiResponse = await callAIModel(aiContext || message, systemPrompt);

      // 添加免责声明
      if (!aiResponse.includes('声明') && !aiResponse.includes('仅供参考')) {
        aiResponse += '\n\n---\n*💡 以上分析仅供参考，人生掌握在自己手中。*';
      }
    } catch (error) {
      console.error('AI Call Failed:', error);
      aiResponse = `抱歉，AI服务暂时不可用。

根据您的问题类型，我建议您：
${validation.dataType === 'bazi' ? '- 查看八字分析报告了解详细信息' : ''}
${validation.dataType === 'fengshui' ? '- 查看风水分析报告了解布局建议' : ''}
${!validation.dataType ? '- 先进行基础分析获取专业报告' : ''}

如需帮助，请稍后再试或联系客服。`;
    }

    // 记录审计日志
    await AuditLogger.log({
      timestamp: new Date().toISOString(),
      sessionId,
      userId: validationResult.data.userId,
      questionType,
      hasValidData: validation.hasData || false,
      dataVersion:
        analysisContext.baziData?.version ||
        analysisContext.fengshuiData?.version,
      responseType: 'ANALYSIS',
      confidenceLevel: 0.85,
    });

    // 返回成功响应
    return NextResponse.json<ChatResponse>({
      success: true,
      data: {
        response: aiResponse,
        questionType,
        hasData: validation.hasData || false,
        sessionId,
        confidence: 0.85,
        birthInfo: birthInfoToUse, // 保持传递birthInfo
      },
    });
  } catch (error) {
    console.error('Chat API Error:', error);

    return NextResponse.json<ChatResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS请求处理（CORS）
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
