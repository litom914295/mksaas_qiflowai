#!/usr/bin/env node

/**
 * 测试 computeBaziSmart 函数
 */

// 模拟测试数据
const testBirthData = {
  datetime: '1973-01-07T02:30',
  gender: 'male',
  timezone: 'Asia/Shanghai',
  isTimeKnown: true,
  preferredLocale: 'zh-CN',
};

console.log('=== 测试 computeBaziSmart 函数 ===');
console.log('输入数据:', testBirthData);

// 动态导入模块
async function testComputeBaziSmart() {
  try {
    // 导入模块
    const { computeBaziSmart } = await import('./src/lib/bazi/index.ts');

    console.log('\n开始调用 computeBaziSmart...');
    const result = await computeBaziSmart(testBirthData);

    console.log('\n=== 计算结果 ===');
    console.log('结果类型:', typeof result);
    console.log('结果是否为null:', result === null);

    if (result) {
      console.log('\n=== 结果结构 ===');
      console.log('keys:', Object.keys(result));

      if (result.pillars) {
        console.log('\n=== 四柱信息 ===');
        console.log('年柱:', result.pillars.year);
        console.log('月柱:', result.pillars.month);
        console.log('日柱:', result.pillars.day);
        console.log('时柱:', result.pillars.hour);
      } else {
        console.log('❌ 缺少 pillars 字段');
      }

      if (result.dayMaster) {
        console.log('\n=== 日主信息 ===');
        console.log('日主:', result.dayMaster);
      } else {
        console.log('❌ 缺少 dayMaster 字段');
      }

      console.log('\n=== 完整结果 ===');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('❌ 函数返回 null');
    }
  } catch (error) {
    console.error('❌ 测试失败:', error);
    console.error('错误堆栈:', error.stack);
  }
}

testComputeBaziSmart();
