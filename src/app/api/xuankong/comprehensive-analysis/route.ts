import type { DiagnosticAlert } from '@/components/qiflow/xuankong/diagnostic-alert-card';
import type { RemedyPlan } from '@/components/qiflow/xuankong/remedy-plan-selector';
import { analyzeKeyPositions } from '@/lib/qiflow/fusion/key-positions';
import { analyzeXuankongDiagnosis } from '@/lib/qiflow/xuankong/diagnostic-engine';
import { generateXuankongPlate } from '@/lib/qiflow/xuankong/plate-generator';
import { generateRemedyPlans } from '@/lib/qiflow/xuankong/remedy-engine';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/xuankong/comprehensive-analysis
 *
 * 玄空风水综合分析接口
 * 整合飞星盘生成、诊断分析、化解方案、关键方位分析
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必需参数
    const { facing, buildYear } = body;

    if (!facing || typeof facing !== 'number') {
      return NextResponse.json(
        { error: '缺少或无效的朝向参数 (facing)' },
        { status: 400 }
      );
    }

    if (!buildYear || typeof buildYear !== 'number') {
      return NextResponse.json(
        { error: '缺少或无效的建造年份 (buildYear)' },
        { status: 400 }
      );
    }

    // 1. 生成飞星盘
    const plate = await generateXuankongPlate({
      facing,
      buildYear,
      location: body.location,
    });

    // 2. 执行诊断分析
    const diagnostics = analyzeXuankongDiagnosis({
      plate,
      roomLayout: body.roomLayout,
      timeFactors: body.timeFactors,
    });

    // 转换诊断为前端格式
    const alerts: DiagnosticAlert[] = diagnostics.issues.map(
      (issue, index) => ({
        id: `alert-${index}`,
        severity: issue.severity,
        title: issue.description,
        description: issue.impact,
        affectedArea: issue.position,
        issue: issue.type,
        impact: {
          health: issue.impact.includes('疑病') ? 'high' : 'low',
          wealth: issue.impact.includes('财') ? 'high' : 'low',
          career: issue.impact.includes('事业') ? 'high' : 'low',
          relationship: issue.impact.includes('感情') ? 'high' : 'low',
        },
        score: diagnostics.score,
        recommendations: diagnostics.recommendations.map((r) => r.explanation),
        urgency:
          issue.severity === 'critical'
            ? 'immediate'
            : issue.severity === 'high'
              ? 'soon'
              : 'planned',
      })
    );

    // 3. 为高危问题生成化解方案
    const criticalIssues = diagnostics.issues.filter(
      (issue) => issue.severity === 'critical' || issue.severity === 'high'
    );

    const remedyPlansData: Record<string, RemedyPlan[]> = {};

    for (const issue of criticalIssues) {
      const plans = generateRemedyPlans({
        issues: [issue],
        budget: body.budget,
        urgency: body.urgency,
        preferences: body.preferences,
      });

      remedyPlansData[issue.position] = [
        {
          id: `remedy-${issue.position}`,
          level: 'basic' as const,
          name: `化解${issue.description}`,
          description:
            plans.immediate.map((p) => p.explanation).join(', ') ||
            '基础化解方案',
          targetArea: issue.position,
          expectedOutcome: {
            health: '改善健康运势',
            wealth: '提升财运',
            career: '事业顺利',
            relationship: '人际和谐',
          },
          items: [
            {
              id: `item-${issue.position}`,
              name: '基本化解物品',
              category: '摆件' as const,
              description: '基础化解物品',
              placement: issue.position,
              quantity: 1,
              estimatedCost: '100元',
              priority: 'must' as const,
            },
          ],
          steps: [
            {
              id: `step-${issue.position}-1`,
              order: 1,
              title: '清理区域',
              description: '清理相关区域，保持整洁',
              duration: '30分钟',
              difficulty: 'easy' as const,
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
          difficulty: 'beginner' as const,
          recommended: true,
          features: ['基础化解', '经济实用'],
        },
      ];
    }

    // 4. 关键方位分析（如果提供了用户信息）
    let keyPositions = null;
    if (body.userProfile) {
      // 将十二地支转换为八方位
      const directionMap: Record<string, string> = {
        午: 'south',
        巳: 'southeast',
        辰: 'east',
        卢: 'northeast',
        子: 'north',
        亥: 'northwest',
        酉: 'west',
        申: 'southwest',
      };
      const mainDirection = directionMap[plate.direction] || 'south';
      keyPositions = analyzeKeyPositions(
        mainDirection,
        body.userProfile?.usage,
        body.userProfile?.objects
      );
    }

    // 5. 计算综合统计
    const stats = {
      diagnosis: {
        total: alerts.length,
        critical: alerts.filter((a) => a.severity === 'critical').length,
        high: alerts.filter((a) => a.severity === 'high').length,
        medium: alerts.filter((a) => a.severity === 'medium').length,
        low: alerts.filter((a) => a.severity === 'low').length,
        safe: alerts.filter((a) => a.severity === 'safe').length,
        avgScore: Math.round(
          alerts.reduce((sum, a) => sum + a.score, 0) / alerts.length
        ),
      },
      remedies: {
        totalIssues: criticalIssues.length,
        totalPlans: Object.values(remedyPlansData).flat().length,
        avgCostPerIssue: Math.round(
          Object.values(remedyPlansData)
            .flat()
            .reduce(
              (sum, plan) => sum + (plan.cost.min + plan.cost.max) / 2,
              0
            ) / Math.max(Object.values(remedyPlansData).flat().length, 1)
        ),
      },
      plate: {
        period: plate.period,
        facing: plate.facing,
        specialPatterns: plate.specialPatterns,
        palaceCount: Object.keys(plate.palaces).length,
      },
    };

    // 6. 生成建议优先级
    const priorities = [
      ...alerts
        .filter((a) => a.severity === 'critical')
        .map((a) => ({
          type: 'critical_issue',
          area: a.affectedArea,
          title: a.title,
          action: '立即处理',
          urgency: 'immediate' as const,
        })),
      ...alerts
        .filter((a) => a.severity === 'high' && a.score < 40)
        .map((a) => ({
          type: 'high_priority',
          area: a.affectedArea,
          title: a.title,
          action: '尽快处理',
          urgency: 'soon' as const,
        })),
    ];

    return NextResponse.json({
      success: true,
      data: {
        plate: {
          period: plate.period,
          facing: plate.facing,
          specialPatterns: plate.specialPatterns,
          palaces: plate.palaces,
        },
        diagnosis: {
          alerts,
          stats: stats.diagnosis,
        },
        remedies: {
          plans: remedyPlansData,
          stats: stats.remedies,
        },
        keyPositions,
        priorities,
        overallScore: stats.diagnosis.avgScore,
        recommendation: generateOverallRecommendation(stats.diagnosis.avgScore),
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '6.0',
        analysisType: 'comprehensive',
      },
    });
  } catch (error) {
    console.error('Comprehensive analysis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '综合分析失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * 根据综合评分生成总体建议
 */
function generateOverallRecommendation(score: number): string {
  if (score >= 80) {
    return '整体风水状况优秀,建议保持现有布局,定期维护即可。';
  }
  if (score >= 60) {
    return '整体风水状况良好,但存在部分需要改善的区域,建议优先处理中高风险问题。';
  }
  if (score >= 40) {
    return '风水状况一般,存在多处需要调整的地方,建议制定系统化的改善计划。';
  }
  if (score >= 20) {
    return '风水状况较差,存在较多高风险问题,强烈建议尽快实施化解方案。';
  }
  return '风水状况严重不佳,存在多处危险区域,建议立即采取紧急措施并考虑专业咨询。';
}

/**
 * GET /api/xuankong/comprehensive-analysis
 *
 * 获取综合分析说明文档
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/xuankong/comprehensive-analysis',
    method: 'POST',
    description: '玄空风水综合分析 - 一站式分析服务',
    features: [
      '飞星盘生成',
      '五级诊断分析',
      '多级化解方案',
      '关键方位评估',
      '优先级建议',
    ],
    parameters: {
      facing: {
        type: 'number',
        required: true,
        description: '房屋朝向角度 (0-360)',
        example: 180,
      },
      buildYear: {
        type: 'number',
        required: true,
        description: '建造年份',
        example: 2020,
      },
      location: {
        type: 'object',
        required: false,
        description: '地理位置',
        properties: {
          lat: { type: 'number', description: '纬度' },
          lng: { type: 'number', description: '经度' },
        },
      },
      userProfile: {
        type: 'object',
        required: false,
        description: '用户八字信息（用于关键方位分析）',
        properties: {
          bazi: { type: 'object', description: '八字信息' },
          priorities: { type: 'array', description: '关注重点' },
        },
      },
      context: {
        type: 'object',
        required: false,
        description: '额外上下文',
      },
      includeSafeAreas: {
        type: 'boolean',
        required: false,
        default: true,
        description: '是否包含安全区域',
      },
      severityThreshold: {
        type: 'string',
        required: false,
        default: 'low',
        enum: ['critical', 'high', 'medium', 'low'],
        description: '诊断严重程度阈值',
      },
    },
    response: {
      plate: 'object - 飞星盘数据',
      diagnosis: 'object - 诊断结果',
      remedies: 'object - 化解方案',
      keyPositions: 'object | null - 关键方位分析',
      priorities: 'array - 优先级建议',
      overallScore: 'number - 综合评分',
      recommendation: 'string - 总体建议',
    },
    examples: {
      basic: {
        facing: 180,
        buildYear: 2020,
      },
      withUser: {
        facing: 180,
        buildYear: 2020,
        location: {
          lat: 39.9042,
          lng: 116.4074,
        },
        userProfile: {
          bazi: {
            year: { stem: '甲', branch: '子' },
            month: { stem: '丙', branch: '寅' },
            day: { stem: '戊', branch: '午' },
            hour: { stem: '庚', branch: '申' },
          },
          priorities: ['wealth', 'health'],
        },
      },
    },
  });
}
