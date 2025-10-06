/**
 * 浏览器控制台快速测试脚本
 * 在浏览器控制台直接复制粘贴运行
 */

console.log('%c🚀 QiFlow AI 快速测试套件', 'color: #0ea5e9; font-size: 20px; font-weight: bold;');
console.log('-----------------------------------------------------------');

// ===========================================
// 1. PWA 功能测试
// ===========================================
console.log('\n%c1️⃣ PWA 功能检查', 'color: #10b981; font-size: 16px; font-weight: bold;');

const pwaChecks = {
  'Service Worker 支持': 'serviceWorker' in navigator,
  'Manifest 已配置': !!document.querySelector('link[rel="manifest"]'),
  '安全上下文': window.isSecureContext,
  '独立模式运行': window.matchMedia('(display-mode: standalone)').matches,
  'Cache API 支持': 'caches' in window
};

Object.entries(pwaChecks).forEach(([key, value]) => {
  const icon = value ? '✅' : '❌';
  const color = value ? 'green' : 'red';
  console.log(`%c${icon} ${key}`, `color: ${color}`);
});

// 检查 Service Worker 注册
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    console.log(`\n📡 Service Workers: ${regs.length} 个已注册`);
    regs.forEach((reg, i) => {
      console.log(`  - SW ${i + 1}: ${reg.scope}`);
      console.log(`    状态: ${reg.active ? '✅ 激活' : '⚠️ 未激活'}`);
    });
    
    if (regs.length === 0) {
      console.log('%c⚠️ 未找到已注册的 Service Worker', 'color: orange');
      console.log('💡 提示: 确保 Service Worker 文件存在并正确配置');
    }
  });
}

// 检查 Manifest 内容
const manifestLink = document.querySelector('link[rel="manifest"]');
if (manifestLink) {
  fetch(manifestLink.href)
    .then(res => res.json())
    .then(manifest => {
      console.log('\n📋 PWA Manifest 内容:');
      console.log(`  名称: ${manifest.name}`);
      console.log(`  短名称: ${manifest.short_name}`);
      console.log(`  显示模式: ${manifest.display}`);
      console.log(`  主题色: ${manifest.theme_color}`);
      console.log(`  图标数量: ${manifest.icons?.length || 0}`);
      
      // 验证图标
      if (manifest.icons && manifest.icons.length > 0) {
        console.log('\n  🎨 图标列表:');
        manifest.icons.forEach(icon => {
          console.log(`    - ${icon.sizes} (${icon.type}): ${icon.src}`);
        });
      }
    })
    .catch(err => {
      console.error('%c❌ 无法加载 Manifest:', 'color: red', err);
    });
}

// ===========================================
// 2. API 限流快速测试
// ===========================================
console.log('\n%c2️⃣ API 限流快速测试', 'color: #10b981; font-size: 16px; font-weight: bold;');
console.log('测试 AI Chat API (限制: 5次/分钟)');

