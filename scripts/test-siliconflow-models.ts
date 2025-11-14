#!/usr/bin/env tsx
import path from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

const baseURL =
  process.env.EMBEDDING_BASE_URL || 'https://api.siliconflow.cn/v1';
const apiKey = process.env.EMBEDDING_API_KEY;

const modelsToTest = [
  'BAAI/bge-m3',
  'bge-m3',
  'BAAI-bge-m3',
  'Pro/BAAI/bge-m3',
];

async function testModel(model: string) {
  console.log(`\n测试模型: ${model}`);

  try {
    const response = await fetch(`${baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: ['测试'],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        `✅ 成功！维度: ${data.data[0].embedding.length}, tokens: ${data.usage.total_tokens}`
      );
      return true;
    }
    const text = await response.text();
    console.log(`❌ 失败: ${response.status} ${text}`);
    return false;
  } catch (error: any) {
    console.log(`❌ 错误: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔍 测试硅基流动嵌入模型名称...\n');

  for (const model of modelsToTest) {
    await testModel(model);
  }
}

main();
