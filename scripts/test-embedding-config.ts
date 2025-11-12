/**
 * Embedding API 配置测试脚本
 * 用于验证 Jina AI 和硅基流动 API 密钥是否正确配置
 */

import { getGlobalEmbeddingService } from '@/lib/rag/embedding-service-global';

async function testEmbeddingProviders() {
  console.log('🧪 开始测试 Embedding 提供商配置...\n');

  const testText = '八字命理是中国传统的命理学体系';
  
  // 测试 1: 自动选择（应该选择硅基流动，因为 DEFAULT_REGION=cn）
  console.log('📍 测试 1: 自动选择提供商（基于地区 cn）');
  try {
    const service1 = getGlobalEmbeddingService({
      provider: 'auto',
      userRegion: 'cn',
    });
    
    const result1 = await service1.embed(testText);
    console.log(`✅ 成功 - 使用提供商: ${result1.provider}`);
    console.log(`   向量维度: ${result1.embedding.length}`);
    console.log(`   成本: $${result1.cost.toFixed(6)}`);
    console.log();
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.log();
  }

  // 测试 2: 强制使用硅基流动
  console.log('📍 测试 2: 强制使用硅基流动');
  try {
    const service2 = getGlobalEmbeddingService({
      provider: 'siliconflow',
      forceProvider: true,
    });
    
    const result2 = await service2.embed(testText);
    console.log(`✅ 成功 - 使用提供商: ${result2.provider}`);
    console.log(`   向量维度: ${result2.embedding.length}`);
    console.log(`   成本: $${result2.cost.toFixed(6)} (免费)`);
    console.log();
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.log();
  }

  // 测试 3: 强制使用 Jina AI
  console.log('📍 测试 3: 强制使用 Jina AI');
  try {
    const service3 = getGlobalEmbeddingService({
      provider: 'jina',
      forceProvider: true,
    });
    
    const result3 = await service3.embed(testText);
    console.log(`✅ 成功 - 使用提供商: ${result3.provider}`);
    console.log(`   向量维度: ${result3.embedding.length}`);
    console.log(`   成本: $${result3.cost.toFixed(6)}`);
    console.log();
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.log();
  }

  // 测试 4: 强制使用 OpenAI（备用）
  console.log('📍 测试 4: 强制使用 OpenAI（备用提供商）');
  try {
    const service4 = getGlobalEmbeddingService({
      provider: 'openai',
      forceProvider: true,
    });
    
    const result4 = await service4.embed(testText);
    console.log(`✅ 成功 - 使用提供商: ${result4.provider}`);
    console.log(`   向量维度: ${result4.embedding.length}`);
    console.log(`   成本: $${result4.cost.toFixed(6)}`);
    console.log();
  } catch (error) {
    console.error('❌ 失败:', error.message);
    console.log();
  }

  // 测试 5: 查看统计信息
  console.log('📊 所有提供商统计:');
  const service = getGlobalEmbeddingService();
  const stats = service.getStats();
  
  console.log(`   可用提供商: ${stats.availableProviders.join(', ')}`);
  console.log(`   总请求数: ${stats.totalRequests}`);
  console.log(`   总成本: $${stats.totalCost.toFixed(6)}`);
  console.log();
  
  console.log('✨ 测试完成！');
}

// 运行测试
testEmbeddingProviders().catch(console.error);
