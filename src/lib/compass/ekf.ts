// Minimal EKF-like structure for heading estimation (MVP). Not production-grade.
export type EkfConfig = {
  qYaw: number; // process noise for yaw
  rMag: number; // measurement noise for magnetometer
};

export const DEFAULT_EKF_CONFIG: EkfConfig = { qYaw: 0.02, rMag: 0.5 };

export class HeadingEKF {
  private yaw: number; // deg
  private p: number; // variance
  private readonly cfg: EkfConfig;

  constructor(initialYawDeg = 0, cfg: EkfConfig = DEFAULT_EKF_CONFIG) {
    this.yaw = initialYawDeg;
    this.p = 1;
    this.cfg = cfg;
  }

  predict(gyroZDegPerSec: number, dtSec: number) {
    this.yaw = this.yaw + gyroZDegPerSec * dtSec;
    this.p = this.p + this.cfg.qYaw;
  }

  update(magYawDeg: number) {
    const y = normalizeAngleDeg(magYawDeg - this.yaw);
    const s = this.p + this.cfg.rMag;
    const k = this.p / s;
    this.yaw = normalizeAngleDeg(this.yaw + k * y);
    this.p = (1 - k) * this.p;
  }

  getYawDeg(): number {
    return normalizeAngleDeg(this.yaw);
  }
}

export function normalizeAngleDeg(a: number): number {
  let x = ((a % 360) + 360) % 360;
  if (x > 180) x -= 360;
  return x;
}


