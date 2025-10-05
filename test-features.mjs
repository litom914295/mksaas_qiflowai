/**
 * QiFlow 功能测试脚本
 * 测试八字、玄空风水、信用扣除、PDF导出等核心功能
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

// 测试结果收集
const testResults = {
  passed: [],
  failed: [],
  warnings: [],
};

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 测试页面可访问性
async function testPageAccess() {
  log('\n📄 测试页面可访问性...', 'cyan');

  const pages = [
    { path: '/zh/qiflow/bazi', name: '八字分析页面' },
    { path: '/zh/qiflow/xuankong', name: '玄空风水页面' },
    { path: '/zh/test-flying-star', name: '飞星测试页面' },
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${BASE_URL}${page.path}`);
      if (response.ok) {
        log(`  ✅ ${page.name}: 可访问 (${response.status})`, 'green');
        testResults.passed.push(`${page.name} 可访问`);
      } else {
        log(`  ❌ ${page.name}: 访问失败 (${response.status})`, 'red');
        testResults.failed.push(`${page.name} 访问失败: ${response.status}`);
      }
    } catch (error) {
      log(`  ❌ ${page.name}: 网络错误`, 'red');
      testResults.failed.push(`${page.name} 网络错误: ${error.message}`);
    }
  }
}

// 测试API端点
async function testAPIEndpoints() {
  log('\n🔌 测试API端点...', 'cyan');

  // 测试八字分析API
  try {
    const baziData = {
      birthDate: '1990-01-15',
      birthTime: '14:30',
      birthPlace: '北京',
      gender: 'male',
    };

    log('  测试八字分析API...', 'blue');
    // 注意：实际的API可能需要认证和正确的表单格式
    testResults.warnings.push('八字API需要实际表单提交测试');
    log('  ⚠️  需要通过浏览器表单测试', 'yellow');
  } catch (error) {
    log(`  ❌ 八字API测试失败: ${error.message}`, 'red');
    testResults.failed.push(`八字API测试失败: ${error.message}`);
  }

  // 测试玄空风水API
  try {
    log('  测试玄空风水API...', 'blue');
    testResults.warnings.push('玄空API需要实际表单提交测试');
    log('  ⚠️  需要通过浏览器表单测试', 'yellow');
  } catch (error) {
    log(`  ❌ 玄空API测试失败: ${error.message}`, 'red');
    testResults.failed.push(`玄空API测试失败: ${error.message}`);
  }
}

// 测试静态资源
async function testStaticAssets() {
  log('\n🖼️  测试静态资源...', 'cyan');

  const assets = [
    { path: '/favicon.ico', name: 'Favicon' },
    { path: '/images/logo.png', name: 'Logo' },
  ];

  for (const asset of assets) {
    try {
      const response = await fetch(`${BASE_URL}${asset.path}`);
      if (response.ok) {
        log(`  ✅ ${asset.name}: 加载成功`, 'green');
        testResults.passed.push(`${asset.name} 加载成功`);
      } else if (response.status === 404) {
        log(`  ⚠️  ${asset.name}: 未找到 (可能不存在)`, 'yellow');
        testResults.warnings.push(`${asset.name} 未找到`);
      } else {
        log(`  ❌ ${asset.name}: 加载失败 (${response.status})`, 'red');
        testResults.failed.push(`${asset.name} 加载失败`);
      }
    } catch (error) {
      log(`  ❌ ${asset.name}: 网络错误`, 'red');
      testResults.failed.push(`${asset.name} 网络错误`);
    }
  }
}

// 检查关键功能配置
async function checkFeatureConfig() {
  log('\n⚙️  检查功能配置...', 'cyan');

  // 这些检查需要访问实际的配置文件或环境变量
  const features = ['信用系统', 'PDF导出', 'AI解读', '18+验证', '多语言支持'];

  features.forEach((feature) => {
    log(`  ℹ️  ${feature}: 需要手动验证`, 'blue');
    testResults.warnings.push(`${feature} 需要手动验证`);
  });
}

// 生成测试报告
function generateReport() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 测试报告', 'cyan');
  log('='.repeat(60), 'cyan');

  log(`\n✅ 通过的测试 (${testResults.passed.length}):`, 'green');
  testResults.passed.forEach((test) => log(`  • ${test}`, 'green'));

  if (testResults.warnings.length > 0) {
    log(`\n⚠️  警告 (${testResults.warnings.length}):`, 'yellow');
    testResults.warnings.forEach((warning) => log(`  • ${warning}`, 'yellow'));
  }

  if (testResults.failed.length > 0) {
    log(`\n❌ 失败的测试 (${testResults.failed.length}):`, 'red');
    testResults.failed.forEach((test) => log(`  • ${test}`, 'red'));
  }

  log('\n' + '='.repeat(60), 'cyan');

  // 手动测试建议
  log('\n📝 手动测试建议:', 'cyan');
  log('1. 八字分析表单提交:', 'blue');
  log('   - 访问 http://localhost:3000/zh/qiflow/bazi');
  log('   - 填写出生日期、时间、地点');
  log('   - 提交并检查结果显示');
  log('   - 验证信用扣除（应扣除10积分）');
  log('   - 测试PDF导出功能');

  log('\n2. 玄空风水表单提交:', 'blue');
  log('   - 访问 http://localhost:3000/zh/qiflow/xuankong');
  log('   - 填写建筑信息、朝向等');
  log('   - 提交并检查飞星图显示');
  log('   - 验证信用扣除（应扣除20积分）');
  log('   - 测试AI解读功能');

  log('\n3. 合规功能测试:', 'blue');
  log('   - 清除浏览器缓存');
  log('   - 访问任一分析页面');
  log('   - 应看到18+年龄验证弹窗');
  log('   - 确认后才能使用功能');

  log('\n4. 移动端测试:', 'blue');
  log('   - 使用浏览器开发者工具');
  log('   - 切换到移动设备视图');
  log('   - 检查响应式布局');
  log('   - 测试触摸交互');
}

// 主测试函数
async function runTests() {
  log('🚀 开始QiFlow功能测试', 'cyan');
  log('='.repeat(60), 'cyan');

  try {
    await testPageAccess();
    await testAPIEndpoints();
    await testStaticAssets();
    await checkFeatureConfig();
  } catch (error) {
    log(`\n❌ 测试过程出错: ${error.message}`, 'red');
    testResults.failed.push(`测试过程出错: ${error.message}`);
  }

  generateReport();
}

// 运行测试
runTests().catch((error) => {
  log(`❌ 测试失败: ${error.message}`, 'red');
  process.exit(1);
});
