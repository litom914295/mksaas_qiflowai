// import pino from 'pino';

// Log level configuration
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

// Context information for enhanced logging
export interface LogContext {
  sessionId?: string;
  userId?: string;
  traceId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  route?: string;
  method?: string;
  duration?: number;
  statusCode?: number;
  errorCode?: string;
  provider?: string;
  model?: string;
  tokens?: number;
  cost?: number;
  confidence?: number;
  state?: string;
}

// Performance metrics for structured logging
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage?: number;
  cpuUsage?: number;
  apiCalls?: number;
  dbQueries?: number;
  cacheHits?: number;
  cacheMisses?: number;
}

// Error information for structured logging
export interface ErrorInfo {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
  statusCode?: number;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

// Production logger configuration
const createProductionLogger = () => {
  return {
    level: process.env.LOG_LEVEL || 'info',
    formatters: {
      level: (label: any) => ({ level: label }),
      log: (object: any) => ({
        ...object,
        timestamp: new Date().toISOString(),
        service: 'qiflow-ai',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      }),
    },
    serializers: {
      error: (error: Error) => ({
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error as any).metadata,
      }),
      request: (req: any) => ({
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers?.['user-agent'],
          'x-forwarded-for': req.headers?.['x-forwarded-for'],
          'accept-language': req.headers?.['accept-language'],
        },
        query: req.query,
        params: req.params,
      }),
      response: (res: any) => ({
        statusCode: res.statusCode,
        headers: {
          'content-type': res.headers?.['content-type'],
          'content-length': res.headers?.['content-length'],
        },
        responseTime: res.responseTime,
      }),
    },
    redact: {
      paths: [
        'request.headers.authorization',
        'request.headers.cookie',
        'apiKey',
        'password',
        'token',
        'secret',
        'auth',
        '*.password',
        '*.token',
        '*.secret',
        '*.apiKey',
      ],
      censor: '[REDACTED]',
    },
    trace: (obj: any, msg?: string) => console.trace(msg, obj),
    debug: (obj: any, msg?: string) => console.debug(msg, obj),
    info: (obj: any, msg?: string) => console.info(msg, obj),
    warn: (obj: any, msg?: string) => console.warn(msg, obj),
    error: (obj: any, msg?: string) => console.error(msg, obj),
    fatal: (obj: any, msg?: string) => console.error(msg, obj),
  };
};

// Development logger configuration (more readable)
const createDevelopmentLogger = () => {
  return {
    level: 'debug',
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: false,
        hideObject: false,
      },
    },
    serializers: {
      error: (error: Error) => ({
        name: error.name,
        message: error.message,
        stack: error.stack,
      }),
    },
    trace: (obj: any, msg?: string) => console.trace(msg, obj),
    debug: (obj: any, msg?: string) => console.debug(msg, obj),
    info: (obj: any, msg?: string) => console.info(msg, obj),
    warn: (obj: any, msg?: string) => console.warn(msg, obj),
    error: (obj: any, msg?: string) => console.error(msg, obj),
    fatal: (obj: any, msg?: string) => console.error(msg, obj),
  };
};

// Create logger instance based on environment
const createLogger = () => {
  if (process.env.NODE_ENV === 'production') {
    return createProductionLogger();
  }
  return createDevelopmentLogger();
};

// Global logger instance
const logger = createLogger();

// Enhanced logger class with context support
export class StructuredLogger {
  private baseLogger: any; // pino.Logger;
  private context: LogContext;

  constructor(baseContext: LogContext = {}) {
    this.baseLogger = logger;
    this.context = baseContext;
  }

  // Create child logger with additional context
  child(context: LogContext): StructuredLogger {
    return new StructuredLogger({
      ...this.context,
      ...context,
    });
  }

  // Generate trace ID for request tracking
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // Enhanced logging methods with context
  trace(message: string, context?: LogContext, data?: Record<string, unknown>) {
    this.baseLogger.trace(
      {
        ...this.context,
        ...context,
        ...data,
        traceId:
          context?.traceId || this.context.traceId || this.generateTraceId(),
      },
      message
    );
  }

  debug(message: string, context?: LogContext, data?: Record<string, unknown>) {
    this.baseLogger.debug(
      {
        ...this.context,
        ...context,
        ...data,
        traceId:
          context?.traceId || this.context.traceId || this.generateTraceId(),
      },
      message
    );
  }

  info(message: string, context?: LogContext, data?: Record<string, unknown>) {
    this.baseLogger.info(
      {
        ...this.context,
        ...context,
        ...data,
        traceId:
          context?.traceId || this.context.traceId || this.generateTraceId(),
      },
      message
    );
  }

  warn(message: string, context?: LogContext, data?: Record<string, unknown>) {
    this.baseLogger.warn(
      {
        ...this.context,
        ...context,
        ...data,
        traceId:
          context?.traceId || this.context.traceId || this.generateTraceId(),
      },
      message
    );
  }

