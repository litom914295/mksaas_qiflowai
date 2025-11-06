# 首页加载性能诊断

## 问题现象
用户反馈首页加载特别慢，截图显示页面停留在加载状态。

## 诊断结果

### 1. 服务器端问题

#### Turbopack 编译错误
```
Export CardAction doesn't exist in target module card.tsx
```

**原因**: Turbopack 缓存问题，虽然 `CardAction` 已正确导出，但 Turbopack 没有识别。

**解决方案**: 清理 Turbopack 缓存
```bash
# 删除 .next 目录
rm -rf .next

# 或使用 dev:clean 脚本
npm run dev:clean
```

#### 数据库查询超时
```
Failed to get user credits, using default value: Error: Credits query timeout
```

**影响**: 虽然有降级处理，但仍会造成 5秒延迟。

**已优化**: 签到查询从 120天→30天，超时从 15秒→3秒

**待优化**: 积分查询超时（当前 5秒）

### 2. 客户端问题

#### 大型组件初始化
`HeroWithForm.tsx` 包含：
- 复杂的表单状态管理
- 24山分析器初始化
- Framer Motion 动画库
- 动态导入的罗盘组件

#### Session 检查优化
已优化为：
1. 先检查 cookie（快速）
2. 只有已登录时才获取完整 session

### 3. 网络问题

#### API 路由错误（500）
多个 API 返回 500：
- `/api/dashboard/stats`
- `/api/dashboard/activity`  
- `/api/credits/daily-progress`

**原因**: 导入错误
```
Export analysisResults doesn't exist in target module
Export getServerSession doesn't exist in target module
```

## 立即修复方案

### 方案 1: 清理缓存（推荐）
```bash
# 停止当前开发服务器（Ctrl+C）
# 删除缓存
rm -rf .next

# 重启
npm run dev
```

### 方案 2: 使用非 Turbopack 模式
```bash
npm run dev:webpack
```

### 方案 3: 添加加载提示
在首页添加更明显的加载状态提示，让用户知道正在加载。

## 性能优化建议

### 短期（立即可做）
1. ✅ 清理 Turbopack 缓存
2. ✅ 优化 session 检查（已完成）
3. ⏳ 修复 API 路由导入错误
4. ⏳ 添加首页加载骨架屏

### 中期（本周内）
1. 将 `HeroWithForm` 拆分为更小的组件
2. 懒加载 framer-motion 动画
3. 优化积分查询（添加缓存）
4. 使用 React.lazy 延迟加载非关键组件

### 长期（持续优化）
1. 实施代码分割（Code Splitting）
2. 使用 Service Worker 缓存
3. 优化图片和资源加载
4. 实施 CDN 加速

## 测试检查清单

### 功能测试
- [ ] 首页正常加载（无编译错误）
- [ ] 未登录用户可以看到完整表单
- [ ] 已登录用户可以看到用户信息栏
- [ ] 表单提交正常工作

### 性能测试
使用 Chrome DevTools 测试：
- [ ] Time to First Byte (TTFB) < 500ms
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] 没有 500 错误

### 体验测试
- [ ] 有明显的加载状态指示
- [ ] 过渡动画流畅
- [ ] 没有闪烁或跳跃

## 监控指标

### 关键指标
- **首页加载时间**: 目标 < 2秒
- **API 响应时间**: 目标 < 500ms
- **数据库查询时间**: 目标 < 200ms

### 监控工具
1. Chrome DevTools Performance
2. React DevTools Profiler
3. Next.js 内置性能分析
4. Vercel Analytics (生产环境)

## 下一步行动

1. **立即执行** - 清理缓存并重启服务器
2. **今天完成** - 修复 API 导入错误
3. **本周完成** - 添加首页加载骨架屏
4. **持续监控** - 设置性能监控和告警

## 相关文件

- `src/app/[locale]/(marketing)/(home)/page.tsx` - 首页主文件
- `src/components/home/HeroWithForm.tsx` - 主表单组件
- `src/components/home/LoggedInUserBar.tsx` - 用户信息栏
- `src/app/actions/dashboard/get-dashboard-data.ts` - 仪表盘数据
- `docs/OPTIMIZATION_LOGIN_DASHBOARD.md` - 登录优化文档
