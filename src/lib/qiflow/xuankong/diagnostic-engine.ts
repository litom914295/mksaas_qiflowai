// 风水诊断引擎 - 简化版本

import type { XuankongPlate } from './plate-generator';

export interface DiagnosticInput {
  plate: XuankongPlate;
  roomLayout?: {
    [position: string]:
      | 'bedroom'
      | 'kitchen'
      | 'bathroom'
      | 'livingroom'
      | 'office'
      | 'empty';
  };
  timeFactors?: {
    moveInDate?: string;
    currentYear?: number;
  };
}

export interface DiagnosticResult {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  score: number; // 0-100
  issues: Issue[];
  recommendations: Recommendation[];
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface Issue {
  type: 'star_combination' | 'room_placement' | 'time_factor' | 'direction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  position: string;
  description: string;
  impact: string;
}

export interface Recommendation {
  type: 'placement' | 'color' | 'element' | 'timing' | 'layout';
  priority: 'low' | 'medium' | 'high';
  position: string;
  action: string;
  explanation: string;
  cost?: 'free' | 'low' | 'medium' | 'high';
}

// 导出诊断分析函数
export function analyzeXuankongDiagnosis(
  input: DiagnosticInput
): DiagnosticResult {
  return DiagnosticEngine.diagnose(input);
}

export class DiagnosticEngine {
  static diagnose(input: DiagnosticInput): DiagnosticResult {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];
    let totalScore = 100;

    // 分析飞星组合
    const starIssues = DiagnosticEngine.analyzeStarCombinations(input.plate);
    issues.push(...starIssues.issues);
    recommendations.push(...starIssues.recommendations);
    totalScore -= starIssues.penalty;

    // 分析房间布局
    if (input.roomLayout) {
      const layoutIssues = DiagnosticEngine.analyzeRoomLayout(
        input.plate,
        input.roomLayout
      );
      issues.push(...layoutIssues.issues);
      recommendations.push(...layoutIssues.recommendations);
      totalScore -= layoutIssues.penalty;
    }

    // 分析时间因素
    if (input.timeFactors) {
      const timeIssues = DiagnosticEngine.analyzeTimeFactors(
        input.plate,
        input.timeFactors
      );
      issues.push(...timeIssues.issues);
      recommendations.push(...timeIssues.recommendations);
      totalScore -= timeIssues.penalty;
    }

    const score = Math.max(0, Math.min(100, totalScore));
    const overall = DiagnosticEngine.calculateOverallRating(score, issues);
    const urgency = DiagnosticEngine.calculateUrgency(issues);

    return {
      overall,
      score,
      issues,
      recommendations,
      urgency,
    };
  }

  private static analyzeStarCombinations(plate: XuankongPlate): {
    issues: Issue[];
    recommendations: Recommendation[];
    penalty: number;
  } {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];
    let penalty = 0;

    Object.entries(plate.plate).forEach(([position, stars]) => {
      const { mountain, direction } = stars;

      // 检查五黄煞
      if (mountain === 5 || direction === 5) {
        issues.push({
          type: 'star_combination',
          severity: 'high',
          position,
          description: '五黄煞星到位',
          impact: '可能导致疾病、意外或财运不佳',
        });

        recommendations.push({
          type: 'element',
          priority: 'high',
          position,
          action: '放置金属饰品或铜钱',
          explanation: '金属能够化解土煞之气',
          cost: 'low',
        });

        penalty += 15;
      }

      // 检查双星到位（吉星）
      if (mountain === 8 && direction === 8) {
        recommendations.push({
          type: 'placement',
          priority: 'high',
          position,
          action: '设置重要功能区域',
          explanation: '此方位双星到位，最为吉利',
          cost: 'free',
        });
      }
    });

    return { issues, recommendations, penalty };
  }

  private static analyzeRoomLayout(
    plate: XuankongPlate,
    layout: { [position: string]: string }
  ): {
    issues: Issue[];
    recommendations: Recommendation[];
    penalty: number;
  } {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];
    let penalty = 0;

    Object.entries(layout).forEach(([position, roomType]) => {
      const stars = plate.plate[position];
      if (!stars) return;

      // 检查厨房位置
      if (roomType === 'kitchen') {
        if (stars.mountain === 5 || stars.direction === 5) {
          issues.push({
            type: 'room_placement',
            severity: 'high',
            position,
            description: '厨房位于五黄方位',
            impact: '火土相克，易生疾病',
          });
          penalty += 20;
        }
      }

      // 检查卧室位置
      if (roomType === 'bedroom') {
        if (stars.direction === 3 || stars.mountain === 3) {
          issues.push({
            type: 'room_placement',
            severity: 'medium',
            position,
            description: '卧室位于三碧方位',
            impact: '可能影响感情运势',
          });
          penalty += 10;
        }
      }
    });

    return { issues, recommendations, penalty };
  }

  private static analyzeTimeFactors(
    plate: XuankongPlate,
    timeFactors: { moveInDate?: string; currentYear?: number }
  ): {
    issues: Issue[];
    recommendations: Recommendation[];
    penalty: number;
  } {
    const issues: Issue[] = [];
    const recommendations: Recommendation[] = [];
    let penalty = 0;

    const currentYear = timeFactors.currentYear || new Date().getFullYear();

    // 简化的流年分析
    if (currentYear % 9 === 5) {
      // 五黄流年
      issues.push({
        type: 'time_factor',
        severity: 'medium',
        position: 'general',
        description: '流年五黄当值',
        impact: '整体运势可能受到影响',
      });

      recommendations.push({
        type: 'timing',
        priority: 'medium',
        position: 'general',
        action: '避免大规模装修或搬迁',
        explanation: '五黄流年宜静不宜动',
        cost: 'free',
      });

      penalty += 5;
    }

    return { issues, recommendations, penalty };
  }

  private static calculateOverallRating(
    score: number,
    issues: Issue[]
  ): DiagnosticResult['overall'] {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  private static calculateUrgency(
    issues: Issue[]
  ): DiagnosticResult['urgency'] {
    const criticalIssues = issues.filter((i) => i.severity === 'critical');
    const highIssues = issues.filter((i) => i.severity === 'high');

    if (criticalIssues.length > 0) return 'critical';
    if (highIssues.length > 2) return 'high';
    if (highIssues.length > 0) return 'medium';
    return 'low';
  }

  static generateDiagnosticReport(result: DiagnosticResult): string {
    const { overall, score, issues, recommendations, urgency } = result;

    return `
风水诊断报告
============

综合评分: ${score}/100 (${overall})
紧急程度: ${urgency}

主要问题:
${issues
  .map(
    (issue) =>
      `• ${issue.position}: ${issue.description} (${issue.severity}级)
    影响: ${issue.impact}`
  )
  .join('\n\n')}

改善建议:
${recommendations
  .map(
    (rec) =>
      `• ${rec.position}: ${rec.action} (${rec.priority}优先级)
    原因: ${rec.explanation}
    成本: ${rec.cost || '未知'}`
  )
  .join('\n\n')}

注：此为AI诊断结果，具体实施请咨询专业风水师。
`;
  }
}
