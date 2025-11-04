import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

async function insertAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('缺少 Supabase 配置');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@qiflowai.com';

  console.log(`插入管理员用户: ${adminEmail}`);

  // 插入到 user 表
  const { data, error } = await supabase.from('user').upsert(
    {
      id: '5d7b9abc-78d6-4513-b397-60c2ffeb175b',
      email: adminEmail,
      name: 'Admin',
      email_verified: true,
      role: 'admin',
      banned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'id',
    }
  );

  if (error) {
    console.error('插入失败:', error);
  } else {
    console.log('✅ 管理员用户已插入到 user 表');
  }

  // 验证插入结果
  const { data: users, error: queryError } = await supabase
    .from('user')
    .select('*')
    .eq('email', adminEmail);

  if (queryError) {
    console.error('查询失败:', queryError);
  } else if (users && users.length > 0) {
    console.log('\n管理员用户信息:');
    console.log('- ID:', users[0].id);
    console.log('- Email:', users[0].email);
    console.log('- Name:', users[0].name);
    console.log('- Role:', users[0].role);
    console.log('- Email Verified:', users[0].email_verified);
  } else {
    console.log('⚠️  未找到管理员用户');
  }
}

insertAdmin().catch(console.error);
