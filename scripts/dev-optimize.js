#!/usr/bin/env node

/**
 * 开发环境优化脚本
 * 用于清理缓存和优化开发体验
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始优化开发环境...\n');

// 1. 清理 Next.js 缓存
console.log('📦 清理 Next.js 缓存...');
try {
  execSync('npx next clean', { stdio: 'inherit' });
  console.log('✅ Next.js 缓存清理完成\n');
} catch (error) {
  console.log('⚠️  Next.js 缓存清理失败，继续执行...\n');
}

// 2. 清理 node_modules/.cache
console.log('🗑️  清理 node_modules 缓存...');
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  try {
    execSync(`rmdir /s /q "${cacheDir}"`, { stdio: 'inherit' });
    console.log('✅ node_modules 缓存清理完成\n');
  } catch (error) {
    console.log('⚠️  node_modules 缓存清理失败，继续执行...\n');
  }
}

// 3. 清理 TypeScript 缓存
console.log('🔧 清理 TypeScript 缓存...');
const tsCacheDir = path.join(process.cwd(), '.next', 'cache');
if (fs.existsSync(tsCacheDir)) {
  try {
    execSync(`rmdir /s /q "${tsCacheDir}"`, { stdio: 'inherit' });
    console.log('✅ TypeScript 缓存清理完成\n');
  } catch (error) {
    console.log('⚠️  TypeScript 缓存清理失败，继续执行...\n');
  }
}

// 4. 重新安装依赖（可选）
const shouldReinstall = process.argv.includes('--reinstall');
if (shouldReinstall) {
  console.log('📥 重新安装依赖...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ 依赖重新安装完成\n');
  } catch (error) {
    console.log('❌ 依赖重新安装失败\n');
  }
}

// 5. 优化 node_modules（删除不必要的文件）
if (process.argv.includes('--deep-clean')) {
  console.log('🧹 执行深度清理...');
  const dirsToClean = [
    'node_modules/.cache',
    'node_modules/.vite',
    '.turbo',
    '.next',
  ];

  dirsToClean.forEach((dir) => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ 已清理: ${dir}`);
      } catch (error) {
        console.log(`⚠️  清理失败: ${dir}`);
      }
    }
  });
  console.log('✅ 深度清理完成\n');
}

console.log('🎉 开发环境优化完成！');
console.log('💡 建议：');
console.log('   - 使用 npm run dev 启动开发服务器（已启用 Turbopack）');
console.log('   - 首次启动可能需要较长时间，后续会利用缓存更快');
console.log('   - 如果仍然很慢，运行: npm run dev:clean');
console.log('   - 深度清理: node scripts/dev-optimize.js --deep-clean');
