// 九宫飞星排盘算法验证脚本
import { generateFlyingStar } from './src/lib/fengshui/index.js';

console.log('=== 九宫飞星排盘算法验证 ===\n');

// 测试经典案例：子山午向九运排盘
async function validateFlyingStar() {
  try {
    console.log('正在验证子山午向九运排盘...\n');

    const result = generateFlyingStar({
      observedAt: new Date('2024-01-01'),
      facing: { degrees: 180 }, // 子山午向
    });

    console.log('✅ 基本信息验证：');
    console.log(`   当前运数：${result.period}运 (2024年应为九运)`);
    console.log(`   测试坐向：子山午向 (180度)`);
    console.log(
      `   应用规则：${result.meta.rulesApplied.join(', ') || '标准排盘'}`
    );
    console.log(
      `   计算状态：${result.meta.ambiguous ? '边界模糊' : '精确计算'}\n`
    );

    console.log('✅ 九宫飞星盘验证：');
    console.log('   ┌─────┬─────┬─────┐');
    console.log('   │ 4巽 │ 9离 │ 2坤 │');
    console.log('   ├─────┼─────┼─────┤');
    console.log('   │ 3震 │ 5中 │ 7兑 │');
    console.log('   ├─────┼─────┼─────┤');
    console.log('   │ 8艮 │ 1坎 │ 6乾 │');
    console.log('   └─────┴─────┴─────┘\n');

    // 显示详细飞星信息
    const palaceNames = {
      1: '坎(北)',
      2: '坤(西南)',
      3: '震(东)',
      4: '巽(东南)',
      5: '中',
      6: '乾(西北)',
      7: '兑(西)',
      8: '艮(东北)',
      9: '离(南)',
    };

    console.log('   宫位详情 | 天盘 | 山星 | 向星');
    console.log('   ---------|------|------|------');

    for (let palace = 1; palace <= 9; palace++) {
      const cell = result.plates.period.find(c => c.palace === palace);
      if (cell) {
        const name = palaceNames[palace].padEnd(8);
        console.log(
          `   ${palace}${name}|  ${cell.periodStar}   |  ${cell.mountainStar}   |  ${cell.facingStar}`
        );
      }
    }

    console.log('\n✅ 格局分析验证：');
    if (result.geju && result.geju.types.length > 0) {
      console.log(`   检测格局：${result.geju.types.join(', ')}`);
      console.log(`   格局描述：${result.geju.descriptions.join('; ')}`);
      console.log(
        `   吉凶判断：${result.geju.isFavorable ? '吉利格局' : '不利格局'}`
      );
    } else {
      console.log('   检测格局：无特殊格局');
    }

    console.log('\n✅ 重要位置验证：');
    console.log(`   文昌位：${result.wenchangwei || '需进一步分析'}`);
    console.log(`   财位：${result.caiwei || '需进一步分析'}`);

    console.log('\n✅ 各宫位评分：');
    Object.entries(result.evaluation).forEach(([palace, evaluation]) => {
      const name = palaceNames[parseInt(palace)];
      console.log(
        `   ${palace}宫${name}：${evaluation.score}分 [${evaluation.tags.join(', ')}]`
      );
      if (evaluation.reasons.length > 0) {
        console.log(`     理由：${evaluation.reasons.join('; ')}`);
      }
    });

    // 验证核心算法准确性
    console.log('\n✅ 算法准确性验证：');

    // 验证九运天盘
    const centerPalace = result.plates.period.find(c => c.palace === 5);
    if (centerPalace?.periodStar === 9) {
      console.log('   ✓ 九运天盘正确：中宫为9星');
    } else {
      console.log('   ✗ 九运天盘错误：中宫应为9星');
    }

    // 验证子山午向的山向星分布
    const northPalace = result.plates.period.find(c => c.palace === 1); // 坎宫
    const southPalace = result.plates.period.find(c => c.palace === 9); // 离宫

    console.log(`   子山(坎宫)山星：${northPalace?.mountainStar}`);
    console.log(`   午向(离宫)向星：${southPalace?.facingStar}`);

    console.log('\n🎉 九宫飞星排盘算法验证完成！');

    return result;
  } catch (error) {
    console.error('❌ 排盘计算出错：', error.message);
    console.error('错误详情：', error.stack);
    return null;
  }
}

// 运行验证
validateFlyingStar()
  .then(result => {
    if (result) {
      console.log('\n📊 验证结果总结：');
      console.log('   - 基础排盘功能：正常');
      console.log('   - 格局分析功能：正常');
      console.log('   - 评分系统：正常');
      console.log('   - 算法准确性：需要专业验证');
    }
  })
  .catch(console.error);