  error(
    message: string,
    error?: Error | ErrorInfo,
    context?: LogContext,
    data?: Record<string, unknown>
  ) {
    const errorInfo =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(error as any).metadata,
          }
        : error;

    this.baseLogger.error(
      {
        ...this.context,
        ...context,
        ...data,
        error: errorInfo,
        traceId:
          context?.traceId || this.context.traceId || this.generateTraceId(),
      },
      message
    );
  }

  fatal(
    message: string,
    error?: Error | ErrorInfo,
    context?: LogContext,
    data?: Record<string, unknown>
  ) {
    const errorInfo =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            ...(error as any).metadata,
          }
        : error;

    this.baseLogger.fatal(
      {
        ...this.context,
        ...context,
        ...data,
        error: errorInfo,
        traceId:
          context?.traceId || this.context.traceId || this.generateTraceId(),
      },
      message
    );
  }

  // AI-specific logging methods
  aiRequest(
    message: string,
    context: {
      provider: string;
      model: string;
      tokens?: number;
      cost?: number;
      sessionId?: string;
      userId?: string;
    }
  ) {
    this.info(message, {
      ...context,
      // component: 'ai-provider',
      // event: 'ai_request',
    });
  }

  aiResponse(
    message: string,
    context: {
      provider: string;
      model: string;
      tokens?: number;
      cost?: number;
      confidence?: number;
      duration: number;
      sessionId?: string;
      userId?: string;
    }
  ) {
    this.info(message, {
      ...context,
      // component: 'ai-provider',
      // event: 'ai_response',
    });
  }

  // Performance logging
  performance(
    message: string,
    metrics: PerformanceMetrics,
    context?: LogContext
  ) {
    this.info(message, {
      ...context,
      // component: 'performance',
      // event: 'performance_metric',
      // metrics,
    });
  }

  // Database operation logging
  database(
    operation: string,
    context: {
      table?: string;
      query?: string;
      duration?: number;
      affectedRows?: number;
      sessionId?: string;
    }
  ) {
    this.debug(`Database ${operation}`, {
      ...context,
      // component: 'database',
      // event: 'db_operation',
      // operation,
    });
  }

  // HTTP request/response logging
  httpRequest(request: {
    method: string;
    url: string;
    userAgent?: string;
    ip?: string;
    sessionId?: string;
    userId?: string;
  }) {
    this.info('HTTP Request', {
      ...request,
      // component: 'http',
      // event: 'http_request',
    });
  }

  httpResponse(response: {
    statusCode: number;
    duration: number;
    contentLength?: number;
    route?: string;
    method?: string;
    sessionId?: string;
    userId?: string;
  }) {
    const level = response.statusCode >= 400 ? 'warn' : 'info';
    this[level]('HTTP Response', {
      ...response,
      // component: 'http',
      // event: 'http_response',
    });
  }

  // Cost monitoring logging
  cost(
    message: string,
    context: {
      provider: string;
      amount: number;
      currency: string;
      tokens?: number;
      model?: string;
      sessionId?: string;
      userId?: string;
    }
  ) {
    this.info(message, {
      ...context,
      // component: 'cost-monitoring',
      // event: 'cost_incurred',
    });
  }

  // State machine transition logging
  stateTransition(context: {
    sessionId: string;
    fromState: string;
    toState: string;
    trigger: string;
    userId?: string;
  }) {
    this.info('State transition', {
      ...context,
      // component: 'state-machine',
      // event: 'state_transition',
    });
  }
}

// Default logger instance
export const defaultLogger = new StructuredLogger();

// Convenience methods for common logging patterns
export const logAIRequest = (
  provider: string,
  model: string,
  sessionId?: string,
  context?: Partial<LogContext>
) => {
  defaultLogger.aiRequest(`AI request to ${provider}`, {
    provider,
    model,
    sessionId,
    ...context,
  });
};

export const logAIResponse = (
  provider: string,
  model: string,
  duration: number,
  sessionId?: string,
  context?: Partial<LogContext>
) => {
  defaultLogger.aiResponse(`AI response from ${provider}`, {
    provider,
    model,
    duration,
    sessionId,
    ...context,
  });
};

export const logError = (error: Error, context?: LogContext) => {
  defaultLogger.error('Application error', error, context);
};

export const logPerformance = (
  operation: string,
  duration: number,
  context?: LogContext
) => {
  defaultLogger.performance(
    `${operation} completed`,
    {
      responseTime: duration,
    },
    context
  );
};

// Create request-scoped logger with trace ID
export const createRequestLogger = (
  requestId: string,
  sessionId?: string,
  userId?: string
) => {
  return new StructuredLogger({
    requestId,
    sessionId,
    userId,
    traceId: `req_${requestId}_${Date.now()}`,
  });
};

// Export the main logger for backward compatibility
export { logger };
export default defaultLogger;
