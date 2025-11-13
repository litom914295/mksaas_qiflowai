import { NextRequest, NextResponse } from 'next/server';
import { generateEssentialReport } from '@/lib/qiflow/reports/essential-report';
import { dualAudit } from '@/lib/qiflow/quality/dual-audit-system';
import { globalCostGuard } from '@/lib/qiflow/monitoring/cost-guard';
import { track } from '@/lib/qiflow/tracking/conversion-tracker';

/**
 * POST /api/reports/generate
 * 
 * 生成八字风水报告（基础版或精华版）
 * 
 * 集成功能：
 * 1. 成本检查（4层防护）
 * 2. 报告生成
 * 3. 质量审核（双审机制）
 * 4. 成本记录
 * 5. 转化追踪
 * 
 * @body {
 *   birthInfo: { date, time, location },
 *   houseInfo?: { facing, degree },  // 如果有风水数据，生成精华报告
 *   userInfo: { name, gender }
 * }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 0. 解析请求
    const input = await req.json();
    const userId = req.headers.get('x-user-id') || 'anonymous';
    const sessionId = req.headers.get('x-session-id') || `session_${Date.now()}`;
    
    const isPremium = Boolean(input.houseInfo);
    const reportType = isPremium ? 'essential' : 'basic';
    
    // 1. 成本检查（4层防护）
    const estimatedCost = isPremium ? 0.50 : 0.02;
    const costCheck = globalCostGuard.canExecute(estimatedCost, userId);
    
    if (!costCheck.allowed) {
      console.warn('[Report API] Cost limit reached:', costCheck.reason);
      
      return NextResponse.json(
        {
          error: 'cost_limit_exceeded',
          message: '当前成本已达上限，请稍后再试',
          details: costCheck.reason,
          suggestedStrategy: costCheck.suggestedStrategy,
        },
        { status: 429 }
      );
    }
    
    // 2. 生成报告
    console.log(`[Report API] Generating ${reportType} report for user ${userId}`);
    
    const report = await generateEssentialReport({
      userId,
      birthInfo: input.birthInfo,
      houseInfo: input.houseInfo || null,
      userInfo: input.userInfo,
    });
    
    const generationTime = Date.now() - startTime;
    
    // 3. 质量审核（双审机制）
    const audit = await dualAudit(report, {
      isPremium,
      strictMode: isPremium, // 精华报告使用严格模式
      aiAuditEnabled: isPremium, // 仅精华报告启用AI审核
    });
    
    if (audit.decision === 'reject') {
      // 审核拒绝，重新生成（最多重试1次）
      console.error('[Report API] Audit rejected:', audit.issues);
      
      // 这里应该实现重试逻辑，简化版直接返回错误
      return NextResponse.json(
        {
          error: 'quality_check_failed',
          message: '报告质量检查未通过，请稍后重试',
          audit: {
            decision: audit.decision,
            score: audit.overallScore,
            issues: audit.issues.slice(0, 3), // 只返回前3个问题
          },
        },
        { status: 500 }
      );
    }
    
    if (audit.decision === 'manual_review') {
      // 需要人工复核，但仍可返回报告
      console.warn('[Report API] Audit requires manual review:', audit.issues);
    }
    
    // 4. 记录成本
    const actualCost = report.metadata?.cost || estimatedCost;
    globalCostGuard.recordUsage(actualCost, userId);
    
    // 5. 转化追踪
    track.reportGenerated(reportType, {
      userId,
      sessionId,
      cost: actualCost,
      duration: generationTime / 1000,
      auditScore: audit.overallScore,
    });
    
    // 6. 返回成功响应
    return NextResponse.json({
      success: true,
      report: {
        id: report.reportId,
        type: reportType,
        content: report.sections,
        metadata: {
          generatedAt: report.generatedAt,
          generationTime,
          cost: actualCost,
        },
        audit: {
          decision: audit.decision,
          score: audit.overallScore,
          passed: audit.decision === 'approve',
        },
      },
    });
    
  } catch (error: any) {
    console.error('[Report API] Generation error:', error);
    
    // 追踪错误
    track.reportGenerationFailed({
      error: error.message,
      stack: error.stack?.slice(0, 200),
    });
    
    return NextResponse.json(
      {
        error: 'generation_failed',
        message: error.message || '生成报告时发生错误',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reports/generate
 * 
 * 获取报告生成状态和成本使用情况
 */
export async function GET() {
  const usage = globalCostGuard.getCurrentUsage();
  
  return NextResponse.json({
    status: 'operational',
    costUsage: {
      daily: {
        used: usage.daily.used,
        limit: usage.daily.limit,
        percentage: ((usage.daily.used / usage.daily.limit) * 100).toFixed(1) + '%',
      },
      hourly: {
        used: usage.hourly.used,
        limit: usage.hourly.limit,
        percentage: ((usage.hourly.used / usage.hourly.limit) * 100).toFixed(1) + '%',
      },
    },
    canGenerate: {
      basic: globalCostGuard.canExecute(0.02, 'anonymous').allowed,
      essential: globalCostGuard.canExecute(0.50, 'anonymous').allowed,
    },
  });
}
