import { boolean, integer, pgTable, text, timestamp, index, uuid, jsonb } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	role: text('role'),
	banned: boolean('banned'),
	banReason: text('ban_reason'),
	banExpires: timestamp('ban_expires'),
	customerId: text('customer_id'),
	// 积分系统字段
	credits: integer('credits').default(0),
	successfulInvites: integer('successful_invites').default(0),
	totalInvites: integer('total_invites').default(0),
	// 订阅层级
	subscriptionTier: text('subscription_tier').default('free'),
}, (table) => ({
	userIdIdx: index("user_id_idx").on(table.id),
	userCustomerIdIdx: index("user_customer_id_idx").on(table.customerId),
	userRoleIdx: index("user_role_idx").on(table.role),
}));

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp('expires_at').notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	impersonatedBy: text('impersonated_by')
}, (table) => ({
	sessionTokenIdx: index("session_token_idx").on(table.token),
	sessionUserIdIdx: index("session_user_id_idx").on(table.userId),
}));

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at'),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at').notNull(),
	updatedAt: timestamp('updated_at').notNull()
}, (table) => ({
	accountUserIdIdx: index("account_user_id_idx").on(table.userId),
	accountAccountIdIdx: index("account_account_id_idx").on(table.accountId),
	accountProviderIdIdx: index("account_provider_id_idx").on(table.providerId),
}));

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at'),
	updatedAt: timestamp('updated_at')
});

export const payment = pgTable("payment", {
	id: text("id").primaryKey(),
	priceId: text('price_id').notNull(),
	type: text('type').notNull(),
	scene: text('scene'), // payment scene: 'lifetime', 'credit', 'subscription'
	interval: text('interval'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	customerId: text('customer_id').notNull(),
	subscriptionId: text('subscription_id'),
	sessionId: text('session_id'),
	invoiceId: text('invoice_id').unique(), // unique constraint for avoiding duplicate processing
	status: text('status').notNull(),
	paid: boolean('paid').notNull().default(false), // indicates whether payment is completed (set in invoice.paid event)
	periodStart: timestamp('period_start'),
	periodEnd: timestamp('period_end'),
	cancelAtPeriodEnd: boolean('cancel_at_period_end'),
	trialStart: timestamp('trial_start'),
	trialEnd: timestamp('trial_end'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	paymentTypeIdx: index("payment_type_idx").on(table.type),
	paymentSceneIdx: index("payment_scene_idx").on(table.scene),
	paymentPriceIdIdx: index("payment_price_id_idx").on(table.priceId),
	paymentUserIdIdx: index("payment_user_id_idx").on(table.userId),
	paymentCustomerIdIdx: index("payment_customer_id_idx").on(table.customerId),
	paymentStatusIdx: index("payment_status_idx").on(table.status),
	paymentPaidIdx: index("payment_paid_idx").on(table.paid),
	paymentSubscriptionIdIdx: index("payment_subscription_id_idx").on(table.subscriptionId),
	paymentSessionIdIdx: index("payment_session_id_idx").on(table.sessionId),
	paymentInvoiceIdIdx: index("payment_invoice_id_idx").on(table.invoiceId),
}));

// Phase 1: Stripe Webhook 幂等性表
export const stripeWebhookEvents = pgTable('stripe_webhook_events', {
	id: text('id').primaryKey(), // Stripe event.id (天然唯一)
	eventType: text('event_type').notNull(),
	processedAt: timestamp('processed_at').notNull().defaultNow(),
	payload: jsonb('payload').notNull(), // 完整 event 对象
	success: boolean('success').notNull().default(true),
	errorMessage: text('error_message'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
	eventTypeIdx: index('stripe_webhook_events_event_type_idx').on(table.eventType),
	processedAtIdx: index('stripe_webhook_events_processed_at_idx').on(table.processedAt),
}));

export const userCredit = pgTable("user_credit", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	currentCredits: integer("current_credits").notNull().default(0),
	lastRefreshAt: timestamp("last_refresh_at"), // deprecated
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	userCreditUserIdIdx: index("user_credit_user_id_idx").on(table.userId),
}));

