import { describe, expect, test } from '@jest/globals';
import { generateFlyingStar } from '../../fengshui';

const cases = [
  // China
  { name: 'Beijing mid-sector', date: '2025-06-15T03:00:00Z', deg: 180 },
  { name: 'Shanghai boundary -0.4°', date: '2025-03-10T10:00:00Z', deg: 52.6 },
  { name: 'Guangzhou boundary +0.4°', date: '2025-09-01T12:00:00Z', deg: 52.4 },
  // Overseas variety
  { name: 'New York', date: '2025-01-20T18:00:00Z', deg: 310 },
  { name: 'London', date: '2025-04-08T06:00:00Z' },
  { name: 'Sydney', date: '2025-11-30T22:00:00Z', deg: 135 },
];

describe('authoritative snapshots (MVP scaffolding)', () => {
  test.each(cases)('%s', ({ name, date, deg = 120 }) => {
    const out = generateFlyingStar({
      observedAt: new Date(date),
      facing: { degrees: deg },
    });
    // Keep snapshot stable: sort plates by palace
    const sorted = {
      ...out,
      plates: Object.fromEntries(
        Object.entries(out.plates).map(([k, v]) => [
          k,
          [...v].sort((a, b) => a.palace - b.palace),
        ])
      ),
    };
    expect({ name, sorted }).toMatchSnapshot();
  });
});
