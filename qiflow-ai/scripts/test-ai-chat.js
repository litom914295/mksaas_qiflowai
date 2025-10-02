#!/usr/bin/env node

/**
 * AI聊天功能测试脚本
 * 测试修复后的AI八字风水大师功能
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';
const TEST_MESSAGES = [
  '你好，你是谁',
  '你能干什么',
  '帮我分析八字',
  '什么是风水',
  '我是男性，1990年5月15日14时30分出生',
];

async function testAIChat() {
  console.log('🧪 开始测试AI八字风水大师功能...\n');

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
        console.log(`✅ 回复成功: ${reply.substring(0, 100)}...`);

        // 检查是否是智能回退响应
        if (
          reply.includes('当前AI服务暂时不可用') ||
          reply.includes('基于传统理论')
        ) {
          console.log(`   ℹ️  使用智能回退响应`);
        } else {
          console.log(`   🎯 使用AI服务响应`);
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
  console.log(
    '💡 如果看到智能回退响应，说明AI服务可能不可用，但系统能够正常回退'
  );
  console.log('💡 如果看到AI服务响应，说明修复完全成功');
  console.log('💡 如果看到错误信息，请检查服务器日志');
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

  await testAIChat();
}

main().catch(console.error);
