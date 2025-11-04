/**
 * 迁移验证脚本
 *
 * 快速验证所有迁移的组件是否正确使用统一引擎
 */

import fs from 'fs';
import path from 'path';

const migratedFiles = [
  'src/components/qiflow/analysis/report-fengshui-analysis.tsx',
  'src/components/analysis/xuankong-analysis-page.tsx',
  'app/[locale]/(routes)/report/page-enhanced.tsx',
  'src/app/api/qiflow/xuankong/route.ts',
];

const testFiles = [
  'src/components/qiflow/analysis/__tests__/report-fengshui-analysis.test.tsx',
  'src/components/analysis/__tests__/xuankong-analysis-page.test.tsx',
  'src/app/api/qiflow/xuankong/__tests__/route.test.ts',
];

interface CheckResult {
  file: string;
  exists: boolean;
  hasUnifiedEngine: boolean;
  hasAdapter: boolean;
  hasOldImports: boolean;
  status: 'pass' | 'fail' | 'warning';
  issues: string[];
}

function checkFile(filePath: string): CheckResult {
  const fullPath = path.join(process.cwd(), filePath);
  const result: CheckResult = {
    file: filePath,
    exists: false,
    hasUnifiedEngine: false,
    hasAdapter: false,
    hasOldImports: false,
    status: 'pass',
    issues: [],
  };

  if (!fs.existsSync(fullPath)) {
    result.status = 'fail';
    result.issues.push('文件不存在');
    return result;
  }

  result.exists = true;
  const content = fs.readFileSync(fullPath, 'utf-8');

  // 检查是否导入统一引擎
  result.hasUnifiedEngine =
    content.includes("from '@/lib/qiflow/unified'") ||
    content.includes('from "@/lib/qiflow/unified"');

  // 检查是否使用适配器
  result.hasAdapter = content.includes('adaptToFrontend');

  // 检查是否还有旧的导入（排除类型导入）
  const lines = content.split('\n');
  const oldFunctionCalls = [
    'comprehensiveAnalysis(',
    'runComprehensiveAnalysis(',
    'generateFlyingStar(',
  ];

  for (const line of lines) {
    // 跳过类型导入行
    if (
      line.includes('import type') ||
      line.includes('type ComprehensiveAnalysisResult')
    ) {
      continue;
    }

    // 检查旧函数调用
    for (const oldCall of oldFunctionCalls) {
      if (line.includes(oldCall)) {
        result.hasOldImports = true;
        result.issues.push(`发现旧函数调用: ${oldCall}`);
      }
    }
  }

  // 如果是测试文件，不需要统一引擎
  const isTestFile =
    filePath.includes('__tests__') || filePath.includes('.test.');

  if (!isTestFile) {
    if (!result.hasUnifiedEngine) {
      result.status = 'fail';
      result.issues.push('缺少 UnifiedFengshuiEngine 导入');
    }

    if (!result.hasAdapter && !filePath.includes('api')) {
      result.status = 'warning';
      result.issues.push('缺少 adaptToFrontend 导入');
    }
  }

  if (result.hasOldImports) {
    result.status = 'fail';
  }

  return result;
}

function main() {
  console.log('🔍 验证组件迁移状态...\n');

  const results: CheckResult[] = [];

  console.log('📦 检查迁移的组件:');
  for (const file of migratedFiles) {
    const result = checkFile(file);
    results.push(result);

    const icon =
      result.status === 'pass'
        ? '✅'
        : result.status === 'warning'
          ? '⚠️'
          : '❌';
    console.log(`${icon} ${file}`);

    if (result.issues.length > 0) {
      result.issues.forEach((issue) => console.log(`   └─ ${issue}`));
    }
  }

  console.log('\n🧪 检查测试文件:');
  for (const file of testFiles) {
    const fullPath = path.join(process.cwd(), file);
    const exists = fs.existsSync(fullPath);

    const icon = exists ? '✅' : '❌';
    console.log(`${icon} ${file}`);

    if (!exists) {
      console.log('   └─ 测试文件不存在');
    }
  }

  // 统计结果
  console.log('\n📊 验证结果:');
  const passed = results.filter((r) => r.status === 'pass').length;
  const warnings = results.filter((r) => r.status === 'warning').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  console.log(`✅ 通过: ${passed}`);
  console.log(`⚠️  警告: ${warnings}`);
  console.log(`❌ 失败: ${failed}`);

  const testFilesExist = testFiles.filter((f) =>
    fs.existsSync(path.join(process.cwd(), f))
  ).length;
  console.log(`🧪 测试文件: ${testFilesExist}/${testFiles.length}`);

  console.log('\n' + '='.repeat(60));

  if (failed > 0) {
    console.log('❌ 验证失败！请修复上述问题。');
    process.exit(1);
  } else if (warnings > 0) {
    console.log('⚠️  验证通过，但有警告。');
    process.exit(0);
  } else {
    console.log('✅ 所有组件迁移验证通过！');
    process.exit(0);
  }
}

main();
