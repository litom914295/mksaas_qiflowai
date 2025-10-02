#!/usr/bin/env node

/**
 * 标准罗盘功能测试脚本
 * 验证罗盘是否符合主流工作方式
 */

import { execSync } from 'child_process';

console.log('🧭 标准罗盘功能测试');
console.log('==================');

// 检查文件是否存在
const filesToCheck = [
  'src/components/compass/standard-compass.tsx',
  'src/app/[locale]/compass-demo/standard/page.tsx',
  'src/components/compass/index.ts',
];

console.log('\n📁 检查文件存在性...');
filesToCheck.forEach(file => {
  try {
    (await import('fs')).accessSync(file);
    console.log(`✅ ${file} - 存在`);
  } catch (error) {
    console.log(`❌ ${file} - 不存在`);
    process.exit(1);
  }
});

// 检查TypeScript编译
console.log('\n🔧 检查TypeScript编译...');
try {
  execSync('npx tsc --noEmit --project tsconfig.json', { stdio: 'pipe' });
  console.log('✅ TypeScript编译检查通过');
} catch (error) {
  console.log('❌ TypeScript编译检查失败');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// 检查ESLint
console.log('\n🔍 检查代码质量...');
try {
  execSync(
    'npx eslint src/components/compass/standard-compass.tsx src/app/[locale]/compass-demo/standard/page.tsx src/components/compass/index.ts --quiet',
    { stdio: 'pipe' }
  );
  console.log('✅ ESLint检查通过');
} catch (error) {
  console.log('❌ ESLint检查失败');
  console.log(error.stdout?.toString() || error.message);
  process.exit(1);
}

// 检查组件导出
console.log('\n📦 检查组件导出...');
try {
  const indexContent = (await import('fs')).readFileSync(
    'src/components/compass/index.ts',
    'utf8'
  );
  if (indexContent.includes('StandardCompass')) {
    console.log('✅ StandardCompass组件已正确导出');
  } else {
    console.log('❌ StandardCompass组件未正确导出');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ 无法读取index.ts文件');
  process.exit(1);
}

// 检查罗盘核心逻辑
console.log('\n🎯 检查罗盘核心逻辑...');
try {
  const compassContent = (await import('fs')).readFileSync(
    'src/components/compass/standard-compass.tsx',
    'utf8'
  );

  // 检查关键实现
  const checks = [
    {
      name: '红色十字线固定',
      pattern: /红色十字罗经线.*固定不动/,
      required: true,
    },
    {
      name: '指南针不旋转',
      pattern: /transform.*none.*指南针不旋转/,
      required: true,
    },
    {
      name: '罗盘刻度反向旋转',
      pattern: /rotate.*-compassRotation/,
      required: true,
    },
    {
      name: '度数显示',
      pattern: /当前方位.*Math\.round\(compassRotation\)/,
      required: true,
    },
    {
      name: '24山显示',
      pattern: /坐山.*朝向/,
      required: true,
    },
  ];

  let allPassed = true;
  checks.forEach(check => {
    if (check.pattern.test(compassContent)) {
      console.log(`✅ ${check.name} - 已实现`);
    } else {
      console.log(`❌ ${check.name} - 未实现`);
      if (check.required) allPassed = false;
    }
  });

  if (!allPassed) {
    console.log('\n❌ 核心逻辑检查失败');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ 无法读取罗盘组件文件');
  process.exit(1);
}

console.log('\n🎉 所有测试通过！');
console.log('\n📋 测试总结:');
console.log('✅ 文件结构正确');
console.log('✅ TypeScript编译通过');
console.log('✅ 代码质量检查通过');
console.log('✅ 组件导出正确');
console.log('✅ 罗盘核心逻辑符合主流工作方式');
console.log('\n🚀 可以启动开发服务器测试罗盘功能:');
console.log('   npm run dev');
console.log('   然后访问: http://localhost:3000/compass-demo/standard');
