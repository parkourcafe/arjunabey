import { describe, expect, it } from 'vitest';
import {
  calculateStayQuote,
  nightlyRate,
  publicFromRate,
  type SupportedBedrooms,
} from './pricing';

describe('Anjuna public pricing calendar', () => {
  it.each([
    [1, 115],
    [2, 190],
    [3, 280],
  ] as Array<[SupportedBedrooms, number]>)('returns the public from rate for %iBR', (bedrooms, rate) => {
    expect(publicFromRate(bedrooms)).toBe(rate);
  });

  it('uses Friday and Saturday weekend pricing', () => {
    expect(nightlyRate('2026-09-10', 2)).toBe(230);
    expect(nightlyRate('2026-09-11', 2)).toBe(250);
    expect(nightlyRate('2026-09-12', 2)).toBe(250);
    expect(nightlyRate('2026-09-13', 2)).toBe(230);
  });

  it('calculates a seven-night shoulder stay with the weekly discount', () => {
    const quote = calculateStayQuote({
      checkIn: '2026-09-07',
      checkOut: '2026-09-14',
      bedrooms: 2,
    });

    expect(quote.nights).toBe(7);
    expect(quote.subtotal).toBe(1650);
    expect(quote.discountPercent).toBe(10);
    expect(quote.total).toBe(1485);
  });

  it('requires seven nights and applies no discount over New Year', () => {
    const quote = calculateStayQuote({
      checkIn: '2026-12-28',
      checkOut: '2027-01-04',
      bedrooms: 2,
    });

    expect(quote.minimumStay).toBe(7);
    expect(quote.discountPercent).toBe(0);
    expect(quote.total).toBe(2475);
  });

  it('rejects a stay shorter than the seasonal minimum', () => {
    expect(() =>
      calculateStayQuote({
        checkIn: '2026-08-10',
        checkOut: '2026-08-12',
        bedrooms: 1,
      })
    ).toThrow('minimum stay of 3 nights');
  });
});
