// 扩展 Window 接口以包含分析工具
declare global {
  interface Window {
    __qiflow_events?: Array<{
      name: string;
      properties: Record<string, unknown>;
      ts: number;
    }>;
    openpanel?: {
      track: (name: string, properties?: Record<string, unknown>) => void;
    };
    gtag?: (...args: any[]) => void;
    umami?: (name: string) => void;
    plausible?: (
      name: string,
      options?: { props: Record<string, unknown> }
    ) => void;
  }
}

export type QiflowEvent =
  | 'form_start'
  | 'form_submit'
  | 'form_error'
  | 'form_success'
  | 'bazi_calculate'
  | 'xuankong_analyze';

/**
 * 统一的埋点上报封装，优先使用 OpenPanel（若已配置），否则降级到 GA / 控制台。
 * 仅在客户端生效，保证服务端安全。
 */
export function trackEvent(
  name: QiflowEvent | string,
  properties?: Record<string, unknown>
) {
  if (typeof window === 'undefined') return;

  // 为测试与可视化调试记录事件队列（不含敏感信息）
  try {
    window.__qiflow_events = window.__qiflow_events || [];
    window.__qiflow_events.push({
      name,
      properties: properties ?? {},
      ts: Date.now(),
    });
  } catch {}

  try {
    // OpenPanel
    if (window?.openpanel?.track) {
      window.openpanel.track(name, properties);
      return;
    }

    // Google Analytics gtag
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, properties ?? {});
      return;
    }

    // Umami
    if (typeof window.umami === 'function') {
      window.umami(name);
      return;
    }

    // Plausible
    if (typeof window.plausible === 'function') {
      window.plausible(name, { props: properties ?? {} });
      return;
    }
  } catch (e) {
    // ignore errors and fall through to console
  }

  // 最终降级：开发环境或未配置分析时输出到控制台
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', name, properties ?? {});
  }
}
