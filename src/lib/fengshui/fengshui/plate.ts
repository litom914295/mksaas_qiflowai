import type { FlyingStar, PalaceIndex, Plate } from './types';

// Placeholder mapping refined later by true flying rules; keeps determinism.
export function generatePlate(
  seed: number,
  applyTiGua = false,
  applyFanGua = false
): Plate {
  const cells: Plate = [];
  for (let i = 1 as PalaceIndex; i <= 9; i = (i + 1) as PalaceIndex) {
    let mountainStar = ((seed + i * 3) % 9 || 9) as FlyingStar;
    let facingStar = ((seed + i * 5) % 9 || 9) as FlyingStar;
    const periodStar = ((seed + i * 7) % 9 || 9) as FlyingStar;
    if (applyTiGua) {
      // swap mountain/facing as a simplified TiGua effect
      [mountainStar, facingStar] = [facingStar, mountainStar];
    }
    if (applyFanGua) {
      // invert star within 1..9 (mirror around 5)
      const invert = (s: number) => (10 - ((s - 1) % 9) - 1 || 9) as FlyingStar;
      mountainStar = invert(mountainStar);
      facingStar = invert(facingStar);
    }
    cells.push({ palace: i, mountainStar, facingStar, periodStar });
  }
  return cells;
}

// LuoShu palace visiting order (center→NW→W→NE→S→N→SW→E→SE)
// Indexed by 0..8 mapping to palace indices 1..9
const LUOSHU_ORDER: PalaceIndex[] = [
  5, 6, 7, 8, 9, 1, 2, 3, 4,
] as PalaceIndex[];

export function generatePeriodPlateByLuoShu(
  period: FlyingStar,
  forward = true
): Plate {
  const plate: Plate = [];
  let current = period;
  for (let idx = 0; idx < 9; idx++) {
    const palace = LUOSHU_ORDER[idx];
    const mountainStar = current as FlyingStar;
    const facingStar = current as FlyingStar;
    const periodStar = current as FlyingStar;
    plate.push({ palace, mountainStar, facingStar, periodStar });
    // advance
    if (forward) {
      current = ((current % 9) + 1) as FlyingStar;
    } else {
      current = ((current + 7) % 9 || 9) as FlyingStar; // -1 with wrap
    }
  }
  // sort by palace index to keep stable layout order
  return plate.sort((a, b) => a.palace - b.palace) as Plate;
}
