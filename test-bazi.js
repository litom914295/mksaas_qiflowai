/**
 * 八字计算测试脚本
 * 用于验证数据流程是否正确
 */

async function testBaziCalculation() {
  console.log('🧪 开始测试八字计算...\n');

  try {
    // 测试数据
    const testData = {
      datetime: '1990-05-15T14:30',
      gender: 'male',
      timezone: 'Asia/Shanghai',
      isTimeKnown: true,
    };

    console.log('📝 测试数据:', testData);
    console.log('\n正在导入模块...');

    // 动态导入（因为是ESM）
    const { computeBaziSmart } = await import('./src/lib/bazi/index.ts');
    const { normalizeBaziResult } = await import('./src/lib/bazi/normalize.ts');

    console.log('✅ 模块导入成功\n');
    console.log('🔄 开始计算八字...');

    // 执行计算
    const result = await computeBaziSmart(testData);

    console.log('\n📊 计算结果:');
    console.log('- 是否有结果:', !!result);

    if (result) {
      console.log('- 四柱数据:');
      console.log('  年柱:', result.pillars?.year);
      console.log('  月柱:', result.pillars?.month);
      console.log('  日柱:', result.pillars?.day);
      console.log('  时柱:', result.pillars?.hour);

      console.log('\n🔄 开始归一化数据...');
      const normalized = normalizeBaziResult(result, {
        name: '测试用户',
        gender: 'male',
        datetime: testData.datetime,
      });

      console.log('\n📋 归一化结果:');
      console.log('- 是否成功:', !!normalized);

      if (normalized) {
        console.log('- 基础信息:');
        console.log('  姓名:', normalized.base.name);
        console.log('  日主:', normalized.base.dayMaster);
        console.log('  四柱:');
        console.log('    年:', normalized.base.pillars.year.heavenlyStem + normalized.base.pillars.year.earthlyBranch);
        console.log('    月:', normalized.base.pillars.month.heavenlyStem + normalized.base.pillars.month.earthlyBranch);
        console.log('    日:', normalized.base.pillars.day.heavenlyStem + normalized.base.pillars.day.earthlyBranch);
        console.log('    时:', normalized.base.pillars.hour.heavenlyStem + normalized.base.pillars.hour.earthlyBranch);

        console.log('\n✅ 测试通过！数据流程正常。');
      } else {
        console.error('\n❌ 归一化失败！');
      }
    } else {
      console.error('\n❌ 计算失败！');
    }
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error('错误堆栈:', error.stack);
  }
}

// 运行测试
testBaziCalculation();