export const creditTransaction = pgTable("credit_transaction", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: 'cascade' }),
	type: text("type").notNull(),
	description: text("description"),
	amount: integer("amount").notNull(),
	remainingAmount: integer("remaining_amount"),
	paymentId: text("payment_id"), // field name is paymentId, but actually it's invoiceId
	expirationDate: timestamp("expiration_date"),
	expirationDateProcessedAt: timestamp("expiration_date_processed_at"),
	metadata: jsonb('metadata').$type<Record<string, unknown>>(),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
	creditTransactionUserIdIdx: index("credit_transaction_user_id_idx").on(table.userId),
	creditTransactionTypeIdx: index("credit_transaction_type_idx").on(table.type),
}));

// ===========================================
// QiFlow 特定表 - 推荐/分享/任务/成就/统计
// ===========================================

export const referralRelationships = pgTable('referral_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerId: text('referrer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  refereeId: text('referee_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  referralCode: text('referral_code'),
  level: integer('level').default(1),
  status: text('status').default('pending'),
  rewardGranted: boolean('reward_granted').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  activatedAt: timestamp('activated_at'),
}, (table) => ({
  idxReferrer: index('idx_referral_referrer').on(table.referrerId),
  idxReferee: index('idx_referral_referee').on(table.refereeId),
  idxStatus: index('idx_referral_status').on(table.status),
  idxReferralCode: index('idx_referral_code').on(table.referralCode),
}));

export const referralCodes = pgTable('referral_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  customCode: text('custom_code'),
  usageCount: integer('usage_count').default(0),
  maxUsage: integer('max_usage'),
  totalRewards: integer('total_rewards').default(0),
  expireAt: timestamp('expire_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  idxCodeUser: index('idx_code_user').on(table.userId),
  idxCodeCode: index('idx_code_code').on(table.code),
  idxCodeCustom: index('idx_code_custom').on(table.customCode),
}));

export const shareRecords = pgTable('share_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  shareType: text('share_type').notNull(),
  platform: text('platform'),
  shareUrl: text('share_url'),
  clickCount: integer('click_count').default(0),
  conversionCount: integer('conversion_count').default(0),
  rewardGranted: boolean('reward_granted').default(false),
  rewardAmount: integer('reward_amount').default(0),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  idxShareUser: index('idx_share_user').on(table.userId),
  idxShareType: index('idx_share_type').on(table.shareType),
  idxShareUserType: index('idx_share_user_type').on(table.userId, table.shareType),
  idxShareCreated: index('idx_share_created').on(table.createdAt),
}));

export const taskProgress = pgTable('task_progress', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  taskId: text('task_id').notNull(),
  taskType: text('task_type'),
  progress: integer('progress').default(0),
  target: integer('target').notNull(),
  completed: boolean('completed').default(false),
  rewardClaimed: boolean('reward_claimed').default(false),
  completedAt: timestamp('completed_at'),
  resetAt: timestamp('reset_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  idxTaskUser: index('idx_task_user').on(table.userId),
  idxTaskType: index('idx_task_type').on(table.taskType),
  idxTaskUserType: index('idx_task_user_type').on(table.userId, table.taskType),
  idxTaskReset: index('idx_task_reset').on(table.resetAt),
}));

export const achievements = pgTable('achievements', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  achievementId: text('achievement_id').notNull(),
  achievementName: text('achievement_name'),
  achievementLevel: integer('achievement_level').default(1),
  unlockedAt: timestamp('unlocked_at').defaultNow(),
  rewardAmount: integer('reward_amount'),
}, (table) => ({
  idxAchievementUser: index('idx_achievement_user').on(table.userId),
  idxAchievementUnlocked: index('idx_achievement_unlocked').on(table.unlockedAt),
}));

export const userReferralStats = pgTable('user_referral_stats', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  directReferrals: integer('direct_referrals').default(0),
  indirectReferrals: integer('indirect_referrals').default(0),
  totalReferralRewards: integer('total_referral_rewards').default(0),
  totalShares: integer('total_shares').default(0),
  totalShareClicks: integer('total_share_clicks').default(0),
  totalShareConversions: integer('total_share_conversions').default(0),
  referralLevel: text('referral_level'),
  lastReferralAt: timestamp('last_referral_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  idxStatsUser: index('idx_stats_user').on(table.userId),
  idxStatsLevel: index('idx_stats_level').on(table.referralLevel),
}));

