/**
 * 磁偏角计算
 */

export function calculateMagneticDeclination(latitude: number, longitude: number): number {
  // 简化的磁偏角计算
  return 0; // 实际应该使用WMM模型计算
}

export function getDeclinationByLocation(location: { lat: number; lng: number }): number {
  return calculateMagneticDeclination(location.lat, location.lng);
}

