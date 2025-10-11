/**
 * Unified 风水分析 API 路由
 *
 * 使用新的 unified 系统提供完整的风水分析服务
 * 包括玄空飞星、个性化分析、智能评分、预警等
 *
 * @route POST /api/qiflow/unified-analysis
 */

import { UnifiedFengshuiEngine, adaptToFrontend } from '@/lib/qiflow/unified';
import type {
  UnifiedAnalysisInput,
  UnifiedBaziInfo,
  UnifiedHouseInfo,
  UnifiedTimeInfo,
} from '@/lib/qiflow/unified';
import { NextResponse } from 'next/server';

// 请求体类型
interface AnalysisRequestBody {
  // 用户八字信息
  bazi: {
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    birthHour?: number;
    gender: 'male' | 'female';
    // 可选的额外信息
    occupation?: string;
    familyStatus?: 'single' | 'married' | 'divorced' | 'widowed';
    healthConcerns?: string[];
    careerGoals?: string[];
  };

  // 房屋信息
  house: {
    facing: number; // 朝向度数 0-360
    buildYear: number; // 建造年份
    location?: {
      lat: number;
      lon: number;
      address?: string;
    };
    floor?: number;
    // 房间布局
    rooms?: Array<{
      id: string;
      type:
        | 'bedroom'
        | 'living'
        | 'kitchen'
        | 'bathroom'
        | 'study'
        | 'dining'
        | 'entrance'
        | 'balcony';
      name: string;
      palace: number; // 1-9 宫位
      area?: number;
      isPrimary?: boolean;
    }>;
    // 环境信息（零正分析用）
    environment?: {
      waterPositions?: number[];
      mountainPositions?: number[];
      description?: string;
    };
  };

  // 时间信息
  time?: {
    currentYear?: number;
    currentMonth?: number;
    currentDay?: number;
  };

  // 家庭成员（可选）
  family?: Array<{
    birthYear: number;
    birthMonth: number;
    birthDay: number;
    gender: 'male' | 'female';
    relation?: string;
  }>;

  // 分析选项
  options?: {
    depth?: 'basic' | 'standard' | 'comprehensive' | 'expert';
    includeLiunian?: boolean;
    includePersonalization?: boolean;
    includeTigua?: boolean;
    includeLingzheng?: boolean;
    includeChengmenjue?: boolean;
    includeScoring?: boolean;
    includeWarnings?: boolean;
  };
}

// 响应类型
interface AnalysisResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    analyzedAt: string;
    version: string;
    computationTime: number;
    cacheHit?: boolean;
  };
}

/**
 * POST 处理器 - 执行风水分析
 */
export async function POST(
  request: Request
): Promise<NextResponse<AnalysisResponse>> {
  const startTime = Date.now();

  try {
    // 1. 解析请求体
    const body: AnalysisRequestBody = await request.json();

    // 2. 验证必需字段
    if (!body.bazi || !body.house) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少必需字段：bazi 和 house',
        },
        { status: 400 }
      );
    }

    // 3. 构建 unified 输入
    const currentDate = new Date();
    const input: UnifiedAnalysisInput = {
      // 八字信息
      bazi: {
        birthYear: body.bazi.birthYear,
        birthMonth: body.bazi.birthMonth,
        birthDay: body.bazi.birthDay,
        birthHour: body.bazi.birthHour,
        gender: body.bazi.gender,
        occupation: body.bazi.occupation,
        familyStatus: body.bazi.familyStatus,
        healthConcerns: body.bazi.healthConcerns,
        careerGoals: body.bazi.careerGoals,
      } as UnifiedBaziInfo,

      // 房屋信息
      house: {
        facing: body.house.facing,
        buildYear: body.house.buildYear,
        location: body.house.location,
        floor: body.house.floor,
        layout: body.house.rooms,
        environment: body.house.environment,
      } as UnifiedHouseInfo,

      // 时间信息
      time: {
        currentYear: body.time?.currentYear || currentDate.getFullYear(),
        currentMonth: body.time?.currentMonth || currentDate.getMonth() + 1,
        currentDay: body.time?.currentDay || currentDate.getDate(),
      } as UnifiedTimeInfo,

      // 家庭成员
      family: body.family?.map((member) => ({
        birthYear: member.birthYear,
        birthMonth: member.birthMonth,
        birthDay: member.birthDay,
        gender: member.gender,
      })) as UnifiedBaziInfo[] | undefined,

      // 分析选项
      options: {
        depth: body.options?.depth || 'comprehensive',
        includeLiunian: body.options?.includeLiunian ?? true,
        includePersonalization: body.options?.includePersonalization ?? true,
        includeTigua: body.options?.includeTigua ?? false,
        includeLingzheng: body.options?.includeLingzheng ?? false,
        includeChengmenjue: body.options?.includeChengmenjue ?? false,
        includeScoring: body.options?.includeScoring ?? true,
        includeWarnings: body.options?.includeWarnings ?? true,
      },
    };

    // 4. 执行分析（使用缓存）
    const engine = new UnifiedFengshuiEngine();
    const unifiedResult = await engine.analyze(input);

    // 5. 适配为前端格式
    const frontendResult = adaptToFrontend(unifiedResult);

    // 6. 计算总耗时
    const totalTime = Date.now() - startTime;

    // 7. 返回成功响应
    return NextResponse.json({
      success: true,
      data: frontendResult,
      metadata: {
        analyzedAt: unifiedResult.metadata.analyzedAt.toISOString(),
        version: unifiedResult.metadata.version,
        computationTime: unifiedResult.metadata.computationTime,
        cacheHit: totalTime < 50, // 如果总耗时小于50ms，很可能是缓存命中
      },
    });
  } catch (error) {
    console.error('Unified analysis failed:', error);

    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '分析失败，请稍后重试',
        metadata: {
          analyzedAt: new Date().toISOString(),
          version: '1.0.0',
          computationTime: Date.now() - startTime,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET 处理器 - 返回 API 信息
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Unified Fengshui Analysis API',
    version: '1.0.0',
    description: '统一风水分析接口，整合玄空飞星和个性化分析',
    endpoints: {
      POST: {
        path: '/api/qiflow/unified-analysis',
        description: '执行完整的风水分析',
        requiredFields: ['bazi', 'house'],
        optionalFields: ['time', 'family', 'options'],
      },
    },
    features: [
      '玄空飞星基础分析',
      '流年运势分析',
      '个性化风水建议',
      '智能评分系统',
      '智能预警系统',
      '关键位置识别',
      '房间布局建议',
      '行动计划生成',
      '月运预测',
    ],
    caching: {
      enabled: true,
      ttl: '5分钟',
      description: '相同输入会自动使用缓存结果，提升响应速度',
    },
  });
}
