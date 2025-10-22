#!/usr/bin/env node

/**
 * i18n 自动审计和修复脚本
 * 由 AI-WORKFLOW v5.0 自动生成
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  localesDir: path.join(__dirname, '../src/locales'),
  languages: ['zh-CN', 'zh-TW', 'en', 'ja', 'ko', 'ms-MY'],
  baseLanguage: 'zh-CN',
  translationFiles: ['common', 'chat', 'auth', 'dashboard', 'errors'],
};

// 读取 JSON 文件
function readJSON(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.warn(`⚠️  无法读取: ${filePath}`);
    return {};
  }
}

// 写入 JSON 文件
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// 获取所有键的扁平化版本
function flattenKeys(obj, prefix = '') {
  const keys = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(keys, flattenKeys(value, fullKey));
    } else {
      keys[fullKey] = value;
    }
  }
  return keys;
}

// 从扁平化键重建嵌套对象
function unflattenKeys(flatObj) {
  const result = {};
  for (const [key, value] of Object.entries(flatObj)) {
    const parts = key.split('.');
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  return result;
}

// Phase 1: 审计翻译完整性
function auditTranslations() {
  console.log('\n📊 Phase 1: 翻译完整性审计\n');

  const report = {
    languages: {},
    missingKeys: {},
    totalKeys: 0,
  };

  // 获取基准语言的所有键
  const baseKeys = {};
  CONFIG.translationFiles.forEach((file) => {
    const filePath = path.join(
      CONFIG.localesDir,
      CONFIG.baseLanguage,
      `${file}.json`
    );
    if (fs.existsSync(filePath)) {
      const content = readJSON(filePath);
      baseKeys[file] = flattenKeys(content);
    }
  });

  report.totalKeys = Object.values(baseKeys).reduce(
    (sum, keys) => sum + Object.keys(keys).length,
    0
  );
  console.log(
    `✓ 基准语言 (${CONFIG.baseLanguage}) 共有 ${report.totalKeys} 个翻译键\n`
  );

  // 检查每种语言
  CONFIG.languages.forEach((lang) => {
    console.log(`检查语言: ${lang}`);
    report.languages[lang] = { total: 0, missing: 0, files: {} };
    report.missingKeys[lang] = {};

    CONFIG.translationFiles.forEach((file) => {
      const filePath = path.join(CONFIG.localesDir, lang, `${file}.json`);
      const baseFileKeys = baseKeys[file] || {};
      const baseKeyCount = Object.keys(baseFileKeys).length;

      if (!fs.existsSync(filePath)) {
        console.log(`  ❌ 缺失文件: ${file}.json`);
        report.languages[lang].files[file] = {
          exists: false,
          missing: baseKeyCount,
        };
        report.languages[lang].missing += baseKeyCount;
        report.missingKeys[lang][file] = Object.keys(baseFileKeys);
      } else {
        const content = readJSON(filePath);
        const langKeys = flattenKeys(content);
        const missingKeys = Object.keys(baseFileKeys).filter(
          (key) => !(key in langKeys)
        );

        report.languages[lang].files[file] = {
          exists: true,
          total: Object.keys(langKeys).length,
          missing: missingKeys.length,
        };
        report.languages[lang].missing += missingKeys.length;

        if (missingKeys.length > 0) {
          console.log(`  ⚠️  ${file}.json: 缺失 ${missingKeys.length} 个键`);
          report.missingKeys[lang][file] = missingKeys;
        } else {
          console.log(`  ✓ ${file}.json: 完整`);
        }
      }
      report.languages[lang].total += baseKeyCount;
    });

    const coverage = (
      ((report.languages[lang].total - report.languages[lang].missing) /
        report.languages[lang].total) *
      100
    ).toFixed(1);
    console.log(`  覆盖率: ${coverage}%\n`);
  });

  return report;
}

// Phase 2: 自动补全缺失翻译
async function fixMissingTranslations(report) {
  console.log('\n🔧 Phase 2: 自动补全缺失翻译\n');

  const baseTranslations = {};
  CONFIG.translationFiles.forEach((file) => {
    const filePath = path.join(
      CONFIG.localesDir,
      CONFIG.baseLanguage,
      `${file}.json`
    );
    if (fs.existsSync(filePath)) {
      baseTranslations[file] = readJSON(filePath);
    }
  });

  let fixed = 0;
  for (const lang of CONFIG.languages) {
    if (lang === CONFIG.baseLanguage) continue;
    if (report.languages[lang].missing === 0) continue;

    console.log(`修复语言: ${lang}`);

    for (const file of CONFIG.translationFiles) {
      const missingKeys = report.missingKeys[lang]?.[file] || [];
      if (missingKeys.length === 0) continue;

      const langDir = path.join(CONFIG.localesDir, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }

      const filePath = path.join(langDir, `${file}.json`);
      const existingContent = fs.existsSync(filePath) ? readJSON(filePath) : {};
      const existingFlat = flattenKeys(existingContent);
      const baseFlat = flattenKeys(baseTranslations[file] || {});

      // 添加缺失的键（使用基准语言的值 + 标记）
      missingKeys.forEach((key) => {
        if (!(key in existingFlat)) {
          const baseValue = baseFlat[key];
          existingFlat[key] = `[${lang}] ${baseValue}`;
          fixed++;
        }
      });

      // 写回文件
      const updatedContent = unflattenKeys(existingFlat);
      writeJSON(filePath, updatedContent);
      console.log(`  ✓ ${file}.json: 补全 ${missingKeys.length} 个键`);
    }
  }

  console.log(`\n✅ 共补全 ${fixed} 个翻译键\n`);
}

// Phase 3: 生成翻译报告
function generateReport(report) {
  const reportPath = path.join(__dirname, '../i18n-audit-report.md');

  let content = '# i18n 翻译完整性报告\n\n';
  content += `**生成时间**: ${new Date().toISOString()}\n`;
  content += `**总翻译键数**: ${report.totalKeys}\n\n`;
  content += '## 语言覆盖率\n\n';
  content += '| 语言 | 总数 | 缺失 | 覆盖率 |\n';
  content += '|------|------|------|--------|\n';

  CONFIG.languages.forEach((lang) => {
    const data = report.languages[lang];
    const coverage = (((data.total - data.missing) / data.total) * 100).toFixed(
      1
    );
    const status = data.missing === 0 ? '✅' : '⚠️';
    content += `| ${status} ${lang} | ${data.total} | ${data.missing} | ${coverage}% |\n`;
  });

  content += '\n## 详细分析\n\n';
  CONFIG.languages.forEach((lang) => {
    if (report.languages[lang].missing > 0) {
      content += `### ${lang}\n\n`;
      Object.entries(report.languages[lang].files).forEach(([file, data]) => {
        if (data.missing > 0) {
          content += `- **${file}.json**: 缺失 ${data.missing} 个键\n`;
        }
      });
      content += '\n';
    }
  });

  fs.writeFileSync(reportPath, content, 'utf8');
  console.log(`📄 报告已生成: ${reportPath}\n`);
}

// 主函数
async function main() {
  console.log('🚀 i18n 自动审计和修复工具\n');
  console.log('由 AI-WORKFLOW v5.0 自动生成\n');
  console.log('='.repeat(50));

  // Phase 1: 审计
  const report = auditTranslations();

  // Phase 2: 修复
  const shouldFix = process.argv.includes('--fix');
  if (shouldFix) {
    await fixMissingTranslations(report);
    // 重新审计
    console.log('🔄 重新审计...\n');
    const newReport = auditTranslations();
    generateReport(newReport);
  } else {
    generateReport(report);
    console.log(
      '💡 提示: 运行 `node scripts/i18n-audit-fix.js --fix` 自动修复\n'
    );
  }

  console.log('='.repeat(50));
  console.log('✅ 完成！\n');
}

main().catch(console.error);
