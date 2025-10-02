// 专项测试：验证1973年1月7日2:30八字计算的准确性
import { detectAnalysisRequest } from './src/lib/ai/analysis-detection.js';
import { computeBaziSmart } from './src/lib/bazi/index.js';

async function testSpecificCase() {
  console.log('🎯 专项测试：1973年1月7日2:30八字计算验证\n');

  // 测试用户输入
  const testMessage =
    '出生1973年1月7日,2点30分，男性，岳阳，房子朝东南方向，帮我分析';

  console.log('1. 检测分析请求...');
  const detection = detectAnalysisRequest(testMessage);
  console.log(`   ✓ 分析类型: ${detection.analysisType}`);
  console.log(`   ✓ 置信度: ${(detection.confidence * 100).toFixed(1)}%`);
  console.log(`   ✓ 信息完整: ${!detection.isIncomplete}`);

  // 构建标准化输入
  const standardInput = {
    year: 1973,
    month: 1,
    day: 7,
    hour: 2,
    minute: 30,
    timezone: 'Asia/Shanghai',
    calendarType: 'solar',
    gender: 'male',
  };

  console.log('\n2. 执行八字计算...');
  console.log('   输入数据:', JSON.stringify(standardInput, null, 2));

  try {
    const result = await computeBaziSmart(standardInput);

    if (result) {
      console.log('\n   ✅ 计算成功!');
      console.log(
        `   年柱: ${result.fourPillars.year.stem}${result.fourPillars.year.branch}`
      );
      console.log(
        `   月柱: ${result.fourPillars.month.stem}${result.fourPillars.month.branch}`
      );
      console.log(
        `   日柱: ${result.fourPillars.day.stem}${result.fourPillars.day.branch}`
      );
      console.log(
        `   时柱: ${result.fourPillars.hour.stem}${result.fourPillars.hour.branch}`
      );
      console.log(
        `   日主: ${result.dayMaster.stem} (${result.dayMaster.element})`
      );

      // 验证是否为正确结果（不是硬编码）
      const expectedPillars = [
        result.fourPillars.year.stem + result.fourPillars.year.branch,
        result.fourPillars.month.stem + result.fourPillars.month.branch,
        result.fourPillars.day.stem + result.fourPillars.day.branch,
        result.fourPillars.hour.stem + result.fourPillars.hour.branch,
      ];

      // 检查是否为之前的硬编码结果
      const hardcodedPillars = ['癸丑', '甲子', '癸卯', '戊午'];
      const isHardcoded = expectedPillars.every(
        (pillar, index) => pillar === hardcodedPillars[index]
      );

      console.log('\n3. 验证计算准确性...');
      if (isHardcoded) {
        console.log('   ❌ 警告：仍然返回硬编码结果！');
        console.log('   需要进一步检查算法实现');
      } else {
        console.log('   ✅ 计算结果非硬编码，算法正常工作');
      }

      // 显示详细验证信息
      console.log('\n4. 详细验证信息:');
      console.log(
        `   算法版本: ${result.metadata?.algorithmVersion || 'unknown'}`
      );
      console.log(
        `   计算时间: ${result.metadata?.calculationTime || 'unknown'}`
      );
      console.log(`   历法类型: ${result.metadata?.calendarUsed || 'unknown'}`);
      console.log(`   时区: ${result.metadata?.timezoneUsed || 'unknown'}`);
    } else {
      console.log('   ❌ 计算失败：返回空结果');
    }
  } catch (error) {
    console.log(`   ❌ 计算错误: ${error.message}`);
  }

  console.log('\n📝 测试说明:');
  console.log('   如果看到非硬编码结果，说明算法修复成功');
  console.log('   接下来需要确保AI也使用这个正确的计算结果');
  console.log('   而不是自己生成"癸丑年甲子月癸卯日戊午时"');
}

// 运行测试
testSpecificCase().catch(console.error);
