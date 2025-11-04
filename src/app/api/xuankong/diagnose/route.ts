import type { DiagnosticAlert } from '@/components/qiflow/xuankong/diagnostic-alert-card';
import { analyzeXuankongDiagnosis } from '@/lib/qiflow/xuankong/diagnostic-engine';
import { generateXuankongPlate } from '@/lib/qiflow/xuankong/plate-generator';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/xuankong/diagnose
 *
 * 玄空风水诊断接口
 * 生成五级诊断预警
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必需参数
    const { facing, buildYear, location } = body;

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

    // 生成飞星盘
    const plate = await generateXuankongPlate({
      facing,
      buildYear,
      location,
    });

    // 执行诊断分析
    const diagnostics = analyzeXuankongDiagnosis({
      plate,
      roomLayout: body.roomLayout,
      timeFactors: body.timeFactors,
    });

    // 转换为前端格式
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

    // 计算统计信息
    const stats = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      high: alerts.filter((a) => a.severity === 'high').length,
      medium: alerts.filter((a) => a.severity === 'medium').length,
      low: alerts.filter((a) => a.severity === 'low').length,
      safe: alerts.filter((a) => a.severity === 'safe').length,
      avgScore: Math.round(
        alerts.reduce((sum, a) => sum + a.score, 0) / alerts.length
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        stats,
        plate: {
          period: plate.period,
          facing: plate.facing,
          specialPatterns: plate.specialPatterns,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '6.0',
      },
    });
  } catch (error) {
    console.error('Xuankong diagnosis error:', error);

    return NextResponse.json(
      {
        success: false,
        error: '诊断分析失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/xuankong/diagnose
 *
 * 获取诊断说明文档
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/xuankong/diagnose',
    method: 'POST',
    description: '玄空风水五级诊断分析',
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
        description: '严重程度阈值',
      },
    },
    response: {
      alerts: 'DiagnosticAlert[]',
      stats: 'object',
      plate: 'object',
    },
  });
}
