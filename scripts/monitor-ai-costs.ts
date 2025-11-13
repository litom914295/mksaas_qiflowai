#!/usr/bin/env node
/**
 * AI成本监控和自动告警脚本
 * 
 * 功能：
 * 1. 监控每日AI调用成本
 * 2. $50时发送警告邮件/通知
 * 3. $100时自动暂停新用户注册
 * 4. 生成成本报告
 * 
 * 使用方法：
 * - 一次性检查: npx tsx scripts/monitor-ai-costs.ts
 * - 定时任务（cron）: 0 * * * * npx tsx scripts/monitor-ai-costs.ts
 */

import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'path';
import fs from 'fs';

// 加载环境变量
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

// 阈值配置（美元）
const COST_THRESHOLDS = {
  WARNING: 50, // 警告阈值
  CRITICAL: 100, // 危险阈值（暂停注册）
  DAILY_LIMIT: 150, // 每日绝对上限
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  critical: (msg: string) => console.log(`${colors.red}${colors.bright}🚨 ${msg}${colors.reset}`),
};

interface CostRecord {
  timestamp: string;
  model: string;
  tokens: number;
  cost: number;
  user_id?: string;
}

interface DailyCostSummary {
  date: string;
  totalCost: number;
  totalRequests: number;
  totalTokens: number;
  modelBreakdown: Record<string, { requests: number; cost: number; tokens: number }>;
}

// 初始化 Supabase
function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not found');
  }

  return createClient(supabaseUrl, serviceKey);
}

// 获取今日成本
async function getTodayCost(supabase: any): Promise<DailyCostSummary> {
  const today = new Date().toISOString().split('T')[0];
  const startOfDay = `${today}T00:00:00.000Z`;
  const endOfDay = `${today}T23:59:59.999Z`;

  try {
    // 从 ai_usage_metrics 表查询今日记录
    const { data, error } = await supabase
      .from('ai_cost_tracking')
      .select('model, cost_usd, created_at, tokens')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);

    if (error) throw error;

    const records = (data || []).map((row: any) => ({
      model: (row.model as string) || 'unknown',
      tokens: Number(row.tokens) || 0,
      cost: Number(row.cost_usd) || 0,
      timestamp: row.created_at as string,
    })) as CostRecord[];

    // 统计数据
    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    const totalRequests = records.length;
    const totalTokens = records.reduce((sum, r) => sum + (r.tokens || 0), 0);

    // 按模型分组统计
    const modelBreakdown: Record<string, { requests: number; cost: number; tokens: number }> = {};
    for (const record of records) {
      const model = record.model || 'unknown';
      if (!modelBreakdown[model]) {
        modelBreakdown[model] = { requests: 0, cost: 0, tokens: 0 };
      }
      modelBreakdown[model].requests++;
      modelBreakdown[model].cost += record.cost || 0;
      modelBreakdown[model].tokens += record.tokens || 0;
    }

    return {
      date: today,
      totalCost,
      totalRequests,
      totalTokens,
      modelBreakdown,
    };
  } catch (error) {
    log.error(`查询成本数据失败: ${error}`);
    throw error;
  }
}

// 检查注册开关状态
async function getRegistrationStatus(supabase: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'registration_enabled')
      .single();

    if (error) {
      // 如果没有这个设置，默认为开启
      return true;
    }

    return data?.value === 'true' || data?.value === true;
  } catch (error) {
    log.warn('无法读取注册状态，默认为开启');
    return true;
  }
}

