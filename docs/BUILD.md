# Anjuna Bay — Website Build TZ (execution brief for Claude Code / Codex)

**Что это:** исполняемое техзадание на сборку сайта. В отличие от `Website_Build_Spec_EN.md` (референс), здесь — прямой порядок действий и стартовый код: агент может начинать сразу. Спецификация на английском (язык кодовой базы и агента); рамка и примечания — на русском.

**Как запустить:**
- **Claude Code:** положить `CLAUDE.md` в корень репозитория, а этот файл — в `/docs/BUILD.md`. Команда агенту: *“Build the Anjuna Bay site per `docs/BUILD.md`, following `CLAUDE.md`. Start at Milestone M0, stop after each milestone for review.”*
- **Codex (OpenAI):** дать доступ к пустому репозиторию, вставить этот документ как задачу и добавить: *“Implement milestone by milestone; run `pnpm check && pnpm lint && pnpm build` before finishing each.”*
- Открытые зависимости (§14) не блокируют старт: где нет реальных данных — ставим `null` + `TODO`, заглушки, плейсхолдеры. Никогда не выдумываем цены/отзывы/загрузку.

---

## 0. Objective & hard rules

Build a fast, cinematic, Aman-style **marketing + direct-booking** website for **Anjuna Bay** (cliffside pool villas, Thomas Beach, Uluwatu, Bali). Booking runs on **Guesty**; the site drives Reserve + WhatsApp. Static-first, image-led, understated.

**Hard rules (never violate):**
1. **Landmark names, never unit codes** in guest text/URLs (“Sunset — 2-Bedroom Cliffside Pool Villa · 5-min walk to Thomas Beach”, not “B10”).
2. **Rate parity:** never render a public direct price below OTA. Direct wins via member rate + complimentary airport transfer. Never output “book on Airbnb for the best rate”.
3. **Reserve + WhatsApp reachable on every page;** CTAs never dead (Guesty-null → WhatsApp fallback).
4. **Honest “Good to know”** (construction ~8am–5pm, nightlife) on every villa + The Place. Never hide, never over-promise silence.
5. **Guest brand ≠ real estate** (one restrained footer link only).
6. **Never fabricate** prices, reviews, ratings, availability, IDs. Unknown → `null` + `TODO`. The $66 1BR baseline and ~85% occupancy are **unverified** — never shown as fact.
7. **Only `status: "live"` villas** (confirmed mandate) render as bookable.
8. **Tone of Voice** (see `02_Tone_of_Voice_RU.md`): British English, no exclamation marks/CAPS/emoji/empty superlatives.

---

## 1. Stack & dependencies

- **Astro 4** (`output: 'hybrid'`), **TypeScript** strict, **Tailwind CSS**.
- Content in code: **Content Collections** + **MDX** + **Zod**. No CMS.
- Images: `astro:assets` (Sharp) → AVIF/WebP, responsive, LQIP.
- Integrations: `@astrojs/tailwind`, `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/partytown`, host adapter (`@astrojs/netlify` **or** `@astrojs/vercel`).
- Package manager **pnpm**, Node 20+.

```bash
pnpm create astro@latest anjuna-bay -- --template minimal --typescript strict --no-install
cd anjuna-bay
pnpm add -D @astrojs/tailwind tailwindcss @astrojs/mdx @astrojs/sitemap @astrojs/partytown
pnpm add @astrojs/netlify          # or: pnpm add @astrojs/vercel
pnpm add -D eslint prettier prettier-plugin-astro @typescript-eslint/parser vitest @playwright/test
pnpm install
```

**Scripts (`package.json`):**
```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx,.astro",
    "format": "prettier --write .",
    "test": "vitest run"
  }
}
```
**Gate:** `pnpm check && pnpm lint && pnpm build` must pass before any milestone is “done”.

---

## 2. Project structure (create exactly this)

