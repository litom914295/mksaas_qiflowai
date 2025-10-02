#!/usr/bin/env node

/**
 * QiFlow AI - bazi-calculator-by-alvamind 库集成测试
 * 用于评估该库是否适合项目集成
 */

import { BaziCalculator } from '@aharris02/bazi-calculator-by-alvamind';
import { toDate } from 'date-fns-tz';

console.log('🚀 开始测试 @aharris02/bazi-calculator-by-alvamind 库\n');

// 测试1: 基本功能测试
function testBasicFunctionality() {
  console.log('📋 测试1: 基本功能测试');

  try {
    // 创建测试数据
    const birthDateString = '1990-05-10T12:30:00';
    const timezone = 'Asia/Shanghai';
    const gender = 'male';

    // 创建时区感知的日期对象
    const birthDate = toDate(birthDateString, { timeZone: timezone });

    console.log('   ✅ 日期对象创建成功:', birthDate.toISOString());

    // 初始化计算器
    const calculator = new BaziCalculator(birthDate, gender, timezone, true);

    console.log('   ✅ BaziCalculator 初始化成功');

    // 获取完整分析
    const analysis = calculator.getCompleteAnalysis();

    if (analysis) {
      console.log('   ✅ 完整分析获取成功');
      console.log('   📊 四柱信息:', calculator.toString());
      console.log('   👤 日主:', analysis.basicAnalysis?.dayMaster?.stem);
      console.log('   🏠 命卦:', analysis.basicAnalysis?.lifeGua);
      console.log('   ⚡ 五行力量:', analysis.basicAnalysis?.fiveFactors);

      return { success: true, analysis };
    } else {
      console.log('   ❌ 分析获取失败');
      return { success: false };
    }
  } catch (error) {
    console.error('   ❌ 基本功能测试失败:', error.message);
    return { success: false, error };
  }
}

// 测试2: 时区处理测试
function testTimezoneHandling() {
  console.log('\n📋 测试2: 时区处理测试');

  try {
    const birthDateString = '1990-05-10T12:30:00';
    const timezones = ['Asia/Shanghai', 'America/New_York', 'Europe/London'];

    for (const timezone of timezones) {
      const birthDate = toDate(birthDateString, { timeZone: timezone });
      const calculator = new BaziCalculator(birthDate, 'male', timezone, true);
      const analysis = calculator.getCompleteAnalysis();

      if (analysis) {
        console.log(`   ✅ ${timezone}: ${calculator.toString()}`);
      } else {
        console.log(`   ❌ ${timezone}: 分析失败`);
        return { success: false };
      }
    }

    return { success: true };
  } catch (error) {
    console.error('   ❌ 时区处理测试失败:', error.message);
    return { success: false, error };
  }
}

// 测试3: 未知出生时间处理
function testUnknownBirthTime() {
  console.log('\n📋 测试3: 未知出生时间处理');

  try {
    const birthDateString = '1990-05-10T12:00:00'; // 使用中午作为占位时间
    const timezone = 'Asia/Shanghai';
    const gender = 'female';

    const birthDate = toDate(birthDateString, { timeZone: timezone });
    const calculator = new BaziCalculator(birthDate, gender, timezone, false); // 时间未知

    const analysis = calculator.getCompleteAnalysis();

    if (analysis) {
      console.log('   ✅ 未知时间处理成功');
      console.log('   📊 四柱信息:', calculator.toString());
      console.log('   ⚡ 时柱是否为空:', analysis.mainPillars.time === null);
      console.log(
        '   🎯 大运时间是否未知:',
        !analysis.luckPillars?.isTimingKnown
      );

      return { success: true, analysis };
    } else {
      console.log('   ❌ 未知时间处理失败');
      return { success: false };
    }
  } catch (error) {
    console.error('   ❌ 未知时间处理测试失败:', error.message);
    return { success: false, error };
  }
}

// 测试4: 每日分析功能
function testDailyAnalysis() {
  console.log('\n📋 测试4: 每日分析功能');

  try {
    // 创建一个测试的出生信息
    const birthDateString = '1990-05-10T12:30:00';
    const timezone = 'Asia/Shanghai';

    const birthDate = toDate(birthDateString, { timeZone: timezone });
    const calculator = new BaziCalculator(birthDate, 'male', timezone, true);

    // 测试目标日期
    const targetDateString = '2024-12-25T12:00:00';
    const targetTimezone = 'Asia/Shanghai';
    const targetDate = toDate(targetDateString, { timeZone: targetTimezone });

    // 通用每日分析
    const generalAnalysis = calculator.getAnalysisForDate(
      targetDate,
      targetTimezone,
      {
        type: 'general',
      }
    );

    if (generalAnalysis) {
      console.log('   ✅ 通用每日分析成功');
      console.log('   📅 目标日期:', generalAnalysis.date);
      console.log('   🌟 日柱:', generalAnalysis.dayPillar.chinese);
    } else {
      console.log('   ❌ 通用每日分析失败');
      return { success: false };
    }

    // 个性化每日分析
    const personalizedAnalysis = calculator.getAnalysisForDate(
      targetDate,
      targetTimezone,
      {
        type: 'personalized',
      }
    );

    if (personalizedAnalysis) {
      console.log('   ✅ 个性化每日分析成功');
      console.log('   📅 目标日期:', personalizedAnalysis.date);
      console.log(
        '   🔄 互动数量:',
        personalizedAnalysis.interactions?.length || 0
      );
    } else {
      console.log('   ❌ 个性化每日分析失败');
      return { success: false };
    }

    return { success: true };
  } catch (error) {
    console.error('   ❌ 每日分析测试失败:', error.message);
    return { success: false, error };
  }
}

