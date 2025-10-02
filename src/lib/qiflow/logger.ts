/**
 * QiFlow 日志记录模块
 */

export class PerformanceTimer {
  private startTime: number
  private traceId: string

  constructor() {
    this.startTime = Date.now()
    this.traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getTraceId(): string {
    return this.traceId
  }

  finish(action: string, metadata: Record<string, any> = {}): void {
    const duration = Date.now() - this.startTime
    console.log(`[QiFlow] ${action} completed in ${duration}ms`, {
      traceId: this.traceId,
      duration,
      ...metadata
    })
  }
}

export const qiflowLogger = {
  info: (message: string, metadata: Record<string, any> = {}) => {
    console.log(`[QiFlow] INFO: ${message}`, metadata)
  },
  warn: (message: string, metadata: Record<string, any> = {}) => {
    console.warn(`[QiFlow] WARN: ${message}`, metadata)
  },
  error: (message: string, metadata: Record<string, any> = {}) => {
    console.error(`[QiFlow] ERROR: ${message}`, metadata)
  }
}