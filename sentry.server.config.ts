/**
 * Sentry Server Configuration
 * https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENABLED =
  process.env.NEXT_PUBLIC_SENTRY_ENABLED === 'true' &&
  process.env.NODE_ENV === 'production';

Sentry.init({
  // DSN (Data Source Name) - 从Sentry项目获取
  dsn: SENTRY_DSN,

  // 调整此值以控制发送到Sentry的性能事件百分比
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 设置采样率以进行性能分析
  profilesSampleRate: 0.1,

  // 调试模式 - 生产环境应设为false
  debug: false,

  // 仅在生产环境启用
  enabled: SENTRY_ENABLED,

  // 环境标识
  environment: process.env.NODE_ENV,

  // 发布版本
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // 在发送前处理事件
  beforeSend(event, hint) {
    // 过滤敏感数据
    if (event.request) {
      // 不发送请求体中的敏感信息
      delete event.request.data;
      delete event.request.cookies;
    }

    // 过滤掉开发环境错误
    if (process.env.NODE_ENV === 'development') {
      return null;
    }

    return event;
  },

  // 忽略特定错误
  ignoreErrors: [
    // 数据库连接超时（通常是暂时性问题）
    'ETIMEDOUT',
    'ECONNRESET',
    // Prisma相关
    'PrismaClientKnownRequestError',
  ],

  // 集成配置
  integrations: [
    // HTTP追踪
    Sentry.httpIntegration(),
    // PostgreSQL追踪 (如果使用)
    Sentry.prismaIntegration(),
  ],
});
