/**
 * 统一风水分析引擎
 *
 * 整合 xuankong 系统和 fengshui 系统，提供统一的分析接口
 *
 * 核心思路：
 * 1. 使用 xuankong 系统的专业飞星算法作为底层
 * 2. 使用 fengshui 系统的评分和预警作为增强
 * 3. 提供统一的输入输出接口
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

import { ScoreCalculator } from '../fengshui/score-calculator';
import { WarningSystem } from '../fengshui/warning-system';
import { getGlobalMonitor } from '../performance/monitor';
import { comprehensiveAnalysis } from '../xuankong/comprehensive-engine';
import {
  calculatePeriod,
  degreesToMountain,
  getPalaceName,
  toFengshuiInput,
  toXuankongAnalysisOptions,
} from './adapters';
import { getGlobalCache } from './cache';
import type {
  UnifiedAnalysisInput,
  UnifiedAnalysisOutput,
  UnifiedScoringResult,
  UnifiedWarning,
  UnifiedWarningResult,
} from './types';

/**
 * 统一风水分析引擎
 */
export class UnifiedFengshuiEngine {
  /**
   * 主分析入口
   *
   * @param input 统一分析输入
   * @param useCache 是否使用缓存，默认 true
   * @returns 统一分析输出
   */
  async analyze(
    input: UnifiedAnalysisInput,
    useCache = true
  ): Promise<UnifiedAnalysisOutput> {
    const monitor = getGlobalMonitor();
    monitor.start('unified-analysis-total');

    // 尝试从缓存获取
    if (useCache) {
      monitor.start('cache-lookup');
      const cache = getGlobalCache();
      const cached = cache.get(input);
      monitor.end('cache-lookup');

      if (cached) {
        monitor.recordCacheHit();
        monitor.end('unified-analysis-total');
        return cached;
      }
      monitor.recordCacheMiss();
    }

    const startTime = Date.now();

    console.log('[统一引擎] 开始分析...', {
      facing: input.house.facing,
      buildYear: input.house.buildYear,
      enableScoring: input.options?.includeScoring ?? true,
      enableWarnings: input.options?.includeWarnings ?? true,
    });

    // 1. 调用 xuankong 系统做飞星计算和格局分析
    monitor.start('xuankong-analysis');
    const xuankongOptions = toXuankongAnalysisOptions(input);
    const xuankongResult = await comprehensiveAnalysis(xuankongOptions);
    monitor.end('xuankong-analysis');

    const { basicAnalysis, enhancedPlate } = xuankongResult;
    const period = basicAnalysis.period;
    const facingMountain = degreesToMountain(input.house.facing);

    console.log('[统一引擎] xuankong 分析完成', {
      period,
      facingMountain,
      geju: basicAnalysis.geju?.types,
    });

    // 2. 使用 fengshui 系统做评分分析（如果启用）
    let scoring: UnifiedScoringResult | undefined;
    if (input.options?.includeScoring !== false) {
      monitor.start('scoring-calculation');
      try {
        const fengshuiInput = toFengshuiInput(input);
        const scoreResult = await ScoreCalculator.calculate(fengshuiInput);

        scoring = {
          overall: scoreResult.overall,
          level: scoreResult.level,
          dimensions: scoreResult.details.map((detail) => ({
            name: detail.dimension,
            score: detail.score,
            weight: detail.weight,
            reasons: detail.reasons,
            suggestions: detail.suggestions,
          })),
          summary: scoreResult.summary,
        };

        console.log('[统一引擎] 评分分析完成', {
          overall: scoring.overall,
          level: scoring.level,
        });
      } catch (error) {
        console.error('[统一引擎] 评分分析失败', error);
      } finally {
        monitor.end('scoring-calculation');
      }
    }

    // 3. 使用 fengshui 系统做预警分析（如果启用）
    let warnings: UnifiedWarningResult | undefined;
    if (input.options?.includeWarnings !== false) {
      monitor.start('warning-detection');
      try {
        const fengshuiInput = toFengshuiInput(input);
        const warningList = await WarningSystem.identifyIssues(fengshuiInput);

        const unifiedWarnings: UnifiedWarning[] = warningList.map((issue) => ({
          id: issue.id,
          severity: issue.severity,
          urgency: issue.urgency,
          title: issue.title,
          description: issue.description,
          location: issue.location,
          impact: issue.impact,
          consequences: issue.consequences,
          recommendations: [], // 可以从 xuankong 的 smartRecommendations 中提取
        }));

        const urgentCount = unifiedWarnings.filter(
          (w) => w.urgency >= 4
        ).length;
        const criticalCount = unifiedWarnings.filter(
          (w) => w.severity === 'critical'
        ).length;

        warnings = {
          warnings: unifiedWarnings,
          urgentCount,
          criticalCount,
          summary: `发现 ${unifiedWarnings.length} 个问题，其中 ${criticalCount} 个严重问题，${urgentCount} 个紧急问题`,
        };

        console.log('[统一引擎] 预警分析完成', {
          total: unifiedWarnings.length,
          critical: criticalCount,
          urgent: urgentCount,
        });
      } catch (error) {
        console.error('[统一引擎] 预警分析失败', error);
      } finally {
        monitor.end('warning-detection');
      }
    }

    // 4. 从 xuankong 结果中提取关键位置（如果有）
    // TODO: 后续可以扩展

    // 5. 从 xuankong 结果中提取房间建议
    // TODO: 后续可以扩展

    // 6. 从 xuankong 结果中提取月运预测
    // TODO: 后续可以扩展

    // 7. 从 xuankong 智能推荐中生成行动计划
    const actionPlan =
      xuankongResult.smartRecommendations?.urgent?.map((rec, index) => ({
        id: `action-${index}`,
        priority: 5 as const,
        title: rec.title || '紧急处理',
        description: rec.description || '',
        category: 'urgent' as const,
        steps: rec.steps || [],
        expectedEffect: rec.expectedEffect || '改善风水状况',
      })) || [];

    // 8. 生成综合评估
    const assessment = this.generateAssessment(
      xuankongResult,
      scoring,
      warnings
    );

    // 9. 组装最终输出
    const computationTime = Date.now() - startTime;

    // 调试日志：检查 xuankongResult 中的数据
    console.log('[统一引擎] xuankongResult 分析数据:', {
      hasLiunianAnalysis: !!xuankongResult.liunianAnalysis,
      hasPersonalizedAnalysis: !!xuankongResult.personalizedAnalysis,
      hasTiguaAnalysis: !!xuankongResult.tiguaAnalysis,
      hasLingzhengAnalysis: !!xuankongResult.lingzhengAnalysis,
      hasChengmenjueAnalysis: !!xuankongResult.chengmenjueAnalysis,
      basicAnalysisGeju: basicAnalysis.geju,
    });

    // 将高级分析添加到 geju 中，以便 frontend-adapter 可以访问
    const enrichedGeju = {
      ...basicAnalysis.geju,
      tiguaAnalysis: xuankongResult.tiguaAnalysis,
      lingzhengAnalysis: xuankongResult.lingzhengAnalysis,
      chengmenjueAnalysis: xuankongResult.chengmenjueAnalysis,
    };

    const output: UnifiedAnalysisOutput = {
      xuankong: {
        period,
        facing: facingMountain,
        plate: basicAnalysis.plates.period,
        geju: enrichedGeju, // 使用增强的 geju
        evaluation: basicAnalysis.evaluation,
      },
      scoring,
      warnings,
      keyPositions: undefined, // TODO: 后续实现
      roomAdvice: undefined, // TODO: 后续实现
      // 从 xuankongResult 中获取流年分析
      monthlyForecast: xuankongResult.liunianAnalysis?.yearlyTrends,
      actionPlan,
      personalized: xuankongResult.personalizedAnalysis,
      assessment,
      metadata: {
        analyzedAt: new Date(),
        version: '1.0.0',
        depth: input.options?.depth || 'comprehensive',
        computationTime,
      },
    };

    console.log('[统一引擎] 最终输出数据:', {
      hasMonthlyForecast: !!output.monthlyForecast,
      hasPersonalized: !!output.personalized,
      hasGejuInXuankong: !!output.xuankong.geju,
    });

    console.log('[统一引擎] 分析完成', {
      computationTime: `${computationTime}ms`,
      overallScore: assessment.overallScore,
      rating: assessment.rating,
    });

    // 保存到缓存
    if (useCache) {
      monitor.start('cache-store');
      const cache = getGlobalCache();
      cache.set(input, output);
      monitor.end('cache-store');
    }

    // 结束总计时
    monitor.end('unified-analysis-total');

    // 打印性能报告（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      const report = monitor.generateReport();
      console.log('\n[性能监控]', report.summary);
      if (report.bottlenecks.length > 0) {
        console.log(
          '[性能监控] 发现瓶颈:',
          report.bottlenecks.map((b) => `${b.name}: ${b.duration}ms`).join(', ')
        );
      }
    }

