import type { RemedyPlan } from '@/components/qiflow/xuankong/remedy-plan-selector';
import { generateRemedyPlans } from '@/lib/qiflow/xuankong/remedy-engine';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/xuankong/remedy-plans
 *
 * 化解方案生成接口
 * 根据诊断问题生成多级化解方案
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必需参数
    const { issue, palace, severity } = body;

    if (!issue || typeof issue !== 'string') {
      return NextResponse.json(
        { error: '缺少或无效的问题描述 (issue)' },
        { status: 400 }
      );
    }

    if (!palace || typeof palace !== 'string') {
      return NextResponse.json(
        { error: '缺少或无效的宫位 (palace)' },
        { status: 400 }
      );
    }

    // 构造Issue对象
    const issueObj = {
      type: 'star_combination' as const,
      severity: (severity || 'medium') as
        | 'low'
        | 'medium'
        | 'high'
        | 'critical',
      position: palace,
      description: issue,
      impact: `在${palace}宫位出现${issue}问题`,
    };

    // 生成化解方案
    const planResult = generateRemedyPlans({
      issues: [issueObj],
      budget: body.budget?.level || 'medium',
      urgency: severity || 'medium',
      preferences: body.context?.userPreferences,
    });

    // 转换为前端格式 - 简化版本
    // 由于RemedyEngine返回的是不同的结构，我们需要适配
    const remedyPlans: RemedyPlan[] = [
      {
        id: `remedy-${palace}`,
        level: 'basic',
        name: `化解${issue}`,
        description:
          planResult.immediate.map((p) => p.explanation).join(', ') ||
          '基础化解方案',
        targetArea: palace,
        expectedOutcome: {
          health: '改善健康运势',
          wealth: '提升财运',
          career: '事业顺利',
          relationship: '人际和谐',
        },
        items: [
          {
            id: `item-${palace}`,
            name: '基本化解物品',
            category: '摆件',
            description: '基础化解物品',
            placement: palace,
            quantity: 1,
            estimatedCost: '100元',
            priority: 'must',
          },
        ],
        steps: [
          {
            id: `step-${palace}-1`,
            order: 1,
            title: '清理区域',
            description: '清理相关区域，保持整洁',
            duration: '30分钟',
            difficulty: 'easy',
            tips: ['注意安全'],
          },
        ],
        timeline: {
          preparation: '1-2天',
          implementation: '1周',
          maintenance: '每月检查一次',
        },
        cost: {
          min: 50,
          max: 500,
          currency: '元',
        },
        difficulty: 'beginner',
        recommended: true,
        features: ['基础化解', '经济实用'],
      },
    ];

    // 生成对比数据（简化）
    const comparison = {
      cost: remedyPlans.map((p) => ({
        level: p.level,
        min: p.cost.min,
        max: p.cost.max,
        avg: Math.round((p.cost.min + p.cost.max) / 2),
      })),
      timeline: remedyPlans.map((p) => ({
        level: p.level,
        days: 7,
      })),
      effectiveness: remedyPlans.map((p) => ({
        level: p.level,
        score: 80,
      })),
    };

    return NextResponse.json({
      success: true,
      data: {
        plans: remedyPlans,
        comparison,
        meta: {
          issue,
          palace,
          severity,
          totalPlans: remedyPlans.length,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '6.0',
      },
    });
  } catch (error) {
    console.error('Remedy plans generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '化解方案生成失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/xuankong/remedy-plans
 *
 * 获取化解方案说明文档
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/xuankong/remedy-plans',
    method: 'POST',
    description: '生成玄空风水多级化解方案',
    parameters: {
      issue: {
        type: 'string',
        required: true,
        description: '需要化解的问题描述',
        example: '五黄煞气',
      },
      palace: {
        type: 'string',
        required: true,
        description: '受影响宫位',
        example: '中宫',
      },
      severity: {
        type: 'string',
        required: false,
        default: 'medium',
        enum: ['critical', 'high', 'medium', 'low'],
        description: '问题严重程度',
      },
      context: {
        type: 'object',
        required: false,
        description: '额外上下文信息',
        properties: {
          roomType: { type: 'string', description: '房间类型' },
          currentLayout: { type: 'string', description: '当前布局' },
          userPreferences: { type: 'object', description: '用户偏好' },
        },
      },
      budget: {
        type: 'object',
        required: false,
        description: '预算限制',
        properties: {
          min: { type: 'number', description: '最低预算' },
          max: { type: 'number', description: '最高预算' },
        },
      },
    },
    response: {
      plans: 'RemedyPlan[]',
      comparison: 'object',
      meta: 'object',
    },
    examples: {
      basic: {
        issue: '五黄煞气',
        palace: '中宫',
      },
      detailed: {
        issue: '二五交加',
        palace: '西北',
        severity: 'high',
        context: {
          roomType: '主卧室',
          currentLayout: '床位在西北角',
        },
        budget: {
          min: 500,
          max: 5000,
        },
      },
    },
  });
}
