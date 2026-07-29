/**
 * site.ts — the site's own address and publication status, resolved in one
 * place so no page has to guess either.
 *
 * The canonical origin used to be a fallback carrying the repository's name
 * ("arjunabey"), which is not the brand the site presents — it reached
 * canonical URLs, Open Graph tags and structured data. It is now the address
 * the site is actually shown at, overridable by PUBLIC_SITE_URL the moment a
 * real domain is attached.
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

/**
 * The address the owner is being shown. Added in Vercel as an alias alongside
 * the original, so the original keeps working and nothing breaks mid-demo.
 */
const CONFIRMED_URL = 'https://anjunabay.vercel.app';

export function siteUrl(): string {
  const candidate = readEnv('PUBLIC_SITE_URL') || CONFIRMED_URL;
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
