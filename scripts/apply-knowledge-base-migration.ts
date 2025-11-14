#!/usr/bin/env tsx
/**
 * 应用 RAG 知识库表 migration
 * 通过 Supabase REST API 或直接 SQL 执行
 */

import fs from 'fs';
import path from 'path';
import { config as loadEnv } from 'dotenv';

// 加载环境变量
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

const log = {
  info: (msg: string) => console.log(`\x1b[34mℹ\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m✓\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m✗\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m⚠\x1b[0m ${msg}`),
};

async function applyMigration() {
  const sqlPath = path.join(
    process.cwd(),
    'drizzle/0004_phase7_knowledge_base_1024dim.sql'
  );
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  log.info('请在 Supabase SQL Editor 中手动执行以下 SQL:\n');

  console.log('='.repeat(80));
  console.log('SQL Migration 内容:');
  console.log('='.repeat(80));
  console.log(sql);
  console.log('='.repeat(80));

  log.info('\n执行步骤:');
  log.info(
    '1. 访问: https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj/sql/new'
  );
  log.info('2. 复制上述 SQL 到编辑器');
  log.info('3. 点击 "RUN" 按钮执行');
  log.info('4. 确认成功后重新运行摄取脚本\n');
}

applyMigration();
