/**
 * v2.1用户反馈数据分析脚本
 * 
 * 功能：
 * 1. 读取用户反馈问卷数据（JSON格式）
 * 2. 计算各项指标的平均分和达标率
 * 3. 生成数据分析报告
 * 4. 识别改进优先级
 * 
 * 使用方法：
 * node analyze-feedback.js feedback-data.json
 */

const fs = require('fs');
const path = require('path');

// ===== 配置项 =====
const CONFIG = {
  targetMetrics: {
    actionExecutability: 4, // ≥4星
    timeWindowAccuracy: 4, // ≥4星
    fengshuiPracticality: 4, // ≥4星
    knowWhatToDo: 4, // ≥4分
    overallSatisfaction: 4, // ≥4星
    understandingFeeling: 4, // ≥4分
    hopeFeeling: 4, // ≥4分
    nps: 70, // NPS≥70
  },
  passRate: 0.9, // 90%用户达标
};

// ===== 数据结构示例 =====
const FEEDBACK_DATA_EXAMPLE = {
  testCases: [
    {
      caseId: 'case-001',
      caseName: '案例1：30岁男性，食神生财格，职业困境期',
      userName: '张伟',
      feedbackDate: '2025-01-15',
      responses: {
        overallSatisfaction: 5, // 1-5星
        actionExecutability: 5, // 1-5星
        actionPriorityReasonable: '非常合理',
        actionImpactBelievable: '比较可信',
        timeWindowAccuracy: 4, // 1-5星
        timeWindowConfidenceHelpful: '比较有帮助',
        timeWindowCoverageAdequate: '完全覆盖',
        fengshuiPracticality: 5, // 1-5星
        fengshuiItemReasonable: '非常合理',
        fengshuiCostAcceptable: '完全可接受',
        knowWhatToDo: 5, // 1-5分
        reportWorthPrice: '非常值，物超所值',
        estimatedPrice: 200,
        understandingFeeling: 5, // 1-5分
        hopeFeeling: 5, // 1-5分
        lifeThemeAgree: 5, // 1-5分
        attributionHelpful: '非常有帮助',
        hopeTimelineSpecific: '非常具体',
        nps: 10, // 0-10分
        willingToInterview: true,
        topLikes: ['行动清单非常具体', '时间窗口有依据', '风水建议实用'],
        topDislikes: ['无'],
        suggestions: ['希望增加月度跟踪服务'],
      },
      execution: {
        essentialCompleted: 2,
        essentialTotal: 2,
        recommendedCompleted: 3,
        recommendedTotal: 5,
        optionalCompleted: 1,
        optionalTotal: 8,
        waterTasksCompleted: 1,
        waterTasksTotal: 1,
        mountainTasksCompleted: 1,
        mountainTasksTotal: 1,
        startDate: '2025-01-16',
        estimatedCompletionDate: '2025-02-15',
        actualDaysSpent: 7,
      },
      followUp: {
        subjective: '感觉心态更积极了，行动更有方向',
        objective: '开始每天晨跑，调整了书桌位置，睡眠改善',
      },
    },
    // ... 更多案例
  ],
};

