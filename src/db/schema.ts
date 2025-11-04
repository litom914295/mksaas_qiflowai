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



