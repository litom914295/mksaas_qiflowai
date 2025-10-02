export type SensorSample = {
  timestamp: number; // ms epoch
  accel: { x: number; y: number; z: number } | null;
  gyro: { x: number; y: number; z: number } | null;
  mag: { x: number; y: number; z: number } | null;
};

export type FusionConfig = {
  gyroDriftCompensation: number; // 0..1
  accelTrust: number; // 0..1
  magTrust: number; // 0..1
};

export const DEFAULT_FUSION_CONFIG: FusionConfig = {
  gyroDriftCompensation: 0.02,
  accelTrust: 0.02,
  magTrust: 0.05,
};

export type FusionState = {
  yawDeg: number; // heading relative to true north when declination applied
  pitchDeg: number;
  rollDeg: number;
  quality: number; // 0..1 confidence
};

export function normalizeDegrees(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

// Simple complementary filter placeholder. Replace with EKF/UKF as needed.
export function fuseSamples(
  samples: SensorSample[],
  declinationDeg = 0,
  config: FusionConfig = DEFAULT_FUSION_CONFIG,
): FusionState {
  let yaw = 0; let pitch = 0; let roll = 0; let quality = 0.2;
  let lastTs: number | null = null;

  for (const s of samples) {
    if (lastTs != null && s.gyro) {
      const dt = Math.max(0, (s.timestamp - lastTs) / 1000);
      yaw += s.gyro.z * dt * (1 - config.gyroDriftCompensation);
      pitch += s.gyro.x * dt;
      roll += s.gyro.y * dt;
    }
    if (s.accel) {
      // project accel to orientation (very rough)
      const ax = s.accel.x, ay = s.accel.y, az = s.accel.z;
      const pitchAcc = Math.atan2(-ax, Math.sqrt(ay * ay + az * az)) * 180 / Math.PI;
      const rollAcc = Math.atan2(ay, az) * 180 / Math.PI;
      pitch = (1 - config.accelTrust) * pitch + config.accelTrust * pitchAcc;
      roll = (1 - config.accelTrust) * roll + config.accelTrust * rollAcc;
      quality = Math.min(1, quality + 0.05);
    }
    if (s.mag) {
      // tilt-compensated heading (approx)
      const mx = s.mag.x, my = s.mag.y, mz = s.mag.z;
      const cosPitch = Math.cos(pitch * Math.PI / 180);
      const sinPitch = Math.sin(pitch * Math.PI / 180);
      const cosRoll = Math.cos(roll * Math.PI / 180);
      const sinRoll = Math.sin(roll * Math.PI / 180);
      const Xh = mx * cosPitch + mz * sinPitch;
      const Yh = mx * sinRoll * sinPitch + my * cosRoll - mz * sinRoll * cosPitch;
      const yawMag = Math.atan2(-Yh, Xh) * 180 / Math.PI;
      yaw = (1 - config.magTrust) * yaw + config.magTrust * yawMag;
      quality = Math.min(1, quality + 0.1);
    }
    lastTs = s.timestamp;
  }

  const yawTrue = normalizeDegrees(yaw + declinationDeg);
  return { yawDeg: yawTrue, pitchDeg: normalizeDegrees(pitch), rollDeg: normalizeDegrees(roll), quality };
}


