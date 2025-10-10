/**
 * 迁移指南测试验证
 *
 * 测试从旧系统迁移到 unified 系统的兼容性
 */

import { UnifiedFengshuiEngine } from '../engine';
import type { UnifiedAnalysisInput } from '../types';

/**
 * 测试示例 - 完整配置
 */
async function testMigration() {
  console.log('\n🧪 开始测试统一系统迁移兼容性...\n');

  const input: UnifiedAnalysisInput = {
    bazi: {
      birthYear: 1990,
      birthMonth: 8,
      birthDay: 15,
      birthHour: 14,
      gender: 'male',
      dayMaster: 'water',
      favorableElements: ['metal', 'water'],
      unfavorableElements: ['earth', 'fire'],
    },
    house: {
      facing: 180,
      buildYear: 2020,
      floor: 15,
      layout: [
        {
          id: 'room-1',
          type: 'bedroom',
          name: '主卧',
          position: 8,
          isPrimary: true,
        },
        {
          id: 'room-2',
          type: 'kitchen',
          name: '厨房',
          position: 5,
          isPrimary: false,
        },
      ],
    },
    time: {
      currentYear: 2025,
      currentMonth: 1,
    },
    options: {
      depth: 'expert',
      includeScoring: true,
      includeWarnings: true,
      includePersonalization: true,
    },
  };

  console.log('📝 测试输入:', {
    facing: input.house.facing,
    buildYear: input.house.buildYear,
    birthYear: input.bazi.birthYear,
    optionsDepth: input.options?.depth,
  });

  try {
    const result = await UnifiedFengshuiEngine.analyze(input);

    // 验证核心功能
    console.log('\n✅ 飞星排盘:');
    console.log('  - 运期:', result.xuankong.period);
    console.log('  - 朝向:', result.xuankong.facing);
    console.log('  - 格局:', result.xuankong.geju?.types || []);

    console.log('\n✅ 智能评分:');
    console.log('  - 总分:', result.scoring?.overall);
    console.log('  - 等级:', result.scoring?.level);
    console.log('  - 维度数:', result.scoring?.dimensions.length);

    console.log('\n✅ 智能预警:');
    console.log('  - 总数:', result.warnings?.warnings.length);
    console.log('  - 紧急:', result.warnings?.urgentCount);
    console.log('  - 严重:', result.warnings?.criticalCount);

    console.log('\n✅ 综合评估:');
    console.log('  - 评分:', result.assessment.overallScore);
    console.log('  - 等级:', result.assessment.rating);
    console.log('  - 优势:', result.assessment.strengths);
    console.log('  - 劣势:', result.assessment.weaknesses);

    console.log('\n✅ 元数据:');
    console.log('  - 版本:', result.metadata.version);
    console.log('  - 深度:', result.metadata.depth);
    console.log('  - 计算时间:', `${result.metadata.computationTime}ms`);

    console.log('\n🎉 所有测试通过！迁移兼容性验证成功！\n');
    return true;
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    throw error;
  }
}

/**
 * 测试快速分析模式
 */
async function testQuickAnalyze() {
  console.log('\n🧪 测试快速分析模式...\n');

  const input: UnifiedAnalysisInput = {
    bazi: {
      birthYear: 1985,
      birthMonth: 3,
      birthDay: 20,
      birthHour: 10,
      gender: 'female',
    },
    house: {
      facing: 90, // 正东
      buildYear: 2015,
    },
    time: {
      currentYear: 2025,
      currentMonth: 1,
    },
    options: {
      depth: 'basic',
      includeScoring: false,
      includeWarnings: false,
    },
  };

  try {
    const result = await UnifiedFengshuiEngine.quickAnalyze(input);

    // 验证快速模式结果
    if (result.scoring !== undefined) {
      throw new Error('快速模式不应包含评分结果');
    }
    if (result.warnings !== undefined) {
      throw new Error('快速模式不应包含预警结果');
    }

    console.log('✅ 快速分析模式验证通过');
    console.log('  - 运期:', result.xuankong.period);
    console.log('  - 朝向:', result.xuankong.facing);
    console.log('  - 计算时间:', `${result.metadata.computationTime}ms`);

    return true;
  } catch (error) {
    console.error('❌ 快速分析测试失败:', error);
    throw error;
  }
}

/**
 * 测试专家分析模式
 */
async function testExpertAnalyze() {
  console.log('\n🧪 测试专家分析模式...\n');

  const input: UnifiedAnalysisInput = {
    bazi: {
      birthYear: 1978,
      birthMonth: 11,
      birthDay: 5,
      birthHour: 8,
      gender: 'male',
      dayMaster: 'fire',
      favorableElements: ['wood', 'fire'],
      unfavorableElements: ['water', 'metal'],
    },
    house: {
      facing: 225, // 西南
      buildYear: 2010,
      floor: 8,
      layout: [
        { id: 'living', type: 'living_room', name: '客厅', position: 9 },
        {
          id: 'master',
          type: 'bedroom',
          name: '主卧',
          position: 1,
          isPrimary: true,
        },
        { id: 'kitchen', type: 'kitchen', name: '厨房', position: 4 },
        { id: 'bath', type: 'bathroom', name: '浴室', position: 2 },
      ],
      environment: {
        waterPositions: [135, 180], // 东南、南方有水
        mountainPositions: [315, 0], // 西北、北方有山
        description: '前方有河流，后方有山峦',
      },
    },
    time: {
      currentYear: 2025,
      currentMonth: 1,
    },
    options: {
      depth: 'expert',
      includeScoring: true,
      includeWarnings: true,
      includePersonalization: true,
    },
  };

  try {
    const result = await UnifiedFengshuiEngine.expertAnalyze(input);

    // 验证专家模式结果
    if (!result.scoring) {
      throw new Error('专家模式应包含评分结果');
    }
    if (!result.warnings) {
      throw new Error('专家模式应包含预警结果');
    }

    console.log('✅ 专家分析模式验证通过');
    console.log('  - 综合评分:', result.assessment.overallScore);
    console.log('  - 问题数量:', result.warnings.warnings.length);
    console.log('  - 行动计划:', result.actionPlan.length);

    return true;
  } catch (error) {
    console.error('❌ 专家分析测试失败:', error);
    throw error;
  }
}

/**
 * 运行所有迁移测试
 */
async function runAllMigrationTests() {
  console.log('═'.repeat(60));
  console.log('🚀 迁移指南测试套件');
  console.log('═'.repeat(60));

  try {
    await testMigration();
    await testQuickAnalyze();
    await testExpertAnalyze();

    console.log('═'.repeat(60));
    console.log('🎉 所有迁移测试通过！');
    console.log('═'.repeat(60));
  } catch (error) {
    console.log('═'.repeat(60));
    console.log('💥 迁移测试失败！');
    console.log('═'.repeat(60));
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllMigrationTests().catch(console.error);
}

export {
  runAllMigrationTests,
  testMigration,
  testQuickAnalyze,
  testExpertAnalyze,
};
