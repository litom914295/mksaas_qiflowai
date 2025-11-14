#!/usr/bin/env node
import path from 'path';
/**
 * 检查知识库状态
 */
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';

// 加载环境变量
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

async function checkKnowledgeBase() {
  try {
    console.log('🔍 检查知识库状态...\n');

    // 初始化 Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error(
        '❌ Supabase 凭证未找到！请设置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY'
      );
      process.exit(1);
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // 统计总文档数
    const { count: total, error: countError } = await supabase
      .from('knowledge_documents')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    console.log(`📊 总文档数: ${total || 0}`);

    if (!total || total === 0) {
      console.log('\n⚠️  知识库为空！');
      console.log(
        '📌 请运行: npx tsx scripts/ingest-knowledge-base.ts --source test-data --dry-run'
      );
      console.log(
        '📌 正式导入: npx tsx scripts/ingest-knowledge-base.ts --source test-data'
      );
      return;
    }

    // 按类别统计
    const { data: docs, error: docsError } = await supabase
      .from('knowledge_documents')
      .select('category');

    if (docsError) {
      throw docsError;
    }

    const categoryMap = new Map<string, number>();
    for (const doc of docs || []) {
      categoryMap.set(doc.category, (categoryMap.get(doc.category) || 0) + 1);
    }

    console.log('\n📦 按类别统计:');
    for (const [category, count] of categoryMap.entries()) {
      console.log(`  - ${category}: ${count} 条`);
    }

    // 显示最近添加的3条文档
    const { data: recentDocs, error: recentError } = await supabase
      .from('knowledge_documents')
      .select('id, title, category, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (recentError) {
      throw recentError;
    }

    console.log('\n📄 最近添加的文档:');
    for (const doc of recentDocs || []) {
      console.log(
        `  - [${doc.category}] ${doc.title} (${new Date(doc.created_at).toLocaleString('zh-CN')})`
      );
    }

    console.log('\n✅ 知识库检查完成！');
  } catch (error) {
    console.error('❌ 检查知识库失败:', error);
    process.exit(1);
  }
}

checkKnowledgeBase();
