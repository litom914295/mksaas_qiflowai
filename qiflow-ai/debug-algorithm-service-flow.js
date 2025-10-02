/**
 * 测试algorithmFirstService的完整数据流
 * 模拟用户输入："出生1973年1月7日,2点30分，男性，岳阳，房子朝东南方向，帮我分析"
 */

const testMessage =
  '出生1973年1月7日,2点30分，男性，岳阳，房子朝东南方向，帮我分析';

// 模拟algorithmFirstService的extractBirthInfo方法
function extractBirthInfo(message) {
  const birthInfo = {};

  console.log('[extractBirthInfo] 开始提取出生信息，消息:', message);

  // 提取性别
  if (message.includes('男') || message.includes('男性')) {
    birthInfo.gender = 'male';
    console.log('[extractBirthInfo] 提取到性别: 男');
  } else if (message.includes('女') || message.includes('女性')) {
    birthInfo.gender = 'female';
    console.log('[extractBirthInfo] 提取到性别: 女');
  }

  // 提取日期时间 - 支持多种格式（按优先级排序，先匹配精确格式）
  let dateTimeMatch = message.match(
    /(\d{4})年(\d{1,2})月(\d{1,2})日[，,](\d{1,2})点(\d{1,2})分/
  );
  if (!dateTimeMatch) {
    // 尝试格式：1973年1月7日2点30分（无逗号）
    dateTimeMatch = message.match(
      /(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})点(\d{1,2})分/
    );
  }
  if (!dateTimeMatch) {
    // 尝试数字格式：1990年5月15日14时30分
    dateTimeMatch = message.match(
      /(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})时\d{1,2}分/
    );
  }
  if (!dateTimeMatch) {
    // 尝试格式：1990年5月15日14时
    dateTimeMatch = message.match(/(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})时/);
  }
  if (!dateTimeMatch) {
    // 尝试其他格式
    dateTimeMatch = message.match(
      /(\d{4})[年\-/](\d{1,2})[月\-/](\d{1,2})[日\s](\d{1,2})[时点]/
    );
  }
  if (!dateTimeMatch) {
    // 尝试更宽松的格式
    dateTimeMatch = message.match(
      /(\d{4}).*?(\d{1,2}).*?(\d{1,2}).*?(\d{1,2})/
    );
  }
  if (!dateTimeMatch) {
    // 尝试纯数字格式：1990-5-15-14
    dateTimeMatch = message.match(/(\d{4})-(\d{1,2})-(\d{1,2})-(\d{1,2})/);
  }
  if (!dateTimeMatch) {
    // 尝试格式：1973-1-7,2点半
    dateTimeMatch = message.match(/(\d{4})-(\d{1,2})-(\d{1,2}),(\d{1,2})点半/);
  }
  if (!dateTimeMatch) {
    // 尝试格式：1973-1-7,2点
    dateTimeMatch = message.match(/(\d{4})-(\d{1,2})-(\d{1,2}),(\d{1,2})点/);
  }
  if (!dateTimeMatch) {
    // 尝试格式：1973-1-7 2点半
    dateTimeMatch = message.match(
      /(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2})点半/
    );
  }
  if (!dateTimeMatch) {
    // 尝试格式：1973-1-7 2点
    dateTimeMatch = message.match(/(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2})点/);
  }

  if (dateTimeMatch) {
    // 根据匹配的格式调整解析逻辑
    let year,
      month,
      day,
      hour,
      minute = 0;

    console.log(
      '[extractBirthInfo] 匹配结果长度:',
      dateTimeMatch.length,
      '内容:',
      dateTimeMatch
    );

    if (dateTimeMatch.length === 6) {
      // 格式：1973年1月7日，2点30分 - 有5个捕获组 + 完整匹配 = 6
      [, year, month, day, hour, minute] = dateTimeMatch;
      console.log(
        '[extractBirthInfo] 使用6元素格式解析:',
        year + '年' + month + '月' + day + '日' + hour + '时' + minute + '分'
      );
    } else if (dateTimeMatch.length === 7) {
      // 格式：1973年1月7日2点30分 - 有6个捕获组 + 完整匹配 = 7
      [, year, month, day, hour, minute] = dateTimeMatch;
      console.log(
        '[extractBirthInfo] 使用7元素格式解析:',
        year + '年' + month + '月' + day + '日' + hour + '时' + minute + '分'
      );
    } else if (dateTimeMatch.length === 5) {
      // 格式：1973年1月7日2时 - 有4个捕获组 + 完整匹配 = 5
      [, year, month, day, hour] = dateTimeMatch;
      console.log(
        '[extractBirthInfo] 使用5元素格式解析:',
        year + '年' + month + '月' + day + '日' + hour + '时'
      );
    } else {
      // 其他格式 - 有4个捕获组
      [, year, month, day, hour] = dateTimeMatch;
      console.log(
        '[extractBirthInfo] 使用默认格式解析:',
        year + '年' + month + '月' + day + '日' + hour + '时'
      );
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const hourNum = parseInt(hour);
    const minuteNum = parseInt(minute) || 0;

    console.log(
      '[extractBirthInfo] 匹配到日期时间:',
      yearNum + '年' + monthNum + '月' + dayNum + '日' + hourNum + '时'
    );

    // 验证日期有效性
    if (
      yearNum >= 1900 &&
      yearNum <= 2100 &&
      monthNum >= 1 &&
      monthNum <= 12 &&
      dayNum >= 1 &&
      dayNum <= 31 &&
      hourNum >= 0 &&
      hourNum <= 23
    ) {
      // 转换为ISO字符串格式（使用本地时区）
      const date = new Date(yearNum, monthNum - 1, dayNum, hourNum, minuteNum);
      // 格式化为 YYYY-MM-DDTHH:mm 格式，保持本地时间
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hour = String(date.getHours()).padStart(2, '0');
      const minute = String(date.getMinutes()).padStart(2, '0');
      birthInfo.datetime = `${year}-${month}-${day}T${hour}:${minute}`;
      birthInfo.isTimeKnown = true;

      console.log(
        '[extractBirthInfo] 成功提取出生信息:',
        yearNum +
          '年' +
          monthNum +
          '月' +
          dayNum +
          '日' +
          hourNum +
          '时' +
          minuteNum +
          '分',
        '->',
        birthInfo.datetime
      );
    } else {
      console.log(
        '[extractBirthInfo] 日期时间验证失败:',
        yearNum + '年' + monthNum + '月' + dayNum + '日' + hourNum + '时'
      );
    }
  } else {
    console.log('[extractBirthInfo] 未匹配到有效的日期时间格式');
  }

  return birthInfo;
}

