/**
 * Fixed PostgreSQL Database Connection for Supabase
 * 修复了 Better Auth 与 Supabase 的兼容性问题
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;
let connectionClient: ReturnType<typeof postgres> | null = null;

function createClient(conn: string) {
  return postgres(conn, {
    // 禁用 prepare 以支持 pgbouncer/transaction pooler
    prepare: false,
    // SSL 配置
    ssl: process.env.PG_SSL === 'disable' ? undefined : 'require',
    // 连接池设置
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // Supabase 特定：设置应用名称
    connection: { application_name: 'mksaas-better-auth' },
    // 错误重试
    max_lifetime: 60 * 30,
    // 解析布尔值
    types: {
      bool: {
        to: 16,
        from: [16],
        serialize: (x: unknown) => (x ? 't' : 'f'),
        parse: (x: unknown) => x === 't' || x === 'true' || x === true,
      },
    },
  });
}

export async function getDb() {
  if (db) return db;

  // 连接串优先级
  const SESSION = process.env.SESSION_DATABASE_URL;
  const DIRECT = process.env.DIRECT_DATABASE_URL;
  const FALLBACK = process.env.DATABASE_URL!;

  // 先尝试 Direct Connection，如果 DNS被阻止再尝试 Session Pooler
  let connectionString = DIRECT || SESSION || FALLBACK;
  
  console.log('Using database connection:', connectionString.includes('pooler') ? 'Session Pooler' : 'Direct Connection');

  console.log('Connecting to database...');

  const tryConnect = async (conn: string) => {
    const client = createClient(conn);
    try {
      // 始终做轻量探活，便于捕获 pooler 配置错误
      await client`SELECT 1`;
      return client;
    } catch (error: any) {
      // 关闭失败的连接
      try { await client.end(); } catch {}
      throw error;
    }
  };

  // 首次尝试
  try {
    connectionClient = await tryConnect(connectionString);
  } catch (error: any) {
    const msg = String(error?.message || '');
    const code = (error?.code as string) || '';
    const isPoolerTenantErr = code === 'XX000' || msg.includes('Tenant or user not found');
    const isDNSError = code === 'ENOTFOUND';

    // 如果是 DNS 错误且使用的是 Direct Connection，尝试 Session Pooler
    if (isDNSError && connectionString.includes('db.') && SESSION) {
      console.warn('⚠️  Direct Connection DNS 解析失败，尝试使用 Session Pooler...');
      connectionString = SESSION;
      try {
        connectionClient = await tryConnect(connectionString);
        console.log('✅ 使用 Session Pooler 连接成功！');
      } catch (retryError) {
        console.error('❌ Session Pooler 也连接失败:', retryError);
        throw retryError;
      }
    } else if (isDNSError) {
      // 所有连接都失败
      console.error('❌ Database connection failed:', error);
      console.error('');
      console.error('⚠️  数据库连接失败！请检查：');
      console.error('1. 网络连接是否正常');
      console.error('2. Supabase 项目是否存在');
      console.error('3. DNS 是否被阻止（尝试使用 VPN）');
      console.error('4. 查看 DATABASE_SETUP_GUIDE.md 获取详细指导');
      console.error('');
      throw error;
    }

    // 如果首选是 pooler 且出现 Supabase 特有错误，自动降级到直连
    if (isPoolerTenantErr && DIRECT && connectionString.includes('pooler.supabase.com')) {
      console.warn('⚠️  Pooler 连接失败（Tenant or user not found），回退到 DIRECT_DATABASE_URL');
      connectionString = DIRECT;
      connectionClient = await tryConnect(connectionString);
    } else {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  console.log('✅ Database connection established');
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
