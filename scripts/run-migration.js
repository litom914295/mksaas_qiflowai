require('dotenv').config({ path: '.env.local' });
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  console.log('🔌 Connecting to database...');
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    // 读取所有迁移脚本
    const migrations = [
      '0002_phase2_reports_and_sessions.sql',
      '0003_phase5_ab_test.sql',
    ];

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, '../drizzle', migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`⚠️ Skipping ${migrationFile} (file not found)`);
        continue;
      }
      
      const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
      console.log(`📝 Executing migration: ${migrationFile}`);
      
      await sql.unsafe(migrationSQL);
      console.log(`✅ ${migrationFile} completed`);
    }

    console.log('✅ All migrations completed successfully!');
    console.log('📊 Created tables:');
    console.log('  - qiflow_reports');
    console.log('  - chat_sessions');
    console.log('  - ab_test_experiments');
    console.log('  - ab_test_assignments');
    console.log('  - ab_test_events');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

runMigration();