// 模拟standardizedInput的构造
function createStandardizedInput(message) {
  const birthInfo = extractBirthInfo(message);

  const standardizedInput = {
    birthInfo: birthInfo.datetime
      ? {
          datetime: birthInfo.datetime,
          gender: birthInfo.gender || 'unknown',
          timezone: 'Asia/Shanghai',
          isTimeKnown: birthInfo.isTimeKnown !== false,
          preferredLocale: 'zh-CN',
        }
      : null,
    houseInfo: null, // 简化，不处理房屋信息
    originalMessage: message,
  };

  console.log('\n=== 标准化输入数据 ===');
  console.log(JSON.stringify(standardizedInput, null, 2));

  return standardizedInput;
}

// 模拟computeBaziSmart调用
function simulateComputeBaziSmart(birthData) {
  console.log('\n=== 模拟computeBaziSmart调用 ===');
  console.log('输入参数:', JSON.stringify(birthData, null, 2));

  // 解析datetime字符串
  const [datePart, timePart] = birthData.datetime.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);

  console.log('解析的日期时间:', { year, month, day, hour, minute });

  // 创建Date对象
  const birthDate = new Date(year, month - 1, day, hour, minute);
  console.log(
    '创建的Date对象:',
    birthDate.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
  );

  // 使用之前的算法计算四柱
  const yearPillar = computeYearPillar(birthDate);
  const monthPillar = computeMonthPillar(birthDate, yearPillar.stem);
  const dayPillar = computeSexagenaryDay(birthDate, true);
  const hourPillar = computeHourPillar(birthDate, dayPillar.stem);

  console.log('计算的四柱:');
  console.log('年柱:', yearPillar.chinese);
  console.log('月柱:', monthPillar.chinese);
  console.log('日柱:', dayPillar.chinese);
  console.log('时柱:', hourPillar?.chinese || '计算失败');

  return {
    pillars: {
      year: yearPillar,
      month: monthPillar,
      day: dayPillar,
      hour: hourPillar,
    },
    success: true,
  };
}

