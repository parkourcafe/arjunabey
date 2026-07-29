import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../src/pages/api/enquiry';

function requestWith(fields: Record<string, string>): Request {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  return new Request('https://example.test/api/enquiry', {
    method: 'POST',
    body: form,
  });
}

/**
 * A guest submitting normally: consent given, and long enough after the form
 * rendered to clear the timing trap. Tests that care about those checks
 * override them explicitly.
 */
async function submit(
  fields: Record<string, string>,
  clientAddress?: string,
): Promise<Response> {
  return POST({
    request: requestWith({ consent: 'on', ...fields }),
    clientAddress,
  } as unknown as Parameters<typeof POST>[0]);
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('POST /api/enquiry', () => {
  it('rejects invalid guest details', async () => {
    const response = await submit({ name: '', email: 'not-an-email' });
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'invalid_fields',
    });
  });

  it('refuses to take personal details without consent', async () => {
    const send = vi.spyOn(globalThis, 'fetch');
    const response = await POST({
      request: requestWith({ name: 'Guest', email: 'guest@example.test' }),
    } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'consent_required' });
    expect(send).not.toHaveBeenCalled();
  });

  it('drops submissions sent faster than a person could type', async () => {
    const send = vi.spyOn(globalThis, 'fetch');
    const response = await submit({
      name: 'Guest',
      email: 'guest@example.test',
      renderedAt: String(Date.now()),
    });
    // Answered 200 so a script learns nothing about which check caught it.
    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('rate limits one address without affecting another', async () => {
    vi.stubEnv('EMAIL_API_KEY', 'configured');
    vi.stubEnv('ENQUIRY_TO', 'reservations@example.test');
    vi.stubEnv('ENQUIRY_FROM', 'website@example.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    const guest = { name: 'Guest', email: 'guest@example.test' };
    const statuses: number[] = [];
    for (let i = 0; i < 6; i += 1) {
      statuses.push((await submit(guest, '203.0.113.10')).status);
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);

    // A different guest on a different connection is unaffected.
    expect((await submit(guest, '203.0.113.11')).status).toBe(200);
  });

  it('quietly accepts honeypot submissions without sending', async () => {
    const send = vi.spyOn(globalThis, 'fetch');
    const response = await submit({ company: 'bot-filled-this' });
    expect(response.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it('fails closed when email delivery is not configured', async () => {
    vi.stubEnv('EMAIL_API_KEY', '');
    vi.stubEnv('ENQUIRY_TO', '');
    vi.stubEnv('ENQUIRY_FROM', '');
    const response = await submit({
      name: 'Guest',
      email: 'guest@example.test',
      message: 'Dates in September',
    });
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'service_unavailable',
    });
  });

  it('returns a delivery error when the provider rejects the request', async () => {
    vi.stubEnv('EMAIL_API_KEY', 'configured');
    vi.stubEnv('ENQUIRY_TO', 'reservations@example.test');
    vi.stubEnv('ENQUIRY_FROM', 'website@example.test');
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('', { status: 500 }),
    );
    const response = await submit({
      name: 'Guest',
      email: 'guest@example.test',
      message: 'Dates in September',
    });
    expect(response.status).toBe(502);
  });

  it('acknowledges only a successful provider response', async () => {
    vi.stubEnv('EMAIL_API_KEY', 'configured');
    vi.stubEnv('ENQUIRY_TO', 'reservations@example.test');
    vi.stubEnv('ENQUIRY_FROM', 'website@example.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 200 }),
    );
    const response = await submit({
      name: 'Guest',
      email: 'guest@example.test',
      message: 'Dates in September',
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
