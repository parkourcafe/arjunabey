import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../src/pages/api/enquiry';

function requestWith(fields: Record<string, string>): Request {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.set(name, value);
  return new Request('https://arjunabey.vercel.app/api/enquiry', {
    method: 'POST',
    body: form,
  });
}

async function submit(fields: Record<string, string>): Promise<Response> {
  return POST({ request: requestWith(fields) } as Parameters<typeof POST>[0]);
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
