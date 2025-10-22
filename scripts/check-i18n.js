#!/usr/bin/env node

/**
 * CI/CD 国际化检查脚本
 * 自动检测代码中的硬编码中文，防止新增未翻译的文本
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// 配置
const CONFIG = {
  // 要扫描的目录
  scanDirs: ['src/app', 'src/components', 'src/lib'],

  // 排除的目录和文件模式
  excludePatterns: [
    'node_modules',
    '.next',
    'dist',
    'build',
    '.git',
    '*.test.ts',
    '*.test.tsx',
    '*.spec.ts',
    '*.spec.tsx',
    '__tests__',
    'stories',
  ],

  // 允许硬编码中文的例外文件（正则表达式）
  allowedFiles: [
    /\/config\//, // 配置文件
    /\/constants\//, // 常量定义文件
    /\/types\//, // 类型定义
    /\.stories\./, // Storybook stories
    /test-/, // 测试文件
    /demo-/, // 演示文件
  ],

  // 中文字符正则
  chineseRegex: /[\u4e00-\u9fa5]+/g,

  // 严格模式（失败时退出代码非0）
  strict: process.env.CI === 'true' || process.argv.includes('--strict'),

  // 最大允许的硬编码中文数量
  maxHardcodedChinese: 0,
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  if (process.env.NO_COLOR) return text;
  return `${colors[color]}${text}${colors.reset}`;
}

// 检查文件是否在允许列表中
function isAllowedFile(filePath) {
  return CONFIG.allowedFiles.some((pattern) => pattern.test(filePath));
}

// 检查行是否应该被忽略
function shouldIgnoreLine(line) {
  const trimmed = line.trim();

  // 忽略注释
  if (
    trimmed.startsWith('//') ||
    trimmed.startsWith('/*') ||
    trimmed.startsWith('*')
  ) {
    return true;
  }

  // 忽略import语句
  if (trimmed.startsWith('import ')) {
    return true;
  }

  // 忽略包含i18n标记的行
  if (
    trimmed.includes('// i18n-ignore') ||
    trimmed.includes('/* i18n-ignore */')
  ) {
    return true;
  }

  // 忽略console.log（开发调试用）
  if (trimmed.includes('console.log') || trimmed.includes('console.error')) {
    return true;
  }

  return false;
}

// 扫描单个文件
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const issues = [];

    lines.forEach((line, index) => {
      if (shouldIgnoreLine(line)) return;

      const matches = line.match(CONFIG.chineseRegex);
      if (matches) {
        issues.push({
          lineNumber: index + 1,
          line: line.trim(),
          matches: matches,
        });
      }
    });

    return issues;
  } catch (error) {
    console.error(colorize(`⚠️  无法读取文件: ${filePath}`, 'yellow'));
    return [];
  }
}

// 递归扫描目录
function scanDirectory(dirPath, results = []) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // 跳过排除的目录
      if (
        CONFIG.excludePatterns.some((pattern) => entry.name.includes(pattern))
      ) {
        continue;
      }

      if (entry.isDirectory()) {
        scanDirectory(fullPath, results);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.tsx', '.ts', '.jsx', '.js'].includes(ext)) {
          const relativePath = path.relative(process.cwd(), fullPath);

          // 跳过允许列表中的文件
          if (isAllowedFile(relativePath)) {
            continue;
          }

          const issues = scanFile(fullPath);
          if (issues.length > 0) {
            results.push({
              file: relativePath,
              issues: issues,
            });
          }
        }
      }
    }
  } catch (error) {
    console.error(colorize(`❌ 扫描目录失败: ${dirPath}`, 'red'));
  }

  return results;
}

// 获取Git变更的文件
async function getChangedFiles() {
  try {
    const { stdout } = await execPromise('git diff --name-only --cached');
    return stdout
      .split('\n')
      .filter(
        (f) =>
          f.endsWith('.tsx') ||
          f.endsWith('.ts') ||
          f.endsWith('.jsx') ||
          f.endsWith('.js')
      );
  } catch (error) {
    // 不在git仓库中或没有staged文件
    return [];
  }
}

