/**
 * Fixed PostgreSQL Database Connection for Supabase
 * 修复了 Better Auth 与 Supabase 的兼容性问题
 */
import { type PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export type DbType = PostgresJsDatabase<typeof schema>;
// DNS resolution is handled by postgres-js library internally
// No need for manual DNS lookup

// 使用全局变量缓存连接，避免 Next.js 热重载时丢失
const globalForDb = globalThis as unknown as {
  db: DbType | null;
  connectionClient: ReturnType<typeof postgres> | null;
  connectionPromise: Promise<DbType> | null;
};

globalForDb.db = globalForDb.db || null;
globalForDb.connectionClient = globalForDb.connectionClient || null;
globalForDb.connectionPromise = globalForDb.connectionPromise || null;

async function createClient(conn: string) {
  // postgres-js handles DNS resolution and connection automatically
  return postgres(conn, {
    prepare: false,
    ssl: process.env.PG_SSL === 'disable' ? undefined : { rejectUnauthorized: false },
    max: 10,
    idle_timeout: 20,
    connect_timeout: 30, // 增加超时时间以应对网络延迟
    connection: { application_name: 'qiflowai-better-auth' },
    max_lifetime: 60 * 30,
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

export async function getDb(): Promise<DbType> {
  // 检查是否禁用数据库连接
  if (process.env.DISABLE_DATABASE === 'true') {
    console.log('⚠️ Database disabled via DISABLE_DATABASE=true');
    console.log('💡 Using in-memory/Supabase REST API fallback');
    throw new Error('Database connection disabled - using REST API fallback');
  }

  // 优先返回已缓存的连接
  if (globalForDb.db) {
    return globalForDb.db;
  }

  // 如果正在连接中，等待连接完成（避免并发连接）
  if (globalForDb.connectionPromise) {
    return globalForDb.connectionPromise;
  }

  // 创建连接 Promise
  globalForDb.connectionPromise = (async () => {
    const SESSION = process.env.SESSION_DATABASE_URL;
    const DIRECT = process.env.DIRECT_DATABASE_URL;
    const FALLBACK = process.env.DATABASE_URL;

    const candidates = [DIRECT, SESSION, FALLBACK].filter(
      (v, i, a) => !!v && a.indexOf(v) === i
    ) as string[];

    if (candidates.length === 0) {
      throw new Error('No database connection string provided');
    }

    console.log('[DB] Initializing database connection...');

    const tryConnect = async (conn: string) => {
      const client = await createClient(conn);
      try {
        await client`SELECT 1`;
        return client;
      } catch (error) {
        try {
          await client.end();
        } catch {}
        throw error;
      }
    };

    let lastError: any = null;
    for (const conn of candidates) {
      try {
        console.log(
          '[DB] Using database connection:',
          conn.includes('pooler') ? 'Session Pooler' : 'Direct Connection'
        );
        globalForDb.connectionClient = await tryConnect(conn);
        console.log('✅ [DB] Database connection established (cached)');
        globalForDb.db = drizzle(globalForDb.connectionClient, { schema });
        return globalForDb.db;
      } catch (error: any) {
        lastError = error;
        console.warn('⚠️  [DB] Connection failed, will try next candidate:', {
          message: error?.message,
          code: error?.code,
          host: error?.hostname,
        });
        continue;
      }
    }

    console.error('❌ [DB] All database connection attempts failed');
    globalForDb.connectionPromise = null; // 清除失败的 Promise
    throw lastError || new Error('Database connection failed');
  })();

  return globalForDb.connectionPromise;
}

export { globalForDb as db };

export async function closeDb() {
  if (globalForDb.connectionClient) {
    await globalForDb.connectionClient.end();
    globalForDb.connectionClient = null;
    globalForDb.db = null;
    globalForDb.connectionPromise = null;
  }
}
