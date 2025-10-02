# 认证系统

本模块实现了完整的用户认证系统，支持多种登录方式、MFA、设备指纹识别和安全的会话管理。

## 功能特性

- **多种登录方式**: 邮箱密码、第三方 OAuth (Google, Apple, 微信)
- **多因素认证 (MFA)**: TOTP 支持，增强账户安全性
- **设备指纹识别**: 基于浏览器和设备特征的异常检测
- **会话安全**: HttpOnly Cookie、自动刷新、安全配置
- **游客模式集成**: 无缝的游客到注册用户转换
- **速率限制**: 防止暴力破解和滥用

## 核心组件

### 1. AuthManager

主要的认证管理类，提供完整的认证功能。

```typescript
import { authManager } from '@/lib/auth/auth-manager';

// 邮箱注册
const { user, session } = await authManager.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  displayName: '用户名',
  preferredLocale: 'zh-CN',
  timezone: 'Asia/Shanghai',
});

// 邮箱登录
const { user, session } = await authManager.signIn({
  email: 'user@example.com',
  password: 'securepassword',
  rememberMe: true,
});

// 第三方登录
await authManager.signInWithOAuth('google');
await authManager.signInWithWeChat();

// 获取当前用户
const user = await authManager.getCurrentUser();

// 验证会话
const validation = await authManager.validateSession();
```

### 2. 设备指纹

自动生成设备指纹，用于异常检测和安全验证。

```typescript
const fingerprint = authManager.generateDeviceFingerprint();
// 返回: { userAgent, screenResolution, timezone, language, platform, fingerprint }
```

### 3. MFA 支持

完整的多因素认证实现。

```typescript
// 设置 MFA
const mfaSetup = await authManager.setupMFA();
// 返回: { isEnabled, backupCodes, totpSecret, qrCode }

// 验证 MFA
await authManager.verifyMFA('123456');
```

## API 端点

### 用户注册

**POST** `/api/auth/signup`

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "displayName": "用户名",
  "preferredLocale": "zh-CN",
  "timezone": "Asia/Shanghai"
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "用户名",
    "preferredLocale": "zh-CN",
    "timezone": "Asia/Shanghai"
  },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresAt": "2024-01-01T00:00:00Z"
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

### 用户登录

**POST** `/api/auth/signin`

```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "rememberMe": true
}
```

**响应**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "用户名",
    "role": "user"
  },
  "session": {
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresAt": "2024-01-01T00:00:00Z"
  }
}
```

### 第三方登录

**POST** `/api/auth/oauth`

```json
{
  "provider": "google",
  "redirectTo": "https://example.com/auth/callback"
}
```

**响应**:
```json
{
  "success": true,
  "message": "Redirecting to google authentication...",
  "provider": "google"
}
```

### 微信登录回调

**GET** `/api/auth/wechat/callback`

处理微信 OAuth 回调，自动创建或更新用户账户。

### MFA 设置

**POST** `/api/auth/mfa/setup`

**响应**:
```json
{
  "success": true,
  "mfa": {
    "isEnabled": true,
    "backupCodes": ["code1", "code2", ...],
    "totpSecret": "secret-key",
    "qrCode": "data:image/png;base64,..."
  },
  "message": "MFA setup initiated. Please scan the QR code with your authenticator app."
}
```

### MFA 验证

**POST** `/api/auth/mfa/verify`

```json
{
  "code": "123456"
}
```

**响应**:
```json
{
  "success": true,
  "message": "MFA verification successful"
}
```

## 安全特性

### 1. 会话安全

- **HttpOnly Cookie**: 防止 XSS 攻击
- **Secure Flag**: 生产环境强制 HTTPS
- **SameSite**: 防止 CSRF 攻击
- **自动刷新**: 延长有效会话时间

### 2. 设备指纹

基于多个浏览器和设备特征生成唯一指纹：

```typescript
const fingerprint = {
  userAgent: navigator.userAgent,
  screenResolution: `${screen.width}x${screen.height}`,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  language: navigator.language,
  platform: navigator.platform,
  fingerprint: "generated-hash"
};
```

### 3. 速率限制

防止暴力破解和滥用：

```typescript
const rateLimitConfig = {
  loginAttempts: 5,        // 最大尝试次数
  windowMs: 15 * 60 * 1000, // 时间窗口 (15分钟)
  blockDurationMs: 30 * 60 * 1000, // 封禁时长 (30分钟)
};
```

### 4. 数据加密

敏感数据使用 Supabase 加密功能：

```typescript
// 加密敏感数据
const encryptedData = await this.encryptData(sensitiveData);

