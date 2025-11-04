-- 监控系统数据库迁移脚本
-- 创建所有监控相关的表

-- 错误日志表
CREATE TABLE IF NOT EXISTS "error_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'error',
    "status" TEXT NOT NULL DEFAULT 'unresolved',
    "count" INTEGER NOT NULL DEFAULT 1,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMP(3) NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'production',
    "culprit" TEXT,
    "stack_trace" TEXT,
    "tags" JSONB,
    "metadata" JSONB,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "error_logs_level_idx" ON "error_logs"("level");
CREATE INDEX IF NOT EXISTS "error_logs_status_idx" ON "error_logs"("status");
CREATE INDEX IF NOT EXISTS "error_logs_last_seen_idx" ON "error_logs"("last_seen");
CREATE INDEX IF NOT EXISTS "error_logs_environment_idx" ON "error_logs"("environment");

-- 系统日志表
CREATE TABLE IF NOT EXISTS "system_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "user_id" TEXT,
    "ip" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "system_logs_level_idx" ON "system_logs"("level");
CREATE INDEX IF NOT EXISTS "system_logs_source_idx" ON "system_logs"("source");
CREATE INDEX IF NOT EXISTS "system_logs_timestamp_idx" ON "system_logs"("timestamp");
CREATE INDEX IF NOT EXISTS "system_logs_user_id_idx" ON "system_logs"("user_id");

-- 性能指标表
CREATE TABLE IF NOT EXISTS "performance_metrics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metric_type" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT,
    "endpoint" TEXT,
    "query" TEXT,
    "duration" INTEGER,
    "metadata" JSONB
);

CREATE INDEX IF NOT EXISTS "performance_metrics_metric_type_idx" ON "performance_metrics"("metric_type");
CREATE INDEX IF NOT EXISTS "performance_metrics_timestamp_idx" ON "performance_metrics"("timestamp");
CREATE INDEX IF NOT EXISTS "performance_metrics_endpoint_idx" ON "performance_metrics"("endpoint");

-- 告警规则表
CREATE TABLE IF NOT EXISTS "alert_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "condition" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT,
    "channels" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "alert_rules_enabled_idx" ON "alert_rules"("enabled");

-- 告警记录表
CREATE TABLE IF NOT EXISTS "alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rule_id" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "resolved_by" TEXT,
    FOREIGN KEY ("rule_id") REFERENCES "alert_rules"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "alerts_rule_id_idx" ON "alerts"("rule_id");
CREATE INDEX IF NOT EXISTS "alerts_status_idx" ON "alerts"("status");
CREATE INDEX IF NOT EXISTS "alerts_triggered_at_idx" ON "alerts"("triggered_at");

-- 备份记录表
CREATE TABLE IF NOT EXISTS "backup_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "size" BIGINT,
    "location" TEXT NOT NULL,
    "provider" TEXT,
    "error" TEXT,
    "triggered_by" TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "backup_records_status_idx" ON "backup_records"("status");
CREATE INDEX IF NOT EXISTS "backup_records_started_at_idx" ON "backup_records"("started_at");

-- 部署记录表
CREATE TABLE IF NOT EXISTS "deployment_records" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commit" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "deployer" TEXT NOT NULL,
    "error" TEXT
);

CREATE INDEX IF NOT EXISTS "deployment_records_environment_idx" ON "deployment_records"("environment");
CREATE INDEX IF NOT EXISTS "deployment_records_status_idx" ON "deployment_records"("status");
CREATE INDEX IF NOT EXISTS "deployment_records_started_at_idx" ON "deployment_records"("started_at");

-- 审计日志表
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_email" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs"("user_id");
CREATE INDEX IF NOT EXISTS "audit_logs_action_idx" ON "audit_logs"("action");
CREATE INDEX IF NOT EXISTS "audit_logs_level_idx" ON "audit_logs"("level");
CREATE INDEX IF NOT EXISTS "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");

-- 监控配置表
CREATE TABLE IF NOT EXISTS "monitoring_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "encrypted" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 添加注释
COMMENT ON TABLE "error_logs" IS '错误日志记录表';
COMMENT ON TABLE "system_logs" IS '系统日志记录表';
COMMENT ON TABLE "performance_metrics" IS '性能指标记录表';
COMMENT ON TABLE "alert_rules" IS '告警规则配置表';
COMMENT ON TABLE "alerts" IS '告警触发记录表';
COMMENT ON TABLE "backup_records" IS '备份记录表';
COMMENT ON TABLE "deployment_records" IS '部署记录表';
COMMENT ON TABLE "audit_logs" IS '审计日志表';
COMMENT ON TABLE "monitoring_configs" IS '监控配置表';