```
anjuna-bay/
├─ astro.config.mjs
├─ tailwind.config.mjs
├─ tsconfig.json
├─ .env.example
├─ CLAUDE.md                      # copy from the package
├─ docs/BUILD.md                  # this file
├─ public/                        # robots.txt, favicons, /images placeholders
├─ src/
│  ├─ styles/{tokens.css, global.css}
│  ├─ lib/{whatsapp.ts, guesty.ts, seo.ts, analytics.ts, walktimes.ts}
│  ├─ content/{config.ts, villas/*.mdx, experiences/*.mdx, journal/*.mdx, offers/*.mdx, pages/*.mdx}
│  ├─ components/{Header,Footer,Hero,SectionHeading,VillaCard,VillaGallery,AvailabilityWidget,
│  │            StickyBookingBar,RateBlock,WalkTimeMap,AmenityList,ReviewList,RatingBadge,
│  │            GoodToKnow,ExperienceTile,OfferCard,JournalCard,EnquiryForm,WhatsAppButton,
│  │            CookieConsent,ImageWithLQIP,SeoHead}.astro
│  ├─ layouts/{BaseLayout,PageLayout}.astro
│  └─ pages/
│     ├─ index.astro
│     ├─ villas/index.astro
│     ├─ villas/[slug].astro
│     ├─ experiences/index.astro  + [slug].astro
│     ├─ the-place.astro
│     ├─ offers/index.astro
│     ├─ journal/index.astro      + [slug].astro
│     ├─ about.astro
│     ├─ contact.astro
│     ├─ book.astro               # noindex
│     ├─ api/enquiry.ts           # prerender=false
│     ├─ privacy.astro, terms.astro, accessibility.astro
│     └─ 404.astro
```

---

## 3. Config (concrete)

**`astro.config.mjs`**
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import partytown from '@astrojs/partytown';
import netlify from '@astrojs/netlify';          // swap for @astrojs/vercel if hosting on Vercel

export default defineConfig({
  site: 'https://anjunabay.com',                  // TODO confirm final domain
  output: 'hybrid',                               // static pages + one on-demand endpoint
  adapter: netlify(),
  integrations: [
    tailwind({ applyBaseStyles: false }),
    mdx(),
    sitemap({ filter: (p) => !p.includes('/book') }),
    partytown({ config: { forward: ['dataLayer.push', 'gtag'] } }),
  ],
});
```

**`tailwind.config.mjs`** (tokens live here + in `tokens.css`)
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f3eee7', paper: '#faf7f2', ink: '#1c1a17',
        muted: '#6f6a61', ocean: '#2b4c53', clay: '#c08a6a', hairline: '#e4ded4',
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],   // display
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], // body/UI
      },
      maxWidth: { content: '1200px' },
      letterSpacing: { tight: '-0.01em' },
    },
  },
  plugins: [],
};
```

**`src/styles/tokens.css`** — same values as CSS vars for non-Tailwind use; import in `BaseLayout`. Self-host + `<link rel="preload">` the two fonts; `font-display: swap`.

**`.env.example`**
```
PUBLIC_WHATSAPP_NUMBER=6281234567890          # TODO real number, digits only
PUBLIC_GUESTY_BOOKING_URL=                     # TODO Guesty booking-engine base URL
EMAIL_API_KEY=                                 # transactional email (e.g. Resend)
ENQUIRY_TO=stay@anjunabay.com
PUBLIC_GA4_ID=
PUBLIC_META_PIXEL_ID=
META_CAPI_TOKEN=
```

---

## 4. Content model — `src/content/config.ts`

```ts
import { defineCollection, z } from 'astro:content';

const seo = z.object({ title: z.string(), description: z.string(), ogImage: z.string().optional() }).partial();

const villas = defineCollection({
  type: 'content',                               // body (MDX) = the villa story
  schema: ({ image }) => z.object({
    landmarkName: z.string(),                     // "Sunset"
    status: z.enum(['live', 'off-plan']).default('off-plan'), // only 'live' is bookable
    bedrooms: z.number().int(),
    bathrooms: z.number().int().optional(),
    view: z.string().default('ocean'),
    sizeSqm: z.number().optional(),
    walkTimes: z.record(z.number()).default({}),  // { thomasBeach: 5, padangPadang: 12 }
    amenities: z.array(z.string()).default([]),
    includes: z.array(z.string()).default([]),    // "airport transfer", "daily housekeeping"
    ratePublic: z.number().nullable().default(null),   // NEVER below OTA; null = show "Enquire"
    freeCancelRate: z.number().nullable().optional(),
    currency: z.string().default('USD'),
    guestyUnitId: z.string().nullable().default(null), // null → CTA falls back to WhatsApp
    rating: z.number().nullable().optional(),
    reviewCount: z.number().nullable().optional(),
    quietForDates: z.boolean().default(false),
    goodToKnow: z.string(),                        // honest construction/nightlife note (required)
    heroImage: image(),
    gallery: z.array(image()).default([]),
    video: z.string().url().nullable().optional(),
    order: z.number().default(0),
    seo: seo.optional(),
  }),
});

const experiences = defineCollection({ type: 'content',
  schema: ({ image }) => z.object({
    category: z.enum(['surf','wellness','dining','celebrations','around-uluwatu']),
    title: z.string(), heroImage: image(), relatedVillas: z.array(z.string()).default([]), seo: seo.optional(),
  }),
});

const journal = defineCollection({ type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(), excerpt: z.string(), heroImage: image(),
    category: z.string(), author: z.string().default('Anjuna Bay'),
    date: z.coerce.date(), relatedVillas: z.array(z.string()).default([]), seo: seo.optional(),
  }),
});

const offers = defineCollection({ type: 'content',
  schema: () => z.object({ title: z.string(), terms: z.string(), segment: z.string(), cta: z.string().default('Reserve'), seo: seo.optional() }),
});

const pages = defineCollection({ type: 'content',
  schema: ({ image }) => z.object({ title: z.string(), heroImage: image().optional(), seo: seo.optional() }),
});

export const collections = { villas, experiences, journal, offers, pages };
```