// 存储到数据库
await supabase.from('users').update({
  birth_date_encrypted: encryptedData,
});
```

## 第三方集成

### Google OAuth

```typescript
// 配置 Google OAuth
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
};
```

### Apple OAuth

```typescript
// 配置 Apple OAuth
const appleConfig = {
  clientId: process.env.APPLE_CLIENT_ID,
  teamId: process.env.APPLE_TEAM_ID,
  keyId: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
};
```

### 微信 OAuth

```typescript
// 配置微信 OAuth
const wechatConfig = {
  appId: process.env.WECHAT_APP_ID,
  appSecret: process.env.WECHAT_APP_SECRET,
  redirectUri: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/wechat/callback`,
};
```

## 环境配置

### 必需环境变量

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# OAuth 提供商
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY=your-apple-private-key

WECHAT_APP_ID=your-wechat-app-id
WECHAT_APP_SECRET=your-wechat-app-secret

# 会话安全
GUEST_SESSION_SECRET=your-guest-session-secret
```

## 使用示例

### 前端集成

```typescript
// 登录表单
const handleLogin = async (credentials) => {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 登录成功，重定向到仪表板
      router.push('/dashboard');
    } else {
      // 显示错误信息
      setError(data.message);
    }
  } catch (error) {
    setError('登录失败，请重试');
  }
};

// 第三方登录
const handleOAuthLogin = async (provider) => {
  try {
    const response = await fetch('/api/auth/oauth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 重定向到第三方登录页面
      window.location.href = data.redirectUrl;
    }
  } catch (error) {
    setError('第三方登录失败');
  }
};
```

### 中间件集成

```typescript
// 保护需要认证的路由
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('supabase-auth-token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  // 验证令牌
  const validation = await authManager.validateSession();
  
  if (!validation.isValid) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
  
  return NextResponse.next();
}
```

## 最佳实践

### 1. 安全考虑

- 始终使用 HTTPS 在生产环境
- 定期轮换 API 密钥和密钥
- 监控异常登录活动
- 实施强密码策略

### 2. 用户体验

- 提供清晰的错误信息
- 支持记住我功能
- 实现自动登录状态检查
- 提供多种登录方式

### 3. 性能优化

- 使用会话缓存减少数据库查询
- 实施适当的速率限制
- 优化第三方 API 调用
- 使用 CDN 加速静态资源

### 4. 监控和日志

- 记录所有认证事件
- 监控失败登录尝试
- 跟踪用户活跃度
- 设置安全告警

## 故障排除

### 常见问题

1. **OAuth 回调失败**
   - 检查重定向 URI 配置
   - 验证客户端 ID 和密钥
   - 确认域名白名单设置

2. **MFA 验证失败**
   - 检查时间同步
   - 验证 TOTP 密钥
   - 确认备份代码有效性

3. **会话过期**
   - 检查 Cookie 配置
   - 验证令牌有效期
   - 确认自动刷新设置

### 调试工具

```typescript
// 启用详细日志
process.env.DEBUG_AUTH = 'true';

// 手动验证会话
const validation = await authManager.validateSession();
console.log('会话验证结果:', validation);

// 检查设备指纹
const fingerprint = authManager.generateDeviceFingerprint();
console.log('设备指纹:', fingerprint);
```