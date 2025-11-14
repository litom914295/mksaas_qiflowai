/**
 * AI质量审核系统
 *
 * 功能: 检查报告质量、合规性、完整性
 * 目标: 审核成功率 > 98%
 */

import { checkAICompliance } from '@/lib/ai-compliance';
import type { SynthesisOutput } from '../ai/synthesis-prompt';
import type { EssentialReportOutput } from '../reports/essential-report';

/**
 * 审核结果
 */
export interface AuditResult {
  // 是否通过审核
  passed: boolean;

  // 质量分数 (0-100)
  score: number;

  // 审核详情
  details: {
    completeness: CheckResult; // 完整性检查
    quality: CheckResult; // 质量检查
    compliance: CheckResult; // 合规性检查
  };

  // 问题列表
  issues: AuditIssue[];

  // 建议操作
  recommendations: string[];

  // 审核元数据
  metadata: {
    auditedAt: Date;
    auditorVersion: string;
    timeTakenMs: number;
  };
}

/**
 * 检查结果
 */
interface CheckResult {
  passed: boolean;
  score: number; // 0-100
  message: string;
  details?: string[];
}

/**
 * 审核问题
 */
interface AuditIssue {
  severity: 'critical' | 'warning' | 'info';
  category: 'completeness' | 'quality' | 'compliance';
  message: string;
  location?: string; // 问题位置（如 "主题1: 事业财运"）
  suggestion?: string; // 修复建议
}

/**
 * 合规规则库
 */
const COMPLIANCE_RULES = {
  // 禁用词汇（强制）
  bannedWords: [
    '必定',
    '一定会',
    '注定',
    '百分百',
    '绝对',
    '灾难',
    '大凶',
    '血光',
    '破财',
    '凶死',
    '横死',
    '牢狱',
    '离婚',
    '克夫',
    '克妻',
    '绝症',
    '癌症',
    '死亡',
    '自杀',
    '谋杀',
  ],

  // 需要替换的词汇
  sensitiveWords: {
    发财: '财运提升',
    破产: '财务压力',
    升官: '事业发展',
    官非: '法律纠纷',
    小人: '人际挑战',
    孤独终老: '独立生活',
  },

  // 必须包含的免责声明关键词
  disclaimerKeywords: ['仅供参考', '不构成专业建议', '传统文化'],
};

/**
 * 质量标准
 */
const QUALITY_STANDARDS = {
  // 最小内容长度（字符）
  minContentLength: {
    story: 200, // 故事化解读
    synthesis: 100, // 综合分析
    recommendations: 3, // 建议数量
  },

  // 最大内容长度（字符）
  maxContentLength: {
    story: 800,
    synthesis: 300,
  },

  // 必需元素
  requiredElements: {
    themes: 3, // 至少3个主题
    synthesis: true, // 人宅合一分析（付费版）
  },
};

/**
 * 主审核函数
 */
export async function auditReport(
  report: EssentialReportOutput,
  options: {
    isPremium?: boolean; // 是否为付费版
    strictMode?: boolean; // 严格模式
  } = {}
): Promise<AuditResult> {
  const startTime = Date.now();
  const issues: AuditIssue[] = [];

  console.log('[Auditor] 开始报告审核...');

  // 1. 完整性检查
  const completenessCheck = checkCompleteness(report, options, issues);

  // 2. 质量检查
  const qualityCheck = checkQuality(report, options, issues);

  // 3. 合规性检查
  const complianceCheck = checkCompliance(report, options, issues);

  // 计算总分
  const totalScore = Math.round(
    completenessCheck.score * 0.3 +
      qualityCheck.score * 0.4 +
      complianceCheck.score * 0.3
  );

  // 判断是否通过
  const passed = options.strictMode
    ? totalScore >= 90 &&
      issues.filter((i) => i.severity === 'critical').length === 0
    : totalScore >= 70 &&
      issues.filter((i) => i.severity === 'critical').length === 0;

  // 生成建议
  const recommendations = generateRecommendations(issues);

  const timeTaken = Date.now() - startTime;

  console.log(
    `[Auditor] 审核完成 - ${passed ? '通过' : '未通过'} (分数: ${totalScore}/100, 耗时: ${timeTaken}ms)`
  );

  return {
    passed,
    score: totalScore,
    details: {
      completeness: completenessCheck,
      quality: qualityCheck,
      compliance: complianceCheck,
    },
    issues: issues.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }),
    recommendations,
    metadata: {
      auditedAt: new Date(),
      auditorVersion: '1.0.0',
      timeTakenMs: timeTaken,
    },
  };
}

/**
 * 完整性检查
 */
function checkCompleteness(
  report: EssentialReportOutput,
  options: { isPremium?: boolean },
  issues: AuditIssue[]
): CheckResult {
  let score = 100;
  const details: string[] = [];

  // 检查主题数量
  if (report.themes.length < QUALITY_STANDARDS.requiredElements.themes) {
    score -= 30;
    issues.push({
      severity: 'critical',
      category: 'completeness',
      message: `主题数量不足: ${report.themes.length} < ${QUALITY_STANDARDS.requiredElements.themes}`,
      suggestion: '确保生成至少3个主题',
    });
  } else {
    details.push(`✓ 主题数量: ${report.themes.length}`);
  }

  // 检查每个主题的完整性
  report.themes.forEach((theme, index) => {
    if (!theme.story || theme.story.length === 0) {
      score -= 15;
      issues.push({
        severity: 'critical',
        category: 'completeness',
        message: `主题${index + 1}缺少故事化解读`,
        location: `主题${index + 1}: ${theme.title}`,
        suggestion: '调用AI生成故事化内容',
      });
    }

    if (!theme.synthesis || theme.synthesis.length === 0) {
      score -= 10;
      issues.push({
        severity: 'warning',
        category: 'completeness',
        message: `主题${index + 1}缺少综合分析`,
        location: `主题${index + 1}: ${theme.title}`,
      });
    }

    if (
      !theme.recommendations ||
      theme.recommendations.length <
        QUALITY_STANDARDS.minContentLength.recommendations
    ) {
      score -= 10;
      issues.push({
        severity: 'warning',
        category: 'completeness',
        message: `主题${index + 1}建议数量不足`,
        location: `主题${index + 1}: ${theme.title}`,
        suggestion: `至少提供${QUALITY_STANDARDS.minContentLength.recommendations}条建议`,
      });
    }
  });

  // 付费版检查人宅合一分析
  if (options.isPremium) {
    if (!report.synthesis) {
      score -= 40;
      issues.push({
        severity: 'critical',
        category: 'completeness',
        message: '付费版缺少人宅合一分析（核心卖点）',
        suggestion: '确保提供风水数据并调用generateSynthesisAnalysis()',
      });
    } else {
      // 检查人宅合一分析的完整性
      if (report.synthesis.superLuckySpots.length === 0) {
        score -= 10;
        issues.push({
          severity: 'warning',
          category: 'completeness',
          message: '人宅合一分析未找到超级吉位',
          suggestion: '检查八字和风水数据是否正确',
        });
      }

      if (report.synthesis.layoutAdvice.length < 3) {
        score -= 10;
        issues.push({
          severity: 'warning',
          category: 'completeness',
          message: '布局建议数量不足（< 3条）',
          suggestion: '确保AI生成3-5条建议',
        });
      }

      details.push('✓ 人宅合一分析完整');
    }
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    message: score >= 70 ? '完整性检查通过' : '内容不完整',
    details,
  };
}

/**
 * 质量检查
 */
function checkQuality(
  report: EssentialReportOutput,
  options: { strictMode?: boolean },
  issues: AuditIssue[]
): CheckResult {
  let score = 100;
  const details: string[] = [];

  // 检查每个主题的质量
  report.themes.forEach((theme, index) => {
    // 故事长度检查
    if (theme.story.length < QUALITY_STANDARDS.minContentLength.story) {
      score -= 10;
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: `主题${index + 1}故事内容过短 (${theme.story.length} < ${QUALITY_STANDARDS.minContentLength.story})`,
        location: `主题${index + 1}: ${theme.title}`,
        suggestion: '增加故事化描述，使内容更丰富',
      });
    } else if (theme.story.length > QUALITY_STANDARDS.maxContentLength.story) {
      score -= 5;
      issues.push({
        severity: 'info',
        category: 'quality',
        message: `主题${index + 1}故事内容过长 (${theme.story.length} > ${QUALITY_STANDARDS.maxContentLength.story})`,
        location: `主题${index + 1}: ${theme.title}`,
      });
    } else {
      details.push(`✓ 主题${index + 1}内容长度适中`);
    }

    // 检查是否有重复内容
    if (isContentRepetitive(theme.story)) {
      score -= 15;
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: `主题${index + 1}存在重复内容`,
        location: `主题${index + 1}: ${theme.title}`,
        suggestion: '检查AI生成逻辑，避免重复',
      });
    }

    // 检查是否有占位符
    if (hasPlaceholders(theme.story) || hasPlaceholders(theme.synthesis)) {
      score -= 20;
      issues.push({
        severity: 'critical',
        category: 'quality',
        message: `主题${index + 1}包含占位符文本`,
        location: `主题${index + 1}: ${theme.title}`,
        suggestion: '检查AI生成是否完成',
      });
    }
  });

  // 检查人宅合一分析质量
  if (report.synthesis) {
    if (report.synthesis.metadata.qualityScore < 60) {
      score -= 15;
      issues.push({
        severity: 'warning',
        category: 'quality',
        message: `人宅合一分析质量分数过低 (${report.synthesis.metadata.qualityScore}/100)`,
        suggestion: '检查输入数据质量或重新生成',
      });
    } else {
      details.push(
        `✓ 人宅合一分析质量良好 (${report.synthesis.metadata.qualityScore}/100)`
      );
    }
  }

  // 检查整体报告质量分数
  if (report.qualityScore < 70) {
    score -= 10;
    issues.push({
      severity: 'warning',
      category: 'quality',
      message: `整体报告质量分数偏低 (${report.qualityScore}/100)`,
    });
  }

  return {
    passed: score >= 70,
    score: Math.max(0, score),
    message: score >= 70 ? '质量检查通过' : '内容质量需要改进',
    details,
  };
}

