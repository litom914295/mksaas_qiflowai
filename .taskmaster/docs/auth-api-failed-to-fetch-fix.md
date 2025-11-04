# 认证 API "Failed to fetch" 错误诊断与修复

## 🔴 错误信息

```
TypeError: Failed to fetch
  at Object.email (src/lib/auth-client.ts:33:32)
  at onSubmit (src/components/auth/login-form.tsx:129:29)
```

## 🔍 问题分析

"Failed to fetch" 错误通常由以下原因引起：

### 1. **开发服务器未重启**（最常见）
   - 修改环境变量后，Next.js 开发服务器需要完全重启
   - Turbopack 可能不会自动重新加载环境变量

### 2. **环境变量未加载**
   - `.env.local` 文件存在但未被正确读取
   - 环境变量名称拼写错误

### 3. **API 路由问题**
   - Catch-all 路由 `[...all]` 未正确匹配
   - API 端点返回非 200 状态码

### 4. **CORS 或网络问题**
   - 浏览器阻止了请求
   - localhost 端口冲突

### 5. **Supabase 配置问题**
   - Supabase URL 或密钥无效
   - Supabase 项目未激活或暂停

## ✅ 解决方案

### 步骤 1: 完全重启开发服务器

```powershell
# 停止当前的 dev 服务器 (Ctrl+C)

# 清除 Next.js 缓存
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# 重新启动
npm run dev
```

### 步骤 2: 验证环境变量

访问健康检查端点：
```
http://localhost:3000/api/health
```

应该返回：
```json
{
  "status": "healthy",
  "config": {
    "NEXT_PUBLIC_SUPABASE_URL": true,
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": true,
    "SUPABASE_SERVICE_ROLE_KEY": true
  }
}
```

### 步骤 3: 测试 API 端点

在浏览器或 Postman 中测试：

```bash
# 测试登录端点
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### 步骤 4: 检查浏览器控制台

打开浏览器开发者工具 (F12)：
1. **Console 标签**: 查看 JavaScript 错误
2. **Network 标签**: 检查 API 请求状态
   - 请求是否发送？
   - 状态码是什么？
   - 响应内容是什么？

### 步骤 5: 验证 Supabase 配置

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择您的项目
3. 进入 **Settings → API**
4. 确认：
   - Project URL 与 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 一致
   - anon public key 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 一致
   - service_role key 与 `SUPABASE_SERVICE_ROLE_KEY` 一致

## 🛠️ 已实施的改进

### 1. 增强的错误处理 (auth.ts)

```typescript
// 检查环境变量
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('Supabase 环境变量未配置:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓' : '✗');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗');
  throw new Error('Supabase 环境变量未配置，请检查 .env.local 文件');
}
```

### 2. API 路由详细错误信息

```typescript
catch (error) {
  console.error('Auth API error:', error);
  const errorMessage = error instanceof Error ? error.message : 'Internal server error';
  return NextResponse.json(
    { 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    },
    { status: 500 }
  );
}
```

### 3. 客户端错误处理改进

```typescript
// auth-client.ts - 网络错误处理
catch (error) {
  console.error('Auth client network error:', error);
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Network error or server is not responding';
  options?.onError?.({
    error: {
      status: 0,
      message: errorMessage,
    },
  });
  return { error: errorMessage };
}
```

## 📊 错误排查清单

- [ ] 完全重启开发服务器（不是热重载）
- [ ] 清除 `.next` 缓存目录
- [ ] 访问 `/api/health` 检查环境变量
- [ ] 检查浏览器开发者工具 Network 标签
- [ ] 验证 `.env.local` 文件存在且格式正确
- [ ] 确认 Supabase 项目处于活动状态
- [ ] 测试 API 端点（使用 curl 或 Postman）
- [ ] 检查防火墙或安全软件是否阻止本地请求
- [ ] 确认端口 3000 没有被其他程序占用

## 🐛 常见错误模式

### 错误 1: "Supabase 环境变量未配置"
**原因**: 环境变量未正确加载  
**解决**: 重启开发服务器

### 错误 2: "Failed to fetch"
**原因**: API 路由不可访问  
**解决**: 检查开发服务器是否正在运行，访问 `/api/health`

### 错误 3: "Invalid API key"
**原因**: Supabase 密钥错误或过期  
**解决**: 从 Supabase Dashboard 重新复制密钥

### 错误 4: "CORS error"
**原因**: 跨域请求被阻止  
**解决**: 确保前端和 API 都运行在 localhost:3000

## 📝 验证步骤（按顺序执行）

```powershell
# 1. 停止开发服务器
# Ctrl+C

# 2. 清除缓存
Remove-Item -Path ".next" -Recurse -Force

# 3. 验证环境变量文件存在
Get-Content .env.local | Select-String "SUPABASE"

# 4. 重新启动
npm run dev

# 5. 等待服务器启动完成（约10-30秒）

# 6. 在新的 PowerShell 窗口测试健康检查
curl http://localhost:3000/api/health

# 7. 测试登录 API
curl -X POST http://localhost:3000/api/auth/sign-in/email `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"test123456"}'
```

## 🔧 紧急修复

如果所有方法都失败，使用模拟认证（仅用于开发）：

1. 创建 `src/lib/auth-mock.ts`:
```typescript
export const auth = {
  api: {
    signIn: async (email: string, password: string) => ({
      error: null,
      user: { id: '1', email, name: 'Test User' },
      session: { access_token: 'mock-token' }
    }),
    signUp: async (email: string, password: string, name?: string) => ({
      error: null,
      user: { id: '1', email, name: name || 'Test User' }
    }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({
      session: null,
      user: null
    })
  }
};
```

2. 临时替换 `src/app/api/auth/[...all]/route.ts` 中的导入：
```typescript
import { auth } from '@/lib/auth-mock';  // 临时使用
```

## 📞 需要帮助？

如果问题持续存在，请提供以下信息：

1. `/api/health` 的响应
2. 浏览器控制台的完整错误信息
3. Network 标签中失败请求的详情
4. `npm run dev` 的完整输出
5. Supabase Dashboard 项目状态截图

## 🎯 预期结果

成功配置后：
- ✅ `/api/health` 返回 `status: "healthy"`
- ✅ 登录请求成功发送到 `/api/auth/sign-in/email`
- ✅ 错误消息清晰且有帮助
- ✅ 开发体验流畅

## 更新日期

2025-01-14
