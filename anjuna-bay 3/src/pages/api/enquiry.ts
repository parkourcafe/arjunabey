/**
 * POST /api/enquiry — handles EnquiryForm.astro submissions.
 * On-demand (not prerendered) — the one server-rendered route in an
 * otherwise-static site (astro.config.mjs output: 'hybrid').
 *
 * TODO(email-provider): wire EMAIL_API_KEY to the chosen transactional email
 * provider (Resend used here as the reference implementation — swap freely).
 * TODO(crm): optional webhook to a CRM once one is chosen (docs/BUILD.md §14).
 */
export const prerender = false;

import type { APIRoute } from 'astro';

function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_body' }), { status: 400 });
  }

  // Honeypot — bots tend to fill every field.
  if (String(form.get('company') ?? '').trim().length > 0) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }

  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();

  if (!name || !isValidEmail(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'invalid_fields' }), { status: 400 });
  }

  const payload = {
    name,
    email,
    dates: String(form.get('dates') ?? ''),
    guests: String(form.get('guests') ?? ''),
    segment: String(form.get('segment') ?? ''),
    message: String(form.get('message') ?? ''),
  };

  const apiKey = import.meta.env.EMAIL_API_KEY;
  const to = import.meta.env.ENQUIRY_TO || 'stay@anjunabay.com';

  if (apiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'site@anjunabay.com',
          to,
          subject: `Enquiry — ${payload.name}`,
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
    } catch {
      // Email delivery failing shouldn't surface as a 500 to the guest —
      // log server-side (TODO: wire real logging/monitoring) and still
      // acknowledge receipt so they aren't told to retry needlessly.
      console.error('enquiry email delivery failed', { email: payload.email });
    }
  } else {
    // No provider configured yet (fresh checkout / local dev) — do not fail
    // the request; make the gap visible in server logs instead.
    console.warn('EMAIL_API_KEY not configured — enquiry not delivered:', payload);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
