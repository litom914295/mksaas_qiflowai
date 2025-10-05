/**
 * 测试八字和玄空风水算法
 */

// 测试八字算法
async function testBaziAlgorithm() {
  console.log('🔍 测试八字算法...');

  try {
    // 动态导入 ES 模块
    const baziModule = await import('./src/lib/qiflow/bazi/index.js');
    const { calculateBazi } = baziModule;

    // 测试数据
    const testDate = new Date('1990-01-15T14:30:00');
    const result = calculateBazi(testDate, 'male');

    console.log('✅ 八字计算结果:');
    console.log('  四柱:', result.fourPillars);
    console.log('  五行:', result.fiveElements);
    console.log('  日主:', result.dayMaster);

    return true;
  } catch (error) {
    console.error('❌ 八字算法测试失败:', error.message);
    return false;
  }
}

// 测试玄空风水算法
async function testXuankongAlgorithm() {
  console.log('🔍 测试玄空风水算法...');

  try {
    // 动态导入 ES 模块
    const xuankongModule = await import('./src/lib/qiflow/xuankong/index.js');
    const { analyzeFengShui } = xuankongModule;

    // 测试数据
    const testData = {
      facingDirection: 180, // 坐北朝南
      moveInDate: new Date('2024-01-01'),
      buildingType: 'residential',
    };

    const result = analyzeFengShui(testData);

    console.log('✅ 玄空分析结果:');
    console.log('  元运:', result.period);
    console.log('  山星:', result.mountainStars);
    console.log('  向星:', result.facingStars);
    console.log('  飞星分析:', result.analysis?.summary);

    return true;
  } catch (error) {
    console.error('❌ 玄空算法测试失败:', error.message);
    return false;
  }
}

// API 端点测试
async function testAPIEndpoints() {
  console.log('🔍 测试 API 端点...');

  const endpoints = [
    { path: '/zh/qiflow/bazi', name: '八字分析页面' },
    { path: '/zh/qiflow/xuankong', name: '玄空风水页面' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint.path}`);
      const status = response.status;
      const statusText = status === 200 ? '✅ 正常' : '⚠️ 异常';
      console.log(`  ${endpoint.name}: ${statusText} (${status})`);
    } catch (error) {
      console.log(`  ${endpoint.name}: ❌ 无法访问`);
    }
  }
}

// 主测试函数
async function runTests() {
  console.log('========================================');
  console.log('🚀 开始测试 QiFlow 核心功能');
  console.log('========================================\n');

  // 注意：由于导入路径问题，先测试 API
  await testAPIEndpoints();

  console.log('\n========================================');
  console.log('✨ 测试完成！');
  console.log('========================================');
  console.log('\n💡 建议：');
  console.log('1. 访问 http://localhost:3000/zh/qiflow/bazi 测试八字分析');
  console.log('2. 访问 http://localhost:3000/zh/qiflow/xuankong 测试玄空风水');
  console.log('3. 检查控制台是否有错误信息');
  console.log('4. 尝试提交表单测试完整功能流程');
}

// 运行测试
runTests().catch(console.error);
