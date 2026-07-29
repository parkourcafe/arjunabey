/**
 * site.ts — the site's own address and publication status, resolved in one
 * place so no page has to guess either.
 *
 * WHY THERE IS NO HARDCODED DOMAIN HERE. The brand name in the repository
 * ("arjunabey") is not the brand the site presents, and it used to be baked
 * into canonical URLs, Open Graph tags and structured data as a fallback. The
 * platform already knows where it deployed the site, so we ask it rather than
 * assert an answer: add a domain in Vercel and canonical follows it, with no
 * code change and no stale brand left in the markup.
 *
 * Resolution order:
 *   1. PUBLIC_SITE_URL                  — set this once a real domain exists
 *   2. VERCEL_PROJECT_PRODUCTION_URL    — the project's production alias
 *   3. VERCEL_URL                       — this specific deployment
 *   4. localhost                        — local development only
 */

/** `preview` = a private prototype. `production` = approved by the owner. */
export type SiteStatus = 'preview' | 'production';

function readEnv(key: string): string | undefined {
  // Vercel's own variables are build-time only, so they live on process.env
  // rather than import.meta.env. Both are read: PUBLIC_* is inlined by Astro.
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key];
  if (fromMeta) return fromMeta;
  if (typeof process !== 'undefined' && process.env) return process.env[key];
  return undefined;
}

function withProtocol(host: string): string {
  return /^https?:\/\//.test(host) ? host : `https://${host}`;
}

export function siteUrl(): string {
  const candidate =
    readEnv('PUBLIC_SITE_URL') ??
    readEnv('VERCEL_PROJECT_PRODUCTION_URL') ??
    readEnv('VERCEL_URL') ??
    'http://localhost:4321';
  return withProtocol(candidate).replace(/\/$/, '');
}

/**
 * Defaults to `preview`. The site presents a property the owner has not yet
 * approved us to publish, so being indexable has to be something someone turns
 * on deliberately — not something that happens because a variable was never
 * set.
 */
export function siteStatus(): SiteStatus {
  return readEnv('PUBLIC_SITE_STATUS') === 'production' ? 'production' : 'preview';
}

/** In preview nothing is indexable, whatever an individual page asks for. */
export function isIndexable(pageWantsIndex: boolean): boolean {
  return siteStatus() === 'production' && pageWantsIndex;
}
