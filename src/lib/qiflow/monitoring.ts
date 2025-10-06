export interface Metric {
  name: string;
  value: number;
  delta: number;
  id: string;
  label?: string;
}

class SimpleMonitor {
  private queue: Metric[] = [];
  private isBuffering = true;

  constructor() {
    // 页面可见后开始上报
    if (typeof document !== 'undefined') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.flush(), 1000);
      });
    }
  }

  track(metric: Metric) {
    this.queue.push(metric);
    console.log('[Perf]', metric.name, metric.value.toFixed(2), 'ms', metric.label);

    if (!this.isBuffering) {
      this.send([metric]);
    }
  }

  flush() {
    this.isBuffering = false;
    if (this.queue.length) {
      this.send(this.queue);
      this.queue = [];
    }
  }

  private send(metrics: Metric[]) {
    // 可接入Google Analytics、Vercel Analytics或自有后端
    if (typeof window !== 'undefined' && (window as any).gtag) {
      metrics.forEach((m) => {
        (window as any).gtag('event', 'timing_complete', {
          name: m.name,
          value: Math.round(m.value),
          event_label: m.label,
        });
      });
    }
  }
}

export const monitor = typeof window !== 'undefined' ? new SimpleMonitor() : null;

export function trackWebVital(metric: { name: string; value: number; delta: number; id: string }) {
  monitor?.track(metric);
}

export function trackCustom(name: string, value: number, label?: string) {
  monitor?.track({ name, value, delta: value, id: `custom-${Date.now()}`, label });
}