/**
 * 玄空风水API性能测试套件
 *
 * 测试目标：
 * 1. 响应时间基准
 * 2. 并发处理能力
 * 3. 内存使用情况
 * 4. 负载测试
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

// 测试配置
const BASE_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const CONCURRENT_REQUESTS = 10;
const LOAD_TEST_DURATION = 60000; // 1分钟

// 性能指标收集
interface PerformanceMetrics {
  endpoint: string;
  requestCount: number;
  successCount: number;
  failureCount: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50: number;
  p95: number;
  p99: number;
  memoryUsage?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

class PerformanceMonitor {
  private responseTimes: number[] = [];
  private successCount = 0;
  private failureCount = 0;
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  recordRequest(duration: number, success: boolean) {
    this.responseTimes.push(duration);
    if (success) {
      this.successCount++;
    } else {
      this.failureCount++;
    }
  }

  getMetrics(): PerformanceMetrics {
    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, val) => acc + val, 0);

    return {
      endpoint: this.endpoint,
      requestCount: this.responseTimes.length,
      successCount: this.successCount,
      failureCount: this.failureCount,
      averageResponseTime: sum / sorted.length,
      minResponseTime: sorted[0],
      maxResponseTime: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      memoryUsage: process.memoryUsage(),
    };
  }

  printReport() {
    const metrics = this.getMetrics();
    console.log(`\n━━━ 性能报告: ${metrics.endpoint} ━━━`);
    console.log(`请求总数: ${metrics.requestCount}`);
    console.log(
      `成功: ${metrics.successCount} | 失败: ${metrics.failureCount}`
    );
    console.log('响应时间 (ms):');
    console.log(`  平均: ${metrics.averageResponseTime.toFixed(2)}`);
    console.log(`  最小: ${metrics.minResponseTime.toFixed(2)}`);
    console.log(`  最大: ${metrics.maxResponseTime.toFixed(2)}`);
    console.log(`  P50: ${metrics.p50.toFixed(2)}`);
    console.log(`  P95: ${metrics.p95.toFixed(2)}`);
    console.log(`  P99: ${metrics.p99.toFixed(2)}`);
    if (metrics.memoryUsage) {
      console.log('内存使用 (MB):');
      console.log(
        `  堆使用: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}`
      );
      console.log(
        `  堆总量: ${(metrics.memoryUsage.heapTotal / 1024 / 1024).toFixed(2)}`
      );
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

// 辅助函数
async function makeRequest(
  endpoint: string,
  body: any
): Promise<{ duration: number; success: boolean }> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;
    const success = response.status === 200;

    return { duration, success };
  } catch (error) {
    const duration = Date.now() - startTime;
    return { duration, success: false };
  }
}

async function runConcurrentRequests(
  endpoint: string,
  payload: any,
  count: number
): Promise<PerformanceMetrics> {
  const monitor = new PerformanceMonitor(endpoint);

  const promises = Array(count)
    .fill(null)
    .map(async () => {
      const { duration, success } = await makeRequest(endpoint, payload);
      monitor.recordRequest(duration, success);
    });

  await Promise.all(promises);

  return monitor.getMetrics();
}

describe('玄空风水API性能测试', () => {
  // 测试数据
  const diagnosePayload = {
    facing: 180,
    buildYear: 2020,
    location: { lat: 39.9042, lng: 116.4074 },
  };

  const remedyPayload = {
    issue: '五黄煞气',
    palace: '中宫',
    severity: 'high',
  };

  const comprehensivePayload = {
    facing: 180,
    buildYear: 2020,
  };

  // ===== 1. 单请求响应时间测试 =====
  describe('单请求响应时间', () => {
    it('诊断API应该在2秒内响应', async () => {
      const { duration, success } = await makeRequest(
        '/api/xuankong/diagnose',
        diagnosePayload
      );

      console.log(`诊断API响应时间: ${duration}ms`);
      expect(success).toBe(true);
      expect(duration).toBeLessThan(2000);
    }, 10000);

    it('化解方案API应该在2秒内响应', async () => {
      const { duration, success } = await makeRequest(
        '/api/xuankong/remedy-plans',
        remedyPayload
      );

      console.log(`化解方案API响应时间: ${duration}ms`);
      expect(success).toBe(true);
      expect(duration).toBeLessThan(2000);
    }, 10000);

    it('综合分析API应该在5秒内响应', async () => {
      const { duration, success } = await makeRequest(
        '/api/xuankong/comprehensive-analysis',
        comprehensivePayload
      );

      console.log(`综合分析API响应时间: ${duration}ms`);
      expect(success).toBe(true);
      expect(duration).toBeLessThan(5000);
    }, 15000);
  });

  // ===== 2. 并发请求测试 =====
  describe('并发请求处理', () => {
    it(`诊断API应该能处理${CONCURRENT_REQUESTS}个并发请求`, async () => {
      const metrics = await runConcurrentRequests(
        '/api/xuankong/diagnose',
        diagnosePayload,
        CONCURRENT_REQUESTS
      );

      expect(metrics.successCount).toBe(CONCURRENT_REQUESTS);
      expect(metrics.averageResponseTime).toBeLessThan(3000);
      expect(metrics.p95).toBeLessThan(5000);

      console.log(`\n并发测试结果 (${CONCURRENT_REQUESTS}个请求):`);
      console.log(`  平均响应: ${metrics.averageResponseTime.toFixed(2)}ms`);
      console.log(`  P95: ${metrics.p95.toFixed(2)}ms`);
    }, 60000);

    it(`化解方案API应该能处理${CONCURRENT_REQUESTS}个并发请求`, async () => {
      const metrics = await runConcurrentRequests(
        '/api/xuankong/remedy-plans',
        remedyPayload,
        CONCURRENT_REQUESTS
      );

      expect(metrics.successCount).toBe(CONCURRENT_REQUESTS);
      expect(metrics.averageResponseTime).toBeLessThan(3000);
      expect(metrics.p95).toBeLessThan(5000);

      console.log(`\n并发测试结果 (${CONCURRENT_REQUESTS}个请求):`);
      console.log(`  平均响应: ${metrics.averageResponseTime.toFixed(2)}ms`);
      console.log(`  P95: ${metrics.p95.toFixed(2)}ms`);
    }, 60000);

    it(`综合分析API应该能处理${Math.floor(CONCURRENT_REQUESTS / 2)}个并发请求`, async () => {
      const count = Math.floor(CONCURRENT_REQUESTS / 2);
      const metrics = await runConcurrentRequests(
        '/api/xuankong/comprehensive-analysis',
        comprehensivePayload,
        count
      );

      expect(metrics.successCount).toBe(count);
      expect(metrics.averageResponseTime).toBeLessThan(8000);
      expect(metrics.p95).toBeLessThan(12000);

      console.log(`\n并发测试结果 (${count}个请求):`);
      console.log(`  平均响应: ${metrics.averageResponseTime.toFixed(2)}ms`);
      console.log(`  P95: ${metrics.p95.toFixed(2)}ms`);
    }, 90000);
  });

  // ===== 3. 连续请求测试（模拟实际使用场景）=====
  describe('连续请求测试', () => {
    it('应该能稳定处理连续20个请求', async () => {
      const monitor = new PerformanceMonitor('/api/xuankong/diagnose');

      for (let i = 0; i < 20; i++) {
        const { duration, success } = await makeRequest(
          '/api/xuankong/diagnose',
          diagnosePayload
        );
        monitor.recordRequest(duration, success);

        // 模拟用户间隔
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const metrics = monitor.getMetrics();

      expect(metrics.successCount).toBe(20);
      expect(metrics.averageResponseTime).toBeLessThan(2000);

      // 检查性能是否稳定（最大和最小响应时间的差异不应过大）
      const variance = metrics.maxResponseTime - metrics.minResponseTime;
      expect(variance).toBeLessThan(5000);

      monitor.printReport();
    }, 120000);
  });

  // ===== 4. 内存泄漏测试 =====
  describe('内存泄漏测试', () => {
    it('连续请求不应导致内存持续增长', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const monitor = new PerformanceMonitor('/api/xuankong/diagnose');

      // 执行多次请求
      for (let i = 0; i < 50; i++) {
        const { duration, success } = await makeRequest(
          '/api/xuankong/diagnose',
          diagnosePayload
        );
        monitor.recordRequest(duration, success);

        if (i % 10 === 0) {
          // 强制垃圾回收（如果可用）
          if (global.gc) {
            global.gc();
          }
        }
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024;

      console.log(`\n内存变化: ${memoryIncrease.toFixed(2)} MB`);

      // 内存增长应该在合理范围内（小于50MB）
      expect(memoryIncrease).toBeLessThan(50);

      monitor.printReport();
    }, 180000);
  });

  // ===== 5. 不同参数下的性能对比 =====
  describe('参数复杂度影响', () => {
    it('应该比较简单和复杂参数的性能差异', async () => {
      const simplePayload = {
        facing: 180,
        buildYear: 2020,
      };

      const complexPayload = {
        facing: 180,
        buildYear: 2020,
        location: { lat: 39.9042, lng: 116.4074 },
        userProfile: {
          bazi: {
            year: { stem: '甲', branch: '子' },
            month: { stem: '丙', branch: '寅' },
            day: { stem: '戊', branch: '午' },
            hour: { stem: '庚', branch: '申' },
          },
          priorities: ['wealth', 'health', 'career', 'relationship'],
        },
        includeSafeAreas: true,
        severityThreshold: 'low',
      };

      const simpleMetrics = await runConcurrentRequests(
        '/api/xuankong/comprehensive-analysis',
        simplePayload,
        5
      );

      const complexMetrics = await runConcurrentRequests(
        '/api/xuankong/comprehensive-analysis',
        complexPayload,
        5
      );

      console.log(
        `\n简单参数平均响应: ${simpleMetrics.averageResponseTime.toFixed(2)}ms`
      );
      console.log(
        `复杂参数平均响应: ${complexMetrics.averageResponseTime.toFixed(2)}ms`
      );
      console.log(
        `性能差异: ${((complexMetrics.averageResponseTime / simpleMetrics.averageResponseTime - 1) * 100).toFixed(1)}%`
      );

      // 复杂参数不应导致性能下降超过200%
      expect(complexMetrics.averageResponseTime).toBeLessThan(
        simpleMetrics.averageResponseTime * 3
      );
    }, 120000);
  });

  // ===== 6. 缓存效果测试 =====
  describe('缓存效果', () => {
    it('相同请求应该受益于缓存', async () => {
      const payload = { facing: 180, buildYear: 2020 };

      // 首次请求（未缓存）
      const { duration: firstDuration } = await makeRequest(
        '/api/xuankong/diagnose',
        payload
      );

      // 等待缓存生效
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 相同请求（可能已缓存）
      const { duration: secondDuration } = await makeRequest(
        '/api/xuankong/diagnose',
        payload
      );
      const { duration: thirdDuration } = await makeRequest(
        '/api/xuankong/diagnose',
        payload
      );

      console.log('\n缓存测试:');
      console.log(`  首次请求: ${firstDuration}ms`);
      console.log(`  第二次请求: ${secondDuration}ms`);
      console.log(`  第三次请求: ${thirdDuration}ms`);

      // 如果实现了缓存，后续请求应该更快
      // 这里只是记录，不强制要求（因为可能还没实现缓存）
      if (secondDuration < firstDuration * 0.8) {
        console.log(
          `  ✓ 检测到缓存效果: ${((1 - secondDuration / firstDuration) * 100).toFixed(1)}% 加速`
        );
      }
    }, 30000);
  });
});

// ===== 性能基准导出 =====
export const PERFORMANCE_BENCHMARKS = {
  diagnose: {
    single: { target: 2000, acceptable: 3000 },
    concurrent: { target: 3000, acceptable: 5000 },
    p95: { target: 4000, acceptable: 6000 },
  },
  remedyPlans: {
    single: { target: 2000, acceptable: 3000 },
    concurrent: { target: 3000, acceptable: 5000 },
    p95: { target: 4000, acceptable: 6000 },
  },
  comprehensive: {
    single: { target: 5000, acceptable: 8000 },
    concurrent: { target: 8000, acceptable: 12000 },
    p95: { target: 10000, acceptable: 15000 },
  },
};
