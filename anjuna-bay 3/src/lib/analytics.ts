/**
 * Analytics — hard consent gate (CLAUDE.md rule / docs/BUILD.md §9).
 *
 * NOTHING in this file fires a network request on import. `initAnalytics()`
 * must only be called from CookieConsent.astro's accept handler. Before
 * that, `track()` calls are queued in memory and dropped on page unload if
 * consent never arrives — they are NOT sent retroactively without consent.
 *
 * GA4 + Meta Pixel are expected to be loaded via @astrojs/partytown (off the
 * main thread) once consent is granted; this module only defines the event
 * taxonomy and the gate, not the tag-loading snippets themselves (those are
 * inlined in CookieConsent.astro so Partytown can see them at parse time).
 */

export type AnalyticsEvent =
  | 'view_villa'
  | 'start_booking'
  | 'whatsapp_click'
  | 'enquiry_submit';

interface TrackPayload {
  event: AnalyticsEvent;
  villa?: string;
  [key: string]: unknown;
}

let consentGranted = false;
const queue: TrackPayload[] = [];

export function hasConsent(): boolean {
  return consentGranted;
}

/** Called once, from CookieConsent's accept handler — never automatically. */
export function grantConsent(): void {
  consentGranted = true;
  flushQueue();
}

// CookieConsent.astro dispatches this on window after it injects the GA4/Meta
// tags (accept click, or a previously-stored "granted" choice on reload).
// Guarded for SSR: this module's top level also runs during Astro's
// server-side render of any component that imports it, where `window` is
// undefined — only attach the listener in the browser.
if (typeof window !== 'undefined') {
  window.addEventListener('anjuna:consent-granted', () => grantConsent());
}

function flushQueue(): void {
  while (queue.length) {
    const payload = queue.shift();
    if (payload) dispatch(payload);
  }
}

function dispatch(payload: TrackPayload): void {
  const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ ...payload, event: payload.event });
}

/**
 * Records an analytics event. Queues silently pre-consent; the queue is
 * capped so an unconsented long-lived tab can't leak memory.
 */
export function track(event: AnalyticsEvent, extra: Record<string, unknown> = {}): void {
  // Spread `extra` first so a stray `event` key in the caller's payload can
  // never clobber the real event name — the explicit `event` always wins.
  const payload: TrackPayload = { ...extra, event };
  if (!consentGranted) {
    if (queue.length < 50) queue.push(payload);
    return;
  }
  dispatch(payload);
}
