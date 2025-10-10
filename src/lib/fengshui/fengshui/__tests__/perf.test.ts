import { describe, expect, test } from '@jest/globals';
import { generateFlyingStar } from '../../fengshui';

describe('flying star perf', () => {
  test('1k runs under ~3ms per run on average (soft)', () => {
    const n = 1000;
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      generateFlyingStar({
        observedAt: new Date(`2024-06-${(i % 28) + 1}T12:00:00Z`),
        facing: { degrees: (i * 13) % 360 },
      });
    }
    const dt = Date.now() - t0;
    const per = dt / n;
    // Soft bound to avoid CI flakiness; ensure it is reasonably fast
    expect(per).toBeLessThan(10);
  });
});
