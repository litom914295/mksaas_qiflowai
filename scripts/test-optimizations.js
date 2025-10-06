/**
 * 优化功能测试脚本
 * 验证所有新增的优化功能
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 开始测试优化功能...\n');

let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    failedTests++;
  }
}

// 1. 环境变量验证模块测试
test('环境变量验证模块存在', () => {
  const envPath = path.join(__dirname, '..', 'src', 'lib', 'env.ts');
  if (!fs.existsSync(envPath)) {
    throw new Error('env.ts文件不存在');
  }
});

// 2. 限流模块测试
test('API限流模块存在', () => {
  const rateLimitPath = path.join(__dirname, '..', 'src', 'lib', 'rate-limit.ts');
  if (!fs.existsSync(rateLimitPath)) {
    throw new Error('rate-limit.ts文件不存在');
  }
});

// 3. 错误边界组件测试
test('错误边界组件存在', () => {
  const errorBoundaryPath = path.join(__dirname, '..', 'src', 'components', 'providers', 'error-boundary-enhanced.tsx');
  if (!fs.existsSync(errorBoundaryPath)) {
    throw new Error('error-boundary-enhanced.tsx文件不存在');
  }
});

// 4. 缓存系统测试
test('缓存系统模块存在', () => {
  const cachePath = path.join(__dirname, '..', 'src', 'lib', 'qiflow', 'cache.ts');
  if (!fs.existsSync(cachePath)) {
    throw new Error('cache.ts文件不存在');
  }
});

// 5. 监控系统测试
test('性能监控模块存在', () => {
  const monitoringPath = path.join(__dirname, '..', 'src', 'lib', 'qiflow', 'monitoring.ts');
  if (!fs.existsSync(monitoringPath)) {
    throw new Error('monitoring.ts文件不存在');
  }
});

// 6. PWA配置测试
test('PWA manifest文件存在', () => {
  const manifestPath = path.join(__dirname, '..', 'public', 'manifest.webmanifest');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('manifest.webmanifest文件不存在');
  }
});

test('Service Worker文件存在', () => {
  const swPath = path.join(__dirname, '..', 'public', 'sw.js');
  if (!fs.existsSync(swPath)) {
    throw new Error('sw.js文件不存在');
  }
});

test('PWA图标文件存在', () => {
  const icon192Path = path.join(__dirname, '..', 'public', 'icon-192.svg');
  const icon512Path = path.join(__dirname, '..', 'public', 'icon-512.svg');
  if (!fs.existsSync(icon192Path) || !fs.existsSync(icon512Path)) {
    throw new Error('PWA图标文件不完整');
  }
});

// 7. 中间件更新测试
test('中间件包含限流功能', () => {
  const middlewarePath = path.join(__dirname, '..', 'src', 'middleware.ts');
  const content = fs.readFileSync(middlewarePath, 'utf-8');
  if (!content.includes('rate-limit')) {
    throw new Error('中间件未包含限流功能');
  }
});

// 8. 布局文件更新测试
test('布局文件包含错误边界', () => {
  const layoutPath = path.join(__dirname, '..', 'src', 'app', '[locale]', 'layout.tsx');
  const content = fs.readFileSync(layoutPath, 'utf-8');
  if (!content.includes('ErrorBoundaryEnhanced')) {
    throw new Error('布局文件未包含错误边界');
  }
});

// 9. 首页优化测试
test('首页使用动态导入', () => {
  const homePath = path.join(__dirname, '..', 'src', 'app', '[locale]', '(marketing)', '(home)', 'page.tsx');
  const content = fs.readFileSync(homePath, 'utf-8');
  if (!content.includes('dynamic')) {
    throw new Error('首页未使用动态导入优化');
  }
});

// 10. 测试文件存在性
test('单元测试文件存在', () => {
  const testDir = path.join(__dirname, '..', 'src', 'lib', 'qiflow', '__tests__');
  if (!fs.existsSync(testDir)) {
    throw new Error('测试目录不存在');
  }
  
  const envTest = path.join(testDir, 'env.test.ts');
  const rateLimitTest = path.join(testDir, 'rate-limit.test.ts');
  
  if (!fs.existsSync(envTest) || !fs.existsSync(rateLimitTest)) {
    throw new Error('测试文件不完整');
  }
});

// 总结
console.log('\n========================================');
console.log('📊 测试结果总结：');
console.log(`✅ 通过测试: ${passedTests}`);
console.log(`❌ 失败测试: ${failedTests}`);
console.log('========================================\n');

if (failedTests === 0) {
  console.log('🎉 所有优化功能测试通过！');
  process.exit(0);
} else {
  console.log('⚠️  部分测试失败，请检查相关文件。');
  process.exit(1);
}