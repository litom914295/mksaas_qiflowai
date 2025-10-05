# QiFlow AI - 性能测试检查清单

**测试日期**: 待执行  
**测试环境**: 开发环境（localhost:3001）

---

## 📋 测试前准备

### 1. 启动开发服务器
```bash
cd D:\test\mksaas_qiflowai\qiflow-ai
npm run dev
```

**预期结果**: 
- ✅ 服务器启动成功
- ✅ 端口：localhost:3001（或 3000）
- ✅ 无编译错误

---

## 🔍 Lighthouse 性能测试

### 测试步骤

#### 方法 1: 使用 Chrome DevTools（推荐）
1. 打开 Chrome 浏览器
2. 访问 `http://localhost:3001/zh-CN`
3. 打开 DevTools (F12)
4. 切换到 "Lighthouse" 标签
5. 配置：
   - Mode: Navigation
   - Categories: ✅ Performance, ✅ Accessibility, ✅ Best Practices, ✅ SEO
   - Device: Mobile + Desktop（分别测试）
6. 点击 "Analyze page load"
7. 等待测试完成
8. 截图保存报告

#### 方法 2: 使用 CLI
```bash
# 移动端测试
npx lighthouse http://localhost:3001/zh-CN --view --preset=perf --emulated-form-factor=mobile --output=html --output-path=./lighthouse-mobile.html

# 桌面端测试
npx lighthouse http://localhost:3001/zh-CN --view --preset=perf --emulated-form-factor=desktop --output=html --output-path=./lighthouse-desktop.html
```

---

## 📊 性能指标目标

### Core Web Vitals

| 指标 | 目标值 | 优秀 | 良好 | 待改进 | 测试结果 |
|------|--------|------|------|--------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.5s | 2.5s - 4.0s | > 4.0s | ⏳ |
| **FID** (First Input Delay) | < 100ms | < 100ms | 100ms - 300ms | > 300ms | ⏳ |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | 0.1 - 0.25 | > 0.25 | ⏳ |
| **FCP** (First Contentful Paint) | < 1.8s | < 1.8s | 1.8s - 3.0s | > 3.0s | ⏳ |
| **TTFB** (Time to First Byte) | < 600ms | < 600ms | 600ms - 1800ms | > 1800ms | ⏳ |
| **SI** (Speed Index) | < 3.4s | < 3.4s | 3.4s - 5.8s | > 5.8s | ⏳ |

### Lighthouse 分数

| 类别 | 目标分数 | 测试结果（Mobile） | 测试结果（Desktop） |
|------|---------|-------------------|-------------------|
| **Performance** | > 90 | ⏳ | ⏳ |
| **Accessibility** | > 90 | ⏳ | ⏳ |
| **Best Practices** | > 90 | ⏳ | ⏳ |
| **SEO** | > 90 | ⏳ | ⏳ |

---

## 🔎 详细检查项

### 1. 图片优化
- [ ] 所有图片使用 Next.js Image 组件
- [ ] Hero 区图片设置 priority
- [ ] 图片格式：AVIF 或 WebP
- [ ] 图片尺寸适配响应式设备
- [ ] 懒加载非首屏图片

### 2. 字体优化
- [ ] 使用系统字体栈
- [ ] font-display: swap（如有自定义字体）
- [ ] 字体文件预加载（如有）
- [ ] 中文字体使用本地字体

### 3. JavaScript 优化
- [ ] 代码分割（Code Splitting）
- [ ] 懒加载非关键组件
- [ ] 客户端组件最小化
- [ ] 无未使用的依赖

### 4. CSS 优化
- [ ] 内联关键 CSS
- [ ] 移除未使用的 CSS
- [ ] Tailwind CSS purge 配置
- [ ] CSS 压缩

### 5. 网络优化
- [ ] 启用 HTTP/2
- [ ] 资源压缩（Gzip/Brotli）
- [ ] CDN 配置（生产环境）
- [ ] 资源预加载（preload/prefetch）

### 6. 渲染优化
- [ ] 首屏内容优化
- [ ] 避免渲染阻塞
- [ ] 最小化重排重绘
- [ ] 使用 RSC（React Server Components）

---

## 📝 测试页面清单

### 必测页面
1. [ ] 首页（中文）: `/zh-CN`
2. [ ] 首页（英文）: `/en`
3. [ ] 八字分析: `/zh-CN/bazi-analysis`
4. [ ] 罗盘测试: `/zh-CN/compass-analysis`
5. [ ] AI 咨询: `/zh-CN/chat`

### 可选页面
6. [ ] 免责声明: `/zh-CN/disclaimer`
7. [ ] 隐私政策: `/zh-CN/privacy`
8. [ ] DSAR: `/zh-CN/dsar`

---

## 🐛 常见性能问题排查

### 如果 LCP > 2.5s
- [ ] 检查 Hero 图片是否过大
- [ ] 确认 Hero 图片使用 priority
- [ ] 检查字体加载时间
- [ ] 检查首屏 JavaScript 大小

### 如果 CLS > 0.1
- [ ] 确认图片设置了 width 和 height
- [ ] 检查字体切换导致的布局偏移
- [ ] 检查广告/iframe 导致的偏移
- [ ] 确认骨架屏尺寸匹配

### 如果 FID > 100ms
- [ ] 减少主线程 JavaScript 执行时间
- [ ] 使用 Web Worker 处理密集计算
- [ ] 延迟加载非必要 JavaScript
- [ ] 使用 requestIdleCallback

### 如果 TTFB > 600ms
- [ ] 检查服务器响应时间
- [ ] 优化数据库查询
- [ ] 使用缓存（Redis/CDN）
- [ ] 检查网络延迟

---

## 📈 性能优化建议

### 已实施的优化 ✅
- [x] Web Vitals 监控
- [x] Next.js 图片优化配置
- [x] 字体渲染优化
- [x] Hero 图片 priority
- [x] 包导入优化
- [x] 硬件加速
- [x] RSC 优先

### 待实施的优化 ⏳
- [ ] 关键 CSS 内联
- [ ] Service Worker（PWA）
- [ ] 资源预加载
- [ ] 代码分割优化
- [ ] 动态导入优化

---

## 📊 测试结果记录

### 测试环境信息
- **浏览器**: Chrome / Edge / Firefox
- **版本**: _________
- **设备**: _________
- **网络**: Fast 3G / 4G / WiFi
- **CPU 限制**: 无 / 4x / 6x

### Mobile 测试结果
```
日期: __________
URL: http://localhost:3001/zh-CN

Performance Score: _____/100
- LCP: _____ ms
- FID: _____ ms
- CLS: _____
- FCP: _____ ms
- TTFB: _____ ms
- SI: _____ ms

Accessibility: _____/100
Best Practices: _____/100
SEO: _____/100

主要问题:
1. _______________________________
2. _______________________________
3. _______________________________
```

### Desktop 测试结果
```
日期: __________
URL: http://localhost:3001/zh-CN

Performance Score: _____/100
- LCP: _____ ms
- FID: _____ ms
- CLS: _____
- FCP: _____ ms
- TTFB: _____ ms
- SI: _____ ms

Accessibility: _____/100
Best Practices: _____/100
SEO: _____/100

主要问题:
1. _______________________________
2. _______________________________
3. _______________________________
```

---

## ✅ 验收标准

### 必须达标（阻塞上线）
- [ ] Mobile Performance > 70
- [ ] Desktop Performance > 85
- [ ] LCP < 3.0s（Mobile）
- [ ] CLS < 0.2
- [ ] Accessibility > 80
- [ ] SEO > 85

### 优秀标准（推荐目标）
- [ ] Mobile Performance > 90
- [ ] Desktop Performance > 95
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1
- [ ] Accessibility > 95
- [ ] Best Practices > 95
- [ ] SEO > 95

---

## 🔄 持续监控

### 生产环境监控
```bash
# 使用 PageSpeed Insights API
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://qiflow.ai/zh-CN&strategy=mobile"
```

### Web Vitals 数据收集
- [ ] 集成 Google Analytics 4
- [ ] 配置 Web Vitals 事件
- [ ] 设置性能告警
- [ ] 定期生成性能报告

---

## 📞 支持

如有性能问题或疑问，请：
1. 查看 `FINAL_COMPLETION_REPORT.md`
2. 查看 `PHASE_2_COMPLETION.md`
3. 联系开发团队

---

**测试状态**: ⏳ 待执行  
**最后更新**: 2025-01-03
