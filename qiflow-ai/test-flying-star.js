// 九宫飞星排盘算法验证脚本
import { generateFlyingStar } from './src/lib/fengshui/index.js';

// 测试经典案例：子山午向九运排盘
console.log('=== 九宫飞星排盘算法验证 ===\n');

try {
  // 子山午向（坐北朝南，180度）九运排盘
  const result = generateFlyingStar({
    observedAt: new Date('2024-01-01'),
    facing: { degrees: 180 },
  });

  console.log('1. 基本信息：');
  console.log(`   运数：${result.period}运`);
  console.log(`   坐向：子山午向`);
  console.log(`   规则应用：${result.meta.rulesApplied.join(', ') || '无'}`);
  console.log(`   是否模糊：${result.meta.ambiguous ? '是' : '否'}\n`);

  console.log('2. 九宫飞星盘：');
  console.log('   宫位 | 天盘 | 山星 | 向星');
  console.log('   -----|------|------|------');

  // 按九宫顺序显示（4 9 2 / 3 5 7 / 8 1 6）
  const displayOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
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

  for (let i = 0; i < 9; i++) {
    const palace = displayOrder[i];
    const cell = result.plates.period.find(c => c.palace === palace);
    if (cell) {
      console.log(
        `   ${palace}${palaceNames[palace]} |  ${cell.periodStar}   |  ${cell.mountainStar}   |  ${cell.facingStar}`
      );
    }

    // 每三个换行
    if ((i + 1) % 3 === 0 && i < 8) {
      console.log('   -----|------|------|------');
    }
  }

  console.log('\n3. 格局分析：');
  if (result.geju) {
    console.log(`   格局类型：${result.geju.types.join(', ') || '无特殊格局'}`);
    console.log(`   格局描述：${result.geju.descriptions.join('; ') || '无'}`);
    console.log(`   吉凶判断：${result.geju.isFavorable ? '吉' : '凶'}`);
  }

  console.log('\n4. 特殊位置：');
  console.log(`   文昌位：${result.wenchangwei || '未确定'}`);
  console.log(`   财位：${result.caiwei || '未确定'}`);

  console.log('\n5. 各宫评分：');
  Object.entries(result.evaluation).forEach(([palace, eval]) => {
    console.log(`   ${palace}宫：${eval.score}分 (${eval.tags.join(', ')})`);
  });
} catch (error) {
  console.error('排盘计算出错：', error.message);
}
