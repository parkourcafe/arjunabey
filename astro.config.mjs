// astro.config.mjs
// Anjuna Bay — marketing + direct-booking site. Static-first, one on-demand
// endpoint (the enquiry form), booking handled by Guesty (external).
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel/serverless';
// Hosting on Vercel (docs/BUILD.md §14 open decision — resolved). Swap back to
// `netlify()` (from '@astrojs/netlify') if hosting moves to Netlify instead —
// no other change needed.

// Mirrors src/lib/site.ts — the config runs before that module can be imported,
// so the resolution order is repeated here rather than shared. No hardcoded
// domain: Vercel reports where it deployed, so canonical follows whatever
// address is attached to the project.
const SITE_URL = (
  process.env.PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL ??
  'http://localhost:4321'
).replace(/^(?!https?:\/\/)/, 'https://');

// A private prototype until someone deliberately says otherwise.
const IS_PREVIEW = process.env.PUBLIC_SITE_STATUS !== 'production';

export default defineConfig({
  site: SITE_URL,
  output: 'hybrid', // static pages by default; src/pages/api/enquiry.ts opts into server rendering
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    // No sitemap while the site is a preview: publishing one invites the
    // crawlers the noindex header is there to keep out.
    ...(IS_PREVIEW
      ? []
      : [
          sitemap({
            filter: (page) => !page.includes('/book') && !page.includes('/_styleguide'),
          }),
        ]),
    partytown({
      config: { forward: ['dataLayer.push', 'gtag'] }, // offloads GA4/Meta Pixel off the main thread
    }),
  ],
  image: {
    // astro:assets default (Sharp) — do not switch to the no-op passthrough service.
  },
  prefetch: {
    prefetchAll: false, // keep deliberate: prefetch only links marked data-astro-prefetch
  },
});
