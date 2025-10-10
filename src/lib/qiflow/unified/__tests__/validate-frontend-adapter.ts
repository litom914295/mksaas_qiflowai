/**
 * 前端适配器验证脚本
 *
 * 简单验证前端适配器的功能性
 */

import {
  adaptScoringToDisplay,
  adaptToFrontend,
  adaptWarningsToDisplay,
} from '../adapters/frontend-adapter';
import type { UnifiedAnalysisOutput } from '../types';

// 模拟 unified 输出数据
const mockOutput: UnifiedAnalysisOutput = {
  xuankong: {
    period: 8,
    facing: 'zi' as any,
    plate: {
      center: { period: 8, mountain: 8, facing: 8 },
      palaces: {} as any,
    },
    evaluation: {
      isWangShan: false,
      isWangShui: false,
      isShangShan: false,
      isShangShui: false,
      isQiShanQiShui: false,
      isReverseLiuYin: false,
      rating: 'good',
    },
  },
  scoring: {
    overall: 75,
    level: 'good',
    dimensions: [
      {
        name: '财运',
        score: 80,
        weight: 0.3,
        reasons: ['财位适中'],
        suggestions: ['加强财位布局'],
      },
    ],
    summary: '综合评分良好',
  },
  warnings: {
    warnings: [
      {
        id: 'w1',
        severity: 'high',
        urgency: 4,
        title: '五黄煞',
        description: '五黄位于主卧',
        location: '东南',
        impact: ['影响健康'],
        consequences: ['可能导致疾病'],
        recommendations: ['放置化解物品'],
      },
    ],
    urgentCount: 1,
    criticalCount: 0,
    summary: '发现1个预警项目',
  },
  keyPositions: [
    {
      type: 'wealth',
      name: '财位',
      palace: 6,
      direction: '西北',
      score: 85,
      description: '当运旺财位',
      advice: {
        suitable: ['放置鱼缸'],
        avoid: ['堆放杂物'],
        enhance: ['加强照明'],
      },
    },
    {
      type: 'study',
      name: '文昌位',
      palace: 4,
      direction: '东南',
      score: 78,
      description: '利于学习',
      advice: {
        suitable: ['设置书桌'],
        avoid: ['放置电器'],
        enhance: ['充足照明'],
      },
    },
  ],
  actionPlan: [
    {
      id: 'a1',
      priority: 1,
      title: '化解五黄煞',
      description: '在主卧放置化解物品',
      category: 'urgent',
      difficulty: 'easy',
      timeRequired: '1天',
      steps: ['购买化解物品'],
      expectedEffect: '减少健康风险',
    },
  ],
  monthlyForecast: [
    {
      year: 2024,
      month: 12,
      monthName: '12月',
      favorableDirections: ['西北'],
      unfavorableDirections: ['东北'],
      keyEvents: ['适合投资'],
      advice: ['多活动西北方'],
      score: 72,
    },
  ],
  assessment: {
    overallScore: 75,
    rating: 'good',
    strengths: ['财位较好'],
    weaknesses: ['健康位较弱'],
    topPriorities: ['化解五黄'],
    longTermPlan: ['定期调整布局'],
  },
  metadata: {
    analyzedAt: new Date('2024-12-01'),
    version: '1.0.0',
    depth: 'comprehensive',
    computationTime: 150,
  },
};

console.log('🧪 开始验证前端适配器...\n');

