#!/usr/bin/env node

/**
 * 算法优先架构测试脚本
 * 测试新的"算法优先，AI补充"的架构
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const TEST_MESSAGES = [
  // 八字分析测试
  '我是男性，1990年5月15日14时30分出生，请帮我分析八字',
  '帮我算一下八字，我是女性，1985年3月20日9时出生',

  // 风水分析测试
  '我的房子是坐北朝南，请帮我分析风水',
  '房屋朝向是东南向，请分析风水布局',

  // 综合分析测试
  '我是男性，1988年8月8日8时出生，房子是坐西朝东，请综合分析',

  // 追问测试
  '这个八字有什么特别需要注意的地方吗？',
  '我的事业运势如何？',
  '如何改善房屋的风水？',
];

async function testAlgorithmFirst() {
  console.log('🧪 开始测试算法优先架构...\n');

  let lastAnalysisResult = null;

  for (let i = 0; i < TEST_MESSAGES.length; i++) {
    const message = TEST_MESSAGES[i];
    console.log(`📝 测试消息 ${i + 1}: "${message}"`);

    try {
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: `test-session-${Date.now()}`,
          userId: 'test-user',
          locale: 'zh-CN',
        }),
      });

      if (!response.ok) {
        console.log(`❌ 请求失败: ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.log(`   错误详情: ${errorText.substring(0, 200)}...`);
        continue;
      }

      const data = await response.json();

      if (data.success) {
        const reply = data.data?.reply || '无回复内容';
        console.log(`✅ 回复成功: ${reply.substring(0, 150)}...`);

        // 检查是否包含分析结果
        if (data.data?.analysisResult) {
          console.log(
            `   🔍 包含算法分析结果: ${data.data.analysisResult.type}`
          );
          console.log(`   📊 分析成功: ${data.data.analysisResult.success}`);
          if (data.data.analysisResult.success) {
            console.log(
              `   ⏱️  执行时间: ${data.data.analysisResult.executionTime}ms`
            );
          } else {
            console.log(`   ❌ 分析错误: ${data.data.analysisResult.error}`);
          }
          lastAnalysisResult = data.data.analysisResult;
        }

        // 检查是否包含AI增强
        if (data.data?.aiEnhancement) {
          console.log(`   🤖 包含AI增强解释`);
          console.log(
            `   💡 洞察数量: ${data.data.aiEnhancement.insights?.length || 0}`
          );
          console.log(
            `   📋 建议数量: ${data.data.aiEnhancement.recommendations?.length || 0}`
          );
          console.log(
            `   ❓ 后续问题: ${data.data.aiEnhancement.followUpQuestions?.length || 0}`
          );
        }

        // 检查处理方式
        if (data.data?.usage?.provider === 'algorithm-first') {
          console.log(`   🎯 使用算法优先服务`);
        } else {
          console.log(`   💬 使用传统AI对话`);
        }
      } else {
        console.log(`❌ 响应失败: ${data.error?.message || '未知错误'}`);
      }
    } catch (error) {
      console.log(`❌ 请求异常: ${error.message}`);
    }

    console.log(''); // 空行分隔
  }

  console.log('🏁 测试完成！');
  console.log('');
  console.log('💡 如果看到"算法优先服务"，说明新架构工作正常');
  console.log('💡 如果看到"传统AI对话"，说明消息被识别为普通对话');
  console.log('💡 如果看到分析结果和AI增强，说明算法+AI的集成成功');
}

// 检查服务器是否运行
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'ping',
        sessionId: 'health-check',
        userId: 'health-check',
      }),
    });

    return response.ok || response.status === 400; // 400也是正常的，说明服务器在运行
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 检查服务器状态...');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ 服务器未运行，请先启动开发服务器:');
    console.log('   npm run dev');
    return;
  }

  console.log('✅ 服务器正在运行');
  console.log('');

  await testAlgorithmFirst();
}

main().catch(console.error);
