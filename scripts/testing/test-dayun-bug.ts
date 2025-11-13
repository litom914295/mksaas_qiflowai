/**
 * 测试大运计算bug
 * 用户反馈：2024-03-04 11:03 出生，显示正在走34-43岁大运
 */

import { DayunLiuNianCalculator } from '../../src/lib/bazi-pro/core/calculator/dayun-liunian';
import { FourPillarsCalculator } from '../../src/lib/bazi-pro/core/calculator/four-pillars';

// 测试用例
const birthInfo = {
  date: '2024-03-04',
  time: '11:03',
  longitude: 120,
  isLunar: false,
  gender: 'male' as const,
};

console.log('====== 测试大运计算Bug ======');
console.log('出生日期时间:', birthInfo.date, birthInfo.time);
console.log('性别:', birthInfo.gender);
console.log('');

// 1. 计算四柱
const fourPillarsCalc = new FourPillarsCalculator();
const fourPillars = fourPillarsCalc.calculate(birthInfo);

console.log('四柱八字:');
console.log('  年柱:', fourPillars.year.gan + fourPillars.year.zhi);
console.log('  月柱:', fourPillars.month.gan + fourPillars.month.zhi);
console.log('  日柱:', fourPillars.day.gan + fourPillars.day.zhi);
console.log('  时柱:', fourPillars.hour.gan + fourPillars.hour.zhi);
console.log('');

// 2. 计算大运
const dayunCalc = new DayunLiuNianCalculator();
const birthDate = new Date('2024-03-04T11:03:00');
const genderCN = birthInfo.gender === 'male' ? '男' : '女';

const dayunAnalysis = dayunCalc.calculateDayun(
  fourPillars,
  genderCN,
  birthDate
);

console.log('大运计算结果:');
console.log('  起运年龄:', dayunAnalysis.qiYunAge, '岁');
console.log('  起运日期:', dayunAnalysis.qiYunDate.toISOString().split('T')[0]);
console.log('');

console.log('大运列表:');
dayunAnalysis.dayunList.forEach((dayun) => {
  console.log(
    `  第${dayun.index}大运: ${dayun.ganZhi}  ${dayun.startAge}-${dayun.endAge}岁  (${dayun.startYear}-${dayun.endYear}年)`
  );
});
console.log('');

// 3. 当前年龄计算
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const currentDay = new Date().getDate();

console.log('当前日期:', `${currentYear}-${currentMonth}-${currentDay}`);
console.log('');

// 问题代码：只用年份相减
const wrongAge = currentYear - birthDate.getFullYear();
console.log('❌ 错误的年龄计算（只用年份）:', wrongAge, '岁');

// 正确的年龄计算：考虑月日
const birthMonth = birthDate.getMonth() + 1;
const birthDay = birthDate.getDate();
let correctAge = currentYear - birthDate.getFullYear();
if (
  currentMonth < birthMonth ||
  (currentMonth === birthMonth && currentDay < birthDay)
) {
  correctAge--;
}
console.log('✅ 正确的年龄计算（考虑月日）:', correctAge, '岁');
console.log('');

// 4. 当前大运
console.log('当前大运匹配:');
const wrongCurrentDayun = dayunAnalysis.dayunList.find(
  (d) => wrongAge >= d.startAge && wrongAge <= d.endAge
);
console.log(
  '  用错误年龄匹配:',
  wrongCurrentDayun
    ? `第${wrongCurrentDayun.index}大运 ${wrongCurrentDayun.ganZhi} (${wrongCurrentDayun.startAge}-${wrongCurrentDayun.endAge}岁)`
    : '无匹配'
);

const correctCurrentDayun = dayunAnalysis.dayunList.find(
  (d) => correctAge >= d.startAge && correctAge <= d.endAge
);
console.log(
  '  用正确年龄匹配:',
  correctCurrentDayun
    ? `第${correctCurrentDayun.index}大运 ${correctCurrentDayun.ganZhi} (${correctCurrentDayun.startAge}-${correctCurrentDayun.endAge}岁)`
    : '尚未起运'
);
console.log('');

// 5. 分析问题
console.log('====== 问题分析 ======');
console.log('1. 起运年龄是:', dayunAnalysis.qiYunAge, '岁');
if (dayunAnalysis.qiYunAge > 20) {
  console.log('   ⚠️  起运年龄异常偏大！正常应该在1-10岁之间');
}
console.log('2. 当前实际年龄:', correctAge, '岁（不到', correctAge + 1, '岁）');
console.log(
  '3. 如果起运年龄正常，当前应该是:',
  correctAge < dayunAnalysis.qiYunAge ? '尚未起运' : '已起运'
);