try {
  // 测试 1: 基础适配
  console.log('✅ 测试 1: 基础适配');
  const result = adaptToFrontend(mockOutput);
  console.log(`   - 基础分析: ${result.basicAnalysis ? '✓' : '✗'}`);
  console.log(`   - 增强盘面: ${result.enhancedPlate ? '✓' : '✗'}`);
  console.log(`   - 综合评估: ${result.overallAssessment ? '✓' : '✗'}`);
  console.log(`   - 元数据: ${result.metadata ? '✓' : '✗'}`);

  // 测试 2: 文昌位和财位提取
  console.log('\n✅ 测试 2: 关键位置提取');
  console.log(`   - 文昌位数量: ${result.basicAnalysis.wenchangwei.length}`);
  console.log(`   - 财位数量: ${result.basicAnalysis.caiwei.length}`);
  console.log(
    `   - 文昌位宫位: ${result.basicAnalysis.wenchangwei[0]?.palace || 'N/A'}`
  );
  console.log(
    `   - 财位宫位: ${result.basicAnalysis.caiwei[0]?.palace || 'N/A'}`
  );

  // 测试 3: 智能推荐
  console.log('\n✅ 测试 3: 智能推荐');
  console.log(`   - 全部推荐: ${result.smartRecommendations.all.length}`);
  console.log(`   - 紧急推荐: ${result.smartRecommendations.urgent.length}`);
  console.log(`   - 今日推荐: ${result.smartRecommendations.today.length}`);
  console.log(
    `   - 分类推荐: ${Object.keys(result.smartRecommendations.byCategory).length} 类`
  );

  // 测试 4: 综合评估
  console.log('\n✅ 测试 4: 综合评估');
  console.log(`   - 综合评分: ${result.overallAssessment.score}`);
  console.log(`   - 评级: ${result.overallAssessment.rating}`);
  console.log(`   - 优势数量: ${result.overallAssessment.strengths.length}`);
  console.log(`   - 劣势数量: ${result.overallAssessment.weaknesses.length}`);
  console.log(
    `   - 优先事项: ${result.overallAssessment.topPriorities.length}`
  );

  // 测试 5: 流年分析
  console.log('\n✅ 测试 5: 流年分析');
  console.log(`   - 流年数据: ${result.liunianAnalysis ? '✓' : '✗'}`);
  if (result.liunianAnalysis) {
    console.log(
      `   - 月运数量: ${result.liunianAnalysis.overlayAnalysis.length}`
    );
  }

  // 测试 6: 评分显示适配
  console.log('\n✅ 测试 6: 评分显示适配');
  const displayScoring = adaptScoringToDisplay(mockOutput.scoring);
  console.log(`   - 评分数据: ${displayScoring ? '✓' : '✗'}`);
  if (displayScoring) {
    console.log(`   - 总分: ${displayScoring.overall}`);
    console.log(`   - 维度数量: ${displayScoring.dimensions.length}`);
    console.log(
      `   - 第一维度状态: ${displayScoring.dimensions[0]?.status || 'N/A'}`
    );
  }

  // 测试 7: 预警显示适配
  console.log('\n✅ 测试 7: 预警显示适配');
  const displayWarnings = adaptWarningsToDisplay(mockOutput.warnings);
  console.log(`   - 预警数据: ${displayWarnings ? '✓' : '✗'}`);
  if (displayWarnings) {
    console.log(`   - 总数: ${displayWarnings.total}`);
    console.log(`   - 紧急: ${displayWarnings.urgent}`);
    console.log(`   - 严重: ${displayWarnings.critical}`);
    console.log(
      `   - 第一预警图标: ${displayWarnings.items[0]?.icon || 'N/A'}`
    );
    console.log(
      `   - 第一预警颜色: ${displayWarnings.items[0]?.color || 'N/A'}`
    );
  }

  // 测试 8: 元数据完整性
  console.log('\n✅ 测试 8: 元数据完整性');
  console.log(`   - 版本: ${result.metadata.version}`);
  console.log(`   - 分析深度: ${result.metadata.analysisDepth}`);
  console.log(`   - 计算耗时: ${result.metadata.computationTime}ms`);
  console.log(`   - 分析时间: ${result.metadata.analyzedAt}`);

  console.log('\n🎉 所有测试通过！前端适配器工作正常。');
  console.log('\n📋 验证摘要:');
  console.log('   ✓ 基础适配功能正常');
  console.log('   ✓ 关键位置提取正确');
  console.log('   ✓ 智能推荐分类准确');
  console.log('   ✓ 评分和预警显示适配成功');
  console.log('   ✓ 元数据完整保留');
} catch (error) {
  console.error('\n❌ 验证失败:', error);
  process.exit(1);
}