/**
 * 合规性检查
 */
function checkCompliance(
  report: EssentialReportOutput,
  options: any,
  issues: AuditIssue[]
): CheckResult {
  let score = 100;
  const details: string[] = [];

  // 收集所有文本内容
  const allContent: string[] = [];
  report.themes.forEach((theme) => {
    allContent.push(theme.story, theme.synthesis, ...theme.recommendations);
  });

  if (report.synthesis) {
    allContent.push(report.synthesis.summary);
    report.synthesis.superLuckySpots.forEach((spot) => {
      allContent.push(...spot.utilizationAdvice);
    });
    report.synthesis.layoutAdvice.forEach((advice) => {
      allContent.push(advice.title, advice.principle, ...advice.actions);
    });
  }

  const fullText = allContent.join('\n');

  // 检查禁用词汇
  let bannedWordCount = 0;
  COMPLIANCE_RULES.bannedWords.forEach((word) => {
    if (fullText.includes(word)) {
      bannedWordCount++;
      score -= 20;
      issues.push({
        severity: 'critical',
        category: 'compliance',
        message: `包含禁用词汇: "${word}"`,
        suggestion: '移除或替换为合规表述',
      });
    }
  });

  if (bannedWordCount === 0) {
    details.push('✓ 无禁用词汇');
  }

  // 检查敏感词汇（建议替换）
  let sensitiveWordCount = 0;
  Object.keys(COMPLIANCE_RULES.sensitiveWords).forEach((word) => {
    if (fullText.includes(word)) {
      sensitiveWordCount++;
      score -= 5;
      issues.push({
        severity: 'info',
        category: 'compliance',
        message: `包含敏感词汇: "${word}"`,
        suggestion: `建议替换为: "${COMPLIANCE_RULES.sensitiveWords[word as keyof typeof COMPLIANCE_RULES.sensitiveWords]}"`,
      });
    }
  });

  if (sensitiveWordCount === 0) {
    details.push('✓ 无敏感词汇');
  }

  // 使用AI合规检查
  const aiComplianceCheck = checkAICompliance({
    userInput: '命理风水分析',
    aiOutput: fullText,
  });

  if (!aiComplianceCheck.compliant) {
    score -= 30;
    issues.push({
      severity: 'critical',
      category: 'compliance',
      message: 'AI合规检查未通过',
      suggestion: aiComplianceCheck.reason || '检查内容合规性',
    });
  } else {
    details.push('✓ AI合规检查通过');
  }

  return {
    passed: score >= 80,
    score: Math.max(0, score),
    message: score >= 80 ? '合规性检查通过' : '存在合规问题',
    details,
  };
}

/**
 * 生成修复建议
 */
function generateRecommendations(issues: AuditIssue[]): string[] {
  const recommendations: string[] = [];

  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const warningIssues = issues.filter((i) => i.severity === 'warning');

  if (criticalIssues.length > 0) {
    recommendations.push(`修复 ${criticalIssues.length} 个严重问题`);
    criticalIssues.forEach((issue) => {
      if (issue.suggestion) {
        recommendations.push(`- ${issue.suggestion}`);
      }
    });
  }

  if (warningIssues.length > 0 && criticalIssues.length === 0) {
    recommendations.push(`改进 ${warningIssues.length} 个警告项`);
  }

  if (issues.length === 0) {
    recommendations.push('报告质量优秀，无需修改');
  }

  return recommendations;
}

/**
 * 辅助函数：检查是否有重复内容
 */
function isContentRepetitive(text: string): boolean {
  const sentences = text
    .split(/[。！？\n]/)
    .filter((s) => s.trim().length > 10);
  const uniqueSentences = new Set(sentences);
  return uniqueSentences.size < sentences.length * 0.8; // 如果80%以上不重复，则认为正常
}

/**
 * 辅助函数：检查是否包含占位符
 */
function hasPlaceholders(text: string): boolean {
  const placeholders = [
    'TODO',
    'FIXME',
    '{{',
    '}}',
    '[待补充]',
    '[placeholder]',
    'undefined',
    'null',
  ];
  return placeholders.some((p) => text.includes(p));
}

/**
 * 快速审核（用于实时检查）
 */
export function quickAudit(report: EssentialReportOutput): {
  hasIssues: boolean;
  score: number;
} {
  let score = 100;
  let hasIssues = false;

  // 快速检查主题数量
  if (report.themes.length < 3) {
    hasIssues = true;
    score -= 30;
  }

  // 快速检查内容长度
  report.themes.forEach((theme) => {
    if (!theme.story || theme.story.length < 100) {
      hasIssues = true;
      score -= 10;
    }
  });

  return { hasIssues, score };
}