**Sample villa — `src/content/villas/sunset-2br-cliffside.mdx`:**
```mdx
---
landmarkName: "Sunset"
status: "live"
bedrooms: 2
bathrooms: 2
view: "ocean"
sizeSqm: 180
walkTimes: { thomasBeach: 5, padangPadang: 12 }
amenities: ["private pool", "fast fibre", "workspace", "AC", "daily housekeeping"]
includes: ["airport transfer", "welcome breakfast"]
ratePublic: 210            # TODO confirm vs OTA after Guesty pull — must not be below OTA
freeCancelRate: 230
guestyUnitId: null         # TODO real Guesty listing id
rating: 4.87
reviewCount: 86
quietForDates: true
goodToKnow: "Construction continues nearby on the estate, typically 8am–5pm, and Uluwatu nightlife carries after dark. This villa is among the quieter for most dates — ask us and we'll confirm for yours."
heroImage: "./_images/sunset-hero.jpg"   # TODO real photography
gallery: []
seo:
  title: "Sunset — 2-Bedroom Cliffside Pool Villa, 5-min walk to Thomas Beach | Anjuna Bay"
  description: "A two-bedroom cliffside pool villa above Thomas Beach, Uluwatu — ocean view, private pool, a short walk to the sand."
---

Wake to the ocean and the sound of the reef. Sunset is set into the cliff, with a private
pool that faces the afternoon light and a four-minute walk down to Thomas Beach.
```

---

## 5. Lib utilities (implement)

**`src/lib/whatsapp.ts`**
```ts
const NUMBER = import.meta.env.PUBLIC_WHATSAPP_NUMBER;
export function whatsappLink(o: { villa?: string; checkIn?: string; checkOut?: string } = {}) {
  const p = ['Hello Anjuna Bay,'];
  if (o.villa) p.push(`I'm interested in ${o.villa}.`);
  if (o.checkIn) p.push(`Dates: ${o.checkIn}${o.checkOut ? '–' + o.checkOut : ''}.`);
  return `https://wa.me/${NUMBER}?text=${encodeURIComponent(p.join(' '))}`;
}
```

**`src/lib/guesty.ts`** (returns `null` when it can't build a link → caller falls back to WhatsApp)
```ts
const BASE = import.meta.env.PUBLIC_GUESTY_BOOKING_URL;
export function bookingLink(unitId: string | null, checkIn?: string, checkOut?: string) {
  if (!unitId || !BASE) return null;
  const u = new URL(BASE);
  u.searchParams.set('listingId', unitId);
  if (checkIn)  u.searchParams.set('checkIn', checkIn);
  if (checkOut) u.searchParams.set('checkOut', checkOut);
  return u.toString();
}
```

**`src/lib/seo.ts`** — JSON-LD builders: `lodgingBusiness()`, `vacationRental(villa)`, `article(post)`, `faqPage(items)`, `breadcrumbs(path)`. Return objects to `JSON.stringify` into `<script type="application/ld+json">` inside `SeoHead`.

**`src/lib/analytics.ts`** — no-op until consent. Exposes `initAnalytics()` called only after `CookieConsent` accept; loads GA4 + Meta Pixel via Partytown; exposes `track(event, props)` for `view_villa`, `start_booking`, `whatsapp_click`, `enquiry_submit`. Server-side Meta CAPI proxied by `api/enquiry.ts` / a small function.

**`src/lib/walktimes.ts`** — format `walkTimes` map into labelled rows for `WalkTimeMap`.

---

## 6. Enquiry endpoint — `src/pages/api/enquiry.ts`

```ts
export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const f = await request.formData();
  if (f.get('company')) return new Response('ok');                 // honeypot
  const name = String(f.get('name') ?? '').trim();
  const email = String(f.get('email') ?? '').trim();
  if (!name || !/^[^@]+@[^@]+\.[^@]+$/.test(email))
    return new Response(JSON.stringify({ ok: false, error: 'invalid' }), { status: 400 });

  const payload = { name, email, dates: f.get('dates'), guests: f.get('guests'),
                    segment: f.get('segment'), message: f.get('message') };

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${import.meta.env.EMAIL_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'site@anjunabay.com', to: import.meta.env.ENQUIRY_TO,
      subject: `Enquiry — ${name}`, text: JSON.stringify(payload, null, 2) }),
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
```
Enhance later: rate-limit, branded auto-reply, optional CRM webhook, Meta CAPI event.

---

## 7. Components — contracts

Build as Astro components; hydrate only interactive ones as islands (`client:visible`).

- **Header** — nav (Villas · Experiences · The Place · Offers · Journal · About) + `Reserve` + WhatsApp; transparent over hero, condenses on scroll; mobile drawer keeps Reserve+WhatsApp visible.
- **Footer** — page index, villa index by bedrooms, contact + WhatsApp, book-direct block, newsletter (double opt-in), guest social, utility links, one restrained “Investment enquiries” link.
- **Hero** `{ media, headline, sub?, primaryCta, secondaryCta }` — full-bleed; video muted/playsinline/poster; pause under `prefers-reduced-motion`.
- **VillaCard** `{ villa }` — image, landmark name, “N-Bedroom Pool Villa”, walk-time, “from $X / night” (or “Enquire” if `ratePublic` null), `RatingBadge`.
- **VillaGallery** `{ images, video? }` — grid + accessible lightbox (keyboard, focus trap).
- **AvailabilityWidget** `{ guestyUnitId }` — Guesty embed or date-picker → `bookingLink()`; if null → WhatsApp CTA.
- **RateBlock** `{ ratePublic, freeCancelRate, includes }` — non-ref + free-cancel side by side; “what’s included”.
- **WalkTimeMap** `{ walkTimes }` — mini map + labelled rows.
- **ReviewList / RatingBadge** — imported reviews only; score + count; never hand-written.
- **GoodToKnow** `{ text }` — calm disclosure card (used on villa + The Place).
- **StickyBookingBar** `{ villa }` (mobile) — “from $X” + Reserve + WhatsApp.
- **EnquiryForm** — posts to `/api/enquiry`; honeypot; inline validation; branded success.
- **CookieConsent** — blocks non-essential tags until accept (EU); persists choice (cookie).
- **SeoHead** `{ title, description, canonical, jsonLd, noindex? }`.
- **WhatsAppButton** `{ villa? }` — uses `whatsappLink()`, tracked.

**Pattern — `src/components/VillaCard.astro`:**
```astro
---
import { Image } from 'astro:assets';
import { whatsappLink } from '../lib/whatsapp';
const { villa } = Astro.props;
const d = villa.data;
const price = d.ratePublic ? `from $${d.ratePublic} / night` : 'Enquire for rates';
const walk = d.walkTimes?.thomasBeach ? `${d.walkTimes.thomasBeach}-min walk to Thomas Beach` : null;
---
<a href={`/villas/${villa.slug}`} class="group block bg-paper border border-hairline">
  <Image src={d.heroImage} alt={`${d.landmarkName} — ${d.bedrooms}-bedroom cliffside pool villa`} widths={[400,800]} class="aspect-[4/3] w-full object-cover" />
  <div class="p-5">
    <h3 class="font-serif text-2xl text-ink">{d.landmarkName}</h3>
    <p class="text-sm text-muted">{d.bedrooms}-Bedroom Pool Villa{walk ? ` · ${walk}` : ''}</p>
    <p class="mt-2 text-sm text-ink">{price}</p>
  </div>