// 设置注册开关
async function setRegistrationStatus(supabase: any, enabled: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('system_settings')
      .upsert({
        key: 'registration_enabled',
        value: enabled.toString(),
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    log.success(`注册功能已${enabled ? '开启' : '关闭'}`);
  } catch (error) {
    log.error(`设置注册状态失败: ${error}`);
    throw error;
  }
}

// 发送告警通知
async function sendAlert(level: 'warning' | 'critical', summary: DailyCostSummary): Promise<void> {
  const { totalCost, totalRequests, date } = summary;

  // 生成告警消息
  const message = level === 'warning'
    ? `⚠️  AI成本警告\n\n` +
      `日期: ${date}\n` +
      `当前成本: $${totalCost.toFixed(2)}\n` +
      `请求次数: ${totalRequests}\n` +
      `警告阈值: $${COST_THRESHOLDS.WARNING}\n\n` +
      `请注意控制使用量，避免超出预算。`
    : `🚨 AI成本严重超标！\n\n` +
      `日期: ${date}\n` +
      `当前成本: $${totalCost.toFixed(2)}\n` +
      `请求次数: ${totalRequests}\n` +
      `危险阈值: $${COST_THRESHOLDS.CRITICAL}\n\n` +
      `系统已自动暂停新用户注册！\n` +
      `请立即采取措施降低成本。`;

  log.info('告警消息:');
  console.log('\n' + '='.repeat(60));
  console.log(message);
  console.log('='.repeat(60) + '\n');

  // TODO: 这里可以集成邮件/Slack/钉钉/企业微信等通知渠道
  // 例如：
  // await sendEmail(message);
  // await sendSlackNotification(message);
  // await sendWeChatNotification(message);

  // 保存告警记录到日志文件
  const logDir = path.join(process.cwd(), '.taskmaster', 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, `ai-cost-alerts.log`);
  const logEntry = `[${new Date().toISOString()}] ${level.toUpperCase()}: Cost $${totalCost.toFixed(2)} | Requests ${totalRequests}\n`;
  fs.appendFileSync(logFile, logEntry);

  log.success(`告警已记录到: ${logFile}`);
}

// 生成成本报告
function generateReport(summary: DailyCostSummary): void {
  const { date, totalCost, totalRequests, totalTokens, modelBreakdown } = summary;

  console.log('\n' + '='.repeat(60));
  console.log(`📊 AI成本日报 - ${date}`);
  console.log('='.repeat(60) + '\n');

  console.log(`总成本: ${colors.bright}$${totalCost.toFixed(4)}${colors.reset}`);
  console.log(`总请求: ${totalRequests} 次`);
  console.log(`总Token: ${totalTokens.toLocaleString()}`);

  if (totalCost >= COST_THRESHOLDS.CRITICAL) {
    console.log(`状态: ${colors.red}${colors.bright}🚨 危险 (已达 $${COST_THRESHOLDS.CRITICAL})${colors.reset}`);
  } else if (totalCost >= COST_THRESHOLDS.WARNING) {
    console.log(`状态: ${colors.yellow}⚠️  警告 (已达 $${COST_THRESHOLDS.WARNING})${colors.reset}`);
  } else {
    console.log(`状态: ${colors.green}✓ 正常${colors.reset}`);
  }

  const percentage = (totalCost / COST_THRESHOLDS.CRITICAL) * 100;
  console.log(`预算使用: ${percentage.toFixed(1)}% / $${COST_THRESHOLDS.CRITICAL}`);

  // 模型使用详情
  console.log('\n📦 模型使用详情:');
  const sortedModels = Object.entries(modelBreakdown).sort((a, b) => b[1].cost - a[1].cost);
  
  for (const [model, stats] of sortedModels) {
    const modelPercentage = (stats.cost / totalCost) * 100;
    console.log(`  ${model}:`);
    console.log(`    - 请求: ${stats.requests} 次`);
    console.log(`    - 成本: $${stats.cost.toFixed(4)} (${modelPercentage.toFixed(1)}%)`);
    console.log(`    - Token: ${stats.tokens.toLocaleString()}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

// 主监控流程
async function monitorAICosts() {
  log.info('开始AI成本监控...\n');

  try {
    // 初始化数据库
    const supabase = initSupabase();

    // 获取今日成本
    log.info('正在查询今日成本数据...');
    const summary = await getTodayCost(supabase);
    
    // 生成报告
    generateReport(summary);

    // 检查是否需要告警
    const { totalCost } = summary;
    const registrationEnabled = await getRegistrationStatus(supabase);

    if (totalCost >= COST_THRESHOLDS.CRITICAL) {
      // 达到危险阈值
      log.critical(`成本已达危险阈值 $${COST_THRESHOLDS.CRITICAL}！`);
      
      if (registrationEnabled) {
        log.warn('正在关闭新用户注册...');
        await setRegistrationStatus(supabase, false);
      }

      await sendAlert('critical', summary);

    } else if (totalCost >= COST_THRESHOLDS.WARNING) {
      // 达到警告阈值
      log.warn(`成本已达警告阈值 $${COST_THRESHOLDS.WARNING}`);
      await sendAlert('warning', summary);

    } else {
      // 正常范围
      log.success('成本在正常范围内');

      // 如果之前因为超标而关闭了注册，现在可以考虑重新开启
      if (!registrationEnabled && totalCost < COST_THRESHOLDS.WARNING * 0.8) {
        log.info('成本已降至安全范围，可考虑重新开启注册');
        // 注意：这里不自动开启，需要手动确认
        log.info('运行以下命令重新开启注册:');
        log.info('  npx tsx scripts/toggle-registration.ts --enable');
      }
    }

    log.success('\n监控完成！');

  } catch (error) {
    log.error(`监控失败: ${error}`);
    console.error(error);
    process.exit(1);
  }
}

// 执行监控
monitorAICosts();
