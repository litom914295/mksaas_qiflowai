# 🚀 快速测试指南

本指南帮助您快速验证三个关键功能：
1. Lighthouse 性能测试
2. PWA 安装功能
3. API 限流

## 📋 前置准备

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 确认服务器运行
访问 http://localhost:3000 确认页面正常加载

---

## 1️⃣ Lighthouse 性能测试

### 在 Chrome DevTools 中测试

1. **打开 Chrome 浏览器**
   - 访问 http://localhost:3000

2. **打开 Lighthouse**
   - 按 `F12` 打开 DevTools
   - 点击 "Lighthouse" 标签（如果没有，点击 >> 查找）

3. **配置并运行**
   ```
   Mode: Navigation
   Device: Mobile
   Categories: 全选（Performance, Accessibility, Best Practices, SEO, PWA）
   ```
   - 点击 "Analyze page load"
   - 等待 30-60 秒

4. **期望结果**
   - Performance: 85+
   - Accessibility: 90+
   - Best Practices: 95+
   - SEO: 90+
   - PWA: 所有检查通过

### 控制台快速检查
在浏览器控制台运行：
```javascript
// 检查优化是否生效
navigator.serviceWorker.getRegistrations().then(r => console.log('SW:', r.length > 0 ? '✅' : '❌'));
document.querySelector('link[rel="manifest"]') ? console.log('Manifest: ✅') : console.log('Manifest: ❌');
```

---

## 2️⃣ PWA 安装功能验证

### 方法 A：浏览器控制台测试

1. **打开浏览器控制台**（F12 > Console）

2. **复制并运行 PWA 测试脚本**
   ```javascript
   // 将 scripts/test-pwa-install.js 的内容复制到控制台
   // 或直接运行以下简化版本：

   console.log('🔍 PWA 快速检查...');
   
   // 检查关键功能
   const checks = {
     'Service Worker': 'serviceWorker' in navigator,
     'Manifest': !!document.querySelector('link[rel="manifest"]'),
     'HTTPS/Localhost': window.isSecureContext,
     'Standalone': window.matchMedia('(display-mode: standalone)').matches
   };
   
   Object.entries(checks).forEach(([key, value]) => {
     console.log(`${key}: ${value ? '✅' : '❌'}`);
   });
   
   // 检查 SW 注册
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log(`Service Workers 注册: ${regs.length} 个`);
   });
   ```

3. **查看安装选项**
   - Chrome 地址栏右侧是否有安装图标 ⊕
   - 或点击浏览器菜单 > "安装 QiFlow AI..."

### 方法 B：Chrome DevTools 检查

1. **打开 Application 标签**
   - F12 > Application

2. **检查 Manifest**
   - 左侧选择 "Manifest"
   - 验证所有字段是否正确
   - 查看图标是否加载

3. **检查 Service Workers**
   - 左侧选择 "Service Workers"
   - 确认状态为 "activated and running"

4. **测试离线功能**
   - 勾选 "Offline" 复选框
   - 刷新页面，应显示离线页面

---

## 3️⃣ API 限流测试

### 方法 A：使用测试脚本

1. **安装依赖**（如果还没有）
   ```bash
   npm install axios
   ```

2. **运行限流测试**
   ```bash
   node scripts/test-rate-limiting.js
   ```

3. **查看结果**
   - 应该看到每个 API 端点的限流测试结果
   - 成功的请求数不应超过限制
   - 应该有请求被正确限流（返回 429）

### 方法 B：手动测试

1. **在浏览器控制台快速测试**
   ```javascript
   // 测试 AI Chat API 限流（限制：5次/分钟）
   async function testRateLimit() {
     const url = 'http://localhost:3000/api/ai/chat';
     const data = { messages: [{ role: 'user', content: 'test' }], model: 'test' };
     
     for (let i = 1; i <= 8; i++) {
       try {
         const response = await fetch(url, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(data)
         });
         
         if (response.status === 429) {
           console.log(`请求 #${i}: ❌ 被限流 (429)`);
         } else {
           console.log(`请求 #${i}: ✅ 成功 (${response.status})`);
         }
       } catch (error) {
         console.log(`请求 #${i}: ❌ 错误`, error);
       }
       
       // 短暂延迟
       await new Promise(r => setTimeout(r, 100));
     }
   }
   
   testRateLimit();
   ```

2. **预期结果**
   - 前 5 个请求应该成功
   - 第 6-8 个请求应该返回 429（被限流）

---

## 📊 测试结果记录模板

```markdown
## 测试报告 - [日期时间]

### Lighthouse 分数
- Performance: XX/100
- Accessibility: XX/100
- Best Practices: XX/100
- SEO: XX/100
- PWA: Pass/Fail

### PWA 功能
- [ ] Service Worker 注册成功
- [ ] Manifest 正确配置
- [ ] 可以安装到桌面
- [ ] 离线功能正常

### API 限流
- [ ] AI Chat: 5次/分钟 ✅
- [ ] Bazi: 10次/分钟 ✅
- [ ] FengShui: 10次/分钟 ✅
- [ ] General: 20次/分钟 ✅

### 问题和改进
1. [问题描述和解决方案]
2. [问题描述和解决方案]
```

---

## 🎯 快速修复指南

### 如果 Lighthouse 分数低
1. 检查是否有大型 JavaScript 包
2. 确保图片使用了懒加载
3. 验证动态导入是否生效

### 如果 PWA 安装失败
1. 确保 Service Worker 已注册
2. 检查 manifest.json 是否正确链接
3. 验证图标路径是否正确

### 如果限流不工作
1. 检查中间件是否正确配置
2. 验证 rate-limit.ts 是否被导入
3. 确保请求路径匹配限流规则

---

## 💡 提示

- 使用 Chrome 最新版本进行测试
- 在隐身模式下测试以避免缓存影响
- 测试前清除浏览器缓存和 Service Worker
- 使用 Chrome DevTools 的 Network 标签监控请求