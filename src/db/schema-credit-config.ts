import { pgTable, text, integer, boolean, timestamp, jsonb, uuid, index } from 'drizzle-orm/pg-core';
import { user } from './schema';

/**
 * 积分规则配置表
 * 存储系统各类操作的积分消费/奖励规则
 */
export const creditRules = pgTable('credit_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 规则标识
  ruleKey: text('rule_key').notNull().unique(), // e.g. "bazi_analysis", "ai_chat", "daily_checkin"
  ruleName: text('rule_name').notNull(), // 规则名称
  ruleType: text('rule_type').notNull(), // "consumption" | "reward" | "penalty"
  category: text('category').notNull(), // "qiflow" | "engagement" | "referral" | "admin"
  
  // 积分配置
  creditAmount: integer('credit_amount').notNull(), // 正数表示奖励,负数表示消费
  
  // 规则状态
  enabled: boolean('enabled').notNull().default(true),
  
  // 限制配置
  dailyLimit: integer('daily_limit'), // 每日次数限制
  weeklyLimit: integer('weekly_limit'), // 每周次数限制
  monthlyLimit: integer('monthly_limit'), // 每月次数限制
  
  // 高级配置
  vipMultiplier: jsonb('vip_multiplier').$type<{
    basic?: number;
    premium?: number;
    enterprise?: number;
  }>(), // VIP倍率(预留)
  
  cooldownMinutes: integer('cooldown_minutes'), // 冷却时间(分钟)
  
  // 条件配置
  conditions: jsonb('conditions').$type<{
    minUserLevel?: number;
    requireVerification?: boolean;
    customConditions?: Record<string, unknown>;
  }>(),
  
  // 描述与备注
  description: text('description'),
  adminNotes: text('admin_notes'),
  
  // 元数据
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  ruleKeyIdx: index('credit_rules_rule_key_idx').on(table.ruleKey),
  ruleTypeIdx: index('credit_rules_rule_type_idx').on(table.ruleType),
  categoryIdx: index('credit_rules_category_idx').on(table.category),
  enabledIdx: index('credit_rules_enabled_idx').on(table.enabled),
}));

/**
 * 用户签到记录表
 */
export const userCheckIns = pgTable('user_check_ins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 签到日期
  checkInDate: timestamp('check_in_date').notNull(), // 签到日期(只取日期部分)
  
  // 连续签到统计
  consecutiveDays: integer('consecutive_days').notNull().default(1), // 当前连续签到天数
  totalCheckIns: integer('total_check_ins').notNull().default(1), // 累计签到总数
  
  // 奖励记录
  baseReward: integer('base_reward').notNull().default(5), // 基础奖励
  bonusReward: integer('bonus_reward').notNull().default(0), // 额外奖励(连续签到)
  totalReward: integer('total_reward').notNull(), // 总奖励
  
  // 签到来源
  checkInSource: text('check_in_source').default('web'), // web | mobile | auto
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  
  // 元数据
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_check_ins_user_id_idx').on(table.userId),
  checkInDateIdx: index('user_check_ins_check_in_date_idx').on(table.checkInDate),
  userDateIdx: index('user_check_ins_user_date_idx').on(table.userId, table.checkInDate),
}));

/**
 * 签到配置表
 */
