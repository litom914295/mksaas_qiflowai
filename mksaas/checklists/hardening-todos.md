# 安全加固待办清单

基于方案 B：保持 Supabase Auth，补齐与模板对齐的安全特性

## 🚨 P0 - 必须立即修复（高风险）

### [ ] 1. 强制邮箱验证
**位置**: `src/lib/auth.ts`, `middleware.ts`
**工作量**: 2 小时

```typescript
// middleware.ts - 添加邮箱验证检查
export async function middleware(request: NextRequest) {
  const session = await getSession();
  
  // 保护路由列表
  const protectedRoutes = ['/dashboard', '/settings', '/api/protected'];
  
  if (protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
    if (!session?.user?.email_verified) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    }
  }
}
```

### [ ] 2. 配置安全响应头
**位置**: `next.config.js`
**工作量**: 1 小时

```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\s{2,}/g, ' ').trim()
  }
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

### [ ] 3. 完善 Cookie 安全属性
**位置**: `src/lib/auth-client.ts`, API routes
**工作量**: 2 小时

```typescript
// 设置 cookie 时添加安全属性
response.cookies.set('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/'
});
```

## 🔧 P1 - 重要改进（中风险）

### [ ] 4. 实现 RBAC 权限系统
**位置**: `src/lib/permissions.ts` (新建)
**工作量**: 4 小时

```typescript
// src/lib/permissions.ts
export const permissions = {
  'user': ['read:own_profile', 'update:own_profile'],
  'admin': ['read:all', 'write:all', 'delete:all'],
  'moderator': ['read:all', 'write:content', 'delete:content']
} as const;

export async function checkPermission(
  userId: string, 
  permission: string,
  resource?: any
): Promise<boolean> {
  const user = await getUserWithRole(userId);
  const userPermissions = permissions[user.role] || [];
  
  // 检查权限
  return userPermissions.includes(permission);
}

// Server Action 守卫
export function withAuth<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  requiredPermission?: string
) {
  return async (...args: T): Promise<R> => {
    const session = await getSession();
    
    if (!session?.user) {
      throw new Error('Unauthorized');
    }
    
    if (requiredPermission) {
      const hasPermission = await checkPermission(
        session.user.id, 
        requiredPermission
      );
      
      if (!hasPermission) {
        throw new Error('Insufficient permissions');
      }
    }
    
    return handler(...args);
  };
}
```

### [ ] 5. 添加速率限制
**位置**: `src/lib/rate-limit.ts` (新建)
**工作量**: 2 小时

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 创建限流器
export const rateLimiter = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 次/分钟
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 次/分钟
  }),
};

// 在 API 路由中使用
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await rateLimiter.auth.limit(ip);
  
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // 处理请求...
}
```

### [ ] 6. 密码重置 Token 一次性验证
**位置**: `src/app/api/auth/reset-password/route.ts`
**工作量**: 1 小时

```typescript
// 重置密码后立即标记 token 为已使用
export async function POST(request: Request) {
  const { token, password } = await request.json();
  
  // 验证 token
  const tokenRecord = await db.passwordResetTokens.findUnique({
    where: { token, used: false, expiresAt: { gt: new Date() } }
  });
  
  if (!tokenRecord) {
    return new Response('Invalid or expired token', { status: 400 });
  }
  
  // 更新密码
  await updatePassword(tokenRecord.userId, password);
  
  // 标记 token 为已使用
  await db.passwordResetTokens.update({
    where: { token },
    data: { used: true }
  });
  
  return new Response('Password reset successful');
}
```

## 💡 P2 - 建议改进（低风险）

### [ ] 7. 增强密码重置邮件的 Captcha 验证
**位置**: `src/components/auth/forgot-password-form.tsx`
**工作量**: 1 小时

### [ ] 8. 实现会话缓存机制
**位置**: `src/lib/session-cache.ts` (新建)
**工作量**: 2 小时

### [ ] 9. 添加登录异常检测
**位置**: `src/lib/security-monitoring.ts` (新建)
**工作量**: 3 小时

### [ ] 10. 实现账号绑定合并流程
**位置**: `src/app/api/auth/link-account/route.ts` (新建)
**工作量**: 3 小时

## 📋 验证清单

完成上述改进后，请验证：

- [ ] 未验证邮箱的用户无法访问 /dashboard
- [ ] 响应头包含 HSTS、CSP、X-Frame-Options
- [ ] Cookie 设置了 HttpOnly、Secure、SameSite
- [ ] 管理员功能需要 admin 角色才能访问
- [ ] 登录接口有速率限制（5次/分钟）
- [ ] 密码重置 token 使用一次后失效
- [ ] Captcha 在所有认证表单正常工作

## 🔍 测试脚本

```bash
# 测试安全头
curl -I https://your-domain.com | grep -E "Strict-Transport|X-Frame|Content-Security"

# 测试速率限制
for i in {1..10}; do 
  curl -X POST https://your-domain.com/api/auth/sign-in \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"test"}'
done

# 测试权限
curl -X GET https://your-domain.com/api/admin/users \
  -H "Authorization: Bearer $USER_TOKEN" # 应返回 403

curl -X GET https://your-domain.com/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" # 应返回 200
```

## 📅 实施计划

| 阶段 | 任务 | 工作量 | 优先级 |
|------|------|--------|--------|
| Day 1 | P0 任务 (1-3) | 5 小时 | 🔴 必须 |
| Day 2 | P1 任务 (4-6) | 7 小时 | 🟠 重要 |
| Day 3 | P2 任务 (7-10) | 9 小时 | 🟡 建议 |
| Day 4 | 测试与验证 | 4 小时 | 🟢 验收 |

**总工作量**: 约 25 小时（3-4 人天）

## 🎯 完成标准

- 安全评分从 21/35 提升至 28/35 以上
- 所有高风险项降级为中低风险
- 通过安全扫描工具检测
- 通过渗透测试基础项

---

*最后更新：2024-12-26*  
*负责人：安全团队*