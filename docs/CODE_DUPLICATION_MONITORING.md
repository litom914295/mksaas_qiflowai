# 代码重复监控

## 概述

本项目使用 [jscpd](https://github.com/kucherenko/jscpd) 工具自动检测代码重复，帮助维护代码质量。

## 使用方法

### 本地运行

```bash
# 检测代码重复
npm run check:duplicates
```

### 配置参数

当前配置（在 `package.json` 中）：

- **最小行数**: 10行（`--min-lines 10`）
- **最小token数**: 100（`--min-tokens 100`）
- **阈值**: 5%（`--threshold 5`）
- **检测文件类型**: TypeScript, JavaScript, TSX, JSX
- **忽略目录**: 
  - 测试文件 (`__tests__`, `*.test.ts`, `*.test.tsx`)
  - 依赖 (`node_modules`)
  - 构建产物 (`.next`, `dist`)

## CI集成

代码重复检测已集成到 GitHub Actions CI 流程中：

- **触发时机**: 每次 push 到 main/develop 分支，或创建 Pull Request 时
- **失败处理**: `continue-on-error: true` - 不会阻塞 CI 流程，仅作为警告
- **工作流文件**: `.github/workflows/ci.yml`

## 阈值说明

当前阈值设置为 5%：

| 重复率 | 状态 | 建议 |
|-------|------|-----|
| 0-5% | ✅ 优秀 | 保持 |
| 5-10% | ⚠️ 警告 | 考虑重构 |
| >10% | 🔴 严重 | 立即重构 |

## 重构建议

发现重复代码时，考虑以下策略：

### 1. 提取公共函数/组件
```typescript
// Before
// file1.ts
function validateEmail(email: string) { /* ... */ }

// file2.ts  
function validateEmail(email: string) { /* ... */ }

// After
// utils/validation.ts
export function validateEmail(email: string) { /* ... */ }
```

### 2. 使用继承或组合
```typescript
// Before
class UserService { /* common logic */ }
class AdminService { /* same logic */ }

// After
class BaseService { /* common logic */ }
class UserService extends BaseService {}
class AdminService extends BaseService {}
```

### 3. 使用高阶函数/组件
```typescript
// Before
const Button1 = () => <button className="...">...</button>
const Button2 = () => <button className="...">...</button>

// After
const Button = ({ variant }: Props) => <button className={cn(...)}>...</button>
```

## 历史重构

### ✅ 2025-01: Fengshui/Xuankong 合并

**问题**: 15-20% 代码重复率
- `src/lib/fengshui/fengshui/*` 与 `src/lib/qiflow/xuankong/*` 完全重复

**解决方案**:
- 删除重复目录
- 创建别名导出保持向后兼容
- 减少 ~15,000 行冗余代码

**详情**: 见 [CODE_REVIEW_REPORT1.md](../CODE_REVIEW_REPORT1.md)

## 配置优化

如需调整检测灵敏度，修改 `package.json`:

```json
{
  "scripts": {
    "check:duplicates": "npx jscpd --min-lines 15 --min-tokens 150 --threshold 3 ..."
  }
}
```

参数说明：
- 提高 `min-lines`/`min-tokens` → 减少误报
- 降低 `threshold` → 更严格

## 相关资源

- [jscpd 官方文档](https://github.com/kucherenko/jscpd)
- [代码审查报告](../CODE_REVIEW_REPORT1.md)
- [CI 配置](.github/workflows/ci.yml)

## 维护

建议每个月运行一次完整代码重复分析，并根据项目规模调整阈值。
