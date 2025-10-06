import assert from 'node:assert';
import { createRateLimiter } from '@/lib/rate-limit';

// 使用短时间窗口进行测试
const limiter = createRateLimiter({ windowMs: 200, maxRequests: 2, message: '限流触发' });

const id = 'test-user-123';

const r1 = await limiter(id);
assert.strictEqual(r1.success, true);
assert.strictEqual(r1.remaining, 1);

const r2 = await limiter(id);
assert.strictEqual(r2.success, true);
assert.strictEqual(r2.remaining, 0);

const r3 = await limiter(id);
assert.strictEqual(r3.success, false);

console.log('[rate-limit.test] 第三次请求被限流 ✅');

// 等待窗口重置
await new Promise((resolve) => setTimeout(resolve, 250));

const r4 = await limiter(id);
assert.strictEqual(r4.success, true);
console.log('[rate-limit.test] 窗口重置后请求通过 ✅');
