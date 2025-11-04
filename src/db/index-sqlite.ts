/**
 * Connect to SQLite Database (本地开发)
 * https://orm.drizzle.team/docs/get-started-sqlite
 */
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

let db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (db) return db;
  
  const sqlite = new Database('./local.db');
  db = drizzle(sqlite, { schema });
  
  return db;
}

// 导出 db 实例供其他模块使用
export { db };
