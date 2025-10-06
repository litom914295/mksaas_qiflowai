# 🚀 Lighthouse 性能测试指南

## 前置准备

### 1. 启动开发服务器
```bash
npm run dev
```
确保服务器运行在 http://localhost:3000

## 📊 Chrome DevTools Lighthouse 测试步骤

### 步骤 1：打开测试页面
1. 打开 Chrome 浏览器
2. 访问 http://localhost:3000
3. 等待页面完全加载

### 步骤 2：打开 Lighthouse
1. 按 `F12` 打开 DevTools
2. 点击顶部的 `>>` 按钮找到 "Lighthouse" 标签
3. 如果没有，点击 `+` 添加 Lighthouse

### 步骤 3：配置测试参数

#### 推荐配置：
```
Mode: Navigation (分析页面加载)
Device: Mobile (移动优先)
Categories:
  ✅ Performance
  ✅ Accessibility  
  ✅ Best Practices
  ✅ SEO
  ✅ Progressive Web App
```

### 步骤 4：运行测试
1. 点击 "Analyze page load" 按钮
2. 等待 30-60 秒完成测试
3. 查看生成的报告

## 🎯 期望分数和优化建议

### Performance (性能)
**目标分数**: 85+

关键指标：
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TTI** (Time to Interactive): < 3.8s
- **TBT** (Total Blocking Time): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **SI** (Speed Index): < 3.4s

优化建议：
```javascript
// 已实施的优化
- ✅ Dynamic imports 减少初始包体积
- ✅ React Server Components
- ✅ 图片懒加载
- ✅ 缓存策略
```

### Accessibility (可访问性)
**目标分数**: 90+

检查项：
- ARIA 属性正确使用
- 颜色对比度符合 WCAG 2.1
- 表单标签关联
- 图片替代文本
- 焦点管理

### Best Practices (最佳实践)
**目标分数**: 95+

检查项：
- HTTPS 使用
- 控制台无错误
- 图片优化格式
- 安全的外部链接
- 有效的 sourcemap

### SEO (搜索引擎优化)
**目标分数**: 90+

检查项：
- Meta description
- 有效的 robots.txt
- 规范的 URL
- 移动端友好
- 结构化数据

### Progressive Web App
**目标**: 所有检查项通过

必需项：
- ✅ Web app manifest
- ✅ Service Worker
- ✅ HTTPS
- ✅ 响应式设计
- ✅ 离线支持
- ✅ 安装提示

## 📸 测试截图位置

测试完成后，保存报告：
1. 点击报告右上角的 `⋮` 菜单
2. 选择 "Save as HTML" 或 "Save as JSON"
3. 保存到 `reports/lighthouse/` 目录

## 🔍 常见问题诊断

### 如果 Performance 分数低于 70：
```javascript
// 检查清单
1. 是否有大型 JavaScript 包？
   → 使用 Bundle Analyzer 分析
   
2. 是否有渲染阻塞资源？
   → 异步加载非关键 CSS/JS
   
3. 图片是否优化？
   → 使用 next/image 组件
   
4. 是否有长任务？
   → 分割长任务，使用 Web Workers
```

### 如果 PWA 检查失败：
```javascript
// 检查清单
1. manifest.json 是否正确链接？
2. Service Worker 是否注册成功？
3. 图标尺寸是否完整？
4. start_url 是否有效？
5. 是否支持离线访问？
```

## 📝 测试记录模板

```markdown
## Lighthouse 测试报告 - [日期]

### 测试环境
- Chrome 版本: 
- 设备模式: Mobile/Desktop
- 网络: 无限制

### 分数汇总
| 类别 | 分数 | 状态 |
|------|------|------|
| Performance | XX | ✅/⚠️/❌ |
| Accessibility | XX | ✅/⚠️/❌ |
| Best Practices | XX | ✅/⚠️/❌ |
| SEO | XX | ✅/⚠️/❌ |
| PWA | Pass/Fail | ✅/❌ |

### 关键指标
- FCP: X.Xs
- LCP: X.Xs
- TTI: X.Xs
- CLS: X.XX

### 需要改进的项目
1. [问题描述] - [建议解决方案]
2. [问题描述] - [建议解决方案]

### 下次优化重点
- [ ] 优化项1
- [ ] 优化项2
```

## 🚦 快速检查命令

在控制台运行以验证优化是否生效：

```javascript
// 检查 Service Worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs.length > 0 ? '✅ 已注册' : '❌ 未注册');
});

// 检查 PWA manifest
const link = document.querySelector('link[rel="manifest"]');
console.log('PWA Manifest:', link ? '✅ 已配置' : '❌ 未配置');

// 检查动态导入
console.log('代码分割chunks:', Object.keys(window.__NEXT_DATA__.chunks || {}).length);

// 检查缓存
caches.keys().then(names => {
  console.log('缓存数量:', names.length);
});
```

---

完成测试后，将结果记录在 `reports/lighthouse/` 目录中以便追踪优化进展。