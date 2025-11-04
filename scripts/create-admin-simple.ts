#!/usr/bin/env tsx
/**
 * 使用 Supabase Auth 创建管理员用户
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  console.log('🔧 Creating admin user via Supabase Auth...\n');

  const email = 'admin@qiflowai.com';
  const password = 'admin123456';
  const name = 'Admin';

  try {
    // 1. 先检查用户是否存在
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }

    const existingUser = existingUsers?.users.find(u => u.email === email);
    
    if (existingUser) {
      console.log('ℹ️  User already exists:', existingUser.email);
      console.log('   ID:', existingUser.id);
      console.log('   Created:', existingUser.created_at);
      console.log('\n💡 To reset password, use Supabase Dashboard or delete and recreate');
      return;
    }

    // 2. 创建新用户
    console.log('📝 Creating user in Supabase Auth...');
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自动确认邮箱
      user_metadata: {
        name,
        role: 'admin',
      },
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);
      return;
    }

    console.log('✅ Admin user created successfully!');
    console.log('\n👤 User Details:');
    console.log('   Email:', data.user.email);
    console.log('   ID:', data.user.id);
    console.log('   Email Verified:', data.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('   Created:', data.user.created_at);

    console.log('\n🔑 Login Credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('\n🌐 Login URL:');
    console.log('   http://localhost:3001/zh-CN/auth/login');

  } catch (error: any) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createAdmin();
