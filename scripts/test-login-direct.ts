#!/usr/bin/env tsx
/**
 * 直接测试 Supabase 登录
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sibwcdadrsbfkblinezj.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpYndjZGFkcnNiZmtibGluZXpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODM2MjkyNiwiZXhwIjoyMDczOTM4OTI2fQ.BSvS72R5k9IWQjkWkCtwCM9kE5eOP41Ej7O2Q9S49nk';

async function testLogin() {
  console.log('🔧 Testing direct Supabase login...\n');

  const supabase = createClient(supabaseUrl, supabaseKey);

  const email = 'admin@qiflowai.com';
  const password = 'admin123456';

  console.log('📝 Attempting login...');
  console.log('   Email:', email);
  console.log('   Password:', password.replace(/./g, '*'));

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('\n❌ Login failed!');
    console.error('   Error:', error.message);
    console.error('   Status:', error.status);
    console.error('   Name:', error.name);
    
    if (error.message === 'Invalid login credentials') {
      console.log('\n💡 The password might be incorrect. Let\'s update it:');
      
      // Try to update the password
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        'fde07d10-5d92-455c-a48a-2d5b1503991d',
        { password: 'admin123456' }
      );
      
      if (updateError) {
        console.error('   Failed to update password:', updateError.message);
      } else {
        console.log('   ✅ Password updated successfully!');
        console.log('   Try logging in again.');
      }
    }
    return;
  }

  console.log('\n✅ Login successful!');
  console.log('   User ID:', data.user?.id);
  console.log('   Email:', data.user?.email);
  console.log('   Token:', data.session?.access_token?.substring(0, 50) + '...');
}

testLogin();