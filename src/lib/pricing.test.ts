import { describe, expect, it } from 'vitest';
import {
  OBSERVED_RATE_GUIDES,
  formatIdr,
  observedRateGuide,
  publicFromRate,
} from './pricing';

describe('observed Anjuna OTA rate guide', () => {
  it.each([
    [1, 3_000_000, 4_800_000],
    [2, 3_500_000, 5_900_000],
    [3, 5_200_000, 9_100_000],
  ] as const)('returns the verified observed range for %iBR', (bedrooms, minimum, maximum) => {
    expect(observedRateGuide(bedrooms)).toMatchObject({
      minimum,
      maximum,
      currency: 'IDR',
      checkedAt: '2026-07-29',
    });
    expect(publicFromRate(bedrooms)).toBe(minimum);
  });

  it('keeps every range ordered and positive', () => {
    for (const guide of Object.values(OBSERVED_RATE_GUIDES)) {
      expect(guide.minimum).toBeGreaterThan(0);
      expect(guide.maximum).toBeGreaterThan(guide.minimum);
    }
  });

  it('formats IDR without pretending it is USD', () => {
    const formatted = formatIdr(3_000_000);
    expect(formatted).toContain('3.000.000');
    expect(formatted).not.toContain('$');
  });
});