async function testRateLimiting() {
  const endpoint = '/api/ai/chat';
  const testData = {
    messages: [{ role: 'user', content: '测试' }],
    model: 'test'
  };
  
  const results = {
    successful: 0,
    rateLimited: 0,
    errors: 0
  };
  
  console.log('\n发送 8 个请求以测试限流...');
  
  for (let i = 1; i <= 8; i++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Test-Request': 'true'
        },
        body: JSON.stringify(testData)
      });
      
      if (response.status === 429) {
        results.rateLimited++;
        console.log(`%c请求 #${i}: ❌ 被限流 (429)`, 'color: orange');
        
        // 显示限流响应头
        const remaining = response.headers.get('x-ratelimit-remaining');
        const reset = response.headers.get('x-ratelimit-reset');
        if (remaining !== null) {
          console.log(`  剩余请求数: ${remaining}`);
        }
        if (reset) {
          const resetDate = new Date(parseInt(reset) * 1000);
          console.log(`  重置时间: ${resetDate.toLocaleTimeString()}`);
        }
      } else if (response.ok) {
        results.successful++;
        console.log(`%c请求 #${i}: ✅ 成功 (${response.status})`, 'color: green');
      } else {
        results.errors++;
        console.log(`%c请求 #${i}: ⚠️ 错误 (${response.status})`, 'color: red');
      }
    } catch (error) {
      results.errors++;
      console.error(`%c请求 #${i}: ❌ 异常`, 'color: red', error.message);
    }
    
    // 短暂延迟
    await new Promise(r => setTimeout(r, 100));
  }
  
  // 结果分析
  console.log('\n%c📊 限流测试结果:', 'color: #3b82f6; font-weight: bold');
  console.log(`  成功: ${results.successful}`);
  console.log(`  被限流: ${results.rateLimited}`);
  console.log(`  错误: ${results.errors}`);
  
  // 验证限流是否正常工作
  if (results.successful <= 5 && results.rateLimited > 0) {
    console.log('\n%c✅ 限流功能正常工作！', 'color: green; font-weight: bold');
    console.log('  - 成功请求数 ≤ 限制 (5)');
    console.log('  - 超出限制的请求被正确拒绝');
  } else {
    console.log('\n%c⚠️ 限流可能存在问题', 'color: orange; font-weight: bold');
    if (results.successful > 5) {
      console.log(`  - 成功请求数 (${results.successful}) 超过了限制 (5)`);
    }
    if (results.rateLimited === 0) {
      console.log('  - 未触发限流响应');
    }
  }
}

// 延迟执行限流测试，避免干扰其他检查
setTimeout(() => {
  console.log('\n⏳ 3秒后开始限流测试...');
  setTimeout(testRateLimiting, 3000);
}, 1000);

// ===========================================
// 3. 性能指标检查
// ===========================================
console.log('\n%c3️⃣ 性能指标检查', 'color: #10b981; font-size: 16px; font-weight: bold;');

if (window.performance && window.performance.timing) {
  const timing = window.performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
  const firstPaint = timing.responseStart - timing.navigationStart;
  
  console.log(`📈 页面加载时间: ${loadTime}ms`);
  console.log(`📄 DOM Ready: ${domReady}ms`);
  console.log(`🎨 首次渲染: ${firstPaint}ms`);
  
  // 评估性能
  if (loadTime < 3000) {
    console.log('%c✅ 页面加载速度良好', 'color: green');
  } else {
    console.log('%c⚠️ 页面加载较慢，考虑优化', 'color: orange');
  }
}

// Web Vitals (如果已安装)
if (window.webVitals) {
  console.log('\n📊 Web Vitals:');
  window.webVitals.onLCP(console.log);
  window.webVitals.onFID(console.log);
  window.webVitals.onCLS(console.log);
}

// ===========================================
// 4. 缓存检查
// ===========================================
console.log('\n%c4️⃣ 缓存检查', 'color: #10b981; font-size: 16px; font-weight: bold;');

if ('caches' in window) {
  caches.keys().then(cacheNames => {
    console.log(`💾 缓存数量: ${cacheNames.length}`);
    if (cacheNames.length > 0) {
      console.log('缓存列表:');
      cacheNames.forEach(name => {
        console.log(`  - ${name}`);
      });
    } else {
      console.log('%c⚠️ 未找到缓存', 'color: orange');
      console.log('💡 提示: Service Worker 可能尚未创建缓存');
    }
  });
}

// ===========================================
// 总结
// ===========================================
setTimeout(() => {
  console.log('\n%c🎯 测试完成！', 'color: #10b981; font-size: 18px; font-weight: bold');
  console.log('-----------------------------------------------------------');
  console.log('\n📋 下一步建议:');
  console.log('1. 检查上述测试结果');
  console.log('2. 修复发现的问题');
  console.log('3. 在 Chrome DevTools > Application 标签查看详细信息');
  console.log('4. 运行完整的 Lighthouse 测试');
  console.log('\n💡 提示: 保存测试结果以便后续对比');
}, 8000);

// 导出测试函数供手动调用
window.qiflowTests = {
  testRateLimiting,
  checkPWA: () => {
    console.log('PWA Checks:', pwaChecks);
    return pwaChecks;
  }
};

console.log('\n💡 提示: 可以通过 window.qiflowTests 访问测试函数');
console.log('例如: window.qiflowTests.testRateLimiting()');