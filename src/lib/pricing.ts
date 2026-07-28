/**
 * Six-month public rate calendar for the owner preview.
 *
 * These are approved asking rates, not live availability. Availability and
 * applicable taxes/fees remain subject to confirmation until Guesty is wired.
 * Dates are parsed at UTC midnight so browser and Bali time zones calculate
 * the same stay.
 */

export type SupportedBedrooms = 1 | 2 | 3;
export type SeasonId = 'high' | 'shoulder' | 'peak' | 'super_peak' | 'low';

export interface Season {
  id: SeasonId;
  label: string;
  start: string;
  end: string;
  minimumStay: number;
  rates: Record<SupportedBedrooms, { weekday: number; weekend: number }>;
}

export interface StayQuote {
  checkIn: string;
  checkOut: string;
  nights: number;
  minimumStay: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  averageNightlyRate: number;
  seasons: SeasonId[];
}

export const PRICING_START = '2026-08-01';
export const PRICING_LAST_NIGHT = '2027-01-31';
export const PRICING_CHECKOUT_MAX = '2027-02-01';

export const SEASONS: Season[] = [
  {
    id: 'high',
    label: 'High season',
    start: '2026-08-01',
    end: '2026-08-31',
    minimumStay: 3,
    rates: {
      1: { weekday: 155, weekend: 170 },
      2: { weekday: 260, weekend: 280 },
      3: { weekday: 365, weekend: 395 },
    },
  },
  {
    id: 'shoulder',
    label: 'Shoulder season',
    start: '2026-09-01',
    end: '2026-12-19',
    minimumStay: 2,
    rates: {
      1: { weekday: 135, weekend: 145 },
      2: { weekday: 230, weekend: 250 },
      3: { weekday: 330, weekend: 355 },
    },
  },
  {
    id: 'peak',
    label: 'Festive peak',
    start: '2026-12-20',
    end: '2026-12-27',
    minimumStay: 5,
    rates: {
      1: { weekday: 180, weekend: 195 },
      2: { weekday: 300, weekend: 325 },
      3: { weekday: 425, weekend: 460 },
    },
  },
  {
    id: 'super_peak',
    label: 'New Year',
    start: '2026-12-28',
    end: '2027-01-03',
    minimumStay: 7,
    rates: {
      1: { weekday: 205, weekend: 220 },
      2: { weekday: 345, weekend: 375 },
      3: { weekday: 490, weekend: 525 },
    },
  },
  {
    id: 'peak',
    label: 'Festive peak',
    start: '2027-01-04',
    end: '2027-01-09',
    minimumStay: 5,
    rates: {
      1: { weekday: 180, weekend: 195 },
      2: { weekday: 300, weekend: 325 },
      3: { weekday: 425, weekend: 460 },
    },
  },
  {
    id: 'low',
    label: 'Low season',
    start: '2027-01-10',
    end: PRICING_LAST_NIGHT,
    minimumStay: 1,
    rates: {
      1: { weekday: 115, weekend: 125 },
      2: { weekday: 190, weekend: 205 },
      3: { weekday: 280, weekend: 300 },
    },
  },
];

const DAY_MS = 86_400_000;

function parseDate(isoDate: string): Date {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) throw new Error('Choose valid arrival and departure dates.');
  return date;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function seasonFor(isoDate: string): Season {
  const season = SEASONS.find(({ start, end }) => isoDate >= start && isoDate <= end);
  if (!season) {
    throw new Error('Rates are currently available from 1 August 2026 to 31 January 2027.');
  }
  return season;
}

function isWeekend(isoDate: string): boolean {
  const day = parseDate(isoDate).getUTCDay();
  return day === 5 || day === 6;
}

export function publicFromRate(bedrooms: SupportedBedrooms): number {
  return Math.min(
    ...SEASONS.flatMap(({ rates }) => [rates[bedrooms].weekday, rates[bedrooms].weekend])
  );
}

export function nightlyRate(
  isoDate: string,
  bedrooms: SupportedBedrooms,
  adjustmentPercent = 0
): number {
  const rates = seasonFor(isoDate).rates[bedrooms];
  const baseRate = isWeekend(isoDate) ? rates.weekend : rates.weekday;
  return Math.round(baseRate * (1 + adjustmentPercent / 100));
}

function standardLengthOfStayDiscount(nights: number): number {
  if (nights >= 28) return 25;
  if (nights >= 14) return 15;
  if (nights >= 7) return 10;
  if (nights >= 3) return 5;
  return 0;
}

function peakLengthOfStayDiscount(nights: number): number {
  if (nights >= 14) return 10;
  if (nights >= 7) return 5;
  return 0;
}

export function calculateStayQuote(options: {
  checkIn: string;
  checkOut: string;
  bedrooms: SupportedBedrooms;
  adjustmentPercent?: number;
}): StayQuote {
  const { checkIn, checkOut, bedrooms, adjustmentPercent = 0 } = options;
  const arrival = parseDate(checkIn);
  const departure = parseDate(checkOut);

  if (checkIn < PRICING_START || checkIn > PRICING_LAST_NIGHT) {
    throw new Error('Choose an arrival date between 1 August 2026 and 31 January 2027.');
  }
  if (checkOut > PRICING_CHECKOUT_MAX) {
    throw new Error('Choose a departure date no later than 1 February 2027.');
  }

  const nights = Math.round((departure.getTime() - arrival.getTime()) / DAY_MS);
  if (nights <= 0) throw new Error('Departure must be after arrival.');

  let subtotal = 0;
  let minimumStay = 1;
  const seasonIds = new Set<SeasonId>();

  for (let index = 0; index < nights; index += 1) {
    const isoDate = toIsoDate(new Date(arrival.getTime() + index * DAY_MS));
    const season = seasonFor(isoDate);
    seasonIds.add(season.id);
    minimumStay = Math.max(minimumStay, season.minimumStay);
    subtotal += nightlyRate(isoDate, bedrooms, adjustmentPercent);
  }

  if (nights < minimumStay) {
    throw new Error(`A minimum stay of ${minimumStay} nights applies to these dates.`);
  }

  const seasons = [...seasonIds];
  const discountPercent = seasons.includes('super_peak')
    ? 0
    : seasons.includes('peak')
      ? peakLengthOfStayDiscount(nights)
      : standardLengthOfStayDiscount(nights);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  return {
    checkIn,
    checkOut,
    nights,
    minimumStay,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    averageNightlyRate: Math.round(total / nights),
    seasons,
  };
}
