/**
 * QiFlow AI Chat API
 * 算法优先策略 + 积分管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { creditsManager } from '@/lib/credits/manager';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// 请求验证schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.object({
    type: z.enum(['bazi', 'xuankong', 'general']).optional(),
    data: z.record(z.string(), z.any()).optional(),
  }).optional(),
});

// 算法数据检查
async function checkAlgorithmData(message: string, context?: any) {
  // 检查是否询问八字相关
  if (message.includes('八字') || message.includes('命盘') || message.includes('大运')) {
    if (context?.type === 'bazi' && context?.data) {
      return {
        type: 'algorithm',
        response: generateBaziResponse(context.data),
      };
    }
    return {
      type: 'need_data',
      response: '我需要您的生辰八字信息才能进行分析。请提供您的出生年月日时。',
    };
  }

  // 检查是否询问风水相关
  if (message.includes('风水') || message.includes('玄空') || message.includes('飞星')) {
    if (context?.type === 'xuankong' && context?.data) {
      return {
        type: 'algorithm',
        response: generateXuankongResponse(context.data),
      };
    }
    return {
      type: 'need_data',
      response: '我需要您的房屋朝向和地址信息才能进行风水分析。请提供相关信息。',
    };
  }

  return null;
}

// 生成八字响应（基于算法数据）
function generateBaziResponse(data: any): string {
  const { pillars, tenGods, dayMaster } = data;
  
  let response = '根据您的八字分析：\n\n';
  
  if (dayMaster) {
    response += `日主：${dayMaster}\n`;
  }
  
  if (pillars) {
    response += '四柱：\n';
    response += `年柱：${pillars.year?.stem}${pillars.year?.branch}\n`;
    response += `月柱：${pillars.month?.stem}${pillars.month?.branch}\n`;
    response += `日柱：${pillars.day?.stem}${pillars.day?.branch}\n`;
    response += `时柱：${pillars.hour?.stem}${pillars.hour?.branch}\n`;
  }
  
  if (tenGods && tenGods.length > 0) {
    response += '\n十神分析：\n';
    tenGods.forEach((god: any) => {
      response += `${god.name}：${god.description}\n`;
    });
  }
  
  return response;
}

// 生成玄空响应（基于算法数据）
function generateXuankongResponse(data: any): string {
  const { facing, yun, flyingStars } = data;
  
  let response = '根据玄空风水分析：\n\n';
  
  if (facing) {
    response += `房屋坐向：${facing}度\n`;
  }
  
  if (yun) {
    response += `当前运势：${yun}运\n`;
  }
  
  if (flyingStars) {
    response += '\n九宫飞星：\n';
    // 这里可以添加飞星的详细解读
    response += '财位、文昌位、桃花位等方位已标注。\n';
  }
  
  return response;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 验证用户身份
    const session = await auth.api.getSession({
      headers: await headers()
    });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // 2. 验证请求数据
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);
    const { message, context } = validatedData;

    // 3. 算法优先策略
    const algorithmResult = await checkAlgorithmData(message, context);
    if (algorithmResult) {
      if (algorithmResult.type === 'need_data') {
        // 不扣费，直接返回引导信息
        return NextResponse.json({
          response: algorithmResult.response,
          creditsUsed: 0,
          type: 'guidance',
        });
      }
      
      if (algorithmResult.type === 'algorithm') {
        // 算法响应，扣除较少积分
        const result = await creditsManager.executeWithCredits(
          session.user.id,
          'bazi', // 或 'xuankong'，根据实际情况
          async () => algorithmResult.response
        );

        if (result.type === 'insufficient') {
          return NextResponse.json(
            { 
              error: result.message,
              required: result.required,
              balance: result.balance,
            },
            { status: 402 } // Payment Required
          );
        }

        return NextResponse.json({
          response: result.result,
          creditsUsed: result.creditsUsed,
          type: 'algorithm',
        });
      }
    }

    // 4. AI响应（需要更多积分）
    const result = await creditsManager.executeWithCredits(
      session.user.id,
      'aiChat',
      // 完整版AI响应
      async () => {
        const systemPrompt = `你是QiFlow AI，一个专业的八字命理和风水分析助手。
请基于传统命理学和风水学知识，提供专业、准确的分析和建议。
如果用户提供了具体的八字或风水数据，请结合数据进行详细分析。
回答要专业但易懂，避免过于晦涩的术语。`;

        const aiResponse = await streamText({
          model: openai('gpt-3.5-turbo'),
          system: systemPrompt,
          prompt: message,
          temperature: 0.7,
        });

        let fullResponse = '';
        for await (const chunk of aiResponse.textStream) {
          fullResponse += chunk;
        }

        return fullResponse;
      },
      // 简化版响应（积分不足时）
      async () => {
        return `[简化版回答]\n\n关于"${message.substring(0, 50)}..."的问题：\n\n这是一个很好的问题。由于积分限制，我只能提供简要回答。\n\n建议您充值后获取更详细的分析，或者使用八字分析、玄空风水等专门功能获取具体结果。`;
      }
    );

    if (result.type === 'insufficient') {
      return NextResponse.json(
        { 
          error: result.message,
          required: result.required,
          balance: result.balance,
        },
        { status: 402 }
      );
    }

    // 5. 记录消费
    await creditsManager.logConsumption(
      session.user.id,
      'aiChat',
      result.creditsUsed,
      { message: message.substring(0, 100) }
    );

    return NextResponse.json({
      response: result.result,
      creditsUsed: result.creditsUsed,
      type: result.type,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '请求数据格式错误', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}