/**
 * PWA 安装功能验证脚本
 * 在浏览器控制台运行此脚本来验证 PWA 功能
 */

// 运行此脚本前，请先在浏览器中打开 http://localhost:3000

console.log('🔍 开始 PWA 功能验证...\n');

// 1. 检查 HTTPS 或 localhost
const checkSecureContext = () => {
  const isSecure = window.isSecureContext;
  console.log(
    `1. 安全上下文: ${isSecure ? '✅ 安全（HTTPS/localhost）' : '❌ 不安全'}`
  );
  return isSecure;
};

// 2. 检查 Service Worker 支持
const checkServiceWorkerSupport = () => {
  const supported = 'serviceWorker' in navigator;
  console.log(`2. Service Worker 支持: ${supported ? '✅ 支持' : '❌ 不支持'}`);
  return supported;
};

// 3. 检查 Service Worker 注册
const checkServiceWorkerRegistration = async () => {
  if (!('serviceWorker' in navigator)) {
    console.log('3. Service Worker 注册: ❌ 浏览器不支持');
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      console.log(
        `3. Service Worker 注册: ✅ 已注册 ${registrations.length} 个`
      );
      registrations.forEach((reg, index) => {
        console.log(`   - SW ${index + 1}: ${reg.scope}`);
        console.log(`     状态: ${reg.active ? '激活' : '未激活'}`);
      });
      return true;
    }
    console.log('3. Service Worker 注册: ⚠️ 未找到注册的 Service Worker');
    return false;
  } catch (error) {
    console.log(`3. Service Worker 注册: ❌ 检查失败 - ${error.message}`);
    return false;
  }
};

// 4. 检查 Manifest
const checkManifest = () => {
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    console.log('4. Web App Manifest: ✅ 已链接');
    console.log(`   路径: ${manifestLink.href}`);

    // 尝试获取 manifest 内容
    fetch(manifestLink.href)
      .then((res) => res.json())
      .then((manifest) => {
        console.log('   Manifest 内容:');
        console.log(`   - 名称: ${manifest.name}`);
        console.log(`   - 短名称: ${manifest.short_name}`);
        console.log(`   - 显示模式: ${manifest.display}`);
        console.log(`   - 主题色: ${manifest.theme_color}`);
        console.log(`   - 背景色: ${manifest.background_color}`);
        console.log(
          `   - 图标数量: ${manifest.icons ? manifest.icons.length : 0}`
        );

        // 验证必需字段
        const requiredFields = [
          'name',
          'short_name',
          'icons',
          'start_url',
          'display',
        ];
        const missingFields = requiredFields.filter(
          (field) => !manifest[field]
        );

        if (missingFields.length === 0) {
          console.log('   ✅ 所有必需字段都已配置');
        } else {
          console.log(`   ⚠️ 缺少字段: ${missingFields.join(', ')}`);
        }
      })
      .catch((err) => {
        console.log(`   ❌ 无法加载 manifest: ${err.message}`);
      });

    return true;
  }
  console.log('4. Web App Manifest: ❌ 未找到 manifest 链接');
  return false;
};

// 5. 检查安装提示支持
const checkInstallPrompt = () => {
  // 监听 beforeinstallprompt 事件
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('5. 安装提示: ✅ beforeinstallprompt 事件已触发');
    console.log(
      '   💡 提示: 可以调用 window.showInstallPrompt() 来显示安装对话框'
    );

    // 将安装函数暴露到全局
    window.showInstallPrompt = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(
          `   用户选择: ${outcome === 'accepted' ? '✅ 已安装' : '❌ 已拒绝'}`
        );
        deferredPrompt = null;
      } else {
        console.log('   ⚠️ 安装提示不可用');
      }
    };
  });

  // 检查是否已安装
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('5. 安装状态: ✅ 应用已安装并在独立模式运行');
    return true;
  }
  console.log('5. 安装状态: ℹ️ 应用未安装或在浏览器模式运行');

  // 检查安装按钮是否可用
  setTimeout(() => {
    if (!deferredPrompt) {
      console.log('   ⚠️ 安装提示未触发，可能的原因：');
      console.log('   - 应用已经安装');
      console.log('   - 不满足 PWA 安装条件');
      console.log('   - 需要用户交互才能触发');
    }
  }, 2000);

  return false;
};

