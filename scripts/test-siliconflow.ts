#!/usr/bin/env node
/**
 * 测试硅基流动API连接
 */
import { config as loadEnv } from 'dotenv';
import path from 'path';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

async function testSiliconFlow() {
  const apiKey = process.env.SILICONFLOW_API_KEY || process.env.EMBEDDING_API_KEY;
  const baseURL = process.env.SILICONFLOW_BASE_URL || process.env.EMBEDDING_BASE_URL;
  const model = process.env.EMBEDDING_MODEL || 'BAAI/bge-m3';

  console.log('🔍 测试硅基流动API配置:\n');
  console.log(`API Key: ${apiKey?.substring(0, 20)}...`);
  console.log(`Base URL: ${baseURL}`);
  console.log(`Model: ${model}\n`);

  try {
    const response = await fetch(`${baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        input: ['测试文本'],
      }),
    });

    console.log(`📊 响应状态: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ 错误响应:');
      console.error(text || '(空响应体)');
      process.exit(1);
    }

    const data = await response.json();
    console.log('✅ 测试成功！');
    console.log(`向量维度: ${data.data?.[0]?.embedding?.length || '未知'}`);
    console.log(`Token使用: ${data.usage?.total_tokens || '未知'}`);
  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    process.exit(1);
  }
}

testSiliconFlow();
