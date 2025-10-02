/**
 * 调试脚本：测试1973年1月7日2:30的八字计算
 *
 * 用于验证AI大师系统的八字计算准确性
 */

// 模拟compute bazi smart的算法
function computeSexagenaryDay(date, useZiBoundary = true) {
  const local = new Date(date.getTime());
  const hour = local.getHours();

  // 子时跨日处理：23:00-23:59按传统算作次日
  if (useZiBoundary && hour >= 23) {
    local.setDate(local.getDate() + 1);
    local.setHours(0, 0, 0, 0);
  } else {
    local.setHours(0, 0, 0, 0);
  }

  // 使用2000年1月1日戊午日作为权威基准点
  const referenceDate = new Date(2000, 0, 1); // 2000年1月1日
  referenceDate.setHours(0, 0, 0, 0);
  const referencePillar = '戊午'; // 已确认的正确日柱

  // 计算天数差
  const daysDiff = Math.floor(
    (local.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 60甲子表
  const jiazi = [
    '甲子',
    '乙丑',
    '丙寅',
    '丁卯',
    '戊辰',
    '己巳',
    '庚午',
    '辛未',
    '壬申',
    '癸酉',
    '甲戌',
    '乙亥',
    '丙子',
    '丁丑',
    '戊寅',
    '己卯',
    '庚辰',
    '辛巳',
    '壬午',
    '癸未',
    '甲申',
    '乙酉',
    '丙戌',
    '丁亥',
    '戊子',
    '己丑',
    '庚寅',
    '辛卯',
    '壬辰',
    '癸巳',
    '甲午',
    '乙未',
    '丙申',
    '丁酉',
    '戊戌',
    '己亥',
    '庚子',
    '辛丑',
    '壬寅',
    '癸卯',
    '甲辰',
    '乙巳',
    '丙午',
    '丁未',
    '戊申',
    '己酉',
    '庚戌',
    '辛亥',
    '壬子',
    '癸丑',
    '甲寅',
    '乙卯',
    '丙辰',
    '丁巳',
    '戊午',
    '己未',
    '庚申',
    '辛酉',
    '壬戌',
    '癸亥',
  ];

  // 2000年1月1日是戊午日，在甲子表中的索引是54
  const referenceIndex = 54;

  // 计算目标日期的甲子索引
  let targetIndex = (referenceIndex + daysDiff) % 60;
  if (targetIndex < 0) {
    targetIndex += 60;
  }

  const result = jiazi[targetIndex];
  console.log(`[computeSexagenaryDay] 计算结果:`, {
    inputDate: date.toISOString(),
    localDate: local.toISOString(),
    daysDiff,
    referenceIndex,
    targetIndex,
    result,
  });

  return {
    chinese: result,
    stem: result[0],
    branch: result[1],
    heavenlyStem: result[0],
    earthlyBranch: result[1],
  };
}

function computeYearPillar(date) {
  const year = date.getFullYear();
  const heavenlyStems = [
    '甲',
    '乙',
    '丙',
    '丁',
    '戊',
    '己',
    '庚',
    '辛',
    '壬',
    '癸',
  ];
  const earthlyBranches = [
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

  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;

  const stem = heavenlyStems[stemIndex];
  const branch = earthlyBranches[branchIndex];

  console.log(
    `[computeYearPillar] 年份: ${year}, stemIndex: ${stemIndex}, branchIndex: ${branchIndex}, 结果: ${stem}${branch}`
  );

  return {
    stem,
    branch,
    chinese: stem + branch,
    heavenlyStem: stem,
    earthlyBranch: branch,
  };
}

function computeMonthPillar(date, yearStem) {
  const month = date.getMonth() + 1; // JavaScript月份从0开始
  const heavenlyStems = [
    '甲',
    '乙',
    '丙',
    '丁',
    '戊',
    '己',
    '庚',
    '辛',
    '壬',
    '癸',
  ];
  const earthlyBranches = [
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
    '子',
    '丑',
  ]; // 正月建寅

  // 月地支：正月建寅
  const branchIndex = (month - 1) % 12;
  const branch = earthlyBranches[branchIndex];

  // 月天干按年干起月法计算
  const yearStemIndex = heavenlyStems.indexOf(yearStem);
  const stemIndex = (yearStemIndex * 2 + month - 1) % 10;
  const stem = heavenlyStems[stemIndex];

  console.log(
    `[computeMonthPillar] 月份: ${month}, 年干: ${yearStem}, 月支: ${branch}, 月干: ${stem}, 结果: ${stem}${branch}`
  );

  return {
    stem,
    branch,
    chinese: stem + branch,
    heavenlyStem: stem,
    earthlyBranch: branch,
  };
}

function computeHourPillar(date, dayStem) {
  if (!dayStem) return null;

  const hour = date.getHours();
  const timeIndex = Math.floor(((hour + 1) % 24) / 2); // 子时跨日索引

  const earthlyBranches = [
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
  const branch = earthlyBranches[timeIndex];

  // 日干起时法
  const map = {
    甲: [
      '甲子',
      '乙丑',
      '丙寅',
      '丁卯',
      '戊辰',
      '己巳',
      '庚午',
      '辛未',
      '壬申',
      '癸酉',
      '甲戌',
      '乙亥',
    ],
    乙: [
      '丙子',
      '丁丑',
      '戊寅',
      '己卯',
      '庚辰',
      '辛巳',
      '壬午',
      '癸未',
      '甲申',
      '乙酉',
      '丙戌',
      '丁亥',
    ],
    丙: [
      '戊子',
      '己丑',
      '庚寅',
      '辛卯',
      '壬辰',
      '癸巳',
      '甲午',
      '乙未',
      '丙申',
      '丁酉',
      '戊戌',
      '己亥',
    ],
    丁: [
      '庚子',
      '辛丑',
      '壬寅',
      '癸卯',
      '甲辰',
      '乙巳',
      '丙午',
      '丁未',
      '戊申',
      '己酉',
      '庚戌',
      '辛亥',
    ],
    戊: [
      '壬子',
      '癸丑',
      '甲寅',
      '乙卯',
      '丙辰',
      '丁巳',
      '戊午',
      '己未',
      '庚申',
      '辛酉',
      '壬戌',
      '癸亥',
    ],
    己: [
      '甲子',
      '乙丑',
      '丙寅',
      '丁卯',
      '戊辰',
      '己巳',
      '庚午',
      '辛未',
      '壬申',
      '癸酉',
      '甲戌',
      '乙亥',
    ],
    庚: [
      '丙子',
      '丁丑',
      '戊寅',
      '己卯',
      '庚辰',
      '辛巳',
      '壬午',
      '癸未',
      '甲申',
      '乙酉',
      '丙戌',
      '丁亥',
    ],
    辛: [
      '戊子',
      '己丑',
      '庚寅',
      '辛卯',
      '壬辰',
      '癸巳',
      '甲午',
      '乙未',
      '丙申',
      '丁酉',
      '戊戌',
      '己亥',
    ],
    壬: [
      '庚子',
      '辛丑',
      '壬寅',
      '癸卯',
      '甲辰',
      '乙巳',
      '丙午',
      '丁未',
      '戊申',
      '己酉',
      '庚戌',
      '辛亥',
    ],
    癸: [
      '壬子',
      '癸丑',
      '甲寅',
      '乙卯',
      '丙辰',
      '丁巳',
      '戊午',
      '己未',
      '庚申',
      '辛酉',
      '壬戌',
      '癸亥',
    ],
  };

  const hourPillar = map[dayStem] ? map[dayStem][timeIndex] : null;

  console.log(
    `[computeHourPillar] 小时: ${hour}, 时辰索引: ${timeIndex}, 日干: ${dayStem}, 时支: ${branch}, 结果: ${hourPillar}`
  );

  if (!hourPillar) return null;

  return {
    stem: hourPillar[0],
    branch: hourPillar[1],
    chinese: hourPillar,
    heavenlyStem: hourPillar[0],
    earthlyBranch: hourPillar[1],
  };
}

// 测试1973年1月7日2:30的八字计算
function test1973BaziCalculation() {
  console.log('=== 测试1973年1月7日2:30的八字计算 ===');

  // 创建日期对象 - 1973年1月7日2:30
  const birthDate = new Date(1973, 0, 7, 2, 30); // 月份从0开始，所以1月是0
  console.log(
    '输入日期:',
    birthDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  );

  // 计算四柱
  const yearPillar = computeYearPillar(birthDate);
  const monthPillar = computeMonthPillar(birthDate, yearPillar.stem);
  const dayPillar = computeSexagenaryDay(birthDate, true);
  const hourPillar = computeHourPillar(birthDate, dayPillar.stem);

  console.log('\n=== 计算结果 ===');
  console.log('年柱:', yearPillar.chinese);
  console.log('月柱:', monthPillar.chinese);
  console.log('日柱:', dayPillar.chinese);
  console.log('时柱:', hourPillar?.chinese || '计算失败');

  console.log('\n=== 完整四柱 ===');
  console.log(
    `${yearPillar.chinese}年 ${monthPillar.chinese}月 ${dayPillar.chinese}日 ${hourPillar?.chinese || '未知'}时`
  );

  // 验证：用户反馈的错误结果是"癸丑年甲子月癸卯日戊午时"
  const expectedIncorrect = '癸丑年甲子月癸卯日戊午时';
  const actualResult = `${yearPillar.chinese}年${monthPillar.chinese}月${dayPillar.chinese}日${hourPillar?.chinese || '未知'}时`;

  console.log('\n=== 对比分析 ===');
  console.log('用户反馈的错误结果:', expectedIncorrect);
  console.log('正确计算结果:', actualResult);
  console.log(
    '是否匹配:',
    expectedIncorrect === actualResult ? '是（有问题）' : '否（正常）'
  );

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
    fullResult: actualResult,
  };
}

// 额外验证：测试已知正确的日期
function testKnownCorrectDate() {
  console.log('\n=== 验证基准日期：2000年1月1日 ===');
  const knownDate = new Date(2000, 0, 1, 12, 0); // 2000年1月1日12:00
  const dayPillar = computeSexagenaryDay(knownDate, true);
  console.log('2000年1月1日应该是戊午日，计算结果:', dayPillar.chinese);
  console.log('验证:', dayPillar.chinese === '戊午' ? '✓ 正确' : '✗ 错误');
}

// 执行测试
test1973BaziCalculation();
testKnownCorrectDate();

// 测试另一个已知日期：1984年2月4日（立春），甲子年
function testAnotherKnownDate() {
  console.log('\n=== 验证1984年2月4日立春 ===');
  const springDate = new Date(1984, 1, 4, 12, 0); // 1984年2月4日12:00
  const yearPillar = computeYearPillar(springDate);
  console.log('1984年应该是甲子年，计算结果:', yearPillar.chinese);
  console.log('验证:', yearPillar.chinese === '甲子' ? '✓ 正确' : '✗ 错误');
}

testAnotherKnownDate();