// ===== 主函数 =====
function analyzeFeedback(feedbackFilePath) {
  console.log('=== v2.1用户反馈数据分析 ===\n');

  // 1. 读取反馈数据
  const feedbackData = readFeedbackData(feedbackFilePath);
  if (!feedbackData) {
    console.error('❌ 无法读取反馈数据文件');
    return;
  }

  console.log(`📊 共收集 ${feedbackData.testCases.length} 份用户反馈\n`);

  // 2. 计算各项指标
  const metrics = calculateMetrics(feedbackData.testCases);

  // 3. 生成分析报告
  const report = generateReport(metrics, feedbackData.testCases);

  // 4. 输出报告
  console.log(report);

  // 5. 保存报告到文件
  const reportPath = path.join(path.dirname(feedbackFilePath), 'feedback-analysis-report.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n✅ 分析报告已保存到: ${reportPath}`);

  // 6. 生成JSON格式数据（用于进一步分析）
  const jsonReportPath = path.join(path.dirname(feedbackFilePath), 'feedback-analysis-data.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(metrics, null, 2), 'utf-8');
  console.log(`✅ JSON数据已保存到: ${jsonReportPath}\n`);
}

// ===== 辅助函数 =====

function readFeedbackData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件失败: ${error.message}`);
    return null;
  }
}

function calculateMetrics(testCases) {
  const metrics = {
    overallSatisfaction: { avg: 0, passRate: 0, distribution: {} },
    actionExecutability: { avg: 0, passRate: 0, distribution: {} },
    timeWindowAccuracy: { avg: 0, passRate: 0, distribution: {} },
    fengshuiPracticality: { avg: 0, passRate: 0, distribution: {} },
    knowWhatToDo: { avg: 0, passRate: 0, distribution: {} },
    understandingFeeling: { avg: 0, passRate: 0, distribution: {} },
    hopeFeeling: { avg: 0, passRate: 0, distribution: {} },
    nps: { avg: 0, distribution: {}, promoters: 0, passives: 0, detractors: 0 },
    execution: {
      essentialCompletionRate: 0,
      recommendedCompletionRate: 0,
      optionalCompletionRate: 0,
      avgDaysSpent: 0,
    },
  };

  const n = testCases.length;
  if (n === 0) return metrics;

  // 计算各项指标的平均值和达标率
  const scores = {
    overallSatisfaction: [],
    actionExecutability: [],
    timeWindowAccuracy: [],
    fengshuiPracticality: [],
    knowWhatToDo: [],
    understandingFeeling: [],
    hopeFeeling: [],
    nps: [],
  };

  let totalEssential = 0, completedEssential = 0;
  let totalRecommended = 0, completedRecommended = 0;
  let totalOptional = 0, completedOptional = 0;
  let totalDaysSpent = 0;

  testCases.forEach((testCase) => {
    const { responses, execution } = testCase;

    // 收集分数
    scores.overallSatisfaction.push(responses.overallSatisfaction);
    scores.actionExecutability.push(responses.actionExecutability);
    scores.timeWindowAccuracy.push(responses.timeWindowAccuracy);
    scores.fengshuiPracticality.push(responses.fengshuiPracticality);
    scores.knowWhatToDo.push(responses.knowWhatToDo);
    scores.understandingFeeling.push(responses.understandingFeeling);
    scores.hopeFeeling.push(responses.hopeFeeling);
    scores.nps.push(responses.nps);

    // 执行情况
    if (execution) {
      totalEssential += execution.essentialTotal;
      completedEssential += execution.essentialCompleted;
      totalRecommended += execution.recommendedTotal;
      completedRecommended += execution.recommendedCompleted;
      totalOptional += execution.optionalTotal;
      completedOptional += execution.optionalCompleted;
      totalDaysSpent += execution.actualDaysSpent || 0;
    }
  });

  // 计算平均值和达标率
  Object.keys(scores).forEach((key) => {
    const values = scores[key];
    const avg = values.reduce((sum, val) => sum + val, 0) / n;
    metrics[key].avg = Math.round(avg * 100) / 100; // 保留两位小数

    // 计算达标率（≥目标值）
    const target = CONFIG.targetMetrics[key];
    if (target) {
      const passCount = values.filter((val) => val >= target).length;
      metrics[key].passRate = Math.round((passCount / n) * 100);
    }

    // 分布统计
    values.forEach((val) => {
      metrics[key].distribution[val] = (metrics[key].distribution[val] || 0) + 1;
    });
  });

  // NPS特殊计算
  const npsValues = scores.nps;
  metrics.nps.promoters = npsValues.filter((val) => val >= 9).length;
  metrics.nps.passives = npsValues.filter((val) => val >= 7 && val < 9).length;
  metrics.nps.detractors = npsValues.filter((val) => val < 7).length;
  metrics.nps.avg = Math.round(((metrics.nps.promoters - metrics.nps.detractors) / n) * 100);

  // 执行情况
  metrics.execution.essentialCompletionRate = totalEssential > 0 
    ? Math.round((completedEssential / totalEssential) * 100) 
    : 0;
  metrics.execution.recommendedCompletionRate = totalRecommended > 0 
    ? Math.round((completedRecommended / totalRecommended) * 100) 
    : 0;
  metrics.execution.optionalCompletionRate = totalOptional > 0 
    ? Math.round((completedOptional / totalOptional) * 100) 
    : 0;
  metrics.execution.avgDaysSpent = Math.round(totalDaysSpent / n);

  return metrics;
}

function generateReport(metrics, testCases) {
  const timestamp = new Date().toISOString().split('T')[0];
  const n = testCases.length;

  let report = `# v2.1用户反馈数据分析报告\n\n`;
  report += `**生成日期**: ${timestamp}\n`;
  report += `**样本数量**: ${n}份\n`;
  report += `**目标达标率**: ≥90%用户达到目标分数\n\n`;
  report += `---\n\n`;

  // 一、核心指标达标情况
  report += `## 一、核心指标达标情况\n\n`;
  report += `| 指标 | 平均分 | 达标率 | 目标 | 状态 |\n`;
  report += `|------|--------|--------|------|------|\n`;

  const coreMetrics = [
    { key: 'actionExecutability', name: '行动清单可执行性', unit: '星' },
    { key: 'timeWindowAccuracy', name: '决策时间窗口准确性', unit: '星' },
    { key: 'fengshuiPracticality', name: '风水Checklist实用性', unit: '星' },
    { key: 'knowWhatToDo', name: '"我知道该干什么"', unit: '分' },
  ];

  coreMetrics.forEach(({ key, name, unit }) => {
    const metric = metrics[key];
    const target = CONFIG.targetMetrics[key];
    const status = metric.passRate >= 90 ? '✅ 达标' : '❌ 未达标';
    report += `| ${name} | ${metric.avg}${unit} | ${metric.passRate}% | ≥${target}${unit} | ${status} |\n`;
  });

  report += `\n`;

  // 二、整体满意度
  report += `## 二、整体满意度\n\n`;
  const overallMetric = metrics.overallSatisfaction;
  const overallStatus = overallMetric.passRate >= 90 ? '✅ 达标' : '❌ 未达标';
  report += `- **平均分**: ${overallMetric.avg}星\n`;
  report += `- **达标率**: ${overallMetric.passRate}% (≥4星)\n`;
  report += `- **状态**: ${overallStatus}\n\n`;

  // 三、用户推荐意愿（NPS）
  report += `## 三、用户推荐意愿（NPS）\n\n`;
  const npsMetric = metrics.nps;
  const npsStatus = npsMetric.avg >= 70 ? '✅ 达标' : '❌ 未达标';
  report += `- **NPS分数**: ${npsMetric.avg}\n`;
  report += `- **推荐者**: ${npsMetric.promoters}人 (${Math.round((npsMetric.promoters / n) * 100)}%)\n`;
  report += `- **被动者**: ${npsMetric.passives}人 (${Math.round((npsMetric.passives / n) * 100)}%)\n`;
  report += `- **贬损者**: ${npsMetric.detractors}人 (${Math.round((npsMetric.detractors / n) * 100)}%)\n`;
  report += `- **状态**: ${npsStatus} (目标≥70)\n\n`;

  // 四、执行情况
  report += `## 四、行动执行情况\n\n`;
  const execMetric = metrics.execution;
  report += `- **必做项完成率**: ${execMetric.essentialCompletionRate}%\n`;
  report += `- **推荐项完成率**: ${execMetric.recommendedCompletionRate}%\n`;
  report += `- **加分项完成率**: ${execMetric.optionalCompletionRate}%\n`;
  report += `- **平均执行天数**: ${execMetric.avgDaysSpent}天\n\n`;

  // 五、v2.0模块回顾
  report += `## 五、v2.0模块回顾\n\n`;
  report += `| 模块 | 平均分 | 达标率 |\n`;
  report += `|------|--------|--------|\n`;
  report += `| "我感觉被理解了" | ${metrics.understandingFeeling.avg}分 | ${metrics.understandingFeeling.passRate}% |\n`;
  report += `| "我对未来有信心" | ${metrics.hopeFeeling.avg}分 | ${metrics.hopeFeeling.passRate}% |\n\n`;

  // 六、改进建议优先级
  report += `## 六、改进建议优先级\n\n`;
  const improvements = identifyImprovements(metrics, testCases);
  report += improvements;

  // 七、用户反馈摘要
  report += `## 七、用户反馈摘要\n\n`;
  const feedbackSummary = summarizeFeedback(testCases);
  report += feedbackSummary;

  report += `---\n\n`;
  report += `**报告结束**\n`;

  return report;
}

function identifyImprovements(metrics, testCases) {
  let improvements = '';

  // 识别未达标的指标
  const unmetMetrics = [];
  Object.keys(CONFIG.targetMetrics).forEach((key) => {
    if (metrics[key] && metrics[key].passRate < 90) {
      unmetMetrics.push({
        name: key,
        passRate: metrics[key].passRate,
        avg: metrics[key].avg,
      });
    }
  });

  if (unmetMetrics.length === 0) {
    improvements += `✅ **所有核心指标均已达标！**\n\n`;
  } else {
    improvements += `⚠️ **以下指标未达标，需优先改进：**\n\n`;
    unmetMetrics.sort((a, b) => a.passRate - b.passRate); // 按达标率升序排列

    unmetMetrics.forEach((metric, index) => {
      improvements += `${index + 1}. **${metric.name}**: 达标率${metric.passRate}% (平均${metric.avg})\n`;
      improvements += `   - 建议: [根据用户反馈添加具体建议]\n`;
    });
  }

  improvements += `\n`;
  return improvements;
}

function summarizeFeedback(testCases) {
  let summary = '';

  // 收集所有喜欢和不满意的内容
  const allLikes = [];
  const allDislikes = [];
  const allSuggestions = [];

  testCases.forEach((testCase) => {
    if (testCase.responses.topLikes) {
      allLikes.push(...testCase.responses.topLikes);
    }
    if (testCase.responses.topDislikes) {
      allDislikes.push(...testCase.responses.topDislikes);
    }
    if (testCase.responses.suggestions) {
      allSuggestions.push(testCase.responses.suggestions);
    }
  });

  summary += `### 用户最喜欢的地方（高频词）\n\n`;
  const likeFreq = countFrequency(allLikes);
  Object.entries(likeFreq).slice(0, 5).forEach(([item, count]) => {
    summary += `- ${item} (${count}次提及)\n`;
  });

  summary += `\n### 用户最不满意的地方（高频词）\n\n`;
  const dislikeFreq = countFrequency(allDislikes);
  if (Object.keys(dislikeFreq).length === 0) {
    summary += `- (暂无)\n`;
  } else {
    Object.entries(dislikeFreq).slice(0, 5).forEach(([item, count]) => {
      summary += `- ${item} (${count}次提及)\n`;
    });
  }

  summary += `\n### 改进建议汇总\n\n`;
  allSuggestions.slice(0, 10).forEach((suggestion, index) => {
    summary += `${index + 1}. ${suggestion}\n`;
  });

  summary += `\n`;
  return summary;
}

function countFrequency(items) {
  const freq = {};
  items.forEach((item) => {
    if (item && item !== '无') {
      freq[item] = (freq[item] || 0) + 1;
    }
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
}

// ===== 执行 =====
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('使用方法: node analyze-feedback.js feedback-data.json');
    console.log('\n示例数据格式请参考脚本开头的 FEEDBACK_DATA_EXAMPLE');
    process.exit(1);
  }

  const feedbackFilePath = args[0];
  analyzeFeedback(feedbackFilePath);
}

module.exports = { analyzeFeedback, calculateMetrics };