export const checkInConfig = pgTable('check_in_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // 基础配置
  baseReward: integer('base_reward').notNull().default(5), // 基础每日签到奖励
  enabled: boolean('enabled').notNull().default(true), // 签到功能开关
  
  // 连续签到阶梯奖励
  consecutiveRewards: jsonb('consecutive_rewards').$type<Array<{
    days: number; // 连续天数
    bonus: number; // 额外奖励
    label?: string; // 标签(如"三日奖励"、"七日大礼")
  }>>().default([
    { days: 3, bonus: 10, label: '三日奖励' },
    { days: 7, bonus: 30, label: '七日大礼' },
    { days: 30, bonus: 100, label: '月度坚持奖' },
  ]),
  
  // 累计签到里程碑奖励
  milestoneRewards: jsonb('milestone_rewards').$type<Array<{
    total: number; // 累计签到总数
    bonus: number; // 额外奖励
    label?: string;
  }>>().default([
    { total: 10, bonus: 20, label: '新手奖励' },
    { total: 50, bonus: 100, label: '老手奖励' },
    { total: 100, bonus: 300, label: '资深用户' },
    { total: 365, bonus: 1000, label: '年度坚持' },
  ]),
  
  // 补签配置
  allowMakeup: boolean('allow_makeup').notNull().default(true), // 是否允许补签
  makeupCost: integer('makeup_cost').default(10), // 补签消耗积分
  maxMakeupDays: integer('max_makeup_days').default(3), // 最多补签天数
  
  // 高级配置
  vipBonusMultiplier: jsonb('vip_bonus_multiplier').$type<{
    basic?: number;
    premium?: number;
    enterprise?: number;
  }>().default({ basic: 1, premium: 1.5, enterprise: 2 }),
  
  // 元数据
  updatedBy: text('updated_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * 预设积分规则种子数据
 * 用于初始化系统
 */
export const DEFAULT_CREDIT_RULES = [
  // QiFlow 核心服务消费
  {
    ruleKey: 'bazi_analysis',
    ruleName: '八字排盘',
    ruleType: 'consumption',
    category: 'qiflow',
    creditAmount: -10,
    description: '进行一次完整八字排盘分析',
  },
  {
    ruleKey: 'bazi_deep_interpretation',
    ruleName: '八字深度解读',
    ruleType: 'consumption',
    category: 'qiflow',
    creditAmount: -30,
    description: 'AI深度解读八字命盘',
  },
  {
    ruleKey: 'fengshui_analysis',
    ruleName: '玄空风水分析',
    ruleType: 'consumption',
    category: 'qiflow',
    creditAmount: -20,
    description: '玄空飞星风水分析',
  },
  {
    ruleKey: 'ai_chat_message',
    ruleName: 'AI聊天消息',
    ruleType: 'consumption',
    category: 'qiflow',
    creditAmount: -5,
    description: '与AI进行对话(每条消息)',
  },
  {
    ruleKey: 'pdf_export',
    ruleName: 'PDF报告导出',
    ruleType: 'consumption',
    category: 'qiflow',
    creditAmount: -5,
    description: '导出分析报告为PDF',
  },
  
  // 用户互动奖励
  {
    ruleKey: 'daily_checkin',
    ruleName: '每日签到',
    ruleType: 'reward',
    category: 'engagement',
    creditAmount: 5,
    dailyLimit: 1,
    description: '每日签到奖励',
  },
  {
    ruleKey: 'first_login',
    ruleName: '首次登录',
    ruleType: 'reward',
    category: 'engagement',
    creditAmount: 50,
    description: '新用户首次登录奖励',
  },
  {
    ruleKey: 'profile_complete',
    ruleName: '完善资料',
    ruleType: 'reward',
    category: 'engagement',
    creditAmount: 20,
    description: '完整填写个人资料',
  },
  {
    ruleKey: 'share_result',
    ruleName: '分享结果',
    ruleType: 'reward',
    category: 'engagement',
    creditAmount: 3,
    dailyLimit: 5,
    description: '分享分析结果到社交媒体',
  },
  
  // 推荐奖励
  {
    ruleKey: 'successful_referral',
    ruleName: '成功推荐',
    ruleType: 'reward',
    category: 'referral',
    creditAmount: 100,
    description: '成功推荐新用户注册并激活',
  },
  {
    ruleKey: 'referee_bonus',
    ruleName: '被推荐人奖励',
    ruleType: 'reward',
    category: 'referral',
    creditAmount: 50,
    description: '通过推荐码注册的新用户奖励',
  },
  
  // 管理操作
  {
    ruleKey: 'admin_credit_adjustment',
    ruleName: '管理员积分调整',
    ruleType: 'reward',
    category: 'admin',
    creditAmount: 0, // 可变金额
    description: '管理员手动调整用户积分',
  },
  {
    ruleKey: 'penalty_violation',
    ruleName: '违规惩罚',
    ruleType: 'penalty',
    category: 'admin',
    creditAmount: -100,
    description: '违反使用条款的惩罚',
  },
] as const;