export const shareClicks = pgTable('share_clicks', {
  id: uuid('id').defaultRandom().primaryKey(),
  shareId: uuid('share_id').notNull(),
  ip: text('ip'),
  userAgent: text('user_agent'),
  fingerprint: text('fingerprint'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  idxShareClicksShare: index('idx_share_clicks_share').on(table.shareId),
  idxShareClicksCreated: index('idx_share_clicks_created').on(table.createdAt),
}));

export const fraudBlacklist = pgTable('fraud_blacklist', {
  id: uuid('id').defaultRandom().primaryKey(),
  ip: text('ip'),
  fingerprint: text('fingerprint'),
  reason: text('reason'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  idxFraudIp: index('idx_fraud_ip').on(table.ip),
  idxFraudFp: index('idx_fraud_fp').on(table.fingerprint),
}));

export const fraudEvents = pgTable('fraud_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  shareId: uuid('share_id').notNull(),
  ip: text('ip'),
  fingerprint: text('fingerprint'),
  reason: text('reason'),
  step: text('step'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  idxFraudEventsShare: index('idx_fraud_events_share').on(table.shareId),
  idxFraudEventsCreated: index('idx_fraud_events_created').on(table.createdAt),
}));

// QiFlow 八字相关表
export const baziCalculations = pgTable('bazi_calculations', {
id: uuid('id').defaultRandom().primaryKey(),
userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
input: jsonb('input').$type<Record<string, unknown>>().notNull(),
result: jsonb('result').$type<Record<string, unknown>>().notNull(),
creditsUsed: integer('credits_used').notNull().default(10),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
baziUserIdIdx: index("bazi_user_id_idx").on(table.userId),
baziCreatedAtIdx: index("bazi_created_at_idx").on(table.createdAt),
}));

export const fengshuiAnalysis = pgTable('fengshui_analysis', {
id: uuid('id').defaultRandom().primaryKey(),
userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
input: jsonb('input').$type<Record<string, unknown>>().notNull(),
result: jsonb('result').$type<Record<string, unknown>>().notNull(),
confidence: text('confidence').notNull().default('0.0'),
creditsUsed: integer('credits_used').notNull().default(20),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
fengshuiUserIdIdx: index("fengshui_user_id_idx").on(table.userId),
fengshuiCreatedAtIdx: index("fengshui_created_at_idx").on(table.createdAt),
}));

export const pdfAudit = pgTable('pdf_audit', {
id: uuid('id').defaultRandom().primaryKey(),
userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
fileKey: text('file_key').notNull(),
meta: jsonb('meta').$type<Record<string, unknown>>(),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
pdfAuditUserIdIdx: index("pdf_audit_user_id_idx").on(table.userId),
pdfAuditCreatedAtIdx: index("pdf_audit_created_at_idx").on(table.createdAt),
}));

export const copyrightAudit = pgTable('copyright_audit', {
id: uuid('id').defaultRandom().primaryKey(),
userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
copyrightAuditUserIdIdx: index("copyright_audit_user_id_idx").on(table.userId),
copyrightAuditCreatedAtIdx: index("copyright_audit_created_at_idx").on(table.createdAt),
}));

// ===========================================
// Phase 2: 报告产品与 Chat 会话表
// ===========================================

// 精华报告主表
export const qiflowReports = pgTable('qiflow_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 报告类型与状态
  reportType: text('report_type').notNull(), // 'basic' | 'essential'
  status: text('status').notNull().default('pending'), // 'pending' | 'generating' | 'completed' | 'failed'
  
  // 输入输出数据
  input: jsonb('input').$type<{
    birthInfo: Record<string, unknown>;
    selectedThemes?: string[];
  }>().notNull(),
  output: jsonb('output').$type<{
    baziData: Record<string, unknown>;
    flyingStarData: Record<string, unknown>;
    themes: Array<{
      id: string;
      title: string;
      story: string;
      synthesis: string;
      recommendations: string[];
    }>;
    qualityScore?: number;
  }>(),
  
  // 计费与时间
  creditsUsed: integer('credits_used').notNull(),
  generatedAt: timestamp('generated_at'),
  expiresAt: timestamp('expires_at'), // null = 终身有效
  
  // 元数据
  metadata: jsonb('metadata').$type<{
    aiModel: string;
    generationTimeMs: number;
    aiCostUSD: number;
    purchaseMethod: 'credits' | 'stripe';
    stripePaymentId?: string;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('qiflow_reports_user_id_idx').on(table.userId),
  statusIdx: index('qiflow_reports_status_idx').on(table.status),
  reportTypeIdx: index('qiflow_reports_report_type_idx').on(table.reportType),
  createdAtIdx: index('qiflow_reports_created_at_idx').on(table.createdAt),
}));

