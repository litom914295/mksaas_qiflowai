/**
 * Fixed PostgreSQL Database Connection for Supabase
 * 修复了 Better Auth 与 Supabase 的兼容性问题
 */
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

let db: ReturnType<typeof drizzle> | null = null;
let connectionClient: ReturnType<typeof postgres> | null = null;

function createClient(conn: string) {
  return postgres(conn, {
    prepare: false,
    ssl: process.env.PG_SSL === 'disable' ? undefined : 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    connection: { application_name: 'mksaas-better-auth' },
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
    const client = createClient(conn);
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