    return output;
  }

  /**
   * 生成综合评估
   */
  private generateAssessment(
    xuankongResult: any,
    scoring: UnifiedScoringResult | undefined,
    warnings: UnifiedWarningResult | undefined
  ) {
    // 基于 xuankong 的评估分数
    const xuankongScore = xuankongResult.overallAssessment?.score || 70;

    // 基于 fengshui 的评分
    const fengshuiScore = scoring?.overall || 70;

    // 综合评分（两者加权平均）
    const overallScore = Math.round(xuankongScore * 0.5 + fengshuiScore * 0.5);

    // 确定等级
    let rating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    if (overallScore >= 85) rating = 'excellent';
    else if (overallScore >= 70) rating = 'good';
    else if (overallScore >= 55) rating = 'fair';
    else if (overallScore >= 40) rating = 'poor';
    else rating = 'critical';

    // 收集优势
    const strengths: string[] = [];
    if (xuankongResult.basicAnalysis?.geju?.isFavorable) {
      strengths.push('格局吉利');
    }
    if (scoring && scoring.overall >= 70) {
      strengths.push('整体风水良好');
    }
    strengths.push(...(xuankongResult.overallAssessment?.strengths || []));

    // 收集劣势
    const weaknesses: string[] = [];
    if (warnings && warnings.criticalCount > 0) {
      weaknesses.push(`存在 ${warnings.criticalCount} 个严重问题`);
    }
    if (scoring && scoring.overall < 60) {
      weaknesses.push('整体评分偏低');
    }
    weaknesses.push(...(xuankongResult.overallAssessment?.weaknesses || []));

    // 优先处理事项
    const topPriorities: string[] = [];
    if (warnings && warnings.urgentCount > 0) {
      topPriorities.push('优先处理紧急预警问题');
    }
    topPriorities.push(
      ...(xuankongResult.overallAssessment?.topPriorities || [])
    );

    // 长期规划
    const longTermPlan: string[] = [];
    longTermPlan.push(
      ...(xuankongResult.overallAssessment?.longTermPlan || [])
    );
    if (scoring) {
      // 从评分建议中提取长期规划
      scoring.dimensions.forEach((dim) => {
        if (dim.score < 70) {
          longTermPlan.push(`改善 ${dim.name}（当前 ${dim.score}分）`);
        }
      });
    }

    return {
      overallScore,
      rating,
      strengths: strengths.slice(0, 5), // 最多5条
      weaknesses: weaknesses.slice(0, 5),
      topPriorities: topPriorities.slice(0, 3),
      longTermPlan: longTermPlan.slice(0, 5),
    };
  }

  /**
   * 快速分析（仅基础功能）
   *
   * @param input 统一分析输入
   * @returns 统一分析输出
   */
  async quickAnalyze(
    input: UnifiedAnalysisInput
  ): Promise<UnifiedAnalysisOutput> {
    const quickInput: UnifiedAnalysisInput = {
      ...input,
      options: {
        ...input.options,
        depth: 'basic',
        includeLiunian: false,
        includePersonalization: false,
        includeTigua: false,
        includeLingzheng: false,
        includeChengmenjue: false,
        includeScoring: false, // 快速模式不包含评分
        includeWarnings: false, // 快速模式不包含预警
      },
    };

    return this.analyze(quickInput);
  }

  /**
   * 专家分析（全功能）
   *
   * @param input 统一分析输入
   * @returns 统一分析输出
   */
  async expertAnalyze(
    input: UnifiedAnalysisInput
  ): Promise<UnifiedAnalysisOutput> {
    const expertInput: UnifiedAnalysisInput = {
      ...input,
      options: {
        ...input.options,
        depth: 'expert',
        includeLiunian: true,
        includePersonalization: true,
        includeTigua: true,
        includeLingzheng: true,
        includeChengmenjue: true,
        includeScoring: true,
        includeWarnings: true,
      },
    };

    return this.analyze(expertInput);
  }
}