// 6. 检查图标
const checkIcons = async () => {
  const iconPaths = ['/icon-192.svg', '/icon-512.svg', '/favicon.svg'];

  console.log('6. PWA 图标检查:');

  for (const path of iconPaths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        console.log(`   ${path}: ✅ 可访问`);
      } else {
        console.log(`   ${path}: ❌ HTTP ${response.status}`);
      }
    } catch (error) {
      console.log(`   ${path}: ❌ 加载失败`);
    }
  }
};

// 7. 检查缓存
const checkCaches = async () => {
  if ('caches' in window) {
    try {
      const cacheNames = await caches.keys();
      console.log('7. 缓存 API: ✅ 可用');
      console.log(`   缓存数量: ${cacheNames.length}`);
      if (cacheNames.length > 0) {
        console.log('   缓存名称:');
        cacheNames.forEach((name) => {
          console.log(`   - ${name}`);
        });
      }
    } catch (error) {
      console.log(`7. 缓存 API: ❌ 错误 - ${error.message}`);
    }
  } else {
    console.log('7. 缓存 API: ❌ 不支持');
  }
};

// 8. 检查离线功能
const checkOfflineSupport = () => {
  console.log('8. 离线支持检查:');
  console.log(`   当前网络状态: ${navigator.onLine ? '🟢 在线' : '🔴 离线'}`);

  // 监听网络状态变化
  window.addEventListener('online', () => {
    console.log('   📡 网络状态变化: 🟢 已连接');
  });

  window.addEventListener('offline', () => {
    console.log('   📡 网络状态变化: 🔴 已断开');
    console.log('   💡 提示: 如果配置正确，应用应该能继续工作');
  });

  console.log('   💡 提示: 断开网络连接来测试离线功能');
};

// 执行所有检查
const runAllChecks = async () => {
  console.log('='.repeat(50));
  console.log('🚀 PWA 功能验证报告');
  console.log('='.repeat(50) + '\n');

  const results = {
    secureContext: checkSecureContext(),
    serviceWorkerSupport: checkServiceWorkerSupport(),
    serviceWorkerRegistration: await checkServiceWorkerRegistration(),
    manifest: checkManifest(),
    installPrompt: checkInstallPrompt(),
  };

  await checkIcons();
  await checkCaches();
  checkOfflineSupport();

  // 总结
  console.log('\n' + '='.repeat(50));
  console.log('📊 验证总结');
  console.log('='.repeat(50));

  const passedChecks = Object.values(results).filter((r) => r === true).length;
  const totalChecks = Object.values(results).length;

  console.log(`\n通过检查: ${passedChecks}/${totalChecks}`);

  if (passedChecks === totalChecks) {
    console.log('✅ 所有 PWA 核心功能都已就绪！');
    console.log('\n🎯 下一步操作:');
    console.log('1. 在 Chrome 地址栏查看是否有安装按钮（⊕）');
    console.log('2. 或在浏览器菜单中选择"安装 QiFlow AI"');
    console.log('3. 断开网络测试离线功能');
  } else {
    console.log('⚠️ 部分 PWA 功能未就绪');
    console.log('\n🔧 建议修复:');
    if (!results.serviceWorkerRegistration) {
      console.log('- 确保 Service Worker 正确注册');
    }
    if (!results.manifest) {
      console.log('- 添加 Web App Manifest');
    }
  }

  console.log('\n💡 手动测试提示:');
  console.log('- 在 Chrome DevTools > Application > Manifest 查看详细信息');
  console.log(
    '- 在 Chrome DevTools > Application > Service Workers 查看注册状态'
  );
  console.log(
    '- 使用 Chrome://flags/#enable-desktop-pwas 启用桌面 PWA（如需要）'
  );
};

// 运行所有检查
runAllChecks();

// 导出供其他脚本使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkSecureContext,
    checkServiceWorkerSupport,
    checkServiceWorkerRegistration,
    checkManifest,
    checkInstallPrompt,
    checkIcons,
    checkCaches,
    checkOfflineSupport,
    runAllChecks,
  };
}