// 主函数
async function main() {
  console.log(colorize('\n🔍 开始国际化检查...\n', 'cyan'));

  const startTime = Date.now();
  let allResults = [];

  // 是否只检查变更的文件（用于pre-commit）
  const changedOnly = process.argv.includes('--changed');

  if (changedOnly) {
    console.log(colorize('📝 仅检查Git staged文件\n', 'blue'));
    const changedFiles = await getChangedFiles();

    for (const file of changedFiles) {
      if (fs.existsSync(file) && !isAllowedFile(file)) {
        const issues = scanFile(file);
        if (issues.length > 0) {
          allResults.push({ file, issues });
        }
      }
    }
  } else {
    // 扫描所有配置的目录
    for (const dir of CONFIG.scanDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (fs.existsSync(fullPath)) {
        console.log(colorize(`📂 扫描: ${dir}`, 'blue'));
        const results = scanDirectory(fullPath);
        allResults = allResults.concat(results);
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // 统计
  const totalIssues = allResults.reduce((sum, r) => sum + r.issues.length, 0);

  console.log('\n' + '='.repeat(70));
  console.log(colorize('\n📊 检查结果汇总:\n', 'cyan'));
  console.log(`   ⏱️  扫描耗时: ${duration}秒`);
  console.log(
    `   📄 发现问题文件: ${colorize(allResults.length, allResults.length > 0 ? 'red' : 'green')} 个`
  );
  console.log(
    `   🔤 硬编码中文数量: ${colorize(totalIssues, totalIssues > 0 ? 'red' : 'green')} 处\n`
  );

  // 如果没有问题
  if (allResults.length === 0) {
    console.log(colorize('✅ 恭喜！未发现硬编码中文。\n', 'green'));
    process.exit(0);
  }

  // 输出详细问题
  console.log(colorize('❌ 发现以下硬编码中文问题:\n', 'red'));

  allResults.slice(0, 10).forEach((result, idx) => {
    console.log(colorize(`${idx + 1}. ${result.file}`, 'yellow'));
    console.log(
      colorize(`   共 ${result.issues.length} 处硬编码中文\n`, 'yellow')
    );

    result.issues.slice(0, 3).forEach((issue) => {
      console.log(colorize(`   第 ${issue.lineNumber} 行:`, 'cyan'));
      const preview = issue.line.substring(0, 80);
      console.log(`   ${preview}${issue.line.length > 80 ? '...' : ''}`);
      console.log(
        colorize(`   🔤 中文: ${issue.matches.join(', ')}\n`, 'magenta')
      );
    });

    if (result.issues.length > 3) {
      console.log(
        colorize(`   ... 还有 ${result.issues.length - 3} 处\n`, 'yellow')
      );
    }
  });

  if (allResults.length > 10) {
    console.log(
      colorize(
        `\n... 还有 ${allResults.length - 10} 个文件存在问题\n`,
        'yellow'
      )
    );
  }

  // 修复建议
  console.log('='.repeat(70));
  console.log(colorize('\n💡 修复建议:\n', 'cyan'));
  console.log(
    '   1. 将硬编码中文移动到翻译文件 (src/locales/[lang]/common.json)'
  );
  console.log('   2. 使用 useTranslations() 钩子替换硬编码文本');
  console.log('   3. 对于必须保留的中文，添加 // i18n-ignore 注释');
  console.log('   4. 参考国际化规范: docs/i18n-guide.md\n');

  console.log(colorize('📚 示例:\n', 'cyan'));
  console.log('   ❌ const title = "欢迎使用";');
  console.log('   ✅ const t = useTranslations("Common");');
  console.log('      const title = t("welcome");\n');

  // 生成JSON报告（用于CI）
  if (process.env.CI) {
    const reportPath = path.join(process.cwd(), 'i18n-check-report.json');
    fs.writeFileSync(
      reportPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          duration,
          filesChecked: allResults.length,
          totalIssues,
          issues: allResults,
        },
        null,
        2
      )
    );
    console.log(colorize(`📄 报告已保存: ${reportPath}\n`, 'blue'));
  }

  // 严格模式下，如果有问题则退出码为1
  if (CONFIG.strict && totalIssues > CONFIG.maxHardcodedChinese) {
    console.log(colorize('❌ 检查失败：发现硬编码中文\n', 'red'));
    process.exit(1);
  } else {
    console.log(colorize('⚠️  警告模式：检查完成，但存在问题\n', 'yellow'));
    process.exit(0);
  }
}

// 运行
main().catch((error) => {
  console.error(colorize('\n❌ 执行失败:', 'red'), error);
  process.exit(1);
});
