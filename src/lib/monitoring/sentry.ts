/**
 * Sentry 错误监控配置
 * 用于捕获和追踪应用错误
 */

import * as Sentry from '@sentry/nextjs';

/**
 * 初始化 Sentry 客户端监控
 */
export function initSentry() {
  if (
    !process.env.NEXT_PUBLIC_SENTRY_DSN ||
    process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true'
  ) {
    console.log('Sentry monitoring is disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // 环境配置
    environment: process.env.NODE_ENV || 'development',

    // 采样率配置
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // 错误采样率
    sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1.0,

    // 集成配置
    integrations: [
      new (Sentry as any).BrowserTracing({
        tracePropagationTargets: [
          'localhost',
          /^\//,
          process.env.NEXT_PUBLIC_APP_URL || '',
        ],
      }),
      new (Sentry as any).Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Session Replay 采样率
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // 忽略的错误
    ignoreErrors: [
      // 浏览器扩展错误
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      // 网络错误
      'Network request failed',
      'Failed to fetch',
      // 用户取消操作
      'AbortError',
      'User cancelled',
    ],

    // 过滤敏感信息
    beforeSend(event: any, hint: any) {
      // 移除敏感数据
      if (event.request?.cookies) {
        event.request.cookies = undefined;
      }

      if (event.request?.headers) {
        event.request.headers.Authorization = undefined;
        event.request.headers.Cookie = undefined;
      }

      // 开发环境下在控制台输出
      if (process.env.NODE_ENV === 'development') {
        console.error(
          '[Sentry]',
          hint.originalException || hint.syntheticException
        );
      }

      return event;
    },
  });
}

/**
 * 捕获异常
 */
export function captureException(
  error: Error | unknown,
  context?: Record<string, unknown>
) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true') {
    console.error('[Error]', error, context);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * 捕获消息
 */
export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = 'info'
) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true') {
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.captureMessage(message, level);
}

/**
 * 设置用户上下文
 */
export function setUser(
  user: { id: string; email?: string; username?: string } | null
) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true') {
    return;
  }

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * 设置标签
 */
export function setTag(key: string, value: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true') {
    return;
  }

  Sentry.setTag(key, value);
}

/**
 * 设置上下文
 */
export function setContext(name: string, context: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true') {
    return;
  }

  Sentry.setContext(name, context);
}

/**
 * 添加面包屑
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  level?: Sentry.SeverityLevel;
  category?: string;
  data?: Record<string, unknown>;
}) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true') {
    return;
  }

  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * 手动开始事务
 */
export function startTransaction(name: string, op: string) {
  if (process.env.NEXT_PUBLIC_SENTRY_ENABLED !== 'true') {
    // 返回一个模拟对象
    return {
      finish: () => {},
      setStatus: () => {},
      setData: () => {},
    };
  }

  return (Sentry as any).startTransaction({ name, op });
}

/**
 * 包装异步函数以自动捕获错误
 */
export function wrapAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error, {
        function: name || fn.name,
        arguments: args,
      });
      throw error;
    }
  }) as T;
}
