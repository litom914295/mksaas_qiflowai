import { pgTable, text, timestamp, jsonb, integer, boolean, real, uuid, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { user } from './schema' // 导入主schema中的user表

/**
 * 八字计算记录表
 */
export const baziCalculations = pgTable('qiflow_bazi_calculations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 输入数据
  birthDate: timestamp('birth_date', { withTimezone: true }).notNull(),
  birthTime: text('birth_time').notNull(), // HH:mm格式
  birthPlace: text('birth_place').notNull(),
  timezone: text('timezone').notNull(),
  longitude: real('longitude').notNull(),
  latitude: real('latitude').notNull(),
  
  // 计算结果
  bazi: jsonb('bazi').notNull(), // 八字数据
  dayMaster: text('day_master').notNull(), // 日主
  elements: jsonb('elements').notNull(), // 五行分析
  tenGods: jsonb('ten_gods'), // 十神分析
  
  // AI解读
  aiInterpretation: text('ai_interpretation'),
  aiModel: text('ai_model'),
  aiTokensUsed: integer('ai_tokens_used'),
  
  // 元数据
  creditsUsed: integer('credits_used').notNull().default(10),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('bazi_user_id_idx').on(table.userId),
  createdAtIdx: index('bazi_created_at_idx').on(table.createdAt),
}))

/**
 * 玄空风水分析记录表
 */
export const fengshuiAnalysis = pgTable('qiflow_fengshui_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 输入数据
  buildingName: text('building_name'),
  buildingType: text('building_type').notNull(), // residential/commercial
  facingDirection: real('facing_direction').notNull(), // 坐向度数
  sittingDirection: real('sitting_direction').notNull(), // 坐山度数
  moveInDate: timestamp('move_in_date', { withTimezone: true }).notNull(),
  floorNumber: integer('floor_number'),
  unitNumber: text('unit_number'),
  
  // 户型图
  floorPlanUrl: text('floor_plan_url'),
  floorPlanData: jsonb('floor_plan_data'), // Canvas/Konva数据
  
  // 计算结果
  period: integer('period').notNull(), // 元运
  flyingStars: jsonb('flying_stars').notNull(), // 飞星数据
  analysis: jsonb('analysis').notNull(), // 分析结果
  recommendations: jsonb('recommendations'), // 风水建议
  
  // AI解读
  aiInterpretation: text('ai_interpretation'),
  aiModel: text('ai_model'),
  aiTokensUsed: integer('ai_tokens_used'),
  
  // 元数据
  creditsUsed: integer('credits_used').notNull().default(20),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('fengshui_user_id_idx').on(table.userId),
  createdAtIdx: index('fengshui_created_at_idx').on(table.createdAt),
}))

/**
 * 罗盘读数记录表
 */
export const compassReadings = pgTable('qiflow_compass_readings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 读数数据
  magneticHeading: real('magnetic_heading').notNull(), // 磁北方向
  trueHeading: real('true_heading'), // 真北方向
  accuracy: real('accuracy').notNull(), // 精度值
  confidence: real('confidence').notNull(), // 置信度 0-1
  
  // 设备信息
  deviceType: text('device_type'),
  deviceModel: text('device_model'),
  sensorData: jsonb('sensor_data'), // 原始传感器数据
  
  // 位置信息
  latitude: real('latitude'),
  longitude: real('longitude'),
  altitude: real('altitude'),
  location: text('location'),
  
  // 校准信息
  isCalibrated: boolean('is_calibrated').notNull().default(false),
  calibrationMethod: text('calibration_method'), // auto/manual
  manualInput: boolean('manual_input').notNull().default(false),
  
  // 元数据
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('compass_user_id_idx').on(table.userId),
  createdAtIdx: index('compass_created_at_idx').on(table.createdAt),
  confidenceIdx: index('compass_confidence_idx').on(table.confidence),
}))

/**
 * PDF导出审计记录表
 */
export const pdfExports = pgTable('qiflow_pdf_exports', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // 关联记录
  sourceType: text('source_type').notNull(), // bazi/fengshui/combined
  sourceId: uuid('source_id'), // 关联的计算记录ID
  
  // PDF信息
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url'),
  fileSize: integer('file_size'), // bytes
  pageCount: integer('page_count'),
  
  // 内容配置
  includeChart: boolean('include_chart').notNull().default(true),
  includeAnalysis: boolean('include_analysis').notNull().default(true),
  includeRecommendations: boolean('include_recommendations').notNull().default(true),
  language: text('language').notNull().default('zh'),
  
  // 水印与版权
  watermark: text('watermark'),
  copyright: text('copyright'),
  
  // 元数据
  creditsUsed: integer('credits_used').notNull().default(5),
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => ({
  userIdIdx: index('pdf_user_id_idx').on(table.userId),
  sourceIdx: index('pdf_source_idx').on(table.sourceType, table.sourceId),
  generatedAtIdx: index('pdf_generated_at_idx').on(table.generatedAt),
}))

/**
 * 用户偏好设置表
 */
export const qiflowUserPreferences = pgTable('qiflow_user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  
  // 显示偏好
  language: text('language').notNull().default('zh'),
  theme: text('theme').notNull().default('auto'), // light/dark/auto
  displayMode: text('display_mode').notNull().default('simple'), // simple/professional
  
  // 八字偏好
  baziSystem: text('bazi_system').notNull().default('traditional'), // traditional/modern
  showTenGods: boolean('show_ten_gods').notNull().default(true),
  showNaYin: boolean('show_na_yin').notNull().default(true),
  
  // 风水偏好
  fengshuiSchool: text('fengshui_school').notNull().default('xuankong'), // xuankong/bazhai/sanyuan
  showFlyingStars: boolean('show_flying_stars').notNull().default(true),
  
  // 罗盘偏好
  compassType: text('compass_type').notNull().default('magnetic'), // magnetic/true
  angleUnit: text('angle_unit').notNull().default('degree'), // degree/mil
  
  // 通知偏好
  emailNotifications: boolean('email_notifications').notNull().default(true),
  marketingEmails: boolean('marketing_emails').notNull().default(false),
  
  // 隐私设置
  shareAnalytics: boolean('share_analytics').notNull().default(true),
  publicProfile: boolean('public_profile').notNull().default(false),
  
  // 元数据
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('qiflow_pref_user_id_idx').on(table.userId),
}))

// 定义关系
export const baziCalculationsRelations = relations(baziCalculations, ({ one }) => ({
  user: one(user, {
    fields: [baziCalculations.userId],
    references: [user.id],
  }),
}))

export const fengshuiAnalysisRelations = relations(fengshuiAnalysis, ({ one }) => ({
  user: one(user, {
    fields: [fengshuiAnalysis.userId],
    references: [user.id],
  }),
}))

export const compassReadingsRelations = relations(compassReadings, ({ one }) => ({
  user: one(user, {
    fields: [compassReadings.userId],
    references: [user.id],
  }),
}))

export const pdfExportsRelations = relations(pdfExports, ({ one }) => ({
  user: one(user, {
    fields: [pdfExports.userId],
    references: [user.id],
  }),
}))

export const qiflowUserPreferencesRelations = relations(qiflowUserPreferences, ({ one }) => ({
  user: one(user, {
    fields: [qiflowUserPreferences.userId],
    references: [user.id],
  }),
}))
