import { describe, expect, test } from '@jest/globals';
import { HeadingEKF } from '../../compass/ekf';

describe('HeadingEKF', () => {
  test('fuses gyro prediction and mag update', () => {
    const ekf = new HeadingEKF(0);
    ekf.predict(90, 1); // 1s at 90 deg/s -> 90 deg
    expect(Math.abs(ekf.getYawDeg() - 90)).toBeLessThan(1e-6);
    ekf.update(100); // mag suggests 100
    const fused = ekf.getYawDeg();
    expect(fused).toBeGreaterThan(90);
    expect(fused).toBeLessThan(100);
  });
});
