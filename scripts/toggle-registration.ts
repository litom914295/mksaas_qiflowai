#!/usr/bin/env node
/**
 * 注册功能开关控制脚本
 * 
 * 使用方法：
 * - 开启注册: npx tsx scripts/toggle-registration.ts --enable
 * - 关闭注册: npx tsx scripts/toggle-registration.ts --disable
 * - 查看状态: npx tsx scripts/toggle-registration.ts --status
 */

import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import path from 'path';

// 加载环境变量
loadEnv({ path: path.resolve(process.cwd(), '.env.local') });

// 解析命令行参数
const args = process.argv.slice(2);
const action = args.find(arg => ['--enable', '--disable', '--status'].includes(arg));

// 颜色输出
const colors = {
  reset: '\x1b[0m',
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
};

// 初始化 Supabase
function initSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials not found');
  }

  return createClient(supabaseUrl, serviceKey);
}

// 获取注册状态
async function getStatus(supabase: any): Promise<boolean> {
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

// 设置注册状态
async function setStatus(supabase: any, enabled: boolean): Promise<void> {
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

// 显示使用帮助
function showUsage() {
  console.log('\n使用方法:');
  console.log('  开启注册: npx tsx scripts/toggle-registration.ts --enable');
  console.log('  关闭注册: npx tsx scripts/toggle-registration.ts --disable');
  console.log('  查看状态: npx tsx scripts/toggle-registration.ts --status\n');
}

// 主函数
async function main() {
  if (!action) {
    log.error('请指定操作: --enable, --disable, 或 --status');
    showUsage();
    process.exit(1);
  }

  try {
    const supabase = initSupabase();

    switch (action) {
      case '--status': {
        const enabled = await getStatus(supabase);
        console.log('\n' + '='.repeat(40));
        console.log(`注册功能状态: ${enabled ? `${colors.green}开启${colors.reset}` : `${colors.red}关闭${colors.reset}`}`);
        console.log('='.repeat(40) + '\n');
        break;
      }

      case '--enable': {
        log.info('正在开启注册功能...');
        await setStatus(supabase, true);
        break;
      }

      case '--disable': {
        log.warn('正在关闭注册功能...');
        await setStatus(supabase, false);
        log.info('提示: 现有用户不受影响，仅阻止新用户注册');
        break;
      }
    }

    log.success('操作完成！');
  } catch (error) {
    log.error(`操作失败: ${error}`);
    console.error(error);
    process.exit(1);
  }
}

main();
