/**
 * 网络连接测试脚本
 * 测试 Supabase 数据库的网络连接
 */

const dns = require('dns');
const { promisify } = require('util');
const lookup = promisify(dns.lookup);

const hosts = [
  'sibwcdadrsbfkblinezj.pooler.supabase.net', // Session Pooler
  'db.sibwcdadrsbfkblinezj.supabase.co', // Direct Connection
  'supabase.com', // Supabase 主站
  'google.com', // 测试基本网络
];

async function testDNS() {
  console.log('========================================');
  console.log('DNS 和网络连接测试');
  console.log('========================================\n');

  for (const host of hosts) {
    try {
      console.log(`测试: ${host}`);
      const result = await lookup(host);
      console.log(`✅ 成功: ${result.address} (${result.family})`);
    } catch (error) {
      console.error(`❌ 失败: ${error.code || error.message}`);
    }
    console.log('');
  }

  console.log('========================================');
  console.log('诊断建议:');
  console.log('========================================');
  console.log('1. 如果 google.com 失败 → 基本网络有问题');
  console.log('2. 如果 supabase.com 失败 → Supabase 被屏蔽');
  console.log('3. 如果两个数据库地址都失败 → DNS 问题');
  console.log('4. 如果只有 pooler 失败 → 使用 Direct Connection');
  console.log('');
  console.log('解决方案:');
  console.log('- 使用 VPN');
  console.log('- 修改 DNS 服务器(如 8.8.8.8)');
  console.log('- 或在 .env 中只使用 DIRECT_DATABASE_URL');
}

testDNS();