// Chat 会话表 (Phase 6)
export const chatSessions = pgTable('chat_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 时间控制
  startedAt: timestamp('started_at').notNull().defaultNow(),
  expiresAt: timestamp('expires_at').notNull(), // startedAt + 15 mins
  
  // 使用统计
  messageCount: integer('message_count').notNull().default(0),
  creditsUsed: integer('credits_used').notNull().default(40),
  
  // 会话状态
  status: text('status').notNull().default('active'), // 'active' | 'expired' | 'completed' | 'renewed'
  
  // 元数据
  metadata: jsonb('metadata').$type<{
    aiModel: string;
    totalTokens: number;
    totalCostUSD: number;
    renewalCount: number;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('chat_sessions_user_id_idx').on(table.userId),
  statusIdx: index('chat_sessions_status_idx').on(table.status),
  expiresAtIdx: index('chat_sessions_expires_at_idx').on(table.expiresAt),
}));

// ===========================================
// Phase 8: Pro 月度运势表
// ===========================================

export const monthlyFortunes = pgTable('monthly_fortunes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 时间范围
  year: integer('year').notNull(),
  month: integer('month').notNull(), // 1-12
  
  // 运势数据
  fortuneData: jsonb('fortune_data').$type<{
    overallScore: number;  // 0-100
    luckyDirections: string[];
    luckyColors: string[];
    luckyNumbers: number[];
    careerForecast: string;
    healthWarnings: string[];
    relationshipTips: string[];
    wealthAdvice: string;
  }>().notNull(),
  
  // 飞星分析
  flyingStarAnalysis: jsonb('flying_star_analysis').$type<{
    monthlyGrid: Array<{
      direction: string;
      stars: number[];
      meaning: string;
      auspiciousness: 'excellent' | 'good' | 'neutral' | 'poor' | 'dangerous';
    }>;
    criticalWarnings: Array<{
      direction: string;
      issue: string;
      remedy: string;
    }>;
  }>(),
  
  // 八字流年流月分析
  baziTimeliness: jsonb('bazi_timeliness').$type<{
    yearPillar: string;  // 流年天干地支
    monthPillar: string; // 流月天干地支
    interactions: Array<{
      type: string;  // '冲', '合', '刑', '克', '泄'
      target: string;
      impact: string;
    }>;
    strengthAnalysis: Record<string, number>;  // 五行强弱变化
  }>(),
  
  // 生成状态
  status: text('status').notNull().default('pending'),
  // 'pending' → 'generating' → 'completed' | 'failed'
  
  generatedAt: timestamp('generated_at'),
  notifiedAt: timestamp('notified_at'), // 推送通知时间
  
  // AI 成本与元数据
  creditsUsed: integer('credits_used').default(0),
  metadata: jsonb('metadata').$type<{
    aiModel: string;
    generationTimeMs: number;
    aiCostUSD: number;
    generationMethod: 'manual' | 'auto_cron';
  }>(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('monthly_fortunes_user_id_idx').on(table.userId),
  yearMonthIdx: index('monthly_fortunes_year_month_idx').on(table.year, table.month),
  statusIdx: index('monthly_fortunes_status_idx').on(table.status),
  // 唯一约束: 每人每月只有一份运势
  userYearMonthUnique: index('monthly_fortunes_user_year_month_unique')
    .on(table.userId, table.year, table.month),
}));

// ===========================================
// Prisma 兼容表 - 签到/推荐/积分系统
// ===========================================

// 签到表 (Check-ins)
export const checkIns = pgTable('check_ins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  checkInDate: timestamp('check_in_date', { mode: 'date' }).notNull(),
  consecutiveDays: integer('consecutive_days').notNull().default(1),
  rewardCredits: integer('reward_credits').notNull().default(2),
  milestoneReward: integer('milestone_reward').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userIdCheckInDateIdx: index('user_id_check_in_date_idx').on(table.userId, table.checkInDate),
  checkInDateIdx: index('check_in_date_idx').on(table.checkInDate),
}));

