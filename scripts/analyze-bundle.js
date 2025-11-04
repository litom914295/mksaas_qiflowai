#!/usr/bin/env node

/**
 * Bundle 分析脚本
 * 用于分析项目打包大小和依赖关系
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 开始分析项目 Bundle...\n');

// 1. 检查是否有 @next/bundle-analyzer
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const hasBundleAnalyzer =
  packageJson.dependencies['@next/bundle-analyzer'] ||
  packageJson.devDependencies['@next/bundle-analyzer'];

if (!hasBundleAnalyzer) {
  console.log('⚠️  未找到 @next/bundle-analyzer，正在安装...');
  try {
    execSync('npm install --save-dev @next/bundle-analyzer', {
      stdio: 'inherit',
    });
    console.log('✅ @next/bundle-analyzer 安装完成\n');
  } catch (error) {
    console.log('❌ @next/bundle-analyzer 安装失败\n');
    process.exit(1);
  }
}

// 2. 运行 Bundle 分析
console.log('🔍 运行 Bundle 分析...');
try {
  execSync('ANALYZE=true npm run build', { stdio: 'inherit' });
  console.log('✅ Bundle 分析完成\n');
} catch (error) {
  console.log('❌ Bundle 分析失败\n');
  process.exit(1);
}

// 3. 显示分析结果
console.log('📈 Bundle 分析结果：');
console.log('   - 分析报告已生成在 .next/analyze/ 目录');
console.log('   - 可以在浏览器中打开查看详细的依赖关系');
console.log('   - 重点关注较大的依赖包，考虑按需加载\n');

// 4. 提供优化建议
console.log('💡 优化建议：');
console.log('   1. 检查是否有未使用的依赖包');
console.log('   2. 考虑使用动态导入 (dynamic import)');
console.log('   3. 优化图片和静态资源');
console.log('   4. 使用 Tree Shaking 移除未使用的代码');
console.log('   5. 考虑代码分割 (Code Splitting)');
