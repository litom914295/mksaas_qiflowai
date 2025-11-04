# 登录错误处理改进文档

## 问题描述

用户在登录时遇到空错误对象 `{}`，导致无法显示有意义的错误信息。错误发生在：
- `src/components/auth/login-form.tsx:152`
- `src/lib/auth-client.ts:74`

## 根本原因

1. **网络请求失败**：当后端服务器未响应或网络连接中断时，`fetch` 请求会抛出异常
2. **响应解析失败**：有时服务器返回非 JSON 格式的响应，导致 `response.json()` 失败
3. **错误对象缺失字段**：catch 块中捕获的错误对象可能为空或缺少 `status` 和 `message` 字段

## 解决方案

### 1. 改进 auth-client.ts 错误处理

```typescript
// 添加 JSON 解析错误处理
let data;
try {
  data = await response.json();
} catch (jsonError) {
  // 如果响应不是 JSON，使用默认错误消息
  data = { error: 'Invalid server response' };
}

// 改进 catch 块错误处理
catch (error) {
  console.error('Auth client network error:', error);
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Network error or server is not responding';
  options?.onError?.({\n    error: {\n      status: 0,  // 使用 0 表示网络错误
      message: errorMessage,
    },
  });
  return { error: errorMessage };
}
```

### 2. 改进 login-form.tsx 错误显示

```typescript
onError: (ctx) => {
  console.error('login, error:', ctx.error);
  // 处理空错误对象或缺少错误信息的情况
  const errorStatus = ctx.error?.status || 'Unknown';
  const errorMessage = ctx.error?.message || t('loginErrorGeneric');
  setError(`${errorStatus}: ${errorMessage}`);
  // Reset captcha on login error
  if (captchaConfigured) {
    resetCaptcha();
  }
},
```

### 3. 添加翻译文本

在 `messages/zh-CN.json` 中添加：

```json
{
  "AuthPage": {
    "login": {
      "loginErrorGeneric": "登录失败，请检查您的网络连接或稍后重试"
    }
  }
}
```

## 改进效果

### 之前
- 显示空错误对象：`{}`
- 用户不知道发生了什么问题
- 无法判断是网络问题还是认证问题

### 之后
- 显示具体错误状态和消息：`0: Network error or server is not responding`
- 或：`Unknown: 登录失败，请检查您的网络连接或稍后重试`
- 用户能够理解错误原因
- 提供了明确的操作建议

## 错误状态码说明

| 状态码 | 含义 | 常见原因 |
|--------|------|----------|
| 0 | 网络错误 | 服务器未响应、网络中断、CORS 错误 |
| 400 | 请求错误 | 邮箱或密码格式错误 |
| 401 | 未授权 | 邮箱或密码不正确 |
| 403 | 禁止访问 | 账号被封禁或限制 |
| 404 | 未找到 | API 端点不存在 |
| 500 | 服务器错误 | 后端服务出现异常 |
| Unknown | 未知错误 | 其他未预期的错误 |

## 测试建议

1. **正常登录测试**：使用正确的凭据登录，确保功能正常
2. **错误凭据测试**：使用错误的邮箱或密码，检查错误提示是否清晰
3. **网络中断测试**：
   - 断开网络连接后尝试登录
   - 应显示："0: Network error or server is not responding"
4. **服务器未启动测试**：
   - 关闭后端服务器
   - 尝试登录，应显示友好的错误提示
5. **无效响应测试**：
   - 模拟服务器返回非 JSON 响应
   - 应显示："Invalid server response"

## 相关文件

- `src/components/auth/login-form.tsx` - 登录表单组件
- `src/lib/auth-client.ts` - 认证客户端
- `messages/zh-CN.json` - 中文翻译文件

## 后续优化建议

1. **添加重试机制**：网络错误时自动重试 2-3 次
2. **用户友好提示**：根据不同错误类型显示不同的图标和建议
3. **日志记录**：将错误详情发送到日志服务，便于调试
4. **错误监控**：集成 Sentry 等错误监控工具
5. **超时处理**：为请求添加超时设置，避免长时间等待

## 更新日期

2025-01-14