// 从前面的脚本复制必要的函数
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

  return {
    stem,
    branch,
    chinese: stem + branch,
    heavenlyStem: stem,
    earthlyBranch: branch,
  };
}

function computeMonthPillar(date, yearStem) {
  const month = date.getMonth() + 1;
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
  ];

  const branchIndex = (month - 1) % 12;
  const branch = earthlyBranches[branchIndex];

  const yearStemIndex = heavenlyStems.indexOf(yearStem);
  const stemIndex = (yearStemIndex * 2 + month - 1) % 10;
  const stem = heavenlyStems[stemIndex];

  return {
    stem,
    branch,
    chinese: stem + branch,
    heavenlyStem: stem,
    earthlyBranch: branch,
  };
}

function computeSexagenaryDay(date, useZiBoundary = true) {
  const local = new Date(date.getTime());
  const hour = local.getHours();

  if (useZiBoundary && hour >= 23) {
    local.setDate(local.getDate() + 1);
    local.setHours(0, 0, 0, 0);
  } else {
    local.setHours(0, 0, 0, 0);
  }

  const referenceDate = new Date(2000, 0, 1);
  referenceDate.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor(
    (local.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
  );

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

  const referenceIndex = 54;
  let targetIndex = (referenceIndex + daysDiff) % 60;
  if (targetIndex < 0) {
    targetIndex += 60;
  }

  const result = jiazi[targetIndex];

  return {
    chinese: result,
    stem: result[0],
    branch: result[1],
    heavenlyStem: result[0],
    earthlyBranch: result[1],
  };
}

function computeHourPillar(date, dayStem) {
  if (!dayStem) return null;

  const hour = date.getHours();
  const timeIndex = Math.floor(((hour + 1) % 24) / 2);

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

  if (!hourPillar) return null;

  return {
    stem: hourPillar[0],
    branch: hourPillar[1],
    chinese: hourPillar,
    heavenlyStem: hourPillar[0],
    earthlyBranch: hourPillar[1],
  };
}

// 执行完整测试
console.log('=== 测试algorithmFirstService完整数据流 ===');
console.log('用户输入消息:', testMessage);

const standardizedInput = createStandardizedInput(testMessage);

if (standardizedInput.birthInfo) {
  const baziResult = simulateComputeBaziSmart(standardizedInput.birthInfo);

  console.log('\n=== 最终结果对比 ===');
  console.log('用户报告的错误AI输出: 癸丑年甲子月癸卯日戊午时');
  console.log(
    '正确算法计算结果:',
    baziResult.pillars.year.chinese +
      '年' +
      baziResult.pillars.month.chinese +
      '月' +
      baziResult.pillars.day.chinese +
      '日' +
      (baziResult.pillars.hour?.chinese || '未知') +
      '时'
  );

  console.log('\n=== 问题诊断 ===');
  console.log('1. 日期解析是否正确: ✓');
  console.log('2. 八字计算是否正确: ✓');
  console.log('3. 问题出现在: AI生成阶段，而非算法计算阶段');
  console.log(
    '4. 可能原因: AI模板中包含硬编码数据，或AI自行生成八字而不基于算法结果'
  );
} else {
  console.log('未能提取到有效的出生信息');
}
