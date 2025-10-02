import { describe, expect, test } from '@jest/globals';
import { measureFacingTrueNorthDegrees } from '../../compass/true-north';

const fakeProvider = {
  getDeclinationDeg: async () => 5,
};

describe('true north pipeline', () => {
  test('measures facing with WMM provider', async () => {
    const now = new Date('2025-01-01T00:00:00Z');
    const samples = [
      { timestamp: now.getTime(), accel: { x: 0, y: 0, z: 1 }, gyro: { x: 0, y: 0, z: 0 }, mag: { x: 1, y: 0, z: 0 } },
    ];
    const out = await measureFacingTrueNorthDegrees({ location: { lat: 31.23, lon: 121.47 }, observedAt: now, samples }, fakeProvider);
    expect(out.declinationDeg).toBe(5);
    expect(out.facingDeg).toBeGreaterThanOrEqual(0);
    expect(out.facingDeg).toBeLessThan(360);
  });
});


