import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EnhancedBaziResult } from '@/lib/bazi';
import { BaziCache, computeBaziWithCache } from '../bazi-cache';

describe('computeBaziWithCache', () => {
  beforeEach(async () => {
    await BaziCache.getInstance().clear();
  });

  it('reuses cached result for identical birth data', async () => {
    const sampleResult = { pillars: {} } as unknown as EnhancedBaziResult;
    const computeFn = vi.fn().mockResolvedValue(sampleResult);

    const params = {
      datetime: '1990-01-01T08:00',
      gender: 'male',
      timezone: 'Asia/Shanghai',
    };

    const first = await computeBaziWithCache(params, computeFn);
    expect(first).toBe(sampleResult);
    expect(computeFn).toHaveBeenCalledTimes(1);

    const second = await computeBaziWithCache(params, computeFn);
    expect(second).toBe(first);
    expect(computeFn).toHaveBeenCalledTimes(1);
  });

  it('creates separate cache entries when birth time differs', async () => {
    const computeFn = vi
      .fn<[], Promise<EnhancedBaziResult>>()
      .mockResolvedValue({ pillars: {} } as EnhancedBaziResult);

    const base = {
      gender: 'female',
      timezone: 'Asia/Shanghai',
    };

    await computeBaziWithCache(
      { ...base, datetime: '1990-01-01T05:00' },
      computeFn
    );
    await computeBaziWithCache(
      { ...base, datetime: '1990-01-01T07:00' },
      computeFn
    );

    expect(computeFn).toHaveBeenCalledTimes(2);
  });
});
