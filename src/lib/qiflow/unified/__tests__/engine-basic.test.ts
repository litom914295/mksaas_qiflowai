/**
 * Unified 风水引擎基础测试
 *
 * 测试统一引擎的核心功能，不依赖数据库或外部服务
 */

import { UnifiedFengshuiEngine } from '../engine';
import type { UnifiedAnalysisInput } from '../types';

/**
 * 创建标准测试输入
 */
function createTestInput(): UnifiedAnalysisInput {
  return {
    bazi: {
      birthYear: 1990,
      birthMonth: 6,
      birthDay: 15,
      birthHour: 10,
      gender: 'male',
    },
    house: {
      facing: 180, // 坐北向南
      buildYear: 2005, // 八运
      floor: 5,
    },
    time: {
      currentYear: 2024,
      currentMonth: 10,
    },
    options: {
      depth: 'comprehensive',
      includeScoring: true,
      includeWarnings: true,
      includePersonalization: true,
    },
  };
}

/**
 * 基本功能测试
 */
async function testBasicAnalysis() {
  console.log('\n🧪 测试：基础分析功能');

  const input = createTestInput();
  console.log('输入参数：', {
    facing: input.house.facing,
    buildYear: input.house.buildYear,
    birthYear: input.bazi.birthYear,
  });

  try {
    const result = await UnifiedFengshuiEngine.analyze(input);

    // 验证基础结构
    console.log('✅ 分析完成，验证结果结构...');

    if (!result.xuankong) throw new Error('缺少 xuankong 结果');
    if (!result.assessment) throw new Error('缺少综合评估');
    if (!result.metadata) throw new Error('缺少元数据');

    console.log('✅ 结果结构验证通过');

    // 验证 xuankong 核心数据
    const { xuankong } = result;
    if (!xuankong.period) throw new Error('缺少运期');
    if (!xuankong.facing) throw new Error('缺少朝向');
    // 注意：plate 可能为 undefined，这是正常的

    console.log('✅ Xuankong 数据验证通过', {
      period: xuankong.period,
      facing: xuankong.facing,
      plateExists: !!xuankong.plate,
      palaceCount: xuankong.plate
        ? Object.keys(xuankong.plate.palaces || {}).length
        : 0,
    });

    // 验证评分系统（如果启用）
    if (result.scoring) {
      if (typeof result.scoring.overall !== 'number')
        throw new Error('评分格式错误');
      if (!result.scoring.level) throw new Error('缺少评分等级');
      console.log('✅ 评分系统验证通过', {
        overall: result.scoring.overall,
        level: result.scoring.level,
      });
    }

    // 验证预警系统（如果启用）
    if (result.warnings) {
      if (!Array.isArray(result.warnings.warnings))
        throw new Error('预警列表格式错误');
      console.log('✅ 预警系统验证通过', {
        count: result.warnings.warnings.length,
        critical: result.warnings.criticalCount,
        urgent: result.warnings.urgentCount,
      });
    }

    // 验证综合评估
    const { assessment } = result;
    if (typeof assessment.overallScore !== 'number')
      throw new Error('综合评分格式错误');
    if (!assessment.rating) throw new Error('缺少综合评级');
    if (!Array.isArray(assessment.strengths))
      throw new Error('优势列表格式错误');
    if (!Array.isArray(assessment.weaknesses))
      throw new Error('劣势列表格式错误');

    console.log('✅ 综合评估验证通过', {
      score: assessment.overallScore,
      rating: assessment.rating,
      strengths: assessment.strengths.length,
      weaknesses: assessment.weaknesses.length,
    });

    console.log('✅ 基础分析测试通过！');
    return result;
  } catch (error) {
    console.error('❌ 基础分析测试失败：', error);
    throw error;
  }
}

/**
 * 不同配置测试
 */
async function testDifferentConfigurations() {
  console.log('\n🧪 测试：不同配置');

  // 测试最小配置
  console.log('测试最小配置...');
  const minimalInput: UnifiedAnalysisInput = {
    bazi: {
      birthYear: 1985,
      birthMonth: 3,
      birthDay: 1,
      birthHour: 8,
      gender: 'female',
    },
    house: {
      facing: 45, // 坐西北向东南
      buildYear: 2000, // 七运
    },
    time: {
      currentYear: 2024,
      currentMonth: 10,
    },
    options: {
      depth: 'basic',
      includeScoring: false,
      includeWarnings: false,
      includePersonalization: false,
    },
  };

  const minimalResult = await UnifiedFengshuiEngine.analyze(minimalInput);
  if (minimalResult.scoring) throw new Error('不应该有评分结果');
  if (minimalResult.warnings) throw new Error('不应该有预警结果');
  console.log('✅ 最小配置测试通过');

  // 测试完整配置
  console.log('测试完整配置...');
  const fullInput = createTestInput();
  fullInput.house.layout = [
    { name: '客厅', position: 6, type: 'living_room', area: 30 }, // 乾宫
    { name: '主卧', position: 1, type: 'bedroom', area: 20, isPrimary: true }, // 坎宫
    { name: '次卧', position: 8, type: 'bedroom', area: 15 }, // 艮宫
  ];
  fullInput.house.environment = {
    waterPositions: [90, 180],
    mountainPositions: [270],
    description: '前有水景，后有山峦',
  };

  const fullResult = await UnifiedFengshuiEngine.analyze(fullInput);
  if (!fullResult.scoring) throw new Error('应该有评分结果');
  if (!fullResult.warnings) throw new Error('应该有预警结果');
  console.log('✅ 完整配置测试通过');

  console.log('✅ 不同配置测试完成！');
}

/**
 * 性能测试
 */
async function testPerformance() {
  console.log('\n🧪 测试：性能');

  const input = createTestInput();
  const iterations = 5;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await UnifiedFengshuiEngine.analyze(input);
    const duration = Date.now() - start;
    times.push(duration);
    console.log(`第 ${i + 1} 次: ${duration}ms`);
  }

  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const maxTime = Math.max(...times);
  const minTime = Math.min(...times);

  console.log('性能统计：', {
    平均: `${avgTime.toFixed(2)}ms`,
    最大: `${maxTime}ms`,
    最小: `${minTime}ms`,
  });

  if (avgTime > 5000) {
    console.warn('⚠️ 平均响应时间过长，建议优化');
  } else {
    console.log('✅ 性能表现良好');
  }
}

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始 Unified 引擎测试');
  console.log('==========================================');

  try {
    await testBasicAnalysis();
    await testDifferentConfigurations();
    await testPerformance();

    console.log('\n🎉 所有测试通过！');
    console.log('==========================================');
  } catch (error) {
    console.error('\n💥 测试失败：', error);
    console.log('==========================================');
    throw error;
  }
}

// 如果直接运行这个文件
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  runAllTests,
  testBasicAnalysis,
  testDifferentConfigurations,
  testPerformance,
};
