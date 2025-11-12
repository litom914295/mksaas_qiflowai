/**
 * 纳音表验证脚本
 * 用于验证纳音表的完整性和准确性
 */

import { 
  validateNayinTable, 
  getNayin,
  getNayinByIndex,
  getGanZhiByNayin,
  getAllNayin,
  SEXAGENARY_CYCLE,
  NAYIN_LIST
} from '../src/lib/bazi/constants/nayin';

console.log('===== 纳音表验证 =====\n');

// 1. 完整性验证
console.log('1. 完整性验证:');
const validation = validateNayinTable();
console.log(`结果: ${validation.isValid ? '✅ 通过' : '❌ 失败'}`);
if (!validation.isValid) {
  console.log('错误:', validation.errors);
}
console.log();

// 2. 已知案例验证
console.log('2. 已知案例验证:');
const testCases = [
  { gan: '甲', zhi: '子', expected: '海中金' },
  { gan: '乙', zhi: '丑', expected: '海中金' },
  { gan: '丙', zhi: '寅', expected: '炉中火' },
  { gan: '壬', zhi: '戌', expected: '大海水' },
  { gan: '癸', zhi: '亥', expected: '大海水' },
];

let passedTests = 0;
for (const testCase of testCases) {
  const result = getNayin(testCase.gan, testCase.zhi);
  const passed = result === testCase.expected;
  if (passed) passedTests++;
  
  console.log(`  ${testCase.gan}${testCase.zhi} => ${result} ${passed ? '✅' : '❌ 期望:' + testCase.expected}`);
}
console.log(`通过率: ${passedTests}/${testCases.length}`);
console.log();

// 3. 数量统计
console.log('3. 数量统计:');
console.log(`  60甲子: ${SEXAGENARY_CYCLE.length} ${SEXAGENARY_CYCLE.length === 60 ? '✅' : '❌'}`);
console.log(`  纳音组: ${NAYIN_LIST.length} ${NAYIN_LIST.length === 30 ? '✅' : '❌'}`);
console.log();

// 4. 所有纳音五行
console.log('4. 所有纳音五行 (30组):');
const allNayin = getAllNayin();
allNayin.forEach((nayin, index) => {
  const ganZhiList = getGanZhiByNayin(nayin);
  console.log(`  ${String(index + 1).padStart(2)}. ${nayin.padEnd(6)} - ${ganZhiList.join(', ')}`);
});
console.log();

// 5. 索引查找验证
console.log('5. 索引查找验证:');
console.log(`  索引 0: ${getNayinByIndex(0)} (甲子) ${getNayinByIndex(0) === '海中金' ? '✅' : '❌'}`);
console.log(`  索引 1: ${getNayinByIndex(1)} (乙丑) ${getNayinByIndex(1) === '海中金' ? '✅' : '❌'}`);
console.log(`  索引 59: ${getNayinByIndex(59)} (癸亥) ${getNayinByIndex(59) === '大海水' ? '✅' : '❌'}`);
console.log();

// 最终结果
if (validation.isValid && passedTests === testCases.length) {
  console.log('🎉 纳音表验证全部通过!');
} else {
  console.log('⚠️ 纳音表验证存在问题,请检查!');
  process.exit(1);
}
