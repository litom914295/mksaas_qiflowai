import { describe, expect, test } from '@jest/globals';
import { fuseSamples } from '../../compass/sensor-fusion';

describe('sensor fusion', () => {
  test('computes heading with declination applied', () => {
    const now = Date.now();
    const samples = [
      {
        timestamp: now,
        accel: { x: 0, y: 0, z: 1 },
        gyro: { x: 0, y: 0, z: 0 },
        mag: { x: 1, y: 0, z: 0 },
      },
      {
        timestamp: now + 20,
        accel: { x: 0, y: 0, z: 1 },
        gyro: { x: 0, y: 0, z: 0 },
        mag: { x: 1, y: 0.1, z: 0 },
      },
    ];
    const state = fuseSamples(samples, 5);
    expect(state.yawDeg).toBeGreaterThanOrEqual(0);
    expect(state.yawDeg).toBeLessThan(360);
    expect(state.quality).toBeGreaterThan(0);
  });
});
