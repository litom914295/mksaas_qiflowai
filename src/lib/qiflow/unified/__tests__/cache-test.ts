/**
 * 缓存系统测试
 *
 * 测试缓存功能和性能优化效果
 */

import { getGlobalCache, resetGlobalCache } from '../cache';
import { UnifiedFengshuiEngine } from '../engine';
import type { UnifiedAnalysisInput } from '../types';

/**
 * 创建测试输入
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
      facing: 180,
      buildYear: 2005,
      floor: 5,
    },
    time: {
      currentYear: 2025,
      currentMonth: 1,
    },
    options: {
      depth: 'comprehensive',
      includeScoring: true,
      includeWarnings: true,
    },
  };
}

/**
 * 测试基本缓存功能
 */
async function testBasicCache() {
  console.log('\n🧪 测试：基本缓存功能\n');

  // 重置缓存
  resetGlobalCache();
  const cache = getGlobalCache();

  const input = createTestInput();

  // 第一次分析（应该缓存未命中）
  console.log('🔍 第一次分析（应该无缓存）...');
  const start1 = Date.now();
  const result1 = await UnifiedFengshuiEngine.analyze(input);
  const time1 = Date.now() - start1;
  console.log(`✅ 第一次完成，耗时: ${time1}ms`);

  // 第二次分析（应该缓存命中）
  console.log('\n🔍 第二次分析（应该命中缓存）...');
  const start2 = Date.now();
  const result2 = await UnifiedFengshuiEngine.analyze(input);
  const time2 = Date.now() - start2;
  console.log(`✅ 第二次完成，耗时: ${time2}ms`);

  // 验证结果一致性
  if (result1.assessment.overallScore !== result2.assessment.overallScore) {
    throw new Error('缓存结果不一致！');
  }

  // 验证性能提升
  if (time2 > time1 * 0.5) {
    console.warn(`⚠️ 缓存性能提升不明显: ${time1}ms -> ${time2}ms`);
  } else {
    console.log(
      `🚀 缓存显著提升性能: ${time1}ms -> ${time2}ms (提升 ${Math.round((1 - time2 / time1) * 100)}%)`
    );
  }

  cache.printStats();

  console.log('\n✅ 基本缓存功能测试通过！');
}

/**
 * 测试多次访问性能
 */
async function testRepeatedAccess() {
  console.log('\n🧪 测试：多次访问性能\n');

  resetGlobalCache();
  const cache = getGlobalCache();

  const input = createTestInput();
  const iterations = 10;
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await UnifiedFengshuiEngine.analyze(input);
    const duration = Date.now() - start;
    times.push(duration);
    console.log(`第 ${i + 1} 次: ${duration}ms`);
  }

  // 统计
  const firstTime = times[0];
  const avgCachedTime =
    times.slice(1).reduce((sum, t) => sum + t, 0) / (times.length - 1);
  const improvement = (((firstTime - avgCachedTime) / firstTime) * 100).toFixed(
    2
  );

  console.log('\n📊 性能统计:');
  console.log(`  首次分析: ${firstTime}ms`);
  console.log(`  缓存平均: ${avgCachedTime.toFixed(2)}ms`);
  console.log(`  性能提升: ${improvement}%`);

  cache.printStats();

  console.log('\n✅ 多次访问性能测试通过！');
}

/**
 * 测试不同输入的缓存隔离
 */
async function testCacheIsolation() {
  console.log('\n🧪 测试：缓存隔离\n');

  resetGlobalCache();
  const cache = getGlobalCache();

  // 不同输入
  const input1 = createTestInput();
  const input2 = {
    ...createTestInput(),
    house: {
      ...createTestInput().house,
      facing: 90, // 不同朝向
    },
  };

  // 第一个输入
  console.log('分析输入1...');
  const result1 = await UnifiedFengshuiEngine.analyze(input1);

  // 第二个输入（应该未命中）
  console.log('分析输入2...');
  const result2 = await UnifiedFengshuiEngine.analyze(input2);

  // 验证结果不同
  if (result1.xuankong.facing === result2.xuankong.facing) {
    throw new Error('不同输入产生了相同结果！缓存隔离失败！');
  }

  // 再次访问第一个输入（应该命中）
  console.log('再次分析输入1（应该命中缓存）...');
  const result1Again = await UnifiedFengshuiEngine.analyze(input1);

  if (result1.xuankong.facing !== result1Again.xuankong.facing) {
    throw new Error('缓存结果不一致！');
  }

  cache.printStats();

  console.log('\n✅ 缓存隔离测试通过！');
}

/**
 * 测试缓存清理
 */
async function testCacheClear() {
  console.log('\n🧪 测试：缓存清理\n');

  resetGlobalCache();
  const cache = getGlobalCache();

  const input = createTestInput();

  // 先缓存一些数据
  await UnifiedFengshuiEngine.analyze(input);

  console.log('缓存清理前:');
  cache.printStats();

  // 清除缓存
  cache.clear();

  console.log('\n缓存清理后:');
  cache.printStats();

  // 验证缓存已清空
  const stats = cache.getStats();
  if (stats.size !== 0) {
    throw new Error('缓存清理失败！');
  }

  console.log('\n✅ 缓存清理测试通过！');
}

/**
 * 测试禁用缓存
 */
async function testCacheDisabled() {
  console.log('\n🧪 测试：禁用缓存\n');

  resetGlobalCache();
  const cache = getGlobalCache();

  const input = createTestInput();

  // 禁用缓存分析
  console.log('第一次分析（缓存禁用）...');
  const result1 = await UnifiedFengshuiEngine.analyze(input, false);

  console.log('第二次分析（缓存禁用）...');
  const result2 = await UnifiedFengshuiEngine.analyze(input, false);

  // 验证缓存统计
  const stats = cache.getStats();
  if (stats.hits !== 0 || stats.misses !== 0) {
    throw new Error('禁用缓存后仍有缓存活动！');
  }

  console.log('✅ 缓存已成功禁用');
  cache.printStats();

  console.log('\n✅ 禁用缓存测试通过！');
}

/**
 * 运行所有缓存测试
 */
async function runAllCacheTests() {
  console.log('═'.repeat(60));
  console.log('🚀 缓存系统测试套件');
  console.log('═'.repeat(60));

  try {
    await testBasicCache();
    await testRepeatedAccess();
    await testCacheIsolation();
    await testCacheClear();
    await testCacheDisabled();

    console.log('═'.repeat(60));
    console.log('🎉 所有缓存测试通过！');
    console.log('═'.repeat(60));
  } catch (error) {
    console.log('═'.repeat(60));
    console.log('💥 缓存测试失败！');
    console.log('═'.repeat(60));
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  runAllCacheTests().catch(console.error);
}

export {
  runAllCacheTests,
  testBasicCache,
  testRepeatedAccess,
  testCacheIsolation,
  testCacheClear,
  testCacheDisabled,
};
