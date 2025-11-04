# Sentry 配置指南

## 当前状态
Sentry依赖已安装（@sentry/nextjs），但配置文件缺失。

## 部署前需要完成的配置

### 1. 创建 Sentry 配置文件

#### sentry.client.config.ts
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // 调整此值以控制发送到Sentry的事件百分比
  tracesSampleRate: 1.0,
  
  // 设置为 false 以在生产环境禁用
  debug: false,
  
  // 仅在生产环境启用
  enabled: process.env.NODE_ENV === 'production',
  
  // 环境标识
  environment: process.env.NODE_ENV,
});
```

#### sentry.server.config.ts
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  tracesSampleRate: 1.0,
  debug: false,
  enabled: process.env.NODE_ENV === 'production',
  environment: process.env.NODE_ENV,
});
```

### 2. 更新 next.config.ts

在 next.config.ts 中添加 Sentry 配置：

```typescript
const { withSentryConfig } = require('@sentry/nextjs');

// ... 现有配置

module.exports = withSentryConfig(
  nextConfig,
  {
    // Sentry webpack 插件选项
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    // Sentry SDK 选项
    widenClientFileUpload: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

### 3. 环境变量

确保 .env.production 中配置：

```bash
NEXT_PUBLIC_SENTRY_DSN=https://xxx@o0000.ingest.sentry.io/0000
NEXT_PUBLIC_SENTRY_ENABLED=true
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=your-auth-token
```

### 4. 验证配置

部署后，触发一个测试错误验证Sentry是否正常工作：

```typescript
// 在任何页面添加测试按钮
<button onClick={() => {
  throw new Error('Sentry Test Error');
}}>
  Test Sentry
</button>
```

## 可选：性能监控

启用性能监控可以追踪页面加载时间和API响应时间：

```typescript
Sentry.init({
  // ... 其他配置
  tracesSampleRate: 0.1, // 捕获10%的事务用于性能监控
  profilesSampleRate: 0.1, // 性能分析采样率
});
```

## 注意事项

1. **成本考虑**: Sentry根据事件数量计费，生产环境建议调低采样率
2. **隐私**: 确保不发送敏感用户数据到Sentry
3. **Source Maps**: 生产环境上传source maps以便于调试，但注意安全性
