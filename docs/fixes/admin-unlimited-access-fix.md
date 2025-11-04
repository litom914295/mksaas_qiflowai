# Admin无限权限修复指南

## 问题描述

1. **Console SyntaxError**: `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
   - 前端期望JSON响应，但收到HTML错误页面
   
2. **超级管理员限制问题**: admin用户无法无限使用各种功能进行测试
   - 积分限制
   - API限流限制

## 解决方案

### 1. 修复限流器（支持管理员豁免）

已修改 `src/lib/rate-limit.ts`，添加了管理员豁免功能：

```typescript
// 限流器现在支持跳过检查选项
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(
    identifier: string,
    options?: { skipCheck?: boolean }
  ) {
    // 管理员可以跳过限流检查
    if (options?.skipCheck) {
      return { success: true, ... };
    }
    // ... 正常限流逻辑
  };
}

// 中间件现在支持管理员检查
export function rateLimitMiddleware(
  limiter,
  options?: { skipAdminCheck?: boolean }
) {
  return async function middleware(
    request: Request,
    userId?: string,
    userRole?: string
  ) {
    // 管理员豁免限流
    if (!options?.skipAdminCheck && userRole === 'admin') {
      return null; // 通过
    }
    // ... 正常限流逻辑
  };
}
```

### 2. 新增API辅助工具

创建了 `src/lib/api-helpers.ts`，提供统一的API处理：

```typescript
// 1. 统一错误响应（确保返回JSON而不是HTML）
export function errorResponse(error: string, status: number = 400) {
  return Response.json({ success: false, error }, { status });
}

// 2. 管理员检查
export async function isAdmin(userId: string): Promise<boolean> {
  // 查询数据库检查role字段
}

// 3. 带权限检查的API包装器
export function withAuth(handler, options?) {
  return async (request) => {
    try {
      const userInfo = await getUserFromRequest(request);
      const userIsAdmin = await isAdmin(userInfo?.userId);
      
      // 自动处理权限检查
      if (options?.requireAdmin && !userIsAdmin) {
        return errorResponse('需要管理员权限', 403);
      }
      
      return await handler(request, { 
        userId, 
        userRole, 
        isAdmin: userIsAdmin 
      });
    } catch (error) {
      // 确保返回JSON而不是抛出异常
      return errorResponse(error.message, 500);
    }
  };
}

// 4. 带积分检查的包装器（管理员自动跳过）
export function withCreditsCheck(handler) {
  return withAuth(async (request, context) => {
    const skipCreditsCheck = context.isAdmin;
    return handler(request, { ...context, skipCreditsCheck });
  });
}

// 5. 带限流检查的包装器（管理员自动跳过）
export function withRateLimit(handler, limiter) {
  return withAuth(async (request, context) => {
    if (!context.isAdmin) {
      const result = await limiter(context.userId);
      if (!result.success) {
        return errorResponse('请求过于频繁', 429);
      }
    }
    return handler(request, context);
  });
}
```

### 3. 积分管理器（已有的功能）

`src/lib/credits/manager.ts` 已经实现了管理员无限积分：

```typescript
// 检查是否为管理员
async isAdmin(userId: string): Promise<boolean> {
  const users = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId));
  return users[0]?.role === 'admin';
}

// 获取余额（管理员返回无限）
async getBalance(userId: string): Promise<number> {
  if (await this.isAdmin(userId)) {
    return Number.MAX_SAFE_INTEGER; // 无限积分
  }
  // ... 查询正常用户积分
}

// 扣除积分（管理员不扣除）
async deduct(userId: string, amount: number): Promise<boolean> {
  if (await this.isAdmin(userId)) {
    return true; // 直接返回成功
  }
  // ... 扣除正常用户积分
}
```

## 使用方法

### 方法1: 使用新的API辅助工具（推荐）

```typescript
// src/app/api/your-endpoint/route.ts
import { withCreditsCheck, withRateLimit, errorResponse, successResponse } from '@/lib/api-helpers';
import { defaultRateLimiters } from '@/lib/rate-limit';
import { creditsManager } from '@/lib/credits/manager';

// 方式A: 简单的带权限检查
export const GET = withAuth(async (request, context) => {
  // context.isAdmin 会自动判断
  // context.userId 用户ID
  // context.userRole 用户角色
  
  if (!context.isAdmin && someCondition) {
    return errorResponse('权限不足', 403);
  }
  
  return successResponse({ data: 'your data' });
});

// 方式B: 带积分检查（管理员自动跳过）
export const POST = withCreditsCheck(async (request, context) => {
  // context.skipCreditsCheck 表示是否跳过积分检查
  
  if (!context.skipCreditsCheck) {
    // 检查和扣除积分
    const canAfford = await creditsManager.canAfford(context.userId, 'aiChat');
    if (!canAfford) {
      return errorResponse('积分不足', 402);
    }
    await creditsManager.deduct(context.userId, 5);
  }
  
  // 执行业务逻辑
  const result = await doSomething();
  return successResponse(result);
});

// 方式C: 带限流检查（管理员自动跳过）
export const POST = withRateLimit(
  async (request, context) => {
    // 业务逻辑
    return successResponse({ ok: true });
  },
  defaultRateLimiters.aiChat
);
```

### 方法2: 手动检查（更灵活）

```typescript
import { isAdmin, errorResponse, successResponse } from '@/lib/api-helpers';
import { creditsManager } from '@/lib/credits/manager';

