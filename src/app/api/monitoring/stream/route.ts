/**
 * 实时监控数据流 (Server-Sent Events)
 * GET - 建立 SSE 连接，推送实时监控数据
 */

import { verifyAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // 验证权限
  const { authenticated } = await verifyAuth(request as unknown as Request);
  if (!authenticated) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 设置 SSE 响应头
  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });

  // 创建可读流
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // 发送初始连接消息
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`
        )
      );

      // 定期发送监控数据
      const interval = setInterval(() => {
        try {
          // 生成模拟监控数据
          const monitoringData = {
            type: 'metrics',
            timestamp: new Date().toISOString(),
            data: {
              cpu: Math.floor(40 + Math.random() * 20),
              memory: Math.floor(60 + Math.random() * 15),
              responseTime: Math.floor(400 + Math.random() * 200),
              activeConnections: Math.floor(10 + Math.random() * 10),
              requests: Math.floor(50 + Math.random() * 30),
              errors: Math.floor(Math.random() * 5),
            },
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(monitoringData)}\n\n`)
          );
        } catch (error) {
          console.error('Error sending SSE data:', error);
        }
      }, 5000); // 每5秒发送一次

      // 清理函数
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, { headers: responseHeaders });
}
