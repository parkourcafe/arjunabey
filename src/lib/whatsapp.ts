/**
 * WhatsApp deep-link builder.
 *
 * WhatsApp is a required, always-reachable CTA (CLAUDE.md rule 3) and the
 * fallback whenever a Guesty booking link can't be built (see guesty.ts).
 * Every villa CTA and the global header/footer button route through this.
 */

export interface WhatsAppOptions {
  /** Villa landmark name, e.g. "Sunset" — never a unit code. */
  villa?: string;
  checkIn?: string; // ISO date (YYYY-MM-DD) or a human string already formatted
  checkOut?: string;
  guests?: number;
}

/**
 * Confirmed for guest use by the owner-side decision, and published on
 * theanjunabay.com. It is the developer's property-sales line rather than a
 * dedicated guest line, so the prefilled message leads with the fact that the
 * sender is asking about a stay — see whatsappPrefilledMessage.
 *
 * Not a secret, so it lives here rather than only in an environment variable:
 * a missing variable would silently remove every WhatsApp link on the site,
 * which is the failure this file exists to prevent. PUBLIC_WHATSAPP_NUMBER
 * still overrides it once a dedicated guest line exists.
 */
const CONFIRMED_NUMBER = '6281322777710';

const RAW_NUMBER = import.meta.env.PUBLIC_WHATSAPP_NUMBER || CONFIRMED_NUMBER;

/** Digits only, per WhatsApp's wa.me link requirements. */
function sanitizeNumber(n: string): string {
  return n.replace(/[^\d]/g, '');
}

export function whatsappNumber(): string | null {
  const digits = sanitizeNumber(RAW_NUMBER);
  return digits.length > 0 ? digits : null;
}

export function whatsappPrefilledMessage(opts: WhatsAppOptions = {}): string {
  // "about a stay" is doing real work: this number also handles property
  // sales, and without it an enquiry about a villa reads as an enquiry about
  // buying one.
  const lines = ['Hello Anjuna Bay, I am asking about a stay.'];
  if (opts.villa) lines.push(`I'm interested in ${opts.villa}.`);
  if (opts.checkIn) {
    lines.push(`Dates: ${opts.checkIn}${opts.checkOut ? ` – ${opts.checkOut}` : ''}.`);
  }
  if (opts.guests) lines.push(`Guests: ${opts.guests}.`);
  return lines.join(' ');
}

/**
 * Builds a wa.me link. Returns null if no number is configured (env not set
 * yet) — callers should hide/disable the WhatsApp CTA rather than link to a
 * broken destination; see CookieConsent-adjacent guidance in CLAUDE.md: never
 * ship a dead CTA silently — a null return is a signal to handle, not ignore.
 */
export function whatsappLink(opts: WhatsAppOptions = {}): string | null {
  const number = whatsappNumber();
  if (!number) return null;
  const text = encodeURIComponent(whatsappPrefilledMessage(opts));
  return `https://wa.me/${number}?text=${text}`;
}