export async function POST(request: Request) {
  try {
    // 获取用户ID（从session/token等）
    const userId = await getUserId(request);
    
    // 检查是否为管理员
    const userIsAdmin = await isAdmin(userId);
    
    // 管理员跳过所有检查
    if (!userIsAdmin) {
      // 检查积分
      const balance = await creditsManager.getBalance(userId);
      if (balance < 10) {
        return errorResponse('积分不足', 402);
      }
      
      // 检查限流
      const limiter = defaultRateLimiters.aiChat;
      const limitResult = await limiter(userId);
      if (!limitResult.success) {
        return errorResponse('请求过于频繁', 429);
      }
    }
    
    // 执行业务逻辑
    const result = await doSomething();
    
    // 扣除积分（管理员不会真正扣除）
    await creditsManager.deduct(userId, 10);
    
    return successResponse(result);
  } catch (error) {
    // 确保返回JSON错误
    return errorResponse(error.message, 500);
  }
}
```

## 验证步骤

### 1. 运行验证脚本

```bash
npm run tsx scripts/verify-admin-privileges.ts
```

该脚本会检查：
- ✅ 数据库中admin用户的配置
- ✅ 积分管理器是否正确识别管理员
- ✅ 管理员是否拥有无限积分
- ✅ 积分扣除是否对管理员生效（应该不生效）

### 2. 确保admin用户的role字段正确

```sql
-- 检查admin用户
SELECT id, email, name, role FROM "user" WHERE role = 'admin';

-- 如果需要，更新用户为admin
UPDATE "user" SET role = 'admin' WHERE email = 'admin@example.com';
```

### 3. 测试API端点

```bash
# 使用admin用户的token
curl -X POST http://localhost:3000/api/your-endpoint \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

# 应该返回JSON而不是HTML
# 不应该被限流
# 不应该扣除积分
```

## 常见问题

### Q1: 为什么admin用户还是被限流？

**A:** 检查以下几点：
1. 数据库中用户的`role`字段是否为`'admin'`
2. API路由是否使用了`withAuth`、`withRateLimit`或手动检查管理员权限
3. 检查中间件配置是否正确传递用户信息

### Q2: API返回HTML而不是JSON怎么办？

**A:** 使用新的`errorResponse`函数：
```typescript
// ❌ 错误做法
throw new Error('Something wrong'); // 可能返回HTML错误页面

// ✅ 正确做法
return errorResponse('Something wrong', 500); // 确保返回JSON
```

### Q3: 如何给现有用户添加admin权限？

```typescript
import { getDb } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

const db = await getDb();
await db
  .update(user)
  .set({ role: 'admin' })
  .where(eq(user.email, 'user@example.com'));
```

### Q4: 管理员的积分会被扣除吗？

**A:** 不会。`creditsManager.deduct()`会检查用户是否为管理员：
- 管理员：直接返回`true`，不扣除积分
- 普通用户：正常扣除积分

## 最佳实践

1. **使用API辅助工具**: 优先使用`withAuth`、`withCreditsCheck`、`withRateLimit`
2. **统一错误处理**: 使用`errorResponse`确保返回JSON
3. **日志记录**: 管理员操作会自动记录日志
4. **测试验证**: 使用验证脚本确保配置正确

## 示例：完整的受保护API路由

```typescript
// src/app/api/protected-feature/route.ts
import { 
  withCreditsCheck, 
  errorResponse, 
  successResponse 
} from '@/lib/api-helpers';
import { creditsManager } from '@/lib/credits/manager';

export const POST = withCreditsCheck(async (request, context) => {
  try {
    // 解析请求
    const body = await request.json();
    
    // 管理员跳过积分检查
    if (!context.skipCreditsCheck) {
      const price = creditsManager.getPrice('aiChat');
      const canAfford = await creditsManager.canAfford(context.userId, 'aiChat');
      
      if (!canAfford) {
        return errorResponse(`积分不足，需要${price}积分`, 402);
      }
    }
    
    // 执行业务逻辑
    const result = await performFeature(body);
    
    // 扣除积分（管理员不会真正扣除）
    if (!context.skipCreditsCheck) {
      await creditsManager.deduct(context.userId, creditsManager.getPrice('aiChat'));
    }
    
    return successResponse({
      result,
      isAdmin: context.isAdmin,
      creditsDeducted: !context.skipCreditsCheck,
    });
  } catch (error) {
    return errorResponse(error.message, 500);
  }
});
```

## 总结

通过以上修改：

1. ✅ **管理员拥有无限积分**: `CreditsManager.getBalance()` 返回 `Number.MAX_SAFE_INTEGER`
2. ✅ **管理员不被扣除积分**: `CreditsManager.deduct()` 对管理员直接返回成功
3. ✅ **管理员不被限流**: 限流器和中间件检查`userRole === 'admin'`后跳过
4. ✅ **API返回JSON而不是HTML**: 使用`errorResponse`统一错误处理
5. ✅ **易于使用**: 提供`withAuth`、`withCreditsCheck`等高阶函数简化开发

现在admin用户可以：
- 🚀 无限使用所有需要积分的功能
- 🚀 不受API限流限制
- 🚀 进行充分的测试而不用担心资源消耗
