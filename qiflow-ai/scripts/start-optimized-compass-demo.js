#!/usr/bin/env node

/**
 * 启动优化版风水罗盘演示的快速脚本
 */

import { execSync } from 'child_process';
import path from 'path';

console.log('🧭 启动优化版风水罗盘演示...\n');

try {
  // 检查是否在正确的目录
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  await import(packageJsonPath, { assert: { type: 'json' } }).catch(() => {});
  
  console.log('📦 检查依赖...');
  
  // 启动开发服务器
  console.log('🚀 启动开发服务器...');
  console.log('📍 演示页面将在以下地址打开:');
  console.log('   http://localhost:3000/compass-demo/optimized');
  console.log('\n✨ 优化亮点:');
  console.log('   • 解决外圈刻度数字重叠问题');
  console.log('   • 重新设计八卦文字显示');
  console.log('   • 重构九宫布局算法');
  console.log('   • 现代化配色方案');
  console.log('   • 增强整体可读性');
  console.log('\n🎯 使用说明:');
  console.log('   • 左侧面板可调整主题和设置');
  console.log('   • 支持传感器和AI分析功能');
  console.log('   • 右侧面板显示分析结果和事件日志');
  console.log('\n按 Ctrl+C 停止服务器\n');
  
  // 执行 npm run dev
  execSync('npm run dev', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ 启动失败:', error.message);
  console.log('\n💡 请确保:');
  console.log('   1. 在项目根目录执行此脚本');
  console.log('   2. 已安装所有依赖 (npm install)');
  console.log('   3. Next.js 项目配置正确');
  process.exit(1);
}