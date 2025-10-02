/**
 * 文昌位和财位计算
 */

import { PalacePlate } from './types';

export function getWenchangwei(plate: PalacePlate): number[] {
  // 简化的文昌位计算
  return [1, 4, 7]; // 示例位置
}

export function getCaiwei(plate: PalacePlate, period: number): number[] {
  // 简化的财位计算
  return [2, 5, 8]; // 示例位置
}

