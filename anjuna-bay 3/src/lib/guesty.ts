/**
 * Guesty booking-engine link builder.
 *
 * Booking itself runs on Guesty (external) — this site never implements its
 * own payment/availability engine (see docs/BUILD.md §0/§12). If a villa has
 * no guestyUnitId yet (content not wired to Guesty), or the base URL isn't
 * configured, bookingLink() returns null and callers MUST fall back to
 * WhatsApp (whatsapp.ts) rather than render a dead "Reserve" button —
 * CLAUDE.md rule 3: Reserve + WhatsApp reachable, CTAs never dead.
 */

const BASE_URL = import.meta.env.PUBLIC_GUESTY_BOOKING_URL ?? '';

export interface BookingLinkOptions {
  checkIn?: string; // ISO date YYYY-MM-DD
  checkOut?: string;
  guests?: number;
}

export function bookingLink(
  guestyUnitId: string | null,
  opts: BookingLinkOptions = {}
): string | null {
  if (!guestyUnitId || !BASE_URL) return null;

  let url: URL;
  try {
    url = new URL(BASE_URL);
  } catch {
    // Malformed env value — fail closed to the WhatsApp fallback rather than
    // ship a broken link.
    return null;
  }

  url.searchParams.set('listingId', guestyUnitId);
  if (opts.checkIn) url.searchParams.set('checkIn', opts.checkIn);
  if (opts.checkOut) url.searchParams.set('checkOut', opts.checkOut);
  if (opts.guests) url.searchParams.set('guests', String(opts.guests));

  return url.toString();
}

/** True when a villa has enough configuration to attempt a live Guesty link. */
export function hasGuestyBooking(guestyUnitId: string | null): boolean {
  return Boolean(guestyUnitId && BASE_URL);
}
