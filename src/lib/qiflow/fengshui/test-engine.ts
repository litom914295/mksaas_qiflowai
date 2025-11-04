/**
 * 个性化风水引擎测试脚本
 *
 * 用于验证核心功能是否正常运作
 *
 * @author 玄空风水大师团队
 * @version 6.0.0
 */

import {
  type BaziInfo,
  type HouseInfo,
  PersonalizedFengshuiEngine,
  type PersonalizedFengshuiInput,
  RoomLayout,
  type TimeInfo,
} from './personalized-engine';

/**
 * 测试场景1：标准住宅分析
 */
async function testStandardHouse() {
  console.log('\n========== 测试场景1：标准住宅分析 ==========\n');

  // 模拟八字信息
  const bazi: BaziInfo = {
    dayMaster: 'water',
    favorableElements: ['metal', 'water'],
    unfavorableElements: ['earth', 'wood'],
    season: 'winter',
    strength: 6,
  };

  // 模拟房屋信息（九运，朝南，2024年建）
  const house: HouseInfo = {
    facing: 180, // 正南
    period: 9, // 九运
    buildYear: 2024,
    floor: 15,
    layout: [
      {
        id: 'room-1',
        type: 'entrance',
        name: '入户门',
        position: 9, // 离宫（正南）
      },
      {
        id: 'room-2',
        type: 'living',
        name: '客厅',
        position: 5, // 中宫
        area: 30,
      },
      {
        id: 'room-3',
        type: 'bedroom',
        name: '主卧',
        position: 8, // 艮宫（东北）
        isPrimary: true,
        area: 20,
      },
      {
        id: 'room-4',
        type: 'bedroom',
        name: '次卧',
        position: 4, // 巽宫（东南）
        area: 15,
      },
      {
        id: 'room-5',
        type: 'kitchen',
        name: '厨房',
        position: 3, // 震宫（正东）
        area: 10,
      },
      {
        id: 'room-6',
        type: 'bathroom',
        name: '卫生间',
        position: 1, // 坎宫（正北）
        area: 6,
      },
    ],
    address: '北京市朝阳区',
  };

  // 模拟时间信息
  const time: TimeInfo = {
    currentYear: 2025,
    currentMonth: 1,
  };

  // 组装输入
  const input: PersonalizedFengshuiInput = {
    bazi,
    house,
    time,
  };

  try {
    // 调用引擎
    console.time('分析耗时');
    const result = await PersonalizedFengshuiEngine.analyze(input);
    console.timeEnd('分析耗时');

    // 输出结果
    console.log('\n========== 分析结果 ==========\n');

    console.log(`总体评分：${result.overallScore} / 100`);
    console.log(`评分等级：${result.scoreLevel}`);
    console.log('\n评分明细：');
    console.log(`  - 格局评分：${result.scoreBreakdown.layout}`);
    console.log(`  - 八字匹配度：${result.scoreBreakdown.baziMatch}`);
    console.log(`  - 流年吉凶：${result.scoreBreakdown.annual}`);
    console.log(`  - 房间功能：${result.scoreBreakdown.roomFunction}`);
    console.log(`  - 化解措施：${result.scoreBreakdown.remedy}`);

    console.log(`\n紧急问题数量：${result.urgentIssues.length}`);
    if (result.urgentIssues.length > 0) {
      console.log('\n前3个紧急问题：');
      result.urgentIssues.slice(0, 3).forEach((issue, index) => {
        console.log(`\n  ${index + 1}. [${issue.severity}] ${issue.title}`);
        console.log(`     位置：${issue.location}`);
        console.log(`     描述：${issue.description.substring(0, 60)}...`);
        console.log(`     主要影响：${issue.impact.slice(0, 2).join('、')}`);
      });
    }

    console.log(`\n关键位置数量：${result.keyPositions.length}`);
    console.log(`房间建议数量：${result.roomAdvice.length}`);
    console.log(`月运预测数量：${result.monthlyForecast.length}`);
    console.log(`行动计划数量：${result.actionPlan.length}`);
    console.log(`购物清单数量：${result.shoppingList.length}`);

    console.log('\n个性化定制：');
    console.log(
      `  - 是否个性化：${result.personalization.isPersonalized ? '是' : '否'}`
    );
    console.log(
      `  - 考虑八字：${result.personalization.baziConsidered ? '是' : '否'}`
    );
    console.log(
      `  - 喜用神：${result.personalization.favorableElementsUsed.join('、')}`
    );
    console.log(
      `  - 忌神：${result.personalization.unfavorableElementsAvoided.join('、')}`
    );
    console.log('  - 定制项：');
    result.personalization.customizations.forEach((item) => {
      console.log(`    * ${item}`);
    });

    console.log('\n========== 测试通过 ==========\n');

    return result;
  } catch (error) {
    console.error('\n========== 测试失败 ==========\n');
    console.error(error);
    throw error;
  }
}

/**
 * 主测试函数
 */
export async function runTests() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════╗');
  console.log('║   个性化风水引擎 v6.0 - 系统测试        ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('\n');

  try {
    // 运行测试场景
    await testStandardHouse();

    console.log('\n');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   所有测试通过！系统运行正常。          ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('\n');
  } catch (error) {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║   测试失败！请检查错误信息。            ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log('\n');
    throw error;
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
