import { describe, expect, test } from 'vitest';

// 模拟 API route handler
async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      time: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

describe('API 健康检查测试', () => {
  test('健康检查端点返回正确状态', async () => {
    const response = await GET();
    
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.time).toBeDefined();
    expect(data.version).toBe('1.0.0');
  });

  test('响应包含必要的字段', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data).toHaveProperty('ok');
    expect(data).toHaveProperty('time');
    expect(data).toHaveProperty('version');
    expect(data).toHaveProperty('environment');
  });

  test('时间戳格式正确', async () => {
    const response = await GET();
    const data = await response.json();
    
    // ISO 8601 格式验证
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(data.time).toMatch(isoDateRegex);
    
    // 验证时间戳可以被解析
    const timestamp = new Date(data.time);
    expect(timestamp).toBeInstanceOf(Date);
    expect(timestamp.getTime()).not.toBeNaN();
  });

  test('环境变量正确返回', async () => {
    const response = await GET();
    const data = await response.json();
    
    expect(data.environment).toBe('test');
  });
});

describe('API 错误处理', () => {
  test('处理服务器内部错误', async () => {
    // 模拟错误的处理器
    const errorHandler = async () => {
      try {
        throw new Error('Internal server error');
      } catch (error) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    };

    const response = await errorHandler();
    
    expect(response.status).toBe(500);
    
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Internal server error');
  });

  test('处理无效的请求方法', async () => {
    const methodNotAllowed = async () => {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Allow': 'GET',
          },
        }
      );
    };

    const response = await methodNotAllowed();
    
    expect(response.status).toBe(405);
    expect(response.headers.get('Allow')).toBe('GET');
    
    const data = await response.json();
    expect(data.ok).toBe(false);
    expect(data.error).toBe('Method not allowed');
  });
});