/**
 * API辅助函数单元测试
 * 测试API响应格式化、错误处理和认证包装器
 */

import {
  type ApiResponse,
  errorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('API Helpers 测试', () => {
  describe('successResponse - 成功响应格式化', () => {
    it('应该创建基本的成功响应', async () => {
      const data = { id: 1, name: 'Test' };
      const response = successResponse(data);

      expect(response.status).toBe(200);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.message).toBeUndefined();
    });

    it('应该创建带消息的成功响应', async () => {
      const data = { id: 1 };
      const message = '操作成功';
      const response = successResponse(data, message);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(json.message).toBe(message);
    });

    it('应该处理空数据', async () => {
      const response = successResponse(null);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toBeNull();
    });

    it('应该处理数组数据', async () => {
      const data = [1, 2, 3, 4, 5];
      const response = successResponse(data);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
      expect(Array.isArray(json.data)).toBe(true);
    });

    it('应该处理复杂对象', async () => {
      const data = {
        user: { id: 1, name: 'Test' },
        credits: { balance: 100, transactions: [] },
        metadata: { timestamp: Date.now() },
      };
      const response = successResponse(data);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(true);
      expect(json.data).toEqual(data);
    });

    it('应该包含Content-Type为application/json', () => {
      const response = successResponse({ test: true });
      expect(response.headers.get('content-type')).toContain(
        'application/json'
      );
    });
  });

  describe('errorResponse - 错误响应格式化', () => {
    it('应该创建基本的错误响应 (默认400)', async () => {
      const error = '请求参数错误';
      const response = errorResponse(error);

      expect(response.status).toBe(400);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe(error);
      expect(json.details).toBeUndefined();
    });

    it('应该支持自定义HTTP状态码', async () => {
      const error = '未授权';
      const response = errorResponse(error, 401);

      expect(response.status).toBe(401);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe(error);
    });

    it('应该包含详细错误信息', async () => {
      const error = '验证失败';
      const details = { field: 'email', reason: '格式不正确' };
      const response = errorResponse(error, 400, details);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe(error);
      expect(json.details).toEqual(details);
    });

    it('应该处理500内部服务器错误', async () => {
      const error = '服务器内部错误';
      const response = errorResponse(error, 500);

      expect(response.status).toBe(500);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe(error);
    });

    it('应该处理403权限不足错误', async () => {
      const error = '需要管理员权限';
      const response = errorResponse(error, 403);

      expect(response.status).toBe(403);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe(error);
    });

    it('应该处理429限流错误', async () => {
      const error = '请求过于频繁';
      const details = { reset: Date.now() + 60000 };
      const response = errorResponse(error, 429, details);

      expect(response.status).toBe(429);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe(error);
      expect(json.details).toEqual(details);
    });

    it('应该处理404未找到错误', async () => {
      const error = '资源不存在';
      const response = errorResponse(error, 404);

      expect(response.status).toBe(404);

      const json: ApiResponse = await response.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe(error);
    });

    it('应该包含Content-Type为application/json', () => {
      const response = errorResponse('测试错误');
      expect(response.headers.get('content-type')).toContain(
        'application/json'
      );
    });
  });

  describe('ApiResponse 接口兼容性', () => {
    it('成功响应应该符合ApiResponse接口', async () => {
      const response = successResponse({ id: 1 }, '成功');
      const json: ApiResponse = await response.json();

      expect(json).toHaveProperty('success');
      expect(json).toHaveProperty('data');
      expect(json.success).toBe(true);
      expect(typeof json.success).toBe('boolean');
    });

    it('错误响应应该符合ApiResponse接口', async () => {
      const response = errorResponse('错误消息', 400, { code: 'E001' });
      const json: ApiResponse = await response.json();

      expect(json).toHaveProperty('success');
      expect(json).toHaveProperty('error');
      expect(json).toHaveProperty('details');
      expect(json.success).toBe(false);
      expect(typeof json.success).toBe('boolean');
      expect(typeof json.error).toBe('string');
    });
  });

  describe('HTTP状态码规范性', () => {
    it('应该使用正确的2xx成功状态码', () => {
      const response = successResponse({ test: true });
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(300);
    });

    it('应该使用正确的4xx客户端错误状态码', () => {
      const response400 = errorResponse('Bad Request', 400);
      const response401 = errorResponse('Unauthorized', 401);
      const response403 = errorResponse('Forbidden', 403);
      const response404 = errorResponse('Not Found', 404);

      expect(response400.status).toBe(400);
      expect(response401.status).toBe(401);
      expect(response403.status).toBe(403);
      expect(response404.status).toBe(404);
    });

    it('应该使用正确的5xx服务器错误状态码', () => {
      const response500 = errorResponse('Internal Server Error', 500);
      const response503 = errorResponse('Service Unavailable', 503);

      expect(response500.status).toBe(500);
      expect(response503.status).toBe(503);
    });
  });

  describe('边界情况和特殊值', () => {
    it('应该处理空字符串错误消息', async () => {
      const response = errorResponse('', 400);
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('');
    });

    it('应该处理undefined数据 (转换为null)', async () => {
      const response = successResponse(undefined);
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(true);
      // JSON.stringify将undefined转换为null
      expect(json.data).toBeUndefined();
    });

    it('应该处理boolean数据', async () => {
      const response = successResponse(false);
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toBe(false);
    });

    it('应该处理数字数据', async () => {
      const response = successResponse(42);
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(true);
      expect(json.data).toBe(42);
    });

    it('应该处理嵌套错误详情', async () => {
      const details = {
        validationErrors: [
          { field: 'email', message: 'Invalid format' },
          { field: 'password', message: 'Too short' },
        ],
        timestamp: Date.now(),
      };
      const response = errorResponse('Validation failed', 400, details);
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(false);
      expect(json.details).toEqual(details);
      expect(json.details.validationErrors).toHaveLength(2);
    });
  });

  describe('真实场景模拟', () => {
    it('应该模拟成功的用户查询响应', async () => {
      const userData = {
        id: 'user_123',
        email: 'test@example.com',
        credits: 100,
        role: 'user',
      };
      const response = successResponse(userData, '获取用户信息成功');
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.id).toBe('user_123');
      expect(json.message).toBe('获取用户信息成功');
    });

    it('应该模拟分页数据响应', async () => {
      const paginatedData = {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        total: 100,
        page: 1,
        pageSize: 10,
      };
      const response = successResponse(paginatedData);
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(true);
      expect(json.data.items).toHaveLength(3);
      expect(json.data.total).toBe(100);
    });

    it('应该模拟积分不足错误', async () => {
      const response = errorResponse('积分不足', 400, {
        required: 50,
        current: 20,
        shortfall: 30,
      });
      const json: ApiResponse = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('积分不足');
      expect(json.details.shortfall).toBe(30);
    });

    it('应该模拟认证失败响应', async () => {
      const response = errorResponse('Token已过期', 401, {
        code: 'TOKEN_EXPIRED',
        expiredAt: Date.now() - 3600000,
      });
      const json: ApiResponse = await response.json();

      expect(response.status).toBe(401);
      expect(json.success).toBe(false);
      expect(json.details.code).toBe('TOKEN_EXPIRED');
    });

    it('应该模拟限流响应', async () => {
      const resetTime = Date.now() + 60000;
      const response = errorResponse('请求过于频繁,请稍后再试', 429, {
        reset: resetTime,
        limit: 100,
        remaining: 0,
      });
      const json: ApiResponse = await response.json();

      expect(response.status).toBe(429);
      expect(json.details.remaining).toBe(0);
      expect(json.details.reset).toBe(resetTime);
    });
  });
});
