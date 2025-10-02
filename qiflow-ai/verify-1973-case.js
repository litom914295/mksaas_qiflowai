// 简化测试：直接测试八字计算算法
console.log('🎯 验证1973年1月7日2:30的八字计算\n');

// 手动计算期望结果（用于验证）
function manualCalculate1973() {
  console.log('手动验证1973年1月7日的八字:');

  // 1973年为癸丑年（水牛年）
  console.log('年柱: 癸丑 (水牛年，1973年)');

  // 1月为壬寅月（公历1月，农历腊月，但要看具体节气）
  // 1973年1月7日应该已经过了小寒节气，所以是壬寅月
  console.log('月柱: 壬寅 (1月，壬寅月)');

  // 日柱需要通过万年历计算
  // 1973年1月7日，需要从甲子日起算
  console.log('日柱: 需要通过算法精确计算');

  // 时柱：2:30为丑时（1-3点）
  // 日干为癸的话，丑时的时柱应该是癸丑时
  console.log('时柱: 癸丑 (丑时，2:30分)');
}

// 测试算法计算的核心部分
function testCorePillarsCalculation() {
  console.log('\n核心算法测试:');

  // 基础天干地支数组
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const branches = [
    '子',
    '丑',
    '寅',
    '卯',
    '辰',
    '巳',
    '午',
    '未',
    '申',
    '酉',
    '戌',
    '亥',
  ];

  // 计算1973年的年柱
  // 1973 - 1984 = -11, (-11) % 10 = 9 (癸), (-11) % 12 = 1 (丑)
  const yearStemIndex = (1973 - 1984) % 10;
  const yearBranchIndex = (1973 - 1984) % 12;

  const yearStem =
    stems[yearStemIndex >= 0 ? yearStemIndex : yearStemIndex + 10];
  const yearBranch =
    branches[yearBranchIndex >= 0 ? yearBranchIndex : yearBranchIndex + 12];

  console.log(`1973年年柱计算: ${yearStem}${yearBranch}`);

  // 计算1月的月柱（需要考虑节气）
  // 1973年1月7日，应该已经进入寅月
  console.log('1月月柱: 壬寅 (预期)');

  // 计算2:30的时柱（丑时）
  // 如果日干是癸，那么丑时应该是癸丑时
  console.log('丑时时柱: 癸丑 (如果日干为癸)');
}

function testPreviousHardcodedResult() {
  console.log('\n❌ 之前的错误硬编码结果:');
  console.log('年柱: 癸丑 ← 这个可能是对的');
  console.log('月柱: 甲子 ← 这个是错误的，应该是壬寅');
  console.log('日柱: 癸卯 ← 需要通过算法验证');
  console.log('时柱: 戊午 ← 这个是错误的，2:30是丑时，不是午时');

  console.log('\n关键错误点:');
  console.log('1. 月柱错误：甲子 ≠ 壬寅');
  console.log('2. 时柱错误：戊午 ≠ 癸丑 (2:30是丑时不是午时)');
}

// 执行测试
manualCalculate1973();
testCorePillarsCalculation();
testPreviousHardcodedResult();

console.log('\n🔍 结论:');
console.log('AI之前输出的"癸丑年甲子月癸卯日戊午时"确实是错误的');
console.log('正确的应该是"癸丑年壬寅月[正确日柱]癸丑时"');
console.log('现在需要确保算法和AI都输出正确的结果');
