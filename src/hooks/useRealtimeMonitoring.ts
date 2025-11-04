/**
 * 实时监控数据 Hook
 * 使用 Server-Sent Events 接收实时监控数据
 */

import { useCallback, useEffect, useState } from 'react';

export interface MonitoringMetrics {
  cpu: number;
  memory: number;
  responseTime: number;
  activeConnections: number;
  requests: number;
  errors: number;
}

export interface RealtimeData {
  type: string;
  timestamp: string;
  data?: MonitoringMetrics;
}

export function useRealtimeMonitoring(enabled = true) {
  const [data, setData] = useState<MonitoringMetrics | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let eventSource: EventSource | null = null;

    try {
      // 建立 SSE 连接
      eventSource = new EventSource('/api/monitoring/stream');

      eventSource.onopen = () => {
        setConnected(true);
        setError(null);
        console.log('Realtime monitoring connected');
      };

      eventSource.onmessage = (event) => {
        try {
          const parsed: RealtimeData = JSON.parse(event.data);

          if (parsed.type === 'metrics' && parsed.data) {
            setData(parsed.data);
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      };

      eventSource.onerror = (err) => {
        console.error('SSE connection error:', err);
        setConnected(false);
        setError('Connection lost. Reconnecting...');

        // EventSource 会自动重连
      };
    } catch (err) {
      console.error('Error creating EventSource:', err);
      setError('Failed to establish connection');
    }

    // 清理函数
    return () => {
      if (eventSource) {
        eventSource.close();
        setConnected(false);
      }
    };
  }, [enabled]);

  return { data, connected, error };
}