// 推荐关系表 (Referrals) - 与 Prisma 兼容
export const referrals = pgTable('referrals', {
  id: uuid('id').defaultRandom().primaryKey(),
  referrerId: text('referrer_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  referredId: text('referred_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('pending'), // 'pending', 'activated'
  progress: jsonb('progress').$type<Record<string, unknown>>().default({}).notNull(),
  activatedAt: timestamp('activated_at'),
  rewardTier: text('reward_tier'), // 'basic', 'milestone_3', 'milestone_10', etc.
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  referrerIdIdx: index('referrals_referrer_id_idx').on(table.referrerId),
  referredIdIdx: index('referrals_referred_id_idx').on(table.referredId),
  statusIdx: index('referrals_status_idx').on(table.status),
  referrerStatusIdx: index('referrals_referrer_status_idx').on(table.referrerId, table.status),
}));

// 积分配置表 (Credit Config)
export const creditConfig = pgTable('credit_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  keyIdx: index('credit_config_key_idx').on(table.key),
}));

// 积分兑换商品表 (Credit Rewards)
export const creditRewards = pgTable('credit_rewards', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  cost: integer('cost').notNull(),
  stock: integer('stock').notNull().default(-1), // -1 表示无限
  imageUrl: text('image_url'),
  category: text('category').notNull().default('other'), // coupon, vip, physical, virtual
  enabled: boolean('enabled').notNull().default(true),
  sortOrder: integer('sort_order').notNull().default(0),
  metadata: jsonb('metadata').$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  enabledSortOrderIdx: index('credit_rewards_enabled_sort_order_idx').on(table.enabled, table.sortOrder),
  categoryIdx: index('credit_rewards_category_idx').on(table.category),
}));

// 积分兑换记录表 (Credit Redemptions)
export const creditRedemptions = pgTable('credit_redemptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  rewardId: uuid('reward_id').notNull().references(() => creditRewards.id, { onDelete: 'restrict' }),
  cost: integer('cost').notNull(),
  status: text('status').notNull().default('pending'), // pending, fulfilled, cancelled
  fulfillmentData: jsonb('fulfillment_data').$type<Record<string, unknown>>(),
  redeemedAt: timestamp('redeemed_at').notNull().defaultNow(),
  fulfilledAt: timestamp('fulfilled_at'),
}, (table) => ({
  userIdRedeemedAtIdx: index('credit_redemptions_user_id_redeemed_at_idx').on(table.userId, table.redeemedAt),
  statusIdx: index('credit_redemptions_status_idx').on(table.status),
  rewardIdIdx: index('credit_redemptions_reward_id_idx').on(table.rewardId),
}));

// 积分等级表 (Credit Levels)
export const creditLevels = pgTable('credit_levels', {
  id: uuid('id').defaultRandom().primaryKey(),
  level: integer('level').notNull().unique(),
  name: text('name').notNull(),
  minCredits: integer('min_credits').notNull(),
  color: text('color').notNull().default('#gray'),
  icon: text('icon'),
  benefits: jsonb('benefits').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  levelIdx: index('credit_levels_level_idx').on(table.level),
  minCreditsIdx: index('credit_levels_min_credits_idx').on(table.minCredits),
}));

// ===========================================
// Phase 5: A/B 测试系统
// ===========================================

// A/B 测试实验表
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

// A/B 测试用户分组表
export const abTestAssignments = pgTable(
  "ab_test_assignments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    experimentId: uuid("experiment_id")
      .notNull()
      .references(() => abTestExperiments.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    variantId: text("variant_id").notNull(), // 'control' | 'variant_a' | 'variant_b'
    
    assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  },
  (table) => ({
    experimentIdx: index("ab_test_assignments_experiment_idx").on(table.experimentId),
    userIdx: index("ab_test_assignments_user_idx").on(table.userId),
    variantIdx: index("ab_test_assignments_variant_idx").on(table.variantId),
  })
);

// A/B 测试事件追踪表
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
      .references(() => user.id, { onDelete: "cascade" }),
    
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



