/**
 * QiFlow AI - 八字计算使用示例
 *
 * 展示如何在实际应用中使用新的八字计算系统
 */

import {
    baziCache,
    checkBaziSystemHealth,
    computeBaziSmart,
    configureBaziSystem,
    createEnhancedBaziCalculator,
    createTimezoneAwareDate,
    getBaziAdapter,
    getRecommendedTimezone,
    performanceMonitor,
} from './index';

/**
 * 示例1: 基础八字计算
 */
export async function basicBaziCalculation() {
  console.log('=== 基础八字计算示例 ===');

  const birthData = {
    datetime: '1990-05-10T12:30:00',
    gender: 'male' as const,
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  try {
    // 智能计算（自动选择最佳算法）
    const result = await computeBaziSmart(birthData);

    if (result) {
      console.log('四柱信息:', result.pillars);
      console.log('日主:', result.pillars.day.stem);
      console.log('五行力量:', result.elements);
      console.log('用神:', result.yongshen);

      // 如果是增强结果，显示额外信息
      if ('luckPillars' in result && result.luckPillars) {
        console.log('大运数量:', result.luckPillars.length);
      }
    }
  } catch (error) {
    console.error('计算失败:', error);
  }
}

/**
 * 示例2: 增强型八字分析
 */
export async function enhancedBaziAnalysis() {
  console.log('=== 增强型八字分析示例 ===');

  const birthData = {
    datetime: '1995-08-15T14:20:00',
    gender: 'female' as const,
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
    preferredLocale: 'zh-CN',
  };

  try {
    // 创建增强型计算器
    const calculator = createEnhancedBaziCalculator(birthData);

    // 获取完整分析
    const analysis = await calculator.getCompleteAnalysis();

    if (analysis) {
      console.log('完整八字分析结果:');
      console.log('- 四柱:', analysis.pillars);
      console.log('- 五行:', analysis.elements);
      console.log('- 日主强度:', analysis.dayMasterStrength);
      console.log('- 有利元素:', analysis.favorableElements);
      console.log('- 大运分析:', analysis.luckPillars?.length, '个大运');
      console.log('- 互动分析:', analysis.interactions?.length, '个互动');
    }

    // 分析当前大运
    const currentLuck = await calculator.getCurrentLuckPillar();
    if (currentLuck) {
      console.log('当前大运:', currentLuck);
    }

    // 今日运势
    const today = new Date();
    const dailyFortune = await calculator.getDailyAnalysis(
      today,
      'personalized'
    );
    if (dailyFortune) {
      console.log('今日运势:', dailyFortune);
    }
  } catch (error) {
    console.error('增强分析失败:', error);
  }
}

/**
 * 示例3: 时区处理
 */
export async function timezoneHandlingExample() {
  console.log('=== 时区处理示例 ===');

  // 创建时区感知的日期
  const tzDate = createTimezoneAwareDate(
    '1990-05-10T12:30:00',
    'Asia/Shanghai'
  );
  console.log('时区日期:', tzDate.formatLocal());
  console.log('UTC时间:', tzDate.formatUTC());
  console.log('时区偏移:', tzDate.getTimezoneOffset());

  // 获取推荐时区
  const recommendedTz = getRecommendedTimezone({
    latitude: 39.9042, // 北京
    longitude: 116.4074,
  });
  console.log('推荐时区:', recommendedTz);

  // 多时区计算
  const timezones = ['Asia/Shanghai', 'America/New_York', 'Europe/London'];

  for (const timezone of timezones) {
    try {
      const result = await computeBaziSmart({
        datetime: '1990-05-10T12:30:00',
        gender: 'male',
        timezone,
        isTimeKnown: true,
      });

      if (result) {
        console.log(`${timezone}:`, `${result.pillars.year?.stem}${result.pillars.year?.branch}`);
      }
    } catch (error) {
      console.error(`${timezone} 计算失败:`, error);
    }
  }
}

/**
 * 示例4: 性能监控和缓存
 */
export async function performanceAndCacheExample() {
  console.log('=== 性能监控和缓存示例 ===');

  // 配置系统
  configureBaziSystem({
    mode: 'hybrid',
    enableCache: true,
    enableMetrics: true,
  });

  const birthData = {
    datetime: '1985-03-20T09:15:00',
    gender: 'male' as const,
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  // 开始性能监控
  performanceMonitor.start('batch_calculation');

  // 执行多次计算（第二次应该来自缓存）
  for (let i = 0; i < 3; i++) {
    console.log(`第 ${i + 1} 次计算...`);
    const result = await computeBaziSmart(birthData);

    if (result) {
      console.log(`  结果: ${result.pillars.day?.stem}${result.pillars.day?.branch}`);
    }
  }

  // 结束性能监控
  const duration = performanceMonitor.end('batch_calculation');
  console.log(`批量计算总耗时: ${duration}ms`);

  // 查看缓存统计
  const cacheStats = baziCache.stats();
  console.log('缓存统计:', cacheStats);

  // 查看性能报告
  const perfReport = performanceMonitor.report();
  console.log('性能报告:', perfReport);
}

/**
 * 示例5: 大运分析
 */
export async function luckPillarsAnalysisExample() {
  console.log('=== 大运分析示例 ===');

  const birthData = {
    datetime: '1992-11-05T16:45:00',
    gender: 'female' as const,
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  try {
    const calculator = createEnhancedBaziCalculator(birthData);

    // 获取所有大运
    const luckPillars = await calculator.getLuckPillarsAnalysis();

    if (luckPillars && luckPillars.length > 0) {
      console.log(`共 ${luckPillars.length} 个大运:`);

      luckPillars.forEach((luck, index) => {
        console.log(`大运 ${index + 1}:`);
        console.log(`  干支: ${luck.heavenlyStem}${luck.earthlyBranch}`);
        console.log(`  年龄段: ${luck.startAge}-${luck.endAge} 岁`);
        console.log(`  强度: ${luck.strength}`);
        console.log(
          `  开始时间: ${luck.startDate?.toLocaleDateString() || '未知'}`
        );
        console.log();
      });
    }

    // 获取当前大运
    const currentLuck = await calculator.getCurrentLuckPillar();
    if (currentLuck) {
      console.log('当前大运:', {
        干支: `${currentLuck.heavenlyStem}${currentLuck.earthlyBranch}`,
        年龄段: `${currentLuck.startAge}-${currentLuck.endAge} 岁`,
        强度: currentLuck.strength,
      });
    }
  } catch (error) {
    console.error('大运分析失败:', error);
  }
}

/**
 * 示例6: 每日运势分析
 */
export async function dailyFortuneAnalysisExample() {
  console.log('=== 每日运势分析示例 ===');

  const birthData = {
    datetime: '1988-07-12T11:30:00',
    gender: 'male' as const,
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  try {
    const calculator = createEnhancedBaziCalculator(birthData);

    // 分析今天
    const today = new Date();
    const todayFortune = await calculator.getDailyAnalysis(
      today,
      'personalized'
    );

    if (todayFortune) {
      console.log('今日运势分析:');
      console.log(`日期: ${todayFortune.date}`);
      console.log(`日柱: ${todayFortune.dayPillar.chinese}`);
      console.log(`五行: ${todayFortune.dayPillar.element}`);
      console.log(`互动数: ${todayFortune.interactions}`);
      console.log(`是否有利: ${todayFortune.isFavorable ? '是' : '否'}`);
      console.log(`建议: ${todayFortune.recommendation}`);
    }

    // 分析未来几天
    const futureDates = [];
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + i);
      futureDates.push(futureDate);
    }

    console.log('\n未来7天运势预览:');
    for (const date of futureDates) {
      const fortune = await calculator.getDailyAnalysis(date, 'general');
      if (fortune) {
        console.log(
          `${date.toLocaleDateString()}: ${fortune.isFavorable ? '有利' : '不利'} - ${fortune.recommendation}`
        );
      }
    }
  } catch (error) {
    console.error('每日运势分析失败:', error);
  }
}

/**
 * 示例7: 系统健康检查
 */
export async function systemHealthCheckExample() {
  console.log('=== 系统健康检查示例 ===');

  try {
    const health = await checkBaziSystemHealth();

    console.log('系统状态:', health.status);
    console.log('增强算法:', health.enhanced ? '正常' : '异常');
    console.log('配置信息:', health.config);
    console.log('性能指标:', health.metrics);

    if (health.status === 'healthy') {
      console.log('✅ 系统运行正常');
    } else {
      console.log('⚠️  系统存在问题，请检查配置');
    }
  } catch (error) {
    console.error('健康检查失败:', error);
  }
}

/**
 * 示例8: 错误处理
 */
export async function errorHandlingExample() {
  console.log('=== 错误处理示例 ===');

  const invalidData = {
    datetime: 'invalid-date',
    gender: 'male' as const,
  };

  try {
    await computeBaziSmart(invalidData);
  } catch (error) {
    console.log(
      '捕获到错误:',
      error instanceof Error ? error.message : '未知错误'
    );
  }

  // 测试降级处理
  const adapter = getBaziAdapter();

  try {
    // 使用不存在的时区
    const result = await adapter.calculate({
      datetime: '1990-05-10T12:30:00',
      gender: 'male',
      timezone: 'Invalid/Timezone',
    });

    if (result) {
      console.log('降级处理成功');
    }
  } catch (error) {
    console.log(
      '降级处理失败:',
      error instanceof Error ? error.message : '未知错误'
    );
  }
}

/**
 * 示例9: 批量处理
 */
export async function batchProcessingExample() {
  console.log('=== 批量处理示例 ===');

  const birthDataList = [
    {
      datetime: '1990-01-15T08:30:00',
      gender: 'male' as const,
      timezone: 'Asia/Shanghai',
    },
    {
      datetime: '1992-03-22T14:15:00',
      gender: 'female' as const,
      timezone: 'Asia/Shanghai',
    },
    {
      datetime: '1988-11-08T16:45:00',
      gender: 'male' as const,
      timezone: 'America/New_York',
    },
    {
      datetime: '1995-07-30T10:20:00',
      gender: 'female' as const,
      timezone: 'Europe/London',
    },
  ];

  try {
    console.log('开始批量计算...');

    const startTime = Date.now();
    const results = await Promise.allSettled(
      birthDataList.map(data => computeBaziSmart(data))
    );
    const endTime = Date.now();

    console.log(`批量计算完成，耗时: ${endTime - startTime}ms`);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const bazi = result.value;
        console.log(
          `数据 ${index + 1}: ${bazi?.pillars.day ? `${bazi.pillars.day.stem}${bazi.pillars.day.branch}` : '计算失败'}`
        );
      } else {
        console.log(`数据 ${index + 1}: 处理失败 - ${result.reason}`);
      }
    });
  } catch (error) {
    console.error('批量处理失败:', error);
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 QiFlow AI 八字计算系统示例演示\n');

  try {
    await basicBaziCalculation();
    console.log();

    await enhancedBaziAnalysis();
    console.log();

    await timezoneHandlingExample();
    console.log();

    await performanceAndCacheExample();
    console.log();

    await luckPillarsAnalysisExample();
    console.log();

    await dailyFortuneAnalysisExample();
    console.log();

    await systemHealthCheckExample();
    console.log();

    await errorHandlingExample();
    console.log();

    await batchProcessingExample();
    console.log();

    console.log('✅ 所有示例演示完成！');
  } catch (error) {
    console.error('❌ 示例演示失败:', error);
  }
}

// 如果直接运行此文件，执行所有示例
if (require.main === module) {
  runAllExamples().catch(console.error);
}
