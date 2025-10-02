/**
 * QiFlow AI 八字计算完整测试脚本
 * 用于验证八字计算引擎的准确性
 */

// 测试用例：历史名人和标准案例
const testCases = [
  {
    name: "测试案例1：1990年5月15日午时",
    datetime: "1990-05-15T12:30:00",
    gender: "male",
    expected: {
      year: "庚午",
      month: "辛巳",
      day: "己巳", // 待验证
      hour: "庚午"
    }
  },
  {
    name: "测试案例2：2000年1月1日子时（跨日）",
    datetime: "2000-01-01T00:30:00",
    gender: "female",
    expected: {
      year: "己卯",
      month: "丙子",
      day: "戊午", // 2000年1月1日为戊午日
      hour: "壬子"
    }
  },
  {
    name: "测试案例3：2024年12月26日巳时",
    datetime: "2024-12-26T10:00:00",
    gender: "male",
    expected: {
      year: "甲辰",
      month: "丙子",
      day: "壬申", // 待验证
      hour: "乙巳"
    }
  },
  {
    name: "测试案例4：1973年边界案例",
    datetime: "1973-01-01T23:30:00", // 子时跨日测试
    gender: "male",
    expected: {
      year: "壬子",
      month: "壬子",
      day: "甲申", // 跨日后应该是次日
      hour: "甲子"
    }
  }
];

// 天干地支表
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 60甲子表
const SEXAGENARY_CYCLE = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'
];

// 简化的日柱计算（使用权威基准）
function calculateDayPillar(date) {
  const local = new Date(date);
  const hour = local.getHours();
  
  // 子时跨日处理
  if (hour >= 23) {
    local.setDate(local.getDate() + 1);
  }
  local.setHours(0, 0, 0, 0);
  
  // 使用2000年1月1日戊午日作为基准
  const referenceDate = new Date(2000, 0, 1);
  referenceDate.setHours(0, 0, 0, 0);
  const referenceIndex = 54; // 戊午在60甲子中的索引
  
  const daysDiff = Math.floor((local - referenceDate) / (1000 * 60 * 60 * 24));
  const targetIndex = (((referenceIndex + daysDiff) % 60) + 60) % 60;
  
  return SEXAGENARY_CYCLE[targetIndex];
}

// 时柱计算（五鼠遁）
function calculateHourPillar(date, dayStem) {
  const hour = date.getHours();
  const timeIndex = Math.floor(((hour + 1) % 24) / 2);
  
  const timeMap = {
    '甲': ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥'],
    '己': ['甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉', '甲戌', '乙亥'],
    '乙': ['丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未', '甲申', '乙酉', '丙戌', '丁亥'],
    '庚': ['丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未', '甲申', '乙酉', '丙戌', '丁亥'],
    '丙': ['戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥'],
    '辛': ['戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳', '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥'],
    '丁': ['庚子', '辛丑', '壬寅', '癸卯', '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥'],
    '壬': ['庚子', '辛丑', '壬寅', '癸卯', '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥'],
    '戊': ['壬子', '癸丑', '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥'],
    '癸': ['壬子', '癸丑', '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥']
  };
  
  return timeMap[dayStem] ? timeMap[dayStem][timeIndex] : '未知';
}

// 执行测试
async function runTests() {
  console.log('='.repeat(60));
  console.log('QiFlow AI 八字计算引擎测试');
  console.log('='.repeat(60));
  console.log();

  const results = [];
  
  for (const testCase of testCases) {
    console.log(`\n测试: ${testCase.name}`);
    console.log('-'.repeat(40));
    
    const date = new Date(testCase.datetime);
    const dayPillar = calculateDayPillar(date);
    const dayStem = dayPillar[0];
    const hourPillar = calculateHourPillar(date, dayStem);
    
    console.log(`输入: ${testCase.datetime} (${testCase.gender === 'male' ? '男' : '女'})`);
    console.log(`\n计算结果:`);
    console.log(`  日柱: ${dayPillar}`);
    console.log(`  时柱: ${hourPillar}`);
    
    if (testCase.expected.day) {
      const dayMatch = dayPillar === testCase.expected.day;
      console.log(`\n验证日柱: ${dayMatch ? '✅ 正确' : '❌ 错误'}`);
      if (!dayMatch) {
        console.log(`  期望: ${testCase.expected.day}`);
        console.log(`  实际: ${dayPillar}`);
      }
    }
    
    if (testCase.expected.hour) {
      const hourMatch = hourPillar === testCase.expected.hour;
      console.log(`验证时柱: ${hourMatch ? '✅ 正确' : '❌ 错误'}`);
      if (!hourMatch) {
        console.log(`  期望: ${testCase.expected.hour}`);
        console.log(`  实际: ${hourPillar}`);
      }
    }
    
    results.push({
      name: testCase.name,
      dayPillar,
      hourPillar,
      dayMatch: testCase.expected.day ? dayPillar === testCase.expected.day : null,
      hourMatch: testCase.expected.hour ? hourPillar === testCase.expected.hour : null
    });
  }
  
  // 统计结果
  console.log('\n' + '='.repeat(60));
  console.log('测试统计');
  console.log('='.repeat(60));
  
  const totalTests = results.length;
  const dayTests = results.filter(r => r.dayMatch !== null);
  const dayPassed = dayTests.filter(r => r.dayMatch === true).length;
  const hourTests = results.filter(r => r.hourMatch !== null);
  const hourPassed = hourTests.filter(r => r.hourMatch === true).length;
  
  console.log(`\n日柱测试: ${dayPassed}/${dayTests.length} 通过`);
  console.log(`时柱测试: ${hourPassed}/${hourTests.length} 通过`);
  console.log(`总体通过率: ${((dayPassed + hourPassed) / (dayTests.length + hourTests.length) * 100).toFixed(1)}%`);
  
  // 算法分析建议
  console.log('\n' + '='.repeat(60));
  console.log('算法分析与建议');
  console.log('='.repeat(60));
  console.log(`
1. 日柱计算关键点:
   - 使用权威基准日期（如2000年1月1日戊午日）
   - 正确处理子时跨日（23:00-00:59算作次日）
   - 考虑闰年的影响

2. 时柱计算要点:
   - 严格按照五鼠遁日起时诀
   - 时辰划分：每2小时一个时辰
   - 子时特殊处理：23:00-01:00

3. 优化建议:
   - 建立完整的万年历查询表
   - 增加农历转换支持
   - 实现真太阳时修正
   - 添加更多边界条件测试
  `);
}

// 运行测试
runTests().catch(console.error);