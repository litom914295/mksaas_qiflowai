import { expect, request, test } from '@playwright/test';

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(
    0,
    Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)
  );
  return sorted[idx];
}

async function pickEndpoint(
  ctx: import('@playwright/test').APIRequestContext
): Promise<string> {
  const candidates = [
    '/api/metrics',
    '/api/health',
    '/api/admin/growth/metrics/prometheus',
    '/',
  ];
  for (const ep of candidates) {
    const r = await ctx.get(ep);
    if (r.ok()) return ep;
  }
  return '/';
}

test.describe('SLA 验收', () => {
  test('P95≤1s，错误率≤1%，可用性≥99.9%', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const ctx = await request.newContext({ baseURL });
    const endpoint = await pickEndpoint(ctx);

    // 预热
    for (let i = 0; i < 10; i++) await ctx.get(endpoint);

    const total = 200;
    const concurrency = 20;
    const durations: number[] = [];
    let errors = 0;

    async function runBatch(n: number) {
      await Promise.all(
        Array.from({ length: n }).map(async () => {
          const start = process.hrtime.bigint();
          const res = await ctx.get(endpoint);
          const end = process.hrtime.bigint();
          const ms = Number(end - start) / 1e6;
          durations.push(ms);
          if (res.status() >= 500) errors += 1;
        })
      );
    }

    let remaining = total;
    while (remaining > 0) {
      const n = Math.min(concurrency, remaining);
      await runBatch(n);
      remaining -= n;
    }

    const p95 = percentile(durations, 0.95);
    const errRate = errors / durations.length;
    const availability = 1 - errRate;

    expect(p95, 'P95 latency (ms)').toBeLessThanOrEqual(1000);
    expect(errRate, '5xx error rate').toBeLessThanOrEqual(0.01);
    expect(availability, 'availability').toBeGreaterThanOrEqual(0.999);

    await ctx.dispose();
  });

  test('信号覆盖率≥0.8（若指标存在）', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const ctx = await request.newContext({ baseURL });
    const res = await ctx.get('/api/metrics');
    if (!res.ok()) test.skip();
    const text = await res.text();
    const m = text.match(/business_signal_coverage_ratio\s+(\d+\.?\d*)/);
    if (!m) test.skip();
    const value = Number.parseFloat(m[1]);
    expect(value).toBeGreaterThanOrEqual(0.8);
    await ctx.dispose();
  });

  test('故障切换RTO≤300s（若指标存在）', async () => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3000';
    const ctx = await request.newContext({ baseURL });
    const res = await ctx.get('/api/metrics');
    if (!res.ok()) test.skip();
    const text = await res.text();
    const m = text.match(/failover_last_duration_seconds\s+(\d+\.?\d*)/);
    if (!m) test.skip();
    const value = Number.parseFloat(m[1]);
    expect(value).toBeLessThanOrEqual(300);
    await ctx.dispose();
  });
});
