/**
 * 双审机制 - AI审核 + 规则审核
 *
 * 确保报告质量的双重保障
 */

import { checkAICompliance } from '@/lib/ai-compliance';
import type { EssentialReportOutput } from '../reports/essential-report';
import { type AuditResult, auditReport } from './report-auditor';

/**
 * 双审结果
 */
export interface DualAuditResult {
  // 是否通过双审
  passed: boolean;

  // 规则审核结果
  ruleAudit: AuditResult;

  // AI审核结果
  aiAudit: {
    passed: boolean;
    confidence: number; // 0-1
    issues: string[];
  };

  // 最终决策
  decision: 'approve' | 'reject' | 'manual_review';
  reason: string;

  // 综合评分
  overallScore: number;

  // 问题列表
  issues: Array<{ severity: string; message: string }>;

  // 元数据
  metadata: {
    auditedAt: Date;
    timeTakenMs: number;
  };
}

/**
 * 执行双重审核
 */
export async function dualAudit(
  report: EssentialReportOutput,
  options: {
    isPremium?: boolean;
    strictMode?: boolean;
    aiAuditEnabled?: boolean;
  } = {}
): Promise<DualAuditResult> {
  const startTime = Date.now();

  console.log('[DualAudit] 开始双重审核...');

  // 1. 规则审核（快速）
  const ruleAudit = await auditReport(report, {
    isPremium: options.isPremium,
    strictMode: options.strictMode,
  });

  // 2. AI审核（可选，成本较高）
  let aiAudit = {
    passed: true,
    confidence: 1.0,
    issues: [] as string[],
  };

  if (options.aiAuditEnabled !== false) {
    aiAudit = await performAIAudit(report);
  }

  // 3. 决策逻辑
  const decision = makeDecision(ruleAudit, aiAudit, options);

  const timeTaken = Date.now() - startTime;

  console.log(`[DualAudit] 完成 - ${decision.decision} (耗时: ${timeTaken}ms)`);

  // 合并问题列表
  const allIssues = [
    ...ruleAudit.issues,
    ...aiAudit.issues.map(msg => ({ severity: 'medium', message: msg }))
  ];

  return {
    passed: decision.decision === 'approve',
    ruleAudit,
    aiAudit,
    decision: decision.decision,
    reason: decision.reason,
    overallScore: ruleAudit.score,
    issues: allIssues,
    metadata: {
      auditedAt: new Date(),
      timeTakenMs: timeTaken,
    },
  };
}

/**
 * AI审核（简化版，避免额外成本）
 */
async function performAIAudit(report: EssentialReportOutput): Promise<{
  passed: boolean;
  confidence: number;
  issues: string[];
}> {
  const issues: string[] = [];
  let confidence = 1.0;

  // 收集所有文本
  const allText = report.themes
    .map((t) => `${t.story} ${t.synthesis}`)
    .join('\n');

  // 使用现有的AI合规检查
  const complianceCheck = checkAICompliance({
    userInput: '报告审核',
    aiOutput: allText,
  });

  if (!complianceCheck.compliant) {
    issues.push(complianceCheck.reasons?.[0] || '内容不合规');
    confidence -= 0.3;
  }

  // 简单的质量检查
  if (allText.length < 500) {
    issues.push('内容过短');
    confidence -= 0.2;
  }

  return {
    passed: confidence >= 0.7,
    confidence: Math.max(0, confidence),
    issues,
  };
}

/**
 * 决策逻辑
 */
function makeDecision(
  ruleAudit: AuditResult,
  aiAudit: { passed: boolean; confidence: number },
  options: { strictMode?: boolean }
): { decision: 'approve' | 'reject' | 'manual_review'; reason: string } {
  // 严格模式：两者都必须通过
  if (options.strictMode) {
    if (ruleAudit.passed && aiAudit.passed) {
      return { decision: 'approve', reason: '双审通过（严格模式）' };
    }
    return { decision: 'reject', reason: '未通过严格模式双审' };
  }

  // 普通模式：规则审核为主，AI审核辅助
  if (ruleAudit.passed) {
    if (aiAudit.confidence >= 0.7) {
      return { decision: 'approve', reason: '双审通过' };
    }
    if (aiAudit.confidence >= 0.5) {
      return {
        decision: 'manual_review',
        reason: 'AI审核置信度偏低，建议人工复核',
      };
    }
  }

  // 有严重问题
  const criticalIssues = ruleAudit.issues.filter(
    (i) => i.severity === 'critical'
  );
  if (criticalIssues.length > 0) {
    return {
      decision: 'reject',
      reason: `存在${criticalIssues.length}个严重问题`,
    };
  }

  // 需要人工审核
  return { decision: 'manual_review', reason: '质量分数偏低，建议人工审核' };
}

/**
 * 快速双审（仅规则审核，节省成本）
 */
export async function quickDualAudit(
  report: EssentialReportOutput
): Promise<{ passed: boolean; reason: string }> {
  const ruleAudit = await auditReport(report, { strictMode: false });

  return {
    passed: ruleAudit.passed,
    reason: ruleAudit.recommendations[0] || '审核通过',
  };
}
