import type { AngleToMountainResult, Mountain } from './types';

// Authority sequence: see types.ts comment. Index i center is i*15° + 7.5° offset for half-sector centers if needed.
export const MOUNTAINS: readonly Mountain[] = [
  '子',
  '癸',
  '丑',
  '艮',
  '寅',
  '甲',
  '卯',
  '乙',
  '辰',
  '巽',
  '巳',
  '丙',
  '午',
  '丁',
  '未',
  '坤',
  '申',
  '庚',
  '酉',
  '辛',
  '戌',
  '乾',
  '亥',
  '壬',
] as const;

export function angleToMountain(
  degrees: number,
  toleranceDeg = 0.5
): AngleToMountainResult {
  const normalized = ((degrees % 360) + 360) % 360;
  const sectorSize = 360 / MOUNTAINS.length; // 15° each
  // Sector index: 0 at [352.5°, 7.5°), then each 15°
  const idx =
    Math.floor(((normalized + 7.5) % 360) / sectorSize) % MOUNTAINS.length;
  const centerDeg = (idx * sectorSize + 360 - 7.5) % 360; // center at start+7.5; reverse shift
  // Check boundary ambiguity within tolerance around sector borders
  const distToCenter = Math.abs(((normalized - centerDeg + 540) % 360) - 180);
  const ambiguous = distToCenter >= sectorSize / 2 - toleranceDeg;

  if (!ambiguous) {
    return { mountain: MOUNTAINS[idx], ambiguous: false };
  }

  const prev = MOUNTAINS[(idx + MOUNTAINS.length - 1) % MOUNTAINS.length];
  const next = MOUNTAINS[(idx + 1) % MOUNTAINS.length];
  return {
    mountain: MOUNTAINS[idx],
    ambiguous: true,
    candidates: [prev, MOUNTAINS[idx], next],
  };
}
