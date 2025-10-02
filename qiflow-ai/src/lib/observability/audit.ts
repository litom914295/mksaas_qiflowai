// 审计和监控功能
class AuditManager {
  private metrics = new Map<string, number>();

  recordMetric(name: string, value: number = 1) {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + value);
  }

  getMetric(name: string): number {
    return this.metrics.get(name) || 0;
  }

  resetMetrics() {
    this.metrics.clear();
  }

  reset() {
    this.resetMetrics();
  }
}

export const audit = new AuditManager();