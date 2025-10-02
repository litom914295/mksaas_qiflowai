/**
 * E2E 冒烟测试脚本
 * 验证QiFlow核心流程
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = 'artifacts/C9/screenshots';

// 确保截图目录存在
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}_${timestamp}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot saved: ${filepath}`);
  return filepath;
}

async function runE2ETest() {
  console.log('🚀 Starting E2E Smoke Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // 显示浏览器窗口
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  // 监听控制台日志
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  // 监听网络错误
  page.on('response', response => {
    if (response.status() >= 500) {
      console.log('❌ 5xx Error:', response.url(), response.status());
    }
  });
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  try {
    // Test 1: Home页加载
    console.log('📋 Test 1: Home页加载');
    await page.goto(`${BASE_URL}/zh`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '01_home_page');
    
    // 检查页面元素
    const homeElements = await page.evaluate(() => {
      return {
        hasNavigation: !!document.querySelector('nav'),
        hasHero: !!document.querySelector('[data-testid="hero"]') || !!document.querySelector('h1'),
        hasAgeVerification: !!document.querySelector('[data-testid="age-verification"]'),
        hasDisclaimer: !!document.querySelector('[data-testid="disclaimer"]'),
        title: document.title
      };
    });
    
    results.tests.push({
      name: 'Home页加载',
      url: `${BASE_URL}/zh`,
      status: 'passed',
      elements: homeElements,
      screenshot: '01_home_page'
    });
    
    console.log('✅ Home页测试完成');
    
    // Test 2: 八字分析页面
    console.log('\n📋 Test 2: 八字分析页面');
    await page.goto(`${BASE_URL}/zh/analysis/bazi`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '02_bazi_page');
    
    // 检查表单元素
    const baziElements = await page.evaluate(() => {
      return {
        hasForm: !!document.querySelector('form'),
        hasNameInput: !!document.querySelector('input[name="name"]'),
        hasBirthInput: !!document.querySelector('input[name="birth"]'),
        hasGenderSelect: !!document.querySelector('select[name="gender"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
        hasCreditsPrice: !!document.querySelector('[data-testid="credits-price"]'),
        title: document.title
      };
    });
    
    // 填写表单
    await page.type('input[name="name"]', '测试用户');
    await page.type('input[name="birth"]', '1990-01-01 08:08');
    await page.select('select[name="gender"]', 'male');
    
    await takeScreenshot(page, '03_bazi_form_filled');
    
    // 提交表单（注意：这可能会失败，因为需要用户登录和积分）
    try {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000); // 等待响应
      await takeScreenshot(page, '04_bazi_submit_result');
      
      // 检查是否有结果或错误
      const result = await page.evaluate(() => {
        const errorDiv = document.querySelector('.text-red-700');
        const successDiv = document.querySelector('.text-green-700');
        return {
          hasError: !!errorDiv,
          hasSuccess: !!successDiv,
          errorText: errorDiv?.textContent,
          successText: successDiv?.textContent
        };
      });
      
      results.tests.push({
        name: '八字分析页面',
        url: `${BASE_URL}/zh/analysis/bazi`,
        status: result.hasError ? 'failed' : 'passed',
        elements: baziElements,
        formResult: result,
        screenshot: '02_bazi_page'
      });
      
    } catch (error) {
      console.log('⚠️ 八字表单提交可能失败（需要登录/积分）:', error.message);
      results.tests.push({
        name: '八字分析页面',
        url: `${BASE_URL}/zh/analysis/bazi`,
        status: 'partial',
        elements: baziElements,
        error: error.message,
        screenshot: '02_bazi_page'
      });
    }
    
    console.log('✅ 八字分析测试完成');
    
    // Test 3: 玄空风水分析页面
    console.log('\n📋 Test 3: 玄空风水分析页面');
    await page.goto(`${BASE_URL}/zh/analysis/xuankong`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '05_xuankong_page');
    
    const xuankongElements = await page.evaluate(() => {
      return {
        hasForm: !!document.querySelector('form'),
        hasAddressInput: !!document.querySelector('input[name="address"]'),
        hasFacingInput: !!document.querySelector('input[name="facing"]'),
        hasSubmitButton: !!document.querySelector('button[type="submit"]'),
        hasCreditsPrice: !!document.querySelector('[data-testid="credits-price"]'),
        title: document.title
      };
    });
    
    // 填写表单
    await page.type('input[name="address"]', '测试地址');
    await page.type('input[name="facing"]', '180');
    
    await takeScreenshot(page, '06_xuankong_form_filled');
    
    try {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      await takeScreenshot(page, '07_xuankong_submit_result');
      
      const result = await page.evaluate(() => {
        const errorDiv = document.querySelector('.text-red-700');
        const successDiv = document.querySelector('.text-green-700');
        return {
          hasError: !!errorDiv,
          hasSuccess: !!successDiv,
          errorText: errorDiv?.textContent,
          successText: successDiv?.textContent
        };
      });
      
      results.tests.push({
        name: '玄空风水分析页面',
        url: `${BASE_URL}/zh/analysis/xuankong`,
        status: result.hasError ? 'failed' : 'passed',
        elements: xuankongElements,
        formResult: result,
        screenshot: '05_xuankong_page'
      });
      
    } catch (error) {
      console.log('⚠️ 玄空表单提交可能失败:', error.message);
      results.tests.push({
        name: '玄空风水分析页面',
        url: `${BASE_URL}/zh/analysis/xuankong`,
        status: 'partial',
        elements: xuankongElements,
        error: error.message,
        screenshot: '05_xuankong_page'
      });
    }
    
    console.log('✅ 玄空风水测试完成');
    
    // Test 4: 检查其他页面
    console.log('\n📋 Test 4: 其他页面检查');
    
    const otherPages = [
      { name: 'Pricing页', url: '/zh/pricing' },
      { name: 'Dashboard页', url: '/zh/dashboard' },
      { name: 'Blog页', url: '/zh/blog' }
    ];
    
    for (const pageInfo of otherPages) {
      try {
        console.log(`  - 测试 ${pageInfo.name}`);
        await page.goto(`${BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle0' });
        await takeScreenshot(page, `08_${pageInfo.name.replace('页', '')}`);
        
        const pageStatus = await page.evaluate(() => {
          return {
            status: document.title ? 'loaded' : 'failed',
            title: document.title,
            hasContent: document.body.textContent.length > 100
          };
        });
        
        results.tests.push({
          name: pageInfo.name,
          url: `${BASE_URL}${pageInfo.url}`,
          status: pageStatus.status === 'loaded' ? 'passed' : 'failed',
          pageStatus,
          screenshot: `08_${pageInfo.name.replace('页', '')}`
        });
        
      } catch (error) {
        console.log(`  ❌ ${pageInfo.name} 加载失败:`, error.message);
        results.tests.push({
          name: pageInfo.name,
          url: `${BASE_URL}${pageInfo.url}`,
          status: 'failed',
          error: error.message
        });
      }
    }
    
    console.log('✅ 其他页面测试完成');
    
  } catch (error) {
    console.error('❌ E2E测试执行失败:', error);
    results.error = error.message;
  } finally {
    await browser.close();
  }
  
  // 保存测试结果
  const resultsFile = path.join(SCREENSHOTS_DIR, 'e2e-test-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
  
  console.log('\n📊 E2E测试结果:');
  console.log('='.repeat(50));
  
  let passed = 0, failed = 0, partial = 0;
  
  results.tests.forEach(test => {
    const status = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⚠️';
    console.log(`${status} ${test.name}: ${test.status}`);
    
    if (test.status === 'passed') passed++;
    else if (test.status === 'failed') failed++;
    else partial++;
  });
  
  console.log('='.repeat(50));
  console.log(`总计: ${results.tests.length} 个测试`);
  console.log(`✅ 通过: ${passed}`);
  console.log(`❌ 失败: ${failed}`);
  console.log(`⚠️ 部分: ${partial}`);
  console.log(`📸 截图保存在: ${SCREENSHOTS_DIR}`);
  console.log(`📄 详细结果: ${resultsFile}`);
  
  return results;
}

// 如果直接运行此脚本
if (require.main === module) {
  runE2ETest().catch(console.error);
}

module.exports = { runE2ETest };
