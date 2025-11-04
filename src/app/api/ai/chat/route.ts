import { type NextRequest, NextResponse } from 'next/server';

const AI_PROVIDERS = {
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.tu-zi.com/v1',
    model: 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl:
      process.env.GEMINI_BASE_URL ||
      'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-2.0-flash-exp',
  },
};

const BASE_SYSTEM_PROMPT = `你是一位专业的风水大师和八字命理专家，名叫"气流AI大师"。你精通：
1. 八字命理分析：能够根据生辰八字分析人的性格、运势、事业、财运等
2. 风水布局：精通玄空风水、九宫飞星等理论，能给出专业的风水建议
3. 开运指导：提供实用的开运建议和化解方案

请用专业、友好的语气回答用户问题。回答要：
- 专业但易懂
- 有理有据
- 给出具体可行的建议
- 保持积极正面的态度`;

function generateSystemPrompt(contextSummary?: string): string {
  // 添加当前时间信息
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const dateInfo = `\n\n【当前时间】\n今天是 ${currentYear}年${currentMonth}月${currentDay}日。当前是 ${currentYear} 年（甲辰龙年，九运）。`;

  if (!contextSummary) {
    return BASE_SYSTEM_PROMPT + dateInfo;
  }

  return `${BASE_SYSTEM_PROMPT}${dateInfo}

【当前用户的背景信息】
以下是用户已经提供的信息和生成的分析结果，你可以直接引用这些内容来回答问题，无需再次询问用户的生日、房屋朝向等基础信息：

${contextSummary}

【重要提示】
- 在回答时，请自然地运用上述背景信息
- 如果用户的问题与这些信息相关，请结合具体数据给出个性化建议
- 对于分析结果中已经提到的内容，可以进行更深入的解释和扩展
- 避免重复询问用户已经提供过的信息`;
}

async function callAIProvider(
  provider: keyof typeof AI_PROVIDERS,
  messages: any[],
  systemPrompt: string
) {
  const config = AI_PROVIDERS[provider];

  if (!config.apiKey) {
    throw new Error(`${provider} API key not configured`);
  }

  if (provider === 'deepseek' || provider === 'openai') {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`${provider} API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  if (provider === 'gemini') {
    const response = await fetch(
      `${config.baseUrl}/models/${config.model}:generateContent?key=${config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
          })),
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, context, enableContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    const systemPrompt =
      enableContext && context
        ? generateSystemPrompt(context)
        : BASE_SYSTEM_PROMPT;

    if (enableContext && context) {
      console.log('[AI Chat] Context-enhanced mode enabled');
      console.log('[AI Chat] Context length:', context.length);
      console.log(
        '[AI Chat] Context preview:',
        context.substring(0, 200) + '...'
      );
    } else {
      console.log('[AI Chat] Using base prompt (no context)');
      console.log('[AI Chat] enableContext:', enableContext);
      console.log('[AI Chat] context exists:', !!context);
    }

    const providers: (keyof typeof AI_PROVIDERS)[] = [
      'deepseek',
      'openai',
      'gemini',
    ];

    for (const provider of providers) {
      try {
        console.log(`Trying ${provider}...`);
        const message = await callAIProvider(provider, messages, systemPrompt);

        return NextResponse.json({
          message,
          provider,
          success: true,
          contextEnhanced: enableContext && !!context,
        });
      } catch (error) {
        console.error(`${provider} failed:`, error);
      }
    }

    return NextResponse.json(
      {
        error: 'All AI providers failed',
        message: '抱歉，AI服务暂时不可用，请稍后再试。',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: '服务器错误，请稍后重试。',
      },
      { status: 500 }
    );
  }
}
