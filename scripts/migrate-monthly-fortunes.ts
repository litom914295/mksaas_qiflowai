/**
 * Phase 8: 月度运势表迁移脚本
 * 
 * 直接执行 SQL 创建 monthly_fortunes 表
 */

import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { db } from '../src/db';

async function migrate() {
  console.log('🚀 开始迁移 monthly_fortunes 表...\n');

  try {
    // 1. 创建表
    console.log('1️⃣ 创建 monthly_fortunes 表...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "monthly_fortunes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        
        -- 时间范围
        "year" integer NOT NULL,
        "month" integer NOT NULL,
        
        -- 运势数据
        "fortune_data" jsonb NOT NULL,
        "flying_star_analysis" jsonb,
        "bazi_timeliness" jsonb,
        
        -- 生成状态
        "status" text NOT NULL DEFAULT 'pending',
        "generated_at" timestamp,
        "notified_at" timestamp,
        
        -- AI 成本与元数据
        "credits_used" integer DEFAULT 0,
        "metadata" jsonb,
        
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `);
    console.log('✅ 表创建成功\n');

    // 2. 创建索引
    console.log('2️⃣ 创建索引...');
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "monthly_fortunes_user_id_idx" 
      ON "monthly_fortunes"("user_id")
    `);
    console.log('   ✅ user_id 索引');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "monthly_fortunes_year_month_idx" 
      ON "monthly_fortunes"("year", "month")
    `);
    console.log('   ✅ year_month 索引');

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "monthly_fortunes_status_idx" 
      ON "monthly_fortunes"("status")
    `);
    console.log('   ✅ status 索引\n');

    // 3. 创建唯一约束
    console.log('3️⃣ 创建唯一约束...');
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "monthly_fortunes_user_year_month_unique" 
      ON "monthly_fortunes"("user_id", "year", "month")
    `);
    console.log('✅ 唯一约束创建成功\n');

    // 4. 添加注释
    console.log('4️⃣ 添加表注释...');
    await db.execute(sql`
      COMMENT ON TABLE "monthly_fortunes" IS 'Pro 用户月度运势分析表 (Phase 8)'
    `);
    await db.execute(sql`
      COMMENT ON COLUMN "monthly_fortunes"."fortune_data" IS '运势数据 JSON: 整体评分、吉祥方位颜色数字、事业健康感情财运预测'
    `);
    await db.execute(sql`
      COMMENT ON COLUMN "monthly_fortunes"."flying_star_analysis" IS '玄空飞星月度布局分析'
    `);
    await db.execute(sql`
      COMMENT ON COLUMN "monthly_fortunes"."bazi_timeliness" IS '八字流年流月时运分析'
    `);
    console.log('✅ 注释添加成功\n');

    // 5. 验证表是否存在
    console.log('5️⃣ 验证表结构...');
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'monthly_fortunes'
      )
    `);
    
    if (result.rows[0]?.exists) {
      console.log('✅ monthly_fortunes 表验证成功\n');
    } else {
      throw new Error('表验证失败');
    }

    // 6. 查询表信息
    console.log('6️⃣ 表信息：');
    const columnsResult = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'monthly_fortunes'
      ORDER BY ordinal_position
    `);
    
    console.log('\n字段列表：');
    columnsResult.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });

    console.log('\n🎉 迁移完成！\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

// 执行迁移
migrate();
