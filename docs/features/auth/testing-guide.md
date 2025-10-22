# 🧪 认证系统测试指南

## ✅ 当前状态

### 已完成
- ✅ **API 路由**: `app/api/auth/[...all]/route.ts`
- ✅ **登录页面**: `http://localhost:3000/zh-CN/sign-in`
- ✅ **注册页面**: `http://localhost:3000/zh-CN/sign-up`
- ✅ **表单组件**: SignInForm, SignUpForm
- ✅ **UI 组件**: Icons, AuthCard
- ✅ **开发服务器**: 运行在端口 3000

### 待解决
- ⚠️ **数据库连接**: 需要正确的 Supabase 凭据
- ⚠️ **数据库表**: 需要手动创建或修复连接后自动创建

---

## 🚀 测试步骤

### 第 1 步：测试登录页面 UI

**访问地址:**
```
http://localhost:3000/zh-CN/sign-in
```

**检查清单:**
- [ ] 页面正常加载，无白屏或错误
- [ ] Logo 显示正常
- [ ] "欢迎回来" 标题显示
- [ ] 邮箱输入框显示
- [ ] 密码输入框显示
- [ ] "登录" 按钮显示
- [ ] 分隔线和 "或使用以下方式登录" 显示
- [ ] Google 登录按钮显示（带图标）
- [ ] GitHub 登录按钮显示（带图标）
- [ ] 底部 "还没有账户？注册" 链接显示

**测试表单验证:**
1. 点击 "登录" 按钮（不填写表单）
   - ✅ 应显示必填字段错误
2. 输入无效邮箱（例如 "test"）
   - ✅ 应显示邮箱格式错误
3. 输入有效邮箱但不输入密码
   - ✅ 应提示密码必填

**测试导航:**
- 点击 "还没有账户？注册" 链接
  - ✅ 应跳转到注册页面

---

### 第 2 步：测试注册页面 UI

**访问地址:**
```
http://localhost:3000/zh-CN/sign-up
```

**检查清单:**
- [ ] 页面正常加载
- [ ] Logo 显示正常
- [ ] "创建账户" 标题显示
- [ ] 姓名输入框显示
- [ ] 邮箱输入框显示
- [ ] 密码输入框显示（占位符：至少 8 个字符）
- [ ] 确认密码输入框显示
- [ ] "注册" 按钮显示
- [ ] Google 和 GitHub 登录按钮显示
- [ ] 底部 "已有账户？登录" 链接显示

**测试表单验证:**
1. 不填写任何字段，点击注册
   - ✅ 应显示所有必填字段错误
2. 输入密码少于 8 个字符
   - ✅ 应提示密码太短
3. 两次密码输入不一致
   - ✅ 应显示 "密码不匹配" 错误消息
4. 输入所有字段但密码不匹配
   - ✅ 应阻止提交并显示错误

**测试导航:**
- 点击 "已有账户？登录" 链接
  - ✅ 应跳转回登录页面

---

### 第 3 步：测试 API 路由

**在浏览器控制台运行:**

```javascript
// 测试 API 是否响应
fetch('/api/auth/get-session')
  .then(r => r.json())
  .then(d => {
    console.log('API Response:', d);
    if (d.session === null) {
      console.log('✅ API 工作正常（未登录状态）');
    }
  })
  .catch(e => {
    console.error('❌ API 错误:', e);
  });
```

**预期结果:**
```json
{
  "session": null,
  "user": null
}
```

如果看到这个响应，说明 API 路由工作正常！

---

### 第 4 步：解决数据库问题（必需）

要完成实际的登录/注册，需要先解决数据库连接问题。

#### 选项 A：在 Supabase 控制台手动创建表

1. **访问 Supabase Dashboard**
   ```
   https://supabase.com/dashboard/project/sibwcdadrsbfkblinezj
   ```

2. **进入 SQL Editor**
   Dashboard > SQL Editor > New Query

3. **复制并执行以下 SQL**

```sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  "emailVerified" BOOLEAN DEFAULT false,
  image TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "customerId" TEXT,
  role TEXT DEFAULT 'user',
  banned BOOLEAN DEFAULT false,
  "banReason" TEXT,
  "banExpires" TIMESTAMP
);

-- 创建账户表
CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建会话表
CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建验证令牌表
CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_session_token ON session(token);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session("userId");
CREATE INDEX IF NOT EXISTS idx_account_userId ON account("userId");
CREATE INDEX IF NOT EXISTS idx_verification_token ON verification(token);
```

4. **点击 Run 执行**

5. **验证表创建**
   - 进入 Table Editor
   - 应该看到 4 个新表：user, account, session, verification

#### 选项 B：修复数据库连接并使用 Drizzle

1. **获取正确的数据库密码**
   - 访问 Supabase Dashboard
   - Settings > Database > Database Password
   - 如果忘记密码，点击 "Reset Database Password"

