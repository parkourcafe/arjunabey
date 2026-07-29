/**
 * Observed OTA rate guide for the owner preview.
 *
 * The values below come from the Airbnb calendar screenshots supplied on
 * 29 July 2026. They are category-level observed ranges, not a promise of
 * availability and not a live quote for every physical villa. Booking.com
 * also showed a 1BR total of Rp 6,602,743 for 9–11 September 2026 after an
 * account-specific Genius discount; that personalised discount is deliberately
 * not used as a public direct-booking rate.
 */

export type SupportedBedrooms = 1 | 2 | 3;

export interface ObservedRateGuide {
  bedrooms: SupportedBedrooms;
  minimum: number;
  maximum: number;
  currency: 'IDR';
  checkedAt: string;
  sourceLabel: string;
}

export const PRICING_START = '2026-08-01';
export const PRICING_LAST_NIGHT = '2027-02-28';
export const PRICING_CHECKOUT_MAX = '2027-03-01';

export const OBSERVED_RATE_GUIDES: Record<SupportedBedrooms, ObservedRateGuide> = {
  1: {
    bedrooms: 1,
    minimum: 3_000_000,
    maximum: 4_800_000,
    currency: 'IDR',
    checkedAt: '2026-07-29',
    sourceLabel: 'Airbnb public calendar screenshots',
  },
  2: {
    bedrooms: 2,
    minimum: 3_500_000,
    maximum: 5_900_000,
    currency: 'IDR',
    checkedAt: '2026-07-29',
    sourceLabel: 'Airbnb public calendar screenshots',
  },
  3: {
    bedrooms: 3,
    minimum: 5_200_000,
    maximum: 9_100_000,
    currency: 'IDR',
    checkedAt: '2026-07-29',
    sourceLabel: 'Airbnb public calendar screenshots',
  },
};

export function observedRateGuide(bedrooms: SupportedBedrooms): ObservedRateGuide {
  return OBSERVED_RATE_GUIDES[bedrooms];
}

export function publicFromRate(bedrooms: SupportedBedrooms): number {
  return observedRateGuide(bedrooms).minimum;
}

export function formatIdr(amount: number): string {
  return new Intl.NumberFormat('en-ID', {
    style: 'currency',
    currency: 'IDR',
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount);
}
