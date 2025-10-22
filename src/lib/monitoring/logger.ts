/**
 * 结构化日志系统
 * 支持多级别日志、上下文信息、性能追踪
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  requestId?: string;
  sessionId?: string;
  action?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  duration?: number;
}

class Logger {
  private context: LogContext = {};
  private startTime?: number;

  /**
   * 设置全局上下文
   */
  setContext(context: LogContext) {
    this.context = { ...this.context, ...context };
  }

  /**
   * 清除上下文
   */
  clearContext() {
    this.context = {};
  }

  /**
   * 创建日志条目
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    additionalContext?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        ...this.context,
        ...additionalContext,
        environment: process.env.NODE_ENV,
      },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (this.startTime) {
      entry.duration = Date.now() - this.startTime;
      this.startTime = undefined;
    }

    return entry;
  }

  /**
   * 输出日志
   */
  private output(entry: LogEntry) {
    const logLevel = process.env.LOG_LEVEL || 'info';
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
    const currentLevelIndex = levels.indexOf(logLevel as LogLevel);
    const entryLevelIndex = levels.indexOf(entry.level);

    // 只输出当前级别及以上的日志
    if (entryLevelIndex < currentLevelIndex) {
      return;
    }

    // 格式化输出
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase().padEnd(5);
    const message = entry.message;

    // 控制台输出（开发环境）
    if (process.env.NODE_ENV === 'development') {
      const color = this.getColor(entry.level);
      console.log(`${color}[${timestamp}] ${level} ${message}\x1b[0m`);

      if (entry.context && Object.keys(entry.context).length > 0) {
        console.log('  Context:', entry.context);
      }

      if (entry.error) {
        console.log('  Error:', entry.error);
      }

      if (entry.duration !== undefined) {
        console.log(`  Duration: ${entry.duration}ms`);
      }
    } else {
      // 生产环境：输出 JSON 格式（便于日志收集系统解析）
      console.log(JSON.stringify(entry));
    }

    // TODO: 发送到日志收集服务（如 CloudWatch、Datadog、Logtail 等）
    this.sendToLogService(entry);
  }

  /**
   * 获取颜色代码
   */
  private getColor(level: LogLevel): string {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m', // Green
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      fatal: '\x1b[35m', // Magenta
    };
    return colors[level];
  }

  /**
   * 发送到日志收集服务
   */
  private async sendToLogService(entry: LogEntry) {
    if (process.env.LOG_SERVICE_ENABLED !== 'true') {
      return;
    }

    try {
      // TODO: 实现具体的日志服务集成
      // 例如：Logtail, CloudWatch, Datadog, etc.

      // 示例：发送到自定义日志端点
      if (process.env.LOG_SERVICE_ENDPOINT) {
        await fetch(process.env.LOG_SERVICE_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.LOG_SERVICE_TOKEN}`,
          },
          body: JSON.stringify(entry),
        }).catch(() => {
          // 静默失败，避免日志系统影响主应用
        });
      }
    } catch (error) {
      // 静默失败
    }
  }

  /**
   * Debug 级别日志
   */
  debug(message: string, context?: LogContext) {
    const entry = this.createLogEntry('debug', message, context);
    this.output(entry);
  }

  /**
   * Info 级别日志
   */
  info(message: string, context?: LogContext) {
    const entry = this.createLogEntry('info', message, context);
    this.output(entry);
  }

  /**
   * Warn 级别日志
   */
  warn(message: string, context?: LogContext) {
    const entry = this.createLogEntry('warn', message, context);
    this.output(entry);
  }

  /**
   * Error 级别日志
   */
  error(message: string, error?: Error, context?: LogContext) {
    const entry = this.createLogEntry('error', message, context, error);
    this.output(entry);
  }

  /**
   * Fatal 级别日志
   */
  fatal(message: string, error?: Error, context?: LogContext) {
    const entry = this.createLogEntry('fatal', message, context, error);
    this.output(entry);
  }

  /**
   * 开始性能追踪
   */
  startTimer() {
    this.startTime = Date.now();
  }

  /**
   * 结束性能追踪并记录
   */
  endTimer(message: string, context?: LogContext) {
    const entry = this.createLogEntry('info', message, context);
    this.output(entry);
  }

  /**
   * 创建子 Logger（带独立上下文）
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }
}

// 导出单例实例
export const logger = new Logger();

// 导出类型
export type { LogLevel, LogContext, LogEntry };
