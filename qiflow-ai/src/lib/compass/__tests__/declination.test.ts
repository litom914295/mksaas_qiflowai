import { describe, expect, test, jest } from '@jest/globals';
import { InMemoryDeclinationCache, WmmNoaaProvider } from '../../compass/declination';

describe('WmmNoaaProvider', () => {
  test('uses cache and parses declination', async () => {
    const cache = new InMemoryDeclinationCache(10000);
    const mockFetch = jest.fn(async () => ({ ok: true, json: async () => ({ result: [{ declination: 1.23 }] }) })) as unknown as typeof fetch;
    const prov = new WmmNoaaProvider({ fetchImpl: mockFetch, cache });
    const d1 = await prov.getDeclinationDeg(31.2, 121.5, new Date('2025-01-01T00:00:00Z'));
    expect(d1).toBeCloseTo(1.23, 2);
    const d2 = await prov.getDeclinationDeg(31.21, 121.49, new Date('2025-01-01T12:00:00Z'));
    expect(d2).toBeCloseTo(1.23, 2);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});


