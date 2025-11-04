/**
 * Fixed PostgreSQL Database Connection for Supabase
 * 修复了 Better Auth 与 Supabase 的兼容性问题
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
// DNS resolution is handled by postgres-js library internally
// No need for manual DNS lookup

let db: ReturnType<typeof drizzle> | null = null;
let connectionClient: ReturnType<typeof postgres> | null = null;

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

export async function getDb() {
  // 检查是否禁用数据库连接
  if (process.env.DISABLE_DATABASE === 'true') {
    console.log('⚠️ Database disabled via DISABLE_DATABASE=true');
    console.log('💡 Using in-memory/Supabase REST API fallback');
    throw new Error('Database connection disabled - using REST API fallback');
  }

  if (db) return db;

  const SESSION = process.env.SESSION_DATABASE_URL;
  const DIRECT = process.env.DIRECT_DATABASE_URL;
  const FALLBACK = process.env.DATABASE_URL;

  const candidates = [DIRECT, SESSION, FALLBACK].filter(
    (v, i, a) => !!v && a.indexOf(v) === i
  ) as string[];

  if (candidates.length === 0) {
    throw new Error('No database connection string provided');
  }

  console.log('Connecting to database...');

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
        'Using database connection:',
        conn.includes('pooler') ? 'Session Pooler' : 'Direct Connection'
      );
      connectionClient = await tryConnect(conn);
      console.log('✅ Database connection established');
      db = drizzle(connectionClient, { schema });
      return db;
    } catch (error: any) {
      lastError = error;
      console.warn('⚠️  Connection failed, will try next candidate:', {
        message: error?.message,
        code: error?.code,
        host: error?.hostname,
      });
      continue;
    }
  }

  console.error('❌ All database connection attempts failed');
  throw lastError || new Error('Database connection failed');
}

export { db };

export async function closeDb() {
  if (connectionClient) {
    await connectionClient.end();
    connectionClient = null;
    db = null;
  }
}
