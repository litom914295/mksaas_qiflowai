#!/usr/bin/env node

/**
 * 快速开发启动脚本
 * 清理缓存并使用优化配置启动开发服务器
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');
const NEXT_DIR = path.join(ROOT_DIR, '.next');
const TURBO_DIR = path.join(ROOT_DIR, '.turbo');

console.log('🚀 快速开发模式启动...\n');

// 1. 清理缓存（可选）
if (process.argv.includes('--clean')) {
  console.log('🧹 清理编译缓存...');

  const dirsToClean = [NEXT_DIR, TURBO_DIR];

  for (const dir of dirsToClean) {
    if (fs.existsSync(dir)) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`   ✓ 已删除 ${path.basename(dir)}`);
      } catch (err) {
        console.warn(`   ⚠ 无法删除 ${path.basename(dir)}: ${err.message}`);
      }
    }
  }
  console.log('');
}

// 2. 环境变量优化
console.log('⚙️  设置开发环境优化配置...');
process.env.NODE_ENV = 'development';
process.env.NEXT_TELEMETRY_DISABLED = '1'; // 禁用遥测
process.env.DISABLE_CREDITS_DB = 'true'; // 禁用积分数据库（如不需要）
console.log('   ✓ 已应用优化配置\n');

// 3. 性能提示
console.log('💡 性能提示:');
console.log('   - 首次启动会较慢（需要构建缓存）');
console.log('   - 后续刷新会利用缓存，速度会快很多');
console.log('   - 使用 --clean 参数可以清理缓存重新构建');
console.log('   - 避免同时打开过多页面\n');

// 4. 启动开发服务器
console.log('🎬 启动开发服务器...\n');
console.log('━'.repeat(50));

try {
  execSync('npm run dev', {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: '1',
    },
  });
} catch (err) {
  console.error('\n❌ 启动失败:', err.message);
  process.exit(1);
}
