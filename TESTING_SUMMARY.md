# 🎯 QiFlow AI - 完整测试指南

**日期**: 2025-10-05  
**状态**: ✅ 开发服务器运行中  
**URL**: http://localhost:3000

---

## 📋 测试清单

### ✅ 已完成的测试

- [x] **Lighthouse 性能测试** - 初步完成
- [ ] **PWA 安装功能** - 待在浏览器控制台测试
- [ ] **API 限流测试** - 待在浏览器控制台测试

---

## 🚀 快速开始

### 1. Lighthouse 测试结果

**当前分数**:
- Performance: 33/100 ⚠️
- Accessibility: 85/100 ⚠️
- Best Practices: 93/100 ⚠️
- SEO: 92/100 ✅

**重要说明**: 
> ⚠️ Chrome 扩展和本地缓存影响了测试结果  
> 📌 建议在隐身模式下重新测试以获得准确基准

#### 如何在隐身模式重新测试

```bash
# 1. 按 Ctrl+Shift+N 打开 Chrome 隐身窗口
# 2. 访问 http://localhost:3000
# 3. F12 打开 DevTools
# 4. 切换到 Lighthouse 标签
# 5. 选择所有类别，点击 "Analyze page load"
```

**预期分数（隐身模式）**:
- Performance: 60-70
- Accessibility: 85-90
- Best Practices: 93-95
- SEO: 92-95

---

### 2. PWA 和 API 限流测试

#### 方法 A：使用浏览器控制台测试（推荐）

1. **访问网站**
   ```
   http://localhost:3000
   ```

2. **打开控制台** (F12 > Console)

3. **复制并运行测试脚本**
   
   打开文件 `scripts/browser-console-tests.js`，复制全部内容到浏览器控制台运行。

   或者运行简化版测试：

   ```javascript
   // === PWA 快速检查 ===
   console.log('🔍 PWA 功能检查:');
   const checks = {
     'Service Worker': 'serviceWorker' in navigator,
     'Manifest': !!document.querySelector('link[rel="manifest"]'),
     'HTTPS/Localhost': window.isSecureContext,
     'Cache API': 'caches' in window
   };
   Object.entries(checks).forEach(([k,v]) => 
     console.log(`${v?'✅':'❌'} ${k}`)
   );
   
   // 检查 SW 注册
   navigator.serviceWorker.getRegistrations().then(r => 
     console.log(`📡 Service Workers: ${r.length} 个`)
   );
   
   // === API 限流测试 ===
   console.log('\n⏳ 测试 API 限流...');
   async function testAPI() {
     for (let i = 1; i <= 8; i++) {
       const res = await fetch('/api/ai/chat', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({messages:[{role:'user',content:'test'}],model:'test'})
       });
       console.log(`请求 #${i}: ${res.status === 429 ? '❌ 限流' : '✅ 成功'} (${res.status})`);
       await new Promise(r => setTimeout(r, 100));
     }
   }
   setTimeout(testAPI, 2000);
   ```

4. **查看结果**
   - PWA 功能检查结果会立即显示
   - API 限流测试会在 2 秒后开始
   - 应该看到前 5 个请求成功，后 3 个被限流

#### 方法 B：使用 Node.js 测试 API 限流

```bash
# 确保安装了 axios
npm install axios

