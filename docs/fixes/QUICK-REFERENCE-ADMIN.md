# Admin无限权限 - 快速参考

## 🚀 立即开始

### 1. 验证Admin配置

```bash
npm run tsx scripts/verify-admin-privileges.ts
```

### 2. 确保用户role为admin

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'your-admin@example.com';
```

### 3. 在API中使用（三选一）

#### 选项A: 最简单 - 带积分和限流检查的包装器

```typescript
import { withCreditsCheck } from '@/lib/api-helpers';

export const POST = withCreditsCheck(async (request, context) => {
  // context.isAdmin: boolean - 是否为管理员
  // context.skipCreditsCheck: boolean - 是否跳过积分检查
  // 管理员会自动跳过所有检查
  
  const result = await yourBusinessLogic();
  return successResponse(result);
});
```

#### 选项B: 仅权限检查

```typescript
import { withAuth } from '@/lib/api-helpers';

export const GET = withAuth(async (request, context) => {
  if (context.isAdmin) {
    // 管理员特殊处理
  }
  return successResponse({ data: 'ok' });
}, { requireAdmin: true }); // 可选：要求管理员权限
```

#### 选项C: 手动检查（最灵活）

```typescript
import { isAdmin, errorResponse } from '@/lib/api-helpers';
import { creditsManager } from '@/lib/credits/manager';

export async function POST(request: Request) {
  try {
    const userId = await getUserId(request);
    const userIsAdmin = await isAdmin(userId);
    
    // 管理员跳过所有检查
    if (!userIsAdmin) {
      // 检查积分、限流等
      const balance = await creditsManager.getBalance(userId);
      if (balance < 10) {
        return errorResponse('积分不足', 402);
      }
    }
    
    // 业务逻辑
    const result = await doWork();
    
    // 扣除积分（管理员不会真正扣除）
    await creditsManager.deduct(userId, 10);
    
    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
```

## 📋 核心API

### 错误处理（确保返回JSON）

```typescript
import { errorResponse, successResponse } from '@/lib/api-helpers';

// ✅ 正确 - 返回JSON
return errorResponse('错误信息', 400);
return successResponse({ data: 'value' });

// ❌ 错误 - 可能返回HTML
throw new Error('错误信息');
```

### 检查管理员

```typescript
import { isAdmin } from '@/lib/api-helpers';

const admin = await isAdmin(userId); // boolean
```

### 积分管理（管理员自动豁免）

```typescript
import { creditsManager } from '@/lib/credits/manager';

// 获取余额（管理员返回无限）
const balance = await creditsManager.getBalance(userId);
// admin: Number.MAX_SAFE_INTEGER
// user: 实际积分数

// 检查是否能支付
const canAfford = await creditsManager.canAfford(userId, 'aiChat');
// admin: 总是 true

// 扣除积分
const success = await creditsManager.deduct(userId, 10);
// admin: 返回true但不扣除
// user: 扣除积分
```

### 限流（管理员自动豁免）

```typescript
import { defaultRateLimiters } from '@/lib/rate-limit';

const limiter = defaultRateLimiters.aiChat;
const result = await limiter(userId, { skipCheck: isAdmin });
// admin: skipCheck=true, 返回 success: true
// user: 正常限流检查
```

## 🔍 检查清单

- [ ] 数据库中admin用户的`role`字段为`'admin'`
- [ ] API路由使用`withAuth`/`withCreditsCheck`或手动检查
- [ ] 所有错误使用`errorResponse`返回JSON
- [ ] 运行验证脚本确认配置正确

## 🐛 故障排查

### 问题1: Admin还是被限流

**原因**: role字段不是'admin'或API未检查权限  
**解决**: 
```sql
UPDATE "user" SET role = 'admin' WHERE email = 'admin@example.com';
```

### 问题2: API返回HTML错误

**原因**: 使用throw而不是errorResponse  
**解决**:
```typescript
// 改为
return errorResponse('错误', 500);
```

### 问题3: Admin积分被扣除

**原因**: 直接操作数据库而不是用creditsManager  
**解决**: 使用`creditsManager.deduct()`

## 📊 验证结果示例

```
=== 开始验证Admin用户权限 ===

1. 查找admin用户...
✅ 找到 1 个admin用户:
   1. admin@example.com (Admin)
      - ID: usr_xxx
      - Role: admin

2. 测试积分管理器功能...
测试用户: admin@example.com
   isAdmin检查: ✅ 是
   积分余额: ∞ (无限)
   积分扣除测试: ✅ 通过
   扣除后余额: ∞ (无限)
   可用功能数: 9/9

✅ 所有admin用户权限配置正确！
```

## 💡 最佳实践

1. **优先使用包装器**: `withAuth`, `withCreditsCheck`, `withRateLimit`
2. **统一错误格式**: 始终用`errorResponse`
3. **验证配置**: 部署前运行验证脚本
4. **日志记录**: 管理员操作会自动记录

## 🎯 效果

- ✅ Admin拥有无限积分
- ✅ Admin不被限流
- ✅ Admin不扣积分
- ✅ API总是返回JSON
- ✅ 易于测试和开发