2. **更新 .env 文件**
   ```env
   DATABASE_URL=postgresql://postgres:[正确的密码]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
   ```
   
   ⚠️ 特殊字符需要 URL 编码：
   - `@` → `%40`

3. **运行数据库推送**
   ```powershell
   npm run db:push
   ```

---

### 第 5 步：测试完整注册流程

**前提：数据库表已创建**

1. **访问注册页面**
   ```
   http://localhost:3000/zh-CN/sign-up
   ```

2. **填写表单**
   - 姓名: `测试用户`
   - 邮箱: `test@example.com`
   - 密码: `test12345678`
   - 确认密码: `test12345678`

3. **点击注册按钮**

4. **预期结果**
   - ✅ 显示 "注册成功！" 消息
   - ✅ 自动跳转到首页
   - ✅ 用户已登录状态

5. **验证用户已创建**
   - 在 Supabase Dashboard > Table Editor > user
   - 应该看到新创建的用户记录

---

### 第 6 步：测试登录流程

1. **访问登录页面**
   ```
   http://localhost:3000/zh-CN/sign-in
   ```

2. **使用刚注册的账号登录**
   - 邮箱: `test@example.com`
   - 密码: `test12345678`

3. **点击登录按钮**

4. **预期结果**
   - ✅ 显示 "登录成功！" 消息
   - ✅ 跳转到首页
   - ✅ 显示用户已登录

---

### 第 7 步：测试会话持久性

1. **刷新页面**
   - ✅ 用户应保持登录状态

2. **检查会话 Cookie**
   - 打开浏览器开发者工具
   - Application > Cookies
   - 应该看到认证相关的 cookie

3. **测试 API 会话**
   在控制台运行：
   ```javascript
   fetch('/api/auth/get-session')
     .then(r => r.json())
     .then(d => console.log(d));
   ```
   
   应该返回用户信息：
   ```json
   {
     "session": { "userId": "...", "expiresAt": "..." },
     "user": { "id": "...", "email": "test@example.com", "name": "测试用户" }
   }
   ```

---

## 🐛 常见问题排查

### 问题 1: 注册后提示 "注册失败"

**可能原因:**
- 数据库表未创建
- 数据库连接失败
- 邮箱已存在

**解决方法:**
1. 检查浏览器控制台的错误信息
2. 检查 Supabase Dashboard 中的表是否存在
3. 尝试使用不同的邮箱

---

### 问题 2: OAuth 登录失败

**原因:**
- Google/GitHub OAuth 凭据未配置

**解决方法:**
1. 在 `.env.local` 添加：
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

2. 配置 OAuth 回调 URL：
   - Google: `http://localhost:3000/api/auth/callback/google`
   - GitHub: `http://localhost:3000/api/auth/callback/github`

---

### 问题 3: API 返回 404

**解决方法:**
- 确认文件存在：`app/api/auth/[...all]/route.ts`
- 重启开发服务器

---

## 📊 测试检查表

### UI 测试
- [ ] 登录页面渲染正常
- [ ] 注册页面渲染正常
- [ ] 表单验证工作正常
- [ ] 页面跳转正常
- [ ] 按钮交互正常

### API 测试
- [ ] `/api/auth/get-session` 返回 200
- [ ] 未登录状态返回 `{ session: null }`

### 数据库测试
- [ ] 表已在 Supabase 中创建
- [ ] 可以连接到数据库

### 功能测试
- [ ] 用户注册成功
- [ ] 用户登录成功
- [ ] 会话持久化正常
- [ ] 登出功能正常（待实现）

---

## 🎯 下一步行动

### 现在就做：

1. **测试 UI** ✅
   - 访问 http://localhost:3000/zh-CN/sign-in
   - 访问 http://localhost:3000/zh-CN/sign-up
   - 检查页面显示是否正常

2. **创建数据库表** ⚠️
   - 访问 Supabase Dashboard
   - 使用 SQL Editor 执行表创建脚本

3. **测试注册登录** 🚀
   - 注册新用户
   - 登录测试
   - 验证会话

### 稍后优化：

- [ ] 添加登出功能
- [ ] 添加用户资料页面
- [ ] 配置邮箱验证
- [ ] 配置密码重置
- [ ] 添加 OAuth 登录
- [ ] 添加双因素认证

---

## 📝 总结

### 已修复的问题
✅ API 路由 404 错误
✅ 登录注册页面缺失
✅ UI 组件和表单
✅ Better Auth 集成

### 当前状态
🟢 **UI 完全可用** - 可以测试界面和表单验证
🟡 **功能部分可用** - 需要创建数据库表后才能完整测试

### 推荐操作顺序
1. 先测试 UI（现在就可以）
2. 然后手动创建数据库表
3. 最后测试完整的注册登录流程

---

**准备好了吗？现在就访问登录页面吧！** 🎉

```
http://localhost:3000/zh-CN/sign-in
```
