/**
 * Fixed PostgreSQL Database Connection for Supabase
 * 修复了 Better Auth 与 Supabase 的兼容性问题
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;
let connectionClient: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (db) return db;
  
  // 使用直接连接字符串（如果可用）或者 Pooler 连接字符串
  const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!;
  
  console.log('Connecting to database...');
  
  // Supabase 特定的连接选项
  connectionClient = postgres(connectionString, {
    // 禁用 prepare 以支持 Transaction Mode
    prepare: false,
    // SSL 配置
    ssl: process.env.PG_SSL === 'disable' ? undefined : 'require',
    // 连接池设置
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Supabase 特定：设置应用名称
    connection: {
      application_name: 'qiflowai-better-auth'
    },
    // 错误重试
    max_lifetime: 60 * 30, // 30 minutes
    // 添加 Supabase 兼容性选项
    types: {
      // 确保布尔值正确解析
      bool: {
        to: 16,
        from: [16],
        serialize: (x: unknown) => (x ? 't' : 'f'),
        parse: (x: unknown) => x === 't' || x === 'true' || x === true
      }
    }
  });
  
  // 测试连接
  try {
    await connectionClient`SELECT 1`;
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
  
  db = drizzle(connectionClient, { schema });
  return db;
}

// 导出 db 实例供其他模块使用
export { db };

// 清理函数
export async function closeDb() {
  if (connectionClient) {
    await connectionClient.end();
    connectionClient = null;
    db = null;
  }
}