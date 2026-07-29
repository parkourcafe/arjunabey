/**
 * POST /api/enquiry — handles EnquiryForm.astro submissions.
 * On-demand (not prerendered) — the one server-rendered route in an
 * otherwise-static site (astro.config.mjs output: 'hybrid').
 *
 * The endpoint fails closed until the email provider and verified sender are
 * configured. It must never acknowledge delivery when no message was sent.
 */
export const prerender = false;

import type { APIRoute } from 'astro';

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

function json(body: object, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Rate limit, in memory. A serverless instance is short-lived and there may be
 * several at once, so this is not a hard guarantee — it is enough to stop one
 * script hammering a form on a villa site, which is the realistic threat.
 * Move to a shared store if this ever needs to be exact.
 */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;
const MIN_FILL_MS = 3_000;
const recentByIp = new Map<string, number[]>();

function overRateLimit(ip: string): boolean {
  const now = Date.now();
  const hits = (recentByIp.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recentByIp.set(ip, hits);
  // Unbounded growth would be its own denial of service.
  if (recentByIp.size > 5_000) recentByIp.clear();
  return hits.length > RATE_LIMIT;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  // Honeypot — bots tend to fill every field. Answered with 200 so a script
  // cannot learn which field gave it away.
  if (String(form.get('company') ?? '').trim().length > 0) {
    return json({ ok: true }, 200);
  }

  // Nobody reads a form and composes an enquiry in under three seconds.
  const renderedAt = Number(form.get('renderedAt') ?? 0);
  if (renderedAt && Date.now() - renderedAt < MIN_FILL_MS) {
    return json({ ok: true }, 200);
  }

  let ip = '';
  try {
    ip = clientAddress ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  } catch {
    // clientAddress can throw depending on how the route is rendered.
    ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  }
  // Deliberately not rate-limited when the address is unknown: bucketing every
  // such request together would let one script lock out real guests. The
  // honeypot, the timing trap and the consent requirement still apply.
  if (ip && overRateLimit(ip)) {
    return json({ ok: false, error: 'rate_limited' }, 429);
  }

  // Personal data is not collected without agreement (ТЗ §4).
  if (!form.get('consent')) {
    return json({ ok: false, error: 'consent_required' }, 400);
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  if (!name || name.length > 100 || email.length > 254 || !isValidEmail(email)) {
    return json({ ok: false, error: 'invalid_fields' }, 400);
  }

  const payload = {
    name,
    email,
    dates: String(form.get('dates') ?? '').slice(0, 100),
    guests: String(form.get('guests') ?? '').slice(0, 20),
    segment: String(form.get('segment') ?? '').slice(0, 100),
    message: String(form.get('message') ?? '').slice(0, 5_000),
  };

  const apiKey = import.meta.env.EMAIL_API_KEY;
  // Destination and sender have confirmed defaults so that only the API key —
  // the one genuine secret — has to be set in the hosting dashboard. Resend's
  // shared onboarding sender needs no domain verification, which is what lets
  // this work before the brand has a domain of its own.
  // TODO(owner): move both to the brand domain once DNS exists.
  const to = import.meta.env.ENQUIRY_TO || 'saidalarust@gmail.com';
  const from = import.meta.env.ENQUIRY_FROM || 'Anjuna Bay <onboarding@resend.dev>';

  if (!apiKey || !to || !from) {
    return json({ ok: false, error: 'service_unavailable' }, 503);
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: payload.email,
        subject: `Website enquiry — ${payload.name}`,
        text: [
          `Name: ${payload.name}`,
          `Email: ${payload.email}`,
          `Dates: ${payload.dates}`,
          `Guests: ${payload.guests}`,
          `Segment: ${payload.segment}`,
          '',
          payload.message,
        ].join('\n'),
      }),
    });
    if (!response.ok) throw new Error(`email_provider_${response.status}`);
  } catch {
    console.error('enquiry email delivery failed');
    return json({ ok: false, error: 'delivery_failed' }, 502);
  }

  return json({ ok: true }, 200);
};
