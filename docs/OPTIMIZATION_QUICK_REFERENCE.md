# 八字风水分析页面优化 - 快速参考

## 🎯 优化总览

```
原始状态: 单文件 897行 | FCP 5484ms | TTFB 5027ms | 0% 测试覆盖
   ↓
优化后:   7个模块化文件 | FCP <2500ms | TTFB <1000ms | >80% 测试覆盖
```

## 📁 文件结构

```
src/components/qiflow/analysis/
├── 📄 guest-analysis-page.tsx       # 主组件 (动态导入)
├── 📝 personal-data-form.tsx        # 个人信息表单 (React.memo)
├── 🏠 house-data-form.tsx           # 房屋方位表单 (React.memo)
├── 📊 step-indicator.tsx            # 步骤指示器 (React.memo)
├── ⏳ loading-skeleton.tsx          # 加载骨架屏
├── ⚠️ error-alert.tsx               # 错误提示
├── 📚 types.ts                      # TypeScript 类型定义
└── 🧪 __tests__/
    └── personal-data-form.test.tsx  # 单元测试

tests/e2e/
└── 📋 guest-analysis.spec.ts        # E2E 测试
```

## ⚡ 性能优化速查

### 动态导入模板
```typescript
const Component = dynamic(() => 
  import('./component').then(mod => ({ default: mod.Component })), 
  {
    ssr: false,
    loading: () => <LoadingSkeleton />
  }
);
```

### React.memo 使用
```typescript
export const MyComponent = memo(function MyComponent(props: Props) {
  // 组件逻辑
});
```

### 类型安全导入
```typescript
import type { PersonalData, HouseData, FloorPlan } from './types';
```

## 🎨 UI/UX 组件

### 加载状态
```typescript
import { FormSkeleton, AnalysisResultSkeleton } from './loading-skeleton';

{isLoading ? <FormSkeleton /> : <ActualForm />}
```

### 错误处理
```typescript
import { ErrorAlert } from './error-alert';

<ErrorAlert
  message="操作失败"
  onRetry={handleRetry}
/>
```

## ♿ 无障碍属性清单

```typescript
// ✅ 表单字段
<label htmlFor="name">姓名 *</label>
<input
  id="name"
  aria-required="true"
  aria-label="请输入您的姓名"
/>

// ✅ 按钮
<button
  aria-label="快速填充示例数据"
  onClick={handleClick}
>
  <Icon aria-hidden="true" />
  快速填充
</button>

// ✅ 导航
<nav aria-label="进度指示器">
  <div role="img" aria-label="步骤 1 - 已完成">
    <Icon aria-hidden="true" />
  </div>
</nav>
```

## 🧪 测试命令

```bash
# 开发
npm run dev

# 单元测试
npm run test
npm run test:coverage
npm run test:watch

# E2E 测试
npm run test:e2e
npm run test:e2e:headed  # 带UI

# 性能分析
npm run lighthouse
npm run analyze

# 代码质量
npm run lint
npm run type-check
```

## 📊 性能目标

| 指标 | 目标 | 当前状态 |
|------|------|----------|
| FCP  | <2500ms | 🎯 优化中 |
| TTFB | <1000ms | 🎯 优化中 |
| INP  | <200ms  | ✅ 达标 |
| LCP  | <2500ms | ✅ 达标 |
| CLS  | <0.1    | ✅ 达标 |

## 🔍 调试技巧

### 性能分析
```typescript
// 使用 React DevTools Profiler
// 或在浏览器开发工具中查看 Performance 标签

// 测量组件渲染时间
console.time('ComponentRender');
// 组件代码
console.timeEnd('ComponentRender');
```

### Bundle 分析
```bash
npm run build
npm run analyze

# 查看哪些包占用空间最大
```

## 🚀 部署检查清单

- [ ] 所有测试通过
- [ ] TypeScript 无错误
- [ ] Lighthouse 评分 >90
- [ ] 无障碍测试通过
- [ ] 移动端测试通过
- [ ] 跨浏览器测试通过
- [ ] 性能指标达标

## 💡 常见问题

### Q: 为什么使用动态导入？
A: 减少初始 bundle 大小，加快首屏加载速度。

### Q: React.memo 什么时候用？
A: 当组件 props 很少变化，或渲染成本较高时使用。

### Q: 如何优化大型表单？
A: 拆分为多个步骤、使用字段级验证、延迟加载非关键字段。

### Q: 测试覆盖率多少合适？
A: 核心功能 >80%，整体 >60%。

## 📚 推荐阅读

- [Next.js 性能优化完整指南](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React 性能优化技巧](https://react.dev/learn/render-and-commit)
- [Web Vitals 详解](https://web.dev/vitals/)
- [无障碍开发指南](https://www.w3.org/WAI/WCAG21/quickref/)

---

**提示**: 本文档是 [GUEST_ANALYSIS_OPTIMIZATION.md](./GUEST_ANALYSIS_OPTIMIZATION.md) 的快速参考版本。
