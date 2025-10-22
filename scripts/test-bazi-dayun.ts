#!/usr/bin/env node
/**
 * 测试八字大运流年数据生成
 */

import { LunisolarBaziAdapter } from '../src/lib/bazi/adapters/lunisolar-bazi';
import { normalizeBaziResult } from '../src/lib/bazi/normalize';

async function testBaziDaYun() {
  console.log('=== 测试八字大运流年数据 ===\n');
  
  // 测试数据
  const testCases = [
    {
      name: '测试案例1',
      birthDate: new Date('1990-05-15T14:30:00'),
      gender: 'male' as const,
      longitude: 116.4074,
      latitude: 39.9042,
    },
    {
      name: '测试案例2',
      birthDate: new Date('1985-12-25T23:45:00'),
      gender: 'female' as const,
      longitude: 121.4737,
      latitude: 31.2304,
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log(`出生日期: ${testCase.birthDate.toISOString()}`);
    console.log(`性别: ${testCase.gender === 'male' ? '男' : '女'}`);
    
    try {
      // 创建适配器并计算八字
      const adapter = new LunisolarBaziAdapter({
        datetime: testCase.birthDate.toISOString(),
        gender: testCase.gender,
        longitude: testCase.longitude,
        latitude: testCase.latitude,
        calendarType: 'solar'
      });
      
      const result = await adapter.calculate();
      
      console.log('\n原始数据结构:');
      console.log('大运数据存在:', !!result.luckPillars);
      console.log('大运数量:', result.luckPillars?.length || 0);
      
      if (result.luckPillars && result.luckPillars.length > 0) {
        console.log('\n第一个大运原始数据:');
        console.log(JSON.stringify(result.luckPillars[0], null, 2));
      }

      // 规范化数据
      const normalized = normalizeBaziResult(result);
      
      console.log('\n规范化后的大运数据:');
      if (normalized.luck?.timeline) {
        console.log('大运时间线数量:', normalized.luck.timeline.length);
        
        // 显示前3个大运
        normalized.luck.timeline.slice(0, 3).forEach((dayun, index) => {
          console.log(`\n大运${index + 1}:`);
          console.log(`  年龄: ${dayun.ageRange}`);
          console.log(`  年份: ${dayun.yearRange}`);
          console.log(`  天干: ${dayun.heavenlyStem}`);
          console.log(`  地支: ${dayun.earthlyBranch}`);
          console.log(`  主题: ${dayun.theme}`);
        });
      } else {
        console.log('未生成大运时间线数据');
      }
      
      console.log('\n当年运势:');
      if (normalized.luck?.currentYear) {
        const current = normalized.luck.currentYear;
        console.log(`  年份: ${current.year}`);
        console.log(`  年龄: ${current.age}`);
        console.log(`  天干地支: ${current.heavenlyStem}${current.earthlyBranch}`);
        console.log(`  生肖: ${current.zodiac}`);
        console.log(`  评分: ${current.score}`);
        console.log(`  主题: ${current.theme}`);
      } else {
        console.log('未生成当年运势数据');
      }
      
      console.log('\n未来3年运势:');
      if (normalized.luck?.annualForecast) {
        normalized.luck.annualForecast.slice(0, 3).forEach(year => {
          console.log(`  ${year.year}年 (${year.age}岁): ${year.theme} - 评分${year.score?.toFixed(1)}`);
        });
      } else {
        console.log('未生成年度预测数据');
      }
      
    } catch (error) {
      console.error('计算出错:', error);
    }
  }
  
  console.log('\n=== 测试完成 ===');
}

// 运行测试
testBaziDaYun().catch(console.error);