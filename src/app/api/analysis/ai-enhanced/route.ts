/**
 * AI增强分析API路由
 * POST /api/analysis/ai-enhanced
 */

import { verifyAuth } from '@/lib/auth';
import {
  generateAIEnhancedAnalysis,
  generateQuickAIAnalysis,
} from '@/lib/services/ai-enhanced-analysis';
import { calculateBazi } from '@/lib/services/bazi-calculator-service';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 定义 PersonalData 类型
interface PersonalData {
  birthDate: string;
  birthTime: string;
  gender: 'male' | 'female';
  location?: string;
  calendar?: 'solar' | 'lunar';
  name?: string;
}

/**
 * 请求验证Schema
 */
const requestSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式必须为 YYYY-MM-DD'),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/, '时间格式必须为 HH:mm'),
  gender: z.enum(['male', 'female']),
  isQuickAnalysis: z.boolean().optional().default(false),
  userId: z.string().optional(),
});

/**
 * 错误响应
 */
function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message, success: false }, { status });
}

/**
 * POST: 生成AI增强分析
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析和验证请求体
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        `请求参数验证失败: ${validationResult.error.issues.map((e) => e.message).join(', ')}`
      );
    }

    const { birthDate, birthTime, gender, isQuickAnalysis, userId } =
      validationResult.data;

    // 2. 验证用户身份（可选，如果需要记录用户信息）
    let authenticatedUserId: string | null = null;
    if (userId) {
      const authResult = await verifyAuth(request);
      if (!authResult.authenticated || authResult.userId !== userId) {
        return errorResponse('用户身份验证失败', 401);
      }
      authenticatedUserId = authResult.userId;
    }

    // 3. 解析日期和时间
    const [yearStr, monthStr, dayStr] = birthDate.split('-');
    const [hourStr, minuteStr] = birthTime.split(':');

    // 计算八字
    const baziResult = calculateBazi({
      year: Number.parseInt(yearStr),
      month: Number.parseInt(monthStr),
      day: Number.parseInt(dayStr),
      hour: Number.parseInt(hourStr),
      gender,
    });

    // 4. 生成AI增强分析
    let aiAnalysis;
    if (isQuickAnalysis) {
      // 快速分析模式
      const quickText = await generateQuickAIAnalysis(baziResult);
      aiAnalysis = {
        summary: quickText,
        personality: '',
        career: '',
        wealth: '',
        relationship: '',
        health: '',
        generatedAt: new Date(),
      };
    } else {
      // 完整分析模式
      aiAnalysis = await generateAIEnhancedAnalysis(baziResult);
    }

    // 5. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        baziResult,
        aiAnalysis,
        isQuickAnalysis,
        userId: authenticatedUserId,
      },
    });
  } catch (error) {
    console.error('AI增强分析失败:', error);

    // 区分不同类型的错误
    if (error instanceof z.ZodError) {
      return errorResponse('输入数据格式错误');
    }

    if (error instanceof Error) {
      if (error.message.includes('API')) {
        return errorResponse('AI服务暂时不可用，请稍后重试', 503);
      }
      return errorResponse(error.message, 500);
    }

    return errorResponse('生成AI分析时发生未知错误', 500);
  }
}

/**
 * GET: 检查AI服务状态
 */
export async function GET() {
  try {
    // 检查必要的环境变量
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;

    return NextResponse.json({
      success: true,
      data: {
        available: hasOpenAIKey,
        message: hasOpenAIKey
          ? 'AI增强分析服务可用'
          : 'AI服务未配置，请设置 OPENAI_API_KEY',
      },
    });
  } catch (error) {
    return errorResponse('无法检查服务状态', 500);
  }
}
