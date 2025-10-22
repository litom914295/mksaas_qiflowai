const fs = require('fs');
const path = require('path');

// 要扫描的目录
const dirsToScan = ['src/app', 'src/components', 'src/config', 'src/lib'];

// 要排除的目录
const excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git'];

// 要扫描的文件扩展名
const validExtensions = ['.tsx', '.ts', '.jsx', '.js'];

// 中文字符正则
const chineseRegex = /[\u4e00-\u9fa5]+/g;

// 结果存储
const results = [];

/**
 * 递归扫描目录
 */
function scanDirectory(dirPath) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      // 跳过排除的目录
      if (entry.isDirectory() && excludeDirs.includes(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (validExtensions.includes(ext)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`❌ 无法读取目录: ${dirPath}`, error.message);
  }
}

/**
 * 扫描单个文件
 */
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const findings = [];

    lines.forEach((line, index) => {
      const matches = line.match(chineseRegex);
      if (matches) {
        // 排除注释行
        const trimmedLine = line.trim();
        if (
          trimmedLine.startsWith('//') ||
          trimmedLine.startsWith('/*') ||
          trimmedLine.startsWith('*')
        ) {
          return;
        }

        // 排除import语句
        if (trimmedLine.startsWith('import ')) {
          return;
        }

        findings.push({
          lineNumber: index + 1,
          line: line.trim(),
          matches: matches,
        });
      }
    });

    if (findings.length > 0) {
      results.push({
        file: path.relative(process.cwd(), filePath),
        findings: findings,
      });
    }
  } catch (error) {
    console.error(`❌ 无法读取文件: ${filePath}`, error.message);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 开始扫描项目中的硬编码中文...\n');

  const startTime = Date.now();

  // 扫描指定目录
  for (const dir of dirsToScan) {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) {
      console.log(`📂 正在扫描: ${dir}`);
      scanDirectory(fullPath);
    } else {
      console.log(`⚠️  目录不存在: ${dir}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('\n📊 扫描结果汇总:\n');
  console.log(`   ⏱️  扫描耗时: ${duration}秒`);
  console.log(`   📄 发现问题文件: ${results.length}个\n`);

  if (results.length === 0) {
    console.log('✅ 恭喜！未发现硬编码中文文本。\n');
    return;
  }

  // 按文件分类统计
  const byDirectory = {};
  results.forEach((item) => {
    const dir = path.dirname(item.file);
    if (!byDirectory[dir]) {
      byDirectory[dir] = [];
    }
    byDirectory[dir].push(item);
  });

  console.log('📁 按目录分类:\n');
  Object.keys(byDirectory)
    .sort()
    .forEach((dir) => {
      const files = byDirectory[dir];
      console.log(`   ${dir}/`);
      console.log(`   └─ ${files.length} 个文件包含中文\n`);
    });

  console.log('\n' + '='.repeat(70));
  console.log('\n📝 详细结果:\n');

  // 输出详细结果
  results.forEach((result, idx) => {
    console.log(`${idx + 1}. 📄 ${result.file}`);
    console.log(`   共 ${result.findings.length} 处中文\n`);

    result.findings.slice(0, 5).forEach((finding) => {
      console.log(`   第 ${finding.lineNumber} 行:`);
      console.log(
        `   ${finding.line.substring(0, 100)}${finding.line.length > 100 ? '...' : ''}`
      );
      console.log(`   🔤 中文: ${finding.matches.join(', ')}\n`);
    });

    if (result.findings.length > 5) {
      console.log(`   ... 还有 ${result.findings.length - 5} 处中文\n`);
    }

    console.log('');
  });

  // 生成报告文件
  const reportPath = path.join(process.cwd(), 'chinese-scan-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`💾 完整报告已保存至: ${reportPath}\n`);

  // 生成修复建议
  console.log('='.repeat(70));
  console.log('\n💡 修复建议:\n');
  console.log('   1. 检查每个文件中的中文是否需要翻译');
  console.log('   2. 将需要翻译的文本移动到对应的语言文件中');
  console.log('   3. 使用 useTranslations() 或 t() 函数替换硬编码文本');
  console.log('   4. 对于配置文件中的中文，确保有对应的翻译键');
  console.log('   5. 考虑为专业术语添加到 QiFlow.terms 命名空间\n');

  console.log('📚 相关文件:');
  console.log('   • src/locales/[lang]/common.json - 通用翻译');
  console.log('   • src/locales/[lang]/chat.json - 聊天相关翻译');
  console.log('   • src/config/* - 配置文件\n');
}

// 执行
main();
