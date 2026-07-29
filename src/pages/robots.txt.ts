/**
 * robots.txt, generated rather than a static file in public/.
 *
 * It used to hardcode a sitemap URL under the repository's own name — a brand
 * this site does not present — and to invite crawling of a property we have no
 * approval to publish. Both now follow the site's actual state: while the site
 * is a preview it asks crawlers to stay out entirely and names no sitemap,
 * because in preview no sitemap is emitted (astro.config.mjs).
 */
import type { APIRoute } from 'astro';
import { siteStatus, siteUrl } from '../lib/site';

export const prerender = true;

export const GET: APIRoute = () => {
  const body =
    siteStatus() === 'production'
      ? [
          'User-agent: *',
          'Allow: /',
          'Disallow: /book',
          'Disallow: /api/',
          '',
          `Sitemap: ${siteUrl()}/sitemap-index.xml`,
          '',
        ].join('\n')
      : [
          '# Private prototype — not approved for publication.',
          'User-agent: *',
          'Disallow: /',
          '',
        ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