# 运行限流测试
node scripts/test-rate-limiting.js
```

---

## 📊 测试结果记录

### Lighthouse 测试 - 初始测试（2025-10-05 17:07）

| 指标 | 分数 | 状态 | 备注 |
|------|------|------|------|
| Performance | 33 | ⚠️ | 受Chrome扩展影响 |
| Accessibility | 85 | ⚠️ | 接近目标90+ |
| Best Practices | 93 | ⚠️ | 接近目标95+ |
| SEO | 92 | ✅ | 达标 |

**影响因素**:
- Chrome 扩展程序
- IndexedDB 本地存储
- 开发模式（未优化的构建）

**报告位置**: `reports/lighthouse/lighthouse-report-2025-10-05.md`

### PWA 功能测试（待完成）

请在浏览器控制台运行测试后填写：

- [ ] Service Worker 支持
- [ ] Manifest 配置正确
- [ ] 安全上下文（HTTPS/localhost）
- [ ] 可以安装到桌面
- [ ] 离线功能正常

### API 限流测试（待完成）

请在浏览器控制台或运行测试脚本后填写：

| API 端点 | 限制 | 测试结果 | 状态 |
|----------|------|----------|------|
| /api/ai/chat | 5次/分钟 | - | ⏳ |
| /api/qiflow/bazi | 10次/分钟 | - | ⏳ |
| /api/qiflow/fengshui | 10次/分钟 | - | ⏳ |
| /api/health | 20次/分钟 | - | ⏳ |

---

## 🎯 下一步行动

### 立即执行

1. **在浏览器控制台运行 PWA 和 API 限流测试**
   - 打开 http://localhost:3000
   - F12 > Console
   - 复制运行 `scripts/browser-console-tests.js`

2. **在隐身模式重新运行 Lighthouse**
   - Ctrl+Shift+N 打开隐身窗口
   - 访问 http://localhost:3000
   - 运行 Lighthouse 测试

### 短期优化（1-2天）

1. **图片优化**
   - 使用 `next/image` 替换所有 `<img>` 标签
   - 压缩图片资源
   - 添加懒加载

2. **第三方脚本优化**
   - 延迟加载 Crisp Chat
   - 使用 `next/script` 的 `strategy="lazyOnload"`

3. **Bundle 分析**
   ```bash
   npm install @next/bundle-analyzer
   npm run build
   npm run analyze
   ```

4. **Accessibility 改进**
   - 添加缺失的 ARIA 标签
   - 改进键盘导航
   - 增强表单标签

### 中期优化（3-7天）

1. **性能优化**
   - 实施 ISR
   - 优化字体加载
   - 代码分割优化

2. **PWA 增强**
   - 完善离线体验
   - 添加推送通知
   - 优化缓存策略

3. **监控集成**
   - 集成 Vercel Analytics
   - 配置 Sentry 错误追踪
   - 设置性能预警

---

## 📁 测试资源

### 文档
- [Lighthouse 测试指南](docs/lighthouse-testing-guide.md)
- [快速测试指南](docs/quick-test-guide.md)
- [优化验证报告](OPTIMIZATION_VALIDATION_REPORT.md)

### 脚本
- 浏览器控制台测试: `scripts/browser-console-tests.js`
- PWA 安装测试: `scripts/test-pwa-install.js`
- API 限流测试: `scripts/test-rate-limiting.js`
- 优化功能测试: `scripts/test-optimizations.js`

### 报告
- Lighthouse 报告: `reports/lighthouse/`
- 优化完成报告: `OPTIMIZATION_COMPLETE.md`
- 验证报告: `OPTIMIZATION_VALIDATION_REPORT.md`

---

## ✅ 已实施的优化

我们已经完成的优化工作：

1. ✅ **环境变量验证** - Zod 运行时验证
2. ✅ **API 限流系统** - 分级限流策略
3. ✅ **错误边界组件** - 智能错误处理
4. ✅ **缓存系统** - LRU 缓存 + 持久化
5. ✅ **性能监控** - Web Vitals + 自定义指标
6. ✅ **动态导入** - 客户端组件懒加载（已修复 Next.js 15 兼容性）
7. ✅ **PWA 配置** - Manifest + Service Worker + 图标
8. ✅ **代码分割** - 路由级别代码分割

---

## 🐛 已修复的问题

1. ✅ **Next.js 15 动态导入错误**
   - 问题: Server Component 不能使用 `ssr: false`
   - 解决: 创建客户端组件包装器
   - 文件: `src/app/[locale]/(marketing)/(home)/ClientComponents.tsx`

2. ✅ **环境变量配置**
   - 移除了多余的 `.env.local`
   - 统一使用 `.env` 文件
   - 添加了运行时验证

---

## 💡 提示和技巧

### Lighthouse 测试
- 始终在隐身模式下测试
- 清除缓存后重新测试
- 测试前关闭所有扩展
- 多次测试取平均值

### PWA 测试
- 在 DevTools > Application 查看详细信息
- 测试离线功能时断开网络
- 尝试安装到桌面验证

### API 限流测试
- 使用浏览器控制台快速测试
- 观察响应头中的限流信息
- 等待重置后再次测试

---

## 📞 需要帮助？

如果遇到问题：

1. 检查开发服务器是否正在运行
2. 查看浏览器控制台错误
3. 阅读相关文档和报告
4. 参考测试脚本中的示例

---

**最后更新**: 2025-10-05 17:10 UTC  
**下次测试**: 完成浏览器控制台测试后更新此文档