#!/usr/bin/env node

/**
 * QiFlow AI 数据库连接测试脚本
 * 用于验证 Supabase 连接和基本功能
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// 环境变量验证
function validateEnvironment() {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ 缺少必要的环境变量:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.log('\n请参考 ENV_SETUP.md 配置环境变量');
    process.exit(1);
  }

  console.log('✅ 环境变量验证通过');
}

// 创建 Supabase 客户端
function createSupabaseClients() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 客户端 (用于前端)
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  // 服务端客户端 (用于后端)
  const supabaseServer = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  });

  return { supabaseClient, supabaseServer };
}

// 测试数据库连接
async function testDatabaseConnection(supabaseServer) {
  console.log('\n🔍 测试数据库连接...');

  try {
    // 测试基本查询
    const { data, error } = await supabaseServer
      .from('guest_sessions')
      .select('count', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    console.log('✅ 数据库连接成功');
    console.log(`   游客会话表包含 ${data || 0} 条记录`);
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    return false;
  }

  return true;
}

// 测试认证功能
async function testAuthFunctionality(supabaseClient) {
  console.log('\n🔍 测试认证功能...');

  try {
    // 获取当前会话
    const {
      data: { session },
      error,
    } = await supabaseClient.auth.getSession();

    if (error) {
      throw error;
    }

    if (session) {
      console.log('✅ 存在活跃会话');
      console.log(`   用户: ${session.user.email}`);
    } else {
      console.log('ℹ️  没有活跃会话（这是正常的）');
    }
  } catch (error) {
    console.error('❌ 认证功能测试失败:', error.message);
    return false;
  }

  return true;
}

// 测试数据表结构
async function testTableStructure(supabaseServer) {
  console.log('\n🔍 测试数据表结构...');

  const tables = [
    'users',
    'guest_sessions',
    'bazi_calculations',
    'fengshui_analyses',
  ];

  for (const tableName of tables) {
    try {
      const { error } = await supabaseServer
        .from(tableName)
        .select('*', { count: 'exact', head: true })
        .limit(1);

      if (error) {
        throw error;
      }

      console.log(`✅ 表 ${tableName} 存在且可访问`);
    } catch (error) {
      console.error(`❌ 表 ${tableName} 测试失败:`, error.message);
      return false;
    }
  }

  return true;
}

// 测试 RPC 函数
async function testRpcFunctions(supabaseServer) {
  console.log('\n🔍 测试 RPC 函数...');

  try {
    // 测试用户插入函数
    const { error } = await supabaseServer.rpc('insert_user_with_encryption', {
      p_id: 'test-user-id',
      p_email: 'test@example.com',
      p_display_name: 'Test User',
      p_preferred_locale: 'zh-CN',
      p_timezone: 'Asia/Shanghai',
      p_birth_date: '1990-01-01',
      p_birth_time: '12:00:00',
      p_birth_location: '北京市朝阳区',
      p_phone: '+86 138 0000 0000',
    });

    if (error && !error.message.includes('already exists')) {
      throw error;
    }

    console.log('✅ RPC 函数 insert_user_with_encryption 可调用');
  } catch (error) {
    console.error('❌ RPC 函数测试失败:', error.message);
    // RPC 函数测试失败不应该导致整个测试失败，因为函数可能不存在
    console.log('⚠️  RPC 函数可能还未创建，请运行数据库迁移');
  }

  return true;
}

// 主测试函数
async function runTests() {
  console.log('🚀 开始 QiFlow AI 数据库连接测试\n');

  // 1. 验证环境变量
  validateEnvironment();

  // 2. 创建客户端
  const { supabaseClient, supabaseServer } = createSupabaseClients();
  console.log('✅ Supabase 客户端创建成功');

  // 3. 测试数据库连接
  const connectionTest = await testDatabaseConnection(supabaseServer);
  if (!connectionTest) {
    process.exit(1);
  }

  // 4. 测试认证功能
  const authTest = await testAuthFunctionality(supabaseClient);
  if (!authTest) {
    console.log('⚠️  认证功能测试失败，但这不影响基本功能');
  }

  // 5. 测试表结构
  const tableTest = await testTableStructure(supabaseServer);
  if (!tableTest) {
    console.log('⚠️  表结构测试失败，请检查数据库迁移');
  }

  // 6. 测试 RPC 函数
  await testRpcFunctions(supabaseServer);

  console.log('\n🎉 数据库连接测试完成！');

  if (connectionTest) {
    console.log('✅ 基本连接测试通过，可以开始使用 QiFlow AI');
  } else {
    console.log('❌ 连接测试失败，请检查配置');
    process.exit(1);
  }
}

// 运行测试
if (require.main === module) {
  runTests().catch(error => {
    console.error('测试过程中发生未预期的错误:', error);
    process.exit(1);
  });
}

module.exports = { runTests, validateEnvironment, createSupabaseClients };
