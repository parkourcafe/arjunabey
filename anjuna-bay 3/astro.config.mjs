// astro.config.mjs
// Anjuna Bay — marketing + direct-booking site. Static-first, one on-demand
// endpoint (the enquiry form), booking handled by Guesty (external).
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import vercel from '@astrojs/vercel';
// Hosting on Vercel (docs/BUILD.md §14 open decision — resolved). Swap back to
// `netlify()` (from '@astrojs/netlify') if hosting moves to Netlify instead —
// no other change needed.

export default defineConfig({
  site: 'https://anjunabay.com', // TODO: confirm final domain (docs/BUILD.md §14)
  output: 'hybrid', // static pages by default; src/pages/api/enquiry.ts opts into server rendering
  adapter: vercel(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap({
      filter: (page) => !page.includes('/book') && !page.includes('/_styleguide'),
    }),
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