</a>
```

---

## 8. Pages — build order & content

Each page uses `BaseLayout` + `SeoHead`. Villa detail is the priority template; **section order mirrors decision weights** (photos/reviews/price up top):

`gallery → title (landmark + "N-Bedroom Pool Villa · X-min walk to Thomas Beach" + rating) → story (MDX body) → facts & amenities → location & walk-times → rate & terms (free-cancel beside non-ref + AvailabilityWidget) → reviews → GoodToKnow → StickyBookingBar (mobile)`.

`villas/[slug].astro` uses `getStaticPaths()` over `getCollection('villas', v => v.data.status === 'live')`. Home, Villas, Experiences(+subpages), The Place, Offers, Journal(+article), About, Contact, Book(`noindex`, Guesty embed + WhatsApp fallback), utility pages, 404. Full page briefs in `03_Site_Architecture_RU.md`.

---

## 9. SEO, analytics, budgets (must pass)

- **SEO:** unique title/meta per page; canonical; OG/Twitter with real imagery; JSON-LD per template (`LodgingBusiness`+`AggregateRating` home; `VacationRental`/`Product`+`Offer`+`AggregateRating`+`BreadcrumbList` villa; `Article` journal; `FAQPage` contact); `sitemap.xml`; `robots.txt`; clean lowercase landmark URLs; `/book` + embeds `noindex`.
- **Analytics (hard gate):** GA4 + Guesty purchase event, Meta Pixel + Conversions API (server-side), UTM capture, Reserve/WhatsApp click events — all via Partytown **after consent only**. No tags before consent (GDPR/EU).
- **Performance:** Lighthouse ≥ 95 (Perf/SEO/Best/A11y); LCP < 2.5s; CLS < 0.1; INP < 200ms; content-page JS < 100 KB gz; islands only where interactive.
- **Accessibility:** WCAG 2.2 AA — semantic landmarks, visible focus, keyboard nav/lightbox, alt text, ≥4.5:1 contrast (validate ocean/clay on sand), `prefers-reduced-motion`.
- **Security/privacy:** HTTPS/HSTS/CSP; no client secrets; honeypot + rate-limit on form; privacy/cookie pages; data minimisation.

---

## 10. Testing

- **Vitest:** `whatsappLink`, `bookingLink` (null-fallback), `seo` builders, content-schema validity.
- **Playwright:** home→villa→Reserve deep-link; villa→WhatsApp; enquiry submit (200 + branded success); **consent gate blocks tags before accept**; villa with `guestyUnitId:null` shows WhatsApp CTA, not a dead button.
- **Lighthouse CI** budget on home, a villa, a journal article.

---

## 11. Milestones (stop for review after each)

- **M0 — Foundations:** scaffold, config, tokens/fonts, `BaseLayout`, `Header`/`Footer`, `SeoHead`, `CookieConsent`, content schemas, CI + preview deploy. *(Site builds, nav works, consent gate present.)*
- **M1 — Villa engine:** `villas/index` + `villas/[slug]` (gallery, walk-times, RateBlock, GoodToKnow, AvailabilityWidget, StickyBookingBar), `whatsapp.ts`/`guesty.ts`, **analytics wired (post-consent)**. *(One sample `live` villa renders end-to-end; Reserve/WhatsApp work.)*
- **M2 — Brand pages:** Home, The Place, Experiences(+subpages), Offers, About, Contact + `api/enquiry`. *(Enquiry emails; all nav destinations exist.)*
- **M3 — Content & SEO:** Journal + articles, full JSON-LD, sitemap/robots, local-SEO hooks. *(Rich results validate; sitemap correct.)*
- **M4 — Hardening & launch:** perf/a11y to budget, tests green, analytics QA (consent + events + CAPI), 301s, deploy. *(All acceptance criteria pass.)*

---

## 12. Acceptance criteria (Definition of Done)

- [ ] `pnpm check && pnpm lint && pnpm build` pass; Lighthouse ≥ 95 on home/villa/journal.
- [ ] One indexable landmark-URL page per `live` villa; zero unit codes guest-facing; parity respected; no “book on Airbnb” copy.
- [ ] Reserve + WhatsApp on every page; Guesty-null → WhatsApp fallback (no dead CTAs).
- [ ] `GoodToKnow` on every villa + The Place.
- [ ] No fabricated prices/reviews/availability; unknowns `null` + `TODO`; unverified figures never shown as fact.
- [ ] Correct JSON-LD per template; sitemap + robots; `/book` noindex.
- [ ] Consent gate verified: zero non-essential tags pre-consent; documented events fire; Meta CAPI works server-side.
- [ ] WCAG 2.2 AA; tokens-only styling; fonts preloaded; images via `astro:assets`.

---

## 13. i18n readiness
Default EN, no prefix. Keep user-facing strings extractable and routing ready for a future `/ru/` (rising Russian cohort). Do not build RU content now.

## 14. Open dependencies (stub + `TODO`, don't block)
Brand licence & final domain · Guesty booking URL + per-unit IDs + reviews export · final rate ladder (post-Guesty; which units carry a “construction rate”) · confirmed mandate list (which villas go `live`) · real photography · email/CRM/newsletter providers · Google Business Profile eligibility.

## 15. Companion docs
`CLAUDE.md` (working rules) · `03_Site_Architecture_RU.md` (page briefs) · `02_Tone_of_Voice_RU.md` (voice) · `01_Promotion_Strategy_RU.md` (GTM) · `Website_Build_Spec_EN.md` (reference spec).

---

*Build to this order, follow `CLAUDE.md`, write in the brand voice, never invent data. Ship M0 first, then stop for review.*