// 测试5: 与现有项目架构的兼容性
function testArchitectureCompatibility() {
  console.log('\n📋 测试5: 架构兼容性测试');

  try {
    // 测试TypeScript类型兼容性
    const calculator = new BaziCalculator(new Date(), 'male', 'UTC', true);

    // 测试API返回类型
    const analysis = calculator.getCompleteAnalysis();

    if (analysis && typeof analysis === 'object') {
      console.log('   ✅ API返回类型正确');

      // 检查关键字段是否存在
      const requiredFields = ['mainPillars', 'basicAnalysis'];
      for (const field of requiredFields) {
        if (analysis[field] !== undefined) {
          console.log(`   ✅ 字段 ${field} 存在`);
        } else {
          console.log(`   ❌ 字段 ${field} 缺失`);
          return { success: false };
        }
      }

      return { success: true, analysis };
    } else {
      console.log('   ❌ API返回类型不正确');
      return { success: false };
    }
  } catch (error) {
    console.error('   ❌ 架构兼容性测试失败:', error.message);
    return { success: false, error };
  }
}

// 测试6: 性能评估
function testPerformance() {
  console.log('\n📋 测试6: 性能评估');

  try {
    const birthDateString = '1990-05-10T12:30:00';
    const timezone = 'Asia/Shanghai';

    const birthDate = toDate(birthDateString, { timeZone: timezone });

    // 测试初始化性能
    const initStartTime = Date.now();
    const calculator = new BaziCalculator(birthDate, 'male', timezone, true);
    const initEndTime = Date.now();
    const initTime = initEndTime - initStartTime;

    console.log(`   📊 初始化耗时: ${initTime}ms`);

    // 测试分析性能
    const analysisStartTime = Date.now();
    const analysis = calculator.getCompleteAnalysis();
    const analysisEndTime = Date.now();
    const analysisTime = analysisEndTime - analysisStartTime;

    console.log(`   📊 分析耗时: ${analysisTime}ms`);

    // 批量测试
    const batchStartTime = Date.now();
    for (let i = 0; i < 100; i++) {
      calculator.getCompleteAnalysis();
    }
    const batchEndTime = Date.now();
    const batchTime = batchEndTime - batchStartTime;
    const avgTime = batchTime / 100;

    console.log(`   📊 批量测试 (100次): ${batchTime}ms`);
    console.log(`   📊 平均每次耗时: ${avgTime}ms`);

    if (initTime < 100 && analysisTime < 50 && avgTime < 10) {
      console.log('   ✅ 性能表现良好');
      return {
        success: true,
        performance: { initTime, analysisTime, avgTime },
      };
    } else {
      console.log('   ⚠️  性能表现一般');
      return {
        success: true,
        performance: { initTime, analysisTime, avgTime },
      };
    }
  } catch (error) {
    console.error('   ❌ 性能测试失败:', error.message);
    return { success: false, error };
  }
}

// 主测试函数
async function runAllTests() {
  console.log('🧪 QiFlow AI - bazi-calculator-by-alvamind 集成评估\n');

  const results = {
    basic: await testBasicFunctionality(),
    timezone: await testTimezoneHandling(),
    unknownTime: await testUnknownBirthTime(),
    daily: await testDailyAnalysis(),
    compatibility: await testArchitectureCompatibility(),
    performance: await testPerformance(),
  };

  // 统计结果
  const passedTests = Object.values(results).filter(
    result => result.success
  ).length;
  const totalTests = Object.keys(results).length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(60));

  Object.entries(results).forEach(([testName, result]) => {
    const status = result.success ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${testName}`);
    if (!result.success && result.error) {
      console.log(`   错误: ${result.error.message}`);
    }
  });

  console.log('\n📈 总体评分:');
  console.log(`   通过测试: ${passedTests}/${totalTests}`);
  console.log(`   成功率: ${Math.round((passedTests / totalTests) * 100)}%`);

  // 给出建议
  if (passedTests === totalTests) {
    console.log('\n🎉 完美！该库非常适合集成到 QiFlow AI 项目中');
    console.log('💡 建议立即集成，可显著提升项目的八字计算能力');
  } else if (passedTests >= totalTests * 0.8) {
    console.log('\n👍 良好！该库基本满足需求，适合集成');
    console.log('💡 建议进行少量适配后集成');
  } else if (passedTests >= totalTests * 0.6) {
    console.log('\n⚠️ 一般！该库有一定价值，但需要较多适配工作');
    console.log('💡 建议评估是否值得集成，或寻找替代方案');
  } else {
    console.log('\n❌ 不推荐！该库与项目需求匹配度较低');
    console.log('💡 建议寻找更适合的替代方案');
  }

  return results;
}

// 运行所有测试
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('测试过程中发生未预期的错误:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
