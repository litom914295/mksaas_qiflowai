import { Layer, Plate, StackedPlates } from './types';
import { generatePlate } from './plate';

export function buildStackedPlates(seed: number, applyTiGua = false, applyFanGua = false): StackedPlates {
  const layers: Layer[] = ['period', 'year', 'month', 'day'];
  return layers.reduce((acc, layer, idx) => {
    const apply = layer === 'period';
    acc[layer] = generatePlate(seed + idx, apply ? applyTiGua : false, apply ? applyFanGua : false);
    return acc;
  }, {} as Record<Layer, Plate>) as StackedPlates;
}


