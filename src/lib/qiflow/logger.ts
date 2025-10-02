/**
 * QiFlow 结构化日志工具
 * 提供统一的日志格式和traceId追踪
 */

import { randomUUID } from 'crypto'

export interface LogContext {
	traceId?: string
	userId?: string
	action?: string
	cost?: number
	coins?: number
	latency?: number
	status?: 'success' | 'error' | 'warning'
	error?: string
	metadata?: Record<string, unknown>
}

/**
 * 生成traceId
 */
export function generateTraceId(): string {
	return `qiflow_${Date.now()}_${randomUUID().slice(0, 8)}`
}

/**
 * 格式化日志输出
 */
function formatLog(level: string, message: string, context?: LogContext): string {
	const timestamp = new Date().toISOString()
	const logData = {
		timestamp,
		level,
		message,
		...context,
	}
	return JSON.stringify(logData)
}

/**
 * 日志记录器
 */
export const qiflowLogger = {
	/**
	 * 信息日志
	 */
	info(message: string, context?: LogContext) {
		console.log(formatLog('INFO', message, context))
	},

	/**
	 * 警告日志
	 */
	warn(message: string, context?: LogContext) {
		console.warn(formatLog('WARN', message, context))
	},

	/**
	 * 错误日志
	 */
	error(message: string, context?: LogContext) {
		console.error(formatLog('ERROR', message, { ...context, status: 'error' }))
	},

	/**
	 * 调试日志（仅在开发环境输出）
	 */
	debug(message: string, context?: LogContext) {
		if (process.env.NODE_ENV === 'development') {
			console.debug(formatLog('DEBUG', message, context))
		}
	},

	/**
	 * 性能追踪日志
	 */
	trace(message: string, context?: LogContext) {
		console.log(formatLog('TRACE', message, { ...context, status: 'success' }))
	},
}

/**
 * 创建带有traceId的日志上下文
 */
export function createLogContext(overrides?: Partial<LogContext>): LogContext {
	return {
		traceId: generateTraceId(),
		...overrides,
	}
}

/**
 * 性能计时器
 */
export class PerformanceTimer {
	private startTime: number
	private traceId: string

	constructor(traceId?: string) {
		this.startTime = Date.now()
		this.traceId = traceId || generateTraceId()
	}

	/**
	 * 获取耗时（毫秒）
	 */
	getElapsed(): number {
		return Date.now() - this.startTime
	}

	/**
	 * 完成计时并记录日志
	 */
	finish(action: string, context?: Omit<LogContext, 'traceId' | 'latency'>) {
		const latency = this.getElapsed()
		qiflowLogger.trace(`${action} completed`, {
			traceId: this.traceId,
			action,
			latency,
			...context,
		})
		return { traceId: this.traceId, latency }
	}

	/**
	 * 获取traceId
	 */
	getTraceId(): string {
		return this.traceId
	}
}

/**
 * 包装异步函数，自动记录性能和错误
 */
export function withLogging<T extends (...args: any[]) => Promise<any>>(
	fn: T,
	actionName: string
): T {
	return (async (...args: Parameters<T>) => {
		const timer = new PerformanceTimer()
		const traceId = timer.getTraceId()

		try {
			qiflowLogger.debug(`${actionName} started`, { traceId, action: actionName })
			const result = await fn(...args)
			timer.finish(actionName, { status: 'success' })
			return result
		} catch (error) {
			const latency = timer.getElapsed()
			qiflowLogger.error(`${actionName} failed`, {
				traceId,
				action: actionName,
				latency,
				error: error instanceof Error ? error.message : String(error),
			})
			throw error
		}
	}) as T
}

