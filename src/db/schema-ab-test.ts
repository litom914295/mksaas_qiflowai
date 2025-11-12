/**
 * A/B 测试表 Schema 定义
 * 
 * ⚠️ 需要手动将这些定义添加到 src/db/schema.ts 中
 */

import { pgTable, uuid, text, timestamp, jsonb, index, unique } from "drizzle-orm/pg-core";
import { users } from "./schema"; // 假设 users 表已存在

// ===========================================
// 1. ab_test_experiments - 实验配置表
// ===========================================
export const abTestExperiments = pgTable(
  "ab_test_experiments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    // 实验基本信息
    name: text("name").notNull().unique(),
    description: text("description"),
    status: text("status").notNull().default("draft"), // 'draft' | 'active' | 'paused' | 'completed'
    
    // 变体配置
    variants: jsonb("variants").notNull(), // VariantConfig[]
    
    // 时间控制
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    
    // 目标指标
    goalMetric: text("goal_metric"), // 'conversion_rate' | 'revenue' | 'engagement'
    
    // 元数据
    metadata: jsonb("metadata"),
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    nameIdx: index("ab_test_experiments_name_idx").on(table.name),
    statusIdx: index("ab_test_experiments_status_idx").on(table.status),
  })
);

// ===========================================
// 2. ab_test_assignments - 用户分组表
// ===========================================
export const abTestAssignments = pgTable(
  "ab_test_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => abTestExperiments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    variantId: text("variant_id").notNull(), // 'control' | 'variant_a' | 'variant_b'
    
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => ({
    experimentIdx: index("ab_test_assignments_experiment_idx").on(table.experimentId),
    userIdx: index("ab_test_assignments_user_idx").on(table.userId),
    variantIdx: index("ab_test_assignments_variant_idx").on(table.variantId),
    uniqueAssignment: unique("ab_test_assignments_unique").on(table.experimentId, table.userId),
  })
);

// ===========================================
// 3. ab_test_events - 事件追踪表
// ===========================================
export const abTestEvents = pgTable(
  "ab_test_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => abTestExperiments.id, { onDelete: "cascade" }),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => abTestAssignments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    eventType: text("event_type").notNull(), // 'view' | 'click' | 'adoption' | 'conversion' | 'reward'
    eventData: jsonb("event_data"), // 事件附加数据
    
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    experimentIdx: index("ab_test_events_experiment_idx").on(table.experimentId),
    assignmentIdx: index("ab_test_events_assignment_idx").on(table.assignmentId),
    userIdx: index("ab_test_events_user_idx").on(table.userId),
    typeIdx: index("ab_test_events_type_idx").on(table.eventType),
    createdAtIdx: index("ab_test_events_created_at_idx").on(table.createdAt),
  })
);

/**
 * 类型导出
 */
export type ABTestExperiment = typeof abTestExperiments.$inferSelect;
export type ABTestAssignment = typeof abTestAssignments.$inferSelect;
export type ABTestEvent = typeof abTestEvents.$inferSelect;

/**
 * 插入类型导出
 */
export type NewABTestExperiment = typeof abTestExperiments.$inferInsert;
export type NewABTestAssignment = typeof abTestAssignments.$inferInsert;
export type NewABTestEvent = typeof abTestEvents.$inferInsert;
