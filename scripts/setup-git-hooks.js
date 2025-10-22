#!/usr/bin/env node

/**
 * Git Hooks 安装脚本
 * 自动安装pre-commit钩子，在提交前检查国际化
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const gitHooksDir = path.join(process.cwd(), '.git', 'hooks');
const preCommitPath = path.join(gitHooksDir, 'pre-commit');

const preCommitScript = `#!/bin/sh

# QiFlow AI - Pre-commit 国际化检查

echo "🔍 运行国际化检查..."

# 运行检查脚本（只检查staged文件）
node scripts/check-i18n.js --changed

# 获取退出码
STATUS=$?

if [ $STATUS -ne 0 ]; then
  echo ""
  echo "❌ 提交失败：发现硬编码中文"
  echo ""
  echo "💡 修复建议:"
  echo "   1. 将中文移至翻译文件"
  echo "   2. 使用 useTranslations() 替换硬编码"
  echo "   3. 临时跳过: git commit --no-verify"
  echo ""
  exit 1
fi

echo "✅ 国际化检查通过"
exit 0
`;

function setupGitHooks() {
  console.log('🔧 设置 Git Hooks...\n');

  // 检查是否在Git仓库中
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.error('❌ 错误: 不在Git仓库中');
    process.exit(1);
  }

  // 创建hooks目录（如果不存在）
  if (!fs.existsSync(gitHooksDir)) {
    fs.mkdirSync(gitHooksDir, { recursive: true });
  }

  // 写入pre-commit脚本
  fs.writeFileSync(preCommitPath, preCommitScript, { mode: 0o755 });

  // 在Windows上确保可执行
  if (process.platform === 'win32') {
    try {
      execSync(`attrib +x "${preCommitPath}"`);
    } catch (error) {
      // 忽略错误，Windows可能不需要
    }
  } else {
    // Unix系统设置可执行权限
    fs.chmodSync(preCommitPath, 0o755);
  }

  console.log('✅ Pre-commit 钩子已安装');
  console.log(`   路径: ${preCommitPath}`);
  console.log('\n📝 使用说明:');
  console.log('   • 每次提交时会自动检查国际化');
  console.log('   • 如需跳过检查: git commit --no-verify');
  console.log('   • 手动运行检查: node scripts/check-i18n.js\n');
}

// 运行
setupGitHooks();
