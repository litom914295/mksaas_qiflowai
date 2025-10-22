# Dashboard 404 问题修复

## 🔍 问题分析

从日志看到：
```
Dashboard error: Error: NEXT_HTTP_ERROR_FALLBACK;404
if (!dashboardData) {
  notFound(); // ← 这里触发了 404
}
```

**根本原因**: `getDashboardData()` 返回了 `null`，因为 `getSession()` 没有正确返回用户信息。

---

## ✅ 已实施的修复

### 修复 1: Session Pooler 连接字符串 ✅

```bash
# 修复前
SESSION_DATABASE_URL=postgresql://postgres:7MNsdjs7Wyjg9Qtr@aws-0-ap-southeast-1...

# 修复后
SESSION_DATABASE_URL=postgresql://postgres.sibwcdadrsbfkblinezj:7MNsdjs7Wyjg9Qtr@aws-0-ap-southeast-1...
```

**注意**: Session Pooler 需要在用户名中包含项目引用

### 修复 2: 添加调试日志 ✅

在 `getDashboardData` 函数中添加了详细日志，帮助定位问题。

---

## 🚀 现在请执行

### 步骤 1: 重启应用

```bash
# Ctrl+C 停止当前服务器
# 然后重新启动
npm run dev
```

### 步骤 2: 清除浏览器缓存

**重要**：登录后如果还是看到 404，可能是浏览器 cookie 问题。

**Chrome/Edge**:
1. 按 `F12` 打开开发者工具
2. 点击 "Application" 标签
3. 左侧选择 "Cookies" → http://localhost:3000
4. 右键点击 → "Clear"
5. 刷新页面（F5）

**或者使用无痕模式**:
- Chrome: `Ctrl + Shift + N`
- Edge: `Ctrl + Shift + P`

### 步骤 3: 重新登录

1. 访问 http://localhost:3000
2. 点击登录
3. 使用你的账号登录

**预期结果**:
- ✅ 成功跳转到 Dashboard
- ✅ 看到欢迎信息和统计数据
- ✅ 控制台显示 session 信息

---

## 🔧 如果还是 404

### 检查点 1: 查看控制台日志

启动后应该看到：
```
getDashboardData - session: {
  hasSession: true,
  hasUser: true,
  userId: 'aee24c22-...',
  userName: 'xxx'
}
```

如果看到：
```
getDashboardData - session: {
  hasSession: false,
  hasUser: false
}
```

说明 session 没有正确获取。

### 检查点 2: 验证 Cookie

在浏览器开发者工具中：
1. 打开 "Application" → "Cookies"
2. 查找 `supabase-auth-token`
3. 如果不存在，说明登录后 cookie 没有设置

**解决方法**:

修改 `src/app/api/auth/sign-in/email/route.ts`，确保设置了 cookie。

### 检查点 3: 检查 Supabase Auth

在 Supabase Dashboard 中：
1. 访问 Authentication → Users
2. 确认用户已经创建
3. 查看用户的 `last_sign_in_at` 时间戳

---

## 🐛 已知问题和解决方案

### 问题 1: Session Cookie 未设置

**症状**: 登录成功但立即被重定向到登录页

**原因**: 登录 API 没有正确设置 cookie

**临时解决方案**:
```typescript
// src/app/api/auth/sign-in/email/route.ts
// 在登录成功后设置 cookie
response.cookies.set('supabase-auth-token', session.access_token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7, // 7 days
});
```

### 问题 2: 直接访问 Dashboard 404

**症状**: 刷新 Dashboard 页面时出现 404

**原因**: 服务器端无法获取 session（cookie 问题或 auth 配置问题）

**解决方案**:
1. 确保使用 `next/headers` 的 `cookies()` 或 `headers()`
2. 确保登录时设置了正确的 cookie
3. 检查 middleware 是否正确传递了认证信息

---

## 📊 技术细节

### Auth 流程

```
1. 用户登录
   └─> POST /api/auth/sign-in/email
       └─> Supabase Auth 验证
           └─> 设置 cookie (supabase-auth-token)
           └─> 返回 200

2. 访问 Dashboard
   └─> getSession()
       └─> 从 cookie 读取 token
       └─> 验证 token
       └─> 返回 { session, user }

3. getDashboardData()
   └─> 检查 session.user
       └─> 返回 dashboard data
```

### Session 结构

```typescript
// auth.api.getSession() 返回:
{
  session: {
    userId: string;
    token: string;
    expiresAt: Date;
    user: User;
  },
  user: User; // 直接在顶层也有 user
}

// 所以在 getDashboardData 中:
const session = await getSession();
// session.user ✅ 正确
// session.session.user ❌ 错误
```

---

## 🔍 调试命令

### 1. 查看当前用户

```bash
npm run list-users
```

### 2. 测试数据库连接

```bash
# 在终端运行
node -e "require('./src/db/index.ts').getDb().then(() => console.log('DB OK'))"
```

### 3. 清理所有 session

在 Supabase Dashboard:
- Authentication → Users
- 选择用户 → Sign Out User

---

## ✅ 验证修复

重启后，按以下顺序验证：

1. **启动日志** - 应该看到:
   ```
   Using database connection: Session Pooler
   ✅ Database connection established
   ```

2. **登录** - 应该看到:
   ```
   POST /api/auth/sign-in/email 200
   addRegisterGiftCredits, 70 credits...
   ```

3. **Dashboard** - 应该看到:
   ```
   getDashboardData - session: { hasSession: true, hasUser: true, ... }
   GET /zh-CN/dashboard 200
   ```

4. **浏览器** - 应该显示个人中心页面，包含：
   - 欢迎横幅
   - 统计卡片
   - 快速操作按钮

---

## 📝 后续优化建议

1. **改进错误处理**: 在 Dashboard 页面添加友好的错误提示
2. **自动重定向**: 如果 session 无效，自动重定向到登录页
3. **Session 刷新**: 实现自动刷新 token 机制
4. **更好的日志**: 在生产环境禁用调试日志

---

**现在重启应用，清除浏览器缓存，然后重新登录试试！** 🚀
