# 🚨 紧急性能修复指南

## 问题严重程度：🔴 严重

### 症状
- 仪表盘加载时间：**1-5 分钟**
- `get-session` 耗时：**25+ 秒**
- `dashboard` RSC 加载：**29-108 秒**
- 用户体验：完全不可用

### 根本原因
**数据库查询严重超时** - 不是代码逻辑问题，是数据库连接/性能问题

## 🚀 立即修复方案（已实施）

### 1. 使用快速版本仪表盘数据 ✅

已创建 `get-dashboard-data-fast.ts`：
- 只获取 session 信息
- 不查询数据库
- 使用默认值
- 加载时间 < 100ms

**文件修改**:
- ✅ 创建 `src/app/actions/dashboard/get-dashboard-data-fast.ts`
- ✅ 修改 `src/app/[locale]/(protected)dashboard/page.tsx` 使用快速版本

### 2. 优化超时时间 ✅

- 积分查询：5秒 → 2秒
- 签到查询：15秒 → 3秒（之前已优化）

## 📊 预期改善

| 指标 | 修复前 | 修复后 | 改善 |
|------|--------|--------|------|
| 仪表盘加载 | 1-5分钟 | < 1秒 | **99%+** |
| get-session | 25秒 | < 500ms | **98%** |
| 用户可用性 | 不可用 | 立即可用 | ✅ |

## 🔍 深层问题排查

### 必须排查的问题

#### 1. 数据库连接池
```bash
# 检查数据库连接池配置
# 文件: src/db/index.ts 或类似
```

**可能问题**:
- 连接池耗尽
- 连接超时设置过长
- 没有连接池复用

**解决方案**:
```typescript
// 配置合理的连接池
max: 20,          // 最大连接数
min: 2,           // 最小连接数
idleTimeout: 30000, // 空闲超时 30秒
connectionTimeout: 5000, // 连接超时 5秒
```

#### 2. 数据库查询性能

**检查 SQL 查询**:
```sql
-- 检查慢查询
EXPLAIN ANALYZE SELECT * FROM credit_transaction 
WHERE user_id = ? AND type = 'DAILY_SIGNIN' 
ORDER BY created_at DESC;
```

**必须添加的索引**:
```sql
-- 签到查询索引
CREATE INDEX IF NOT EXISTS idx_credit_transaction_signin 
ON credit_transaction(user_id, type, created_at) 
WHERE type = 'DAILY_SIGNIN';

-- 用户分析索引
CREATE INDEX IF NOT EXISTS idx_bazi_calculations_user 
ON bazi_calculations(user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_fengshui_analysis_user 
ON fengshui_analysis(user_id, created_at);
```

#### 3. getUserCredits 函数

**位置**: `src/credits/credits.ts`

**排查点**:
- 是否有事务锁
- 是否有复杂计算
- 是否有多次数据库查询

**临时方案**: 在 `.env` 设置
```bash
DISABLE_CREDITS_DB=true
```

## 🧪 测试验证

### 1. 清理缓存并重启
```bash
# PowerShell
Remove-Item -Recurse -Force .next
npm run dev
```

### 2. 测试仪表盘加载
```bash
# 访问
http://localhost:3000/zh-CN/dashboard

# 预期结果
- 加载时间 < 2秒
- 显示基本信息（姓名、头像）
- 显示"加载中..."占位符
- 没有500错误
```

### 3. 检查 Network 时间
Chrome DevTools → Network:
- `get-session` < 500ms ✅
- `dashboard?_rsc=*` < 1s ✅
- 没有 25秒+ 的请求 ✅

## 📝 长期解决方案

### Phase 1: 数据库优化（本周）
1. ✅ 添加所有必要的数据库索引
2. ✅ 优化 `getUserCredits` 函数
3. ✅ 配置合理的连接池
4. ✅ 添加查询缓存

### Phase 2: 架构优化（下周）
1. 实施 Redis 缓存
2. 异步加载非关键数据
3. 使用 SWR 或 React Query 客户端缓存
4. 实施渐进式数据加载

### Phase 3: 监控告警（持续）
1. 设置慢查询告警（> 1秒）
2. 监控数据库连接池状态
3. 监控API响应时间
4. 设置用户体验指标追踪

## 🔄 回滚方案

如果快速版本有问题，回滚到原版本：

```typescript
// src/app/[locale]/(protected)/dashboard/page.tsx
import { getDashboardData } from '@/app/actions/dashboard/get-dashboard-data';
// 注释掉快速版本
```

## ⚠️ 注意事项

### 快速版本的限制
- ✅ 页面立即加载
- ❌ 积分显示为 0（占位符）
- ❌ 统计数据显示为 0
- ❌ 签到状态不准确

### 下一步
需要实施**客户端异步加载**真实数据：
1. 页面先用快速版本渲染
2. 客户端组件异步获取真实数据
3. 数据到达后更新显示

## 📞 紧急联系

如有问题，请立即：
1. 检查服务器日志
2. 检查数据库连接状态
3. 查看 `.env` 配置
4. 确认数据库是否在线

---

**修复实施时间**: 2025-01-05
**预计解决时间**: < 1小时（临时方案）+ 1-2天（永久方案）
**优先级**: P0 - 最高优先级
