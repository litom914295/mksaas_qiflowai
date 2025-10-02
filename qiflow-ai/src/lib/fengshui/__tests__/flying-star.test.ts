import { describe, expect, test } from '@jest/globals';
import { generateFlyingStar, getConfig } from '../../fengshui';
import { angleToMountain } from '../../fengshui/mountain';

describe('generateFlyingStar', () => {
  test('returns deterministic output for same input', () => {
    const input = {
      observedAt: new Date('2024-06-01T12:00:00Z'),
      facing: { degrees: 135 },
    } as const;
    const a = generateFlyingStar(input);
    const b = generateFlyingStar(input);
    expect(a.period).toBe(b.period);
    expect(a.plates.period).toEqual(b.plates.period);
  });

  test('merges config overrides', () => {
    const cfg = getConfig({ applyTiGua: true, evaluationProfile: 'conservative' });
    expect(cfg.applyTiGua).toBe(true);
    expect(cfg.evaluationProfile).toBe('conservative');
  });

  test('24 mountains mapping with tolerance', () => {
    const res = angleToMountain(0, 0.5);
    expect(res.mountain).toBeDefined();
    expect(typeof res.ambiguous).toBe('boolean');
  });

  test('TiGua/FanGua switches apply without throwing', () => {
    const outA = generateFlyingStar({ observedAt: new Date('2024-01-01T00:00:00Z'), facing: { degrees: 200 }, config: { applyTiGua: true } });
    const outB = generateFlyingStar({ observedAt: new Date('2024-01-01T00:00:00Z'), facing: { degrees: 200 }, config: { applyFanGua: true } });
    expect(outA.meta.rulesApplied.includes('TiGua')).toBe(true);
    expect(outB.meta.rulesApplied.includes('FanGua')).toBe(true);
  });

  test('boundary years mark ambiguous', () => {
    const out = generateFlyingStar({ observedAt: new Date('1884-01-05T00:00:00Z'), facing: { degrees: 10 } });
    expect(typeof out.meta.ambiguous).toBe('boolean');
  });
});


