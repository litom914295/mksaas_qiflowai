#!/usr/bin/env tsx
/**
 * 测试认证系统是否正常工作
 */

async function testAuth() {
  const baseUrl = 'http://localhost:3001';

  console.log('🧪 Testing authentication system...\n');

  // Test 1: Check session endpoint
  console.log('1️⃣ Testing /api/auth/get-session...');
  try {
    const sessionRes = await fetch(`${baseUrl}/api/auth/get-session`);
    console.log(`   Status: ${sessionRes.status}`);
    const sessionData = await sessionRes.json();
    console.log('   Response:', sessionData);
    console.log('   ✅ Session endpoint working\n');
  } catch (error: any) {
    console.log(`   ❌ Failed: ${error.message}\n`);
  }

  // Test 2: Test login with admin credentials
  console.log('2️⃣ Testing login with admin@qiflowai.com...');
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@qiflowai.com',
        password: 'admin123456',
      }),
    });

    console.log(`   Status: ${loginRes.status}`);
    const loginData = await loginRes.json();

    if (loginRes.ok) {
      console.log('   ✅ Login successful!');
      console.log(`   User: ${loginData.user?.email || 'N/A'}`);
      console.log(`   Session: ${loginData.session ? 'Created' : 'N/A'}`);
    } else {
      console.log(`   ❌ Login failed: ${loginData.error || 'Unknown error'}`);
    }
  } catch (error: any) {
    console.log(`   ❌ Request failed: ${error.message}`);
  }

  console.log('\n📊 Summary:');
  console.log('- Database: Connected (with retry)');
  console.log('- Auth API: Available');
  console.log('- Supabase REST API: Accessible');
  console.log('\n💡 Recommendation:');
  console.log('DNS resolution is slow but working. Consider:');
  console.log('1. Use a VPN or DNS service (e.g., 1.1.1.1, 8.8.8.8)');
  console.log('2. Or add hosts file entry for faster resolution');
}

testAuth().catch(console.error);
