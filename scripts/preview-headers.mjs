/**
 * Adds `X-Robots-Tag: noindex, nofollow` to every response while the site is a
 * preview.
 *
 * A <meta name="robots"> tag only covers HTML. It says nothing about the PDFs,
 * images, JSON or the sitemap a crawler can reach directly, and those are
 * indexable on their own. The header covers everything, which is why ТЗ §2
 * asks for it at the server rather than in the document head.
 *
 * It has to be injected here because @astrojs/vercel emits Build Output API
 * v3, and under that API Vercel ignores the `headers` block in vercel.json —
 * .vercel/output/config.json is the authority. The route is prepended with
 * `continue: true` so it stamps the header and then falls through to the real
 * routing untouched.
 *
 * Runs as part of `npm run build`. When PUBLIC_SITE_STATUS=production it
 * removes the route instead, so publishing is a single variable change.
 */
import { readFile, writeFile } from 'node:fs/promises';

const CONFIG = '.vercel/output/config.json';
const MARKER = 'anjuna-preview-noindex';
const isPreview = process.env.PUBLIC_SITE_STATUS !== 'production';

const raw = await readFile(CONFIG, 'utf8').catch(() => null);
if (!raw) {
  console.error(`[preview-headers] ${CONFIG} not found — run after astro build.`);
  process.exit(1);
}

const config = JSON.parse(raw);
config.routes = (config.routes ?? []).filter((route) => route?.[MARKER] !== true);

if (isPreview) {
  config.routes.unshift({
    [MARKER]: true,
    src: '/(.*)',
    headers: { 'x-robots-tag': 'noindex, nofollow' },
    continue: true,
  });
}

await writeFile(CONFIG, JSON.stringify(config, null, '\t'));
console.log(
  isPreview
    ? '[preview-headers] X-Robots-Tag: noindex, nofollow applied to all routes (preview).'
    : '[preview-headers] production — no noindex header applied.',
);
