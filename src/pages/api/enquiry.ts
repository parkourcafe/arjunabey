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

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400);
  }

  // Honeypot — bots tend to fill every field.
  if (String(form.get('company') ?? '').trim().length > 0) {
    return json({ ok: true }, 200);
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
  const to = import.meta.env.ENQUIRY_TO;
  const from = import.meta.env.ENQUIRY_FROM;

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
