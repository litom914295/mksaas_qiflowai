/**
 * Sentry Client Configuration
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
  // 1.0 = 100%, 0.1 = 10%
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // 设置采样率以进行性能分析
  // 建议生产环境设置较低值以控制成本
  profilesSampleRate: 0.1,

  // 调试模式 - 生产环境应设为false
  debug: false,

  // 仅在生产环境启用
  enabled: SENTRY_ENABLED,

  // 环境标识
  environment: process.env.NODE_ENV,

  // 在本地开发时禁用
  beforeSend(event, hint) {
    // 过滤掉本地开发的错误
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },

  // 忽略特定错误
  ignoreErrors: [
    // 浏览器扩展错误
    'top.GLOBALS',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // 网络错误
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    // 随机插件/扩展
    'ChunkLoadError',
  ],

  // 发布版本（用于追踪哪个版本的代码出现问题）
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,

  // 集成配置
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Session Replay - 捕获用户操作以重现错误
      // 注意：会增加成本，建议仅采样错误会话
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Session Replay 采样率
  replaysSessionSampleRate: 0.01, // 1% 的正常会话
  replaysOnErrorSampleRate: 0.5, // 50% 的错误会话
});
