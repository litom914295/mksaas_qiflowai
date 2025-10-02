/**
 * 测试修复后的八字计算功能
 *
 * 这个脚本测试修复后的computeBaziSmart函数是否正确调用真实的计算引擎
 * 而不是返回硬编码数据
 */

import {
    checkBaziSystemHealth,
    computeBaziSmart,
} from './src/lib/bazi/index.js';

async function testBaziCalculation() {
  console.log('=== 测试修复后的八字计算功能 ===\n');

  // 测试用例1：1990年5月10日12点30分
  const testCase1 = {
    datetime: '1990-05-10T12:30:00',
    gender: 'male',
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  // 测试用例2：1985年12月25日06点15分
  const testCase2 = {
    datetime: '1985-12-25T06:15:00',
    gender: 'female',
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  // 测试用例3：2000年1月1日23点45分（子时跨日测试）
  const testCase3 = {
    datetime: '2000-01-01T23:45:00',
    gender: 'male',
    timezone: 'Asia/Shanghai',
    isTimeKnown: true,
  };

  console.log('1. 测试用例1: 1990年5月10日12点30分 (男性)');
  console.log('输入:', JSON.stringify(testCase1, null, 2));

  try {
    const result1 = await computeBaziSmart(testCase1);
    console.log('计算结果:');

    if (result1) {
      console.log('✅ 计算成功');
      console.log('四柱:');
      console.log(
        `  年柱: ${result1.pillars.year.chinese} (${result1.pillars.year.element})`
      );
      console.log(
        `  月柱: ${result1.pillars.month.chinese} (${result1.pillars.month.element})`
      );
      console.log(
        `  日柱: ${result1.pillars.day.chinese} (${result1.pillars.day.element})`
      );
      console.log(
        `  时柱: ${result1.pillars.hour.chinese} (${result1.pillars.hour.element})`
      );
      console.log('五行强度:', result1.elements);
      console.log('用神分析:');
      console.log(`  有利: ${result1.yongshen.favorable}`);
      console.log(`  不利: ${result1.yongshen.unfavorable}`);

      // 验证是否是真实计算而非硬编码
      const isHardcoded =
        result1.pillars.year.chinese === '癸丑' &&
        result1.pillars.month.chinese === '甲寅' &&
        result1.pillars.day.chinese === '戊戌' &&
        result1.pillars.hour.chinese === '甲寅';

      if (isHardcoded) {
        console.log('⚠️  警告: 结果疑似仍为硬编码数据');
      } else {
        console.log('✅ 确认: 结果为真实计算数据');
      }
    } else {
      console.log('❌ 计算失败: 返回null');
    }
  } catch (error) {
    console.log('❌ 计算出错:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  console.log('2. 测试用例2: 1985年12月25日06点15分 (女性)');
  console.log('输入:', JSON.stringify(testCase2, null, 2));

  try {
    const result2 = await computeBaziSmart(testCase2);

    if (result2) {
      console.log('✅ 计算成功');
      console.log('四柱:');
      console.log(`  年柱: ${result2.pillars.year.chinese}`);
      console.log(`  月柱: ${result2.pillars.month.chinese}`);
      console.log(`  日柱: ${result2.pillars.day.chinese}`);
      console.log(`  时柱: ${result2.pillars.hour.chinese}`);

      // 验证不同输入得到不同结果
      const isDifferent =
        result2.pillars.day.chinese !== '戊戌' ||
        result2.pillars.year.chinese !== '癸丑';

      if (isDifferent) {
        console.log('✅ 确认: 不同输入产生不同结果');
      } else {
        console.log('⚠️  警告: 不同输入产生相同结果，可能仍有问题');
      }
    } else {
      console.log('❌ 计算失败: 返回null');
    }
  } catch (error) {
    console.log('❌ 计算出错:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  console.log('3. 测试用例3: 2000年1月1日23点45分 (子时跨日测试)');
  console.log('输入:', JSON.stringify(testCase3, null, 2));

  try {
    const result3 = await computeBaziSmart(testCase3);

    if (result3) {
      console.log('✅ 计算成功');
      console.log('四柱:');
      console.log(`  年柱: ${result3.pillars.year.chinese}`);
      console.log(`  月柱: ${result3.pillars.month.chinese}`);
      console.log(`  日柱: ${result3.pillars.day.chinese}`);
      console.log(`  时柱: ${result3.pillars.hour.chinese}`);

      // 验证子时跨日处理
      if (result3.pillars.hour.chinese.includes('子')) {
        console.log('✅ 确认: 正确识别子时');
      }
    } else {
      console.log('❌ 计算失败: 返回null');
    }
  } catch (error) {
    console.log('❌ 计算出错:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 系统健康检查
  console.log('4. 系统健康检查');
  try {
    const health = await checkBaziSystemHealth();
    console.log('系统状态:', health.status);
    console.log('增强算法状态:', health.enhanced ? '正常' : '异常');
    console.log('配置信息:', health.config);
    if (health.metrics) {
      console.log('性能指标:', health.metrics);
    }
    if (health.error) {
      console.log('错误信息:', health.error);
    }
  } catch (error) {
    console.log('❌ 健康检查失败:', error.message);
  }

  console.log('\n=== 测试完成 ===');
}

// 运行测试
testBaziCalculation().catch(console.error);
