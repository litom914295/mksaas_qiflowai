/**
 * 八字风水分析相关的数据库Schema
 */

import { pgTable, serial, text, timestamp, jsonb, integer, uuid } from 'drizzle-orm/pg-core';
// 引用主schema中的user表
import { user } from '../schema';

/**
 * 分析历史记录表
 * 存储用户的八字风水分析结果
 */
export const analysisHistory = pgTable('analysis_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  // 个人信息
  name: text('name').notNull(),
  birthDate: text('birth_date').notNull(),
  birthTime: text('birth_time'),
  gender: text('gender').notNull(), // 'male' | 'female'
  location: text('location').notNull(),
  
  // 房屋信息
  houseOrientation: integer('house_orientation'), // 0-360度
  houseAddress: text('house_address'),
  houseFloor: integer('house_floor'),
  houseRoomCount: integer('house_room_count'),
  
  // 分析结果（JSON格式存储）
  baziResult: jsonb('bazi_result'),
  fengshuiResult: jsonb('fengshui_result'),
  aiEnhancedAnalysis: text('ai_enhanced_analysis'),
  
  // 元数据
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  
  // 统计数据
  viewCount: integer('view_count').default(0),
  shareCount: integer('share_count').default(0),
});

/**
 * 用户反馈表
 * 存储用户对分析结果的评价和建议
 */
export const analysisFeedback = pgTable('analysis_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // 关联分析记录
  analysisId: uuid('analysis_id')
    .notNull()
    .references(() => analysisHistory.id, { onDelete: 'cascade' }),
  
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  // 评分 (1-5星)
  rating: integer('rating').notNull(),
  
  // 反馈类型
  feedbackType: text('feedback_type').notNull(), // 'general' | 'accuracy' | 'usability' | 'suggestion'
  
  // 反馈内容
  comment: text('comment'),
  
  // 标签（可多选）
  tags: jsonb('tags'), // ['accurate', 'helpful', 'detailed', 'easy-to-understand']
  
  // 是否推荐给他人
  wouldRecommend: integer('would_recommend'), // 1-10
  
  // 元数据
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isPublic: integer('is_public').default(0), // 是否公开显示
  isResolved: integer('is_resolved').default(0), // 是否已处理
});

/**
 * 分析统计表
 * 用于追踪系统使用情况
 */
export const analysisStats = pgTable('analysis_stats', {
  id: serial('id').primaryKey(),
  
  // 日期
  date: text('date').notNull().unique(), // YYYY-MM-DD
  
  // 统计数据
  totalAnalyses: integer('total_analyses').default(0),
  totalUsers: integer('total_users').default(0),
  totalFeedbacks: integer('total_feedbacks').default(0),
  avgRating: integer('avg_rating').default(0), // 平均评分 * 100
  
  // 详细统计（JSON格式）
  detailedStats: jsonb('detailed_stats'),
  
  // 元数据
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 用户收藏表
 * 用户可以收藏分析结果
 */
export const analysisFavorites = pgTable('analysis_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  
  analysisId: uuid('analysis_id')
    .notNull()
    .references(() => analysisHistory.id, { onDelete: 'cascade' }),
  
  // 收藏备注
  note: text('note'),
  
  // 收藏标签
  tags: jsonb('tags'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 导出类型
export type AnalysisHistory = typeof analysisHistory.$inferSelect;
export type NewAnalysisHistory = typeof analysisHistory.$inferInsert;

export type AnalysisFeedback = typeof analysisFeedback.$inferSelect;
export type NewAnalysisFeedback = typeof analysisFeedback.$inferInsert;

export type AnalysisStats = typeof analysisStats.$inferSelect;
export type NewAnalysisStats = typeof analysisStats.$inferInsert;

export type AnalysisFavorites = typeof analysisFavorites.$inferSelect;
export type NewAnalysisFavorites = typeof analysisFavorites.$inferInsert;
