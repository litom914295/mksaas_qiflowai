#!/usr/bin/env node

/**
 * 算法调试脚本
 * 通过API测试算法功能
 */

import fetch from 'node-fetch';

async function testAnalysisAPI() {
  console.log('🧪 测试算法优先API...\n');

  const testMessages = [
    '我是男性，1990年5月15日14时出生，请帮我分析八字',
    '我的房子是坐北朝南，请帮我分析风水',
    '我是女性，1985年3月20日9时出生，房子是坐西朝东，请综合分析',
  ];

  for (let i = 0; i < testMessages.length; i++) {
    const message = testMessages[i];
    console.log(`📝 测试 ${i + 1}: "${message}"`);

    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: `debug-${Date.now()}`,
          userId: 'debug-user',
        }),
      });

      if (!response.ok) {
        console.log(`❌ 请求失败: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();

      if (data.success) {
        console.log(`✅ 请求成功`);

        if (data.data?.analysisResult) {
          const analysis = data.data.analysisResult;
          console.log(`   🔍 分析类型: ${analysis.type}`);
          console.log(`   📊 分析成功: ${analysis.success}`);
          console.log(`   ⏱️  执行时间: ${analysis.executionTime}ms`);

          if (analysis.success) {
            console.log(`   🎯 算法执行成功`);
            if (analysis.data?.yearPillar) {
              console.log(
                `   📅 八字结果: ${analysis.data.yearPillar} ${analysis.data.monthPillar} ${analysis.data.dayPillar} ${analysis.data.hourPillar}`
              );
            }
            if (analysis.data?.sittingDirection) {
              console.log(
                `   🏠 风水结果: 坐${analysis.data.sittingDirection}向${analysis.data.facingDirection}`
              );
            }
          } else {
            console.log(`   ❌ 分析错误: ${analysis.error}`);
          }
        }

        if (data.data?.aiEnhancement) {
          console.log(
            `   🤖 AI增强: ${data.data.aiEnhancement.explanation ? '有' : '无'}`
          );
        }

        console.log(`   🔧 使用服务: ${data.data?.usage?.provider || '未知'}`);
      } else {
        console.log(`❌ 响应失败: ${data.error?.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 请求异常: ${error.message}`);
    }

    console.log(''); // 空行分隔
  }
}

async function main() {
  console.log('🔍 开始算法调试...\n');

  await testAnalysisAPI();

  console.log('🏁 调试完成！');
}

main().catch(console.error);
