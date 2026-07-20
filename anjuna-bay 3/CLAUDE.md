# CLAUDE.md — Anjuna Bay website

Project instructions for Claude Code. Read this before writing any code. Keep it open; follow it over habit.

## What we're building

A brand website for **Anjuna Bay** — new cliffside pool villas at Thomas Beach, Uluwatu (Bali). The design north star is **aman.com**: understated luxury, cinematic full-bleed imagery, generous whitespace, quiet navigation, one calm booking CTA. This is a **marketing + direct-booking site**, not a booking engine — reservations run on **Guesty**; we send guests there and to **WhatsApp**.

One line: *Cliffside pool villas above Thomas Beach — the view, the pool and the quiet people come to Uluwatu for, without the Canggu crowds.*

## Golden rules (do not violate)

1. **Landmark names, never unit codes.** Villas are “Sunset — 2-Bedroom Cliffside Pool Villa · 5-min walk to Thomas Beach”, never “B10” / “2A5” in any guest-facing text or URL.
2. **Rate parity is law.** Never render a public direct price *below* the OTA price. Direct wins via member rates, perks, and a complimentary airport transfer — never a public undercut. Never output the phrase “book on Airbnb for the best rate”.
3. **WhatsApp + Reserve on every screen.** Both are always reachable (header on desktop, sticky on mobile).
4. **Honesty is a feature.** Every villa and `The Place` include a calm **“Good to know”** block disclosing nearby construction (typically 8am–5pm) and Uluwatu nightlife. Never hide it; never over-promise silence.
5. **Guest brand ≠ real estate.** No property-sales content in main nav. Real-estate/investment gets one restrained footer link only.
6. **Never invent facts, prices, reviews, or availability.** Prices, rates, ratings, review text, occupancy, and `guestyUnitId`s come only from content files or the Guesty integration. If a value is unknown, leave the field empty and surface a `TODO` — do not fabricate. Public 1BR baseline ($66) and the ~85% occupancy claim are **unverified** — do not present them as fact.
7. **Only publish villas with a confirmed owner mandate** (`status: "live"` in content). Off-plan/unmandated units must not render as bookable.
8. **Tone of Voice governs all copy.** See `02_Tone_of_Voice_RU.md`. British English spelling. No exclamation marks, CAPS, emoji, or empty superlatives (stunning/breathtaking/luxurious/nestled/paradise).

## Tech stack

- **Astro** (static output, islands for interactivity) + **TypeScript** (strict).
- **Tailwind CSS** via `@astrojs/tailwind`; design tokens as CSS variables + Tailwind theme extension.
- Content in code: **Astro Content Collections** with **MDX** + **Zod** schemas. No CMS.
- Images: `astro:assets` (Sharp) → AVIF/WebP, responsive `srcset`, lazy, LQIP blur-up.
- Integrations: `@astrojs/sitemap`, `@astrojs/mdx`, `@astrojs/partytown` (offload analytics).
- Booking: Guesty booking-engine embed/deep-link. Enquiry: serverless function (Netlify/Vercel) → email.
- Deploy: static host with serverless functions (Netlify or Vercel). Node 20+, package manager **pnpm**.

## Commands

```bash
pnpm install            # install
pnpm dev                # local dev (localhost:4321)
pnpm build              # production build → dist/
pnpm preview            # preview the build
pnpm check              # astro check (types) + tsc --noEmit
pnpm lint               # eslint
pnpm format             # prettier --write
pnpm test               # vitest (unit) + playwright (e2e) if present
```

Always run `pnpm check && pnpm lint && pnpm build` before considering a task done.

## Repo structure

```
src/
  components/        # Reusable .astro/.tsx (VillaCard, Hero, GoodToKnow, WhatsAppButton…)
  layouts/          # BaseLayout.astro, PageLayout.astro
  pages/            # File-based routes (index, villas/, experiences/, journal/, book…)
  content/          # Content collections (villas, experiences, journal, offers, pages)
    config.ts       # Zod schemas — the source of truth for content shape
  styles/           # tokens.css (design tokens), global.css
  lib/              # guesty.ts, whatsapp.ts, seo.ts, analytics.ts, walktimes.ts
  assets/           # Optimised source images/video (processed by astro:assets)
public/             # robots.txt, favicons, static files served as-is
```

## Content model (add content here, not in components)

Schemas live in `src/content/config.ts`. To **add a villa**: create `src/content/villas/{slug}.mdx` with frontmatter:

```yaml
slug: "sunset-2br-cliffside"
landmarkName: "Sunset"
status: "live"                 # only "live" renders as bookable
bedrooms: 2
view: "ocean"
sizeSqm: 180
walkTimes: { thomasBeach: 5, padangPadang: 12 }
amenities: ["private pool", "fast fibre", "workspace", "AC"]
includes: ["airport transfer", "daily housekeeping"]
ratePublic: 210                # number or null; NEVER below OTA
freeCancelRate: 230            # optional flexible rate
guestyUnitId: "GUESTY_ID"      # from Guesty; null → CTA falls back to WhatsApp
rating: 4.87
reviewCount: 86
quietForDates: true
goodToKnow: "…honest construction/nightlife note…"
images: [...]; video: "…"
```

Journal/experiences/offers follow their schemas the same way. **If a required real value is missing, leave it null and add a `TODO:` — never guess.**

## Design tokens (define once in `styles/tokens.css`, reference by role)

- **Type:** display serif (e.g. *Fraunces* or *Cormorant Garamond*, self-hosted) for headings; humanist sans (*Inter*) for body/UI. No system-serif fallback flashes — preload + `font-display: swap`.
  **Status:** Fraunces is real and wired up (`public/fonts/fraunces-latin-600-normal.woff2`, SIL OFL, preloaded in `BaseLayout.astro`) — one static weight (600) only, not the full variable axis. Inter has no licensed file in the repo yet; body/UI intentionally still falls back to the system-ui stack rather than pointing `@font-face` at a file that doesn't exist. TODO(fonts): source the rest of Fraunces' weight range + a real Inter file (self-hosted woff2 or `@fontsource/inter`) and extend `src/styles/tokens.css`.
- **Palette (warm, Aman-like, restrained):**
  - `--sand: #f3eee7` (base surface) · `--paper: #faf7f2` · `--ink: #1c1a17` · `--muted: #6f6a61`
  - accent `--ocean: #2b4c53` *(deep muted teal/ocean)* · secondary `--clay: #c08a6a` *(soft sunset clay)*. Use colour sparingly; neutrals dominate. Tune exact values against the photography.
- **Spacing:** 8px base scale; sections breathe (≥96px vertical rhythm on desktop).
- **Motion:** slow, elegant fades/reveals (200–600ms, ease-out); parallax hero. **Always** honour `prefers-reduced-motion: reduce` (disable transforms/autoplay).
- **Radius/shadow:** minimal. Luxury = restraint, not drop-shadows.

Never hardcode hex in components — use the tokens.

## Images & performance

- All imagery through `astro:assets`; provide meaningful `alt`. Hero video: muted, `playsinline`, poster image, pause on `prefers-reduced-motion`, lazy below the fold.
- Budgets: **Lighthouse ≥ 95** (Perf/SEO/Best/A11y), LCP < 2.5s, CLS < 0.1, JS shipped < 100KB gz on content pages. Ship **zero** client JS on pages that don't need it (Astro islands only where interactive).

## SEO (required on every indexable page)

- Unique `<title>` and meta description with a landmark benefit; canonical; Open Graph/Twitter image.
- JSON-LD per page type: `LodgingBusiness`+`AggregateRating` (home), `VacationRental`/`Product`+`Offer`+`AggregateRating`+`BreadcrumbList` (villa), `Article` (journal), `FAQPage` (contact). Centralise in `lib/seo.ts`.
- `/book` and Guesty embeds are `noindex`. Generate `sitemap.xml`; keep URLs clean and lowercase.

## Analytics & consent (hard gate — no tags before consent)

- GA4 + Guesty purchase event, Meta Pixel + Conversions API, UTM capture, WhatsApp/Reserve click events — all wired through `lib/analytics.ts`, loaded via Partytown **only after** cookie consent (GDPR for EU). No tracking fires without consent.

## Booking / WhatsApp integration rules

- `lib/whatsapp.ts` builds `wa.me` links with a prefilled message (villa landmark name + dates if present). Every villa CTA and the global button use it.
- `lib/guesty.ts` builds booking deep-links from `guestyUnitId` + dates. If `guestyUnitId` is null, the primary CTA gracefully falls back to WhatsApp/Enquiry — never a dead button.

## Accessibility

WCAG 2.2 AA: semantic landmarks, visible focus states, keyboard-navigable menus/lightbox, alt text, ≥4.5:1 body contrast (validate accent-on-sand), reduced-motion support, labelled forms.

## i18n readiness

Default locale English, no prefix. Structure copy so a future `/ru/` (rising Russian cohort) is a routing addition, not a rewrite — keep user-facing strings out of logic where practical.

## Definition of Done (check before you finish a task)

- [ ] `pnpm check && pnpm lint && pnpm build` all pass.
- [ ] No fabricated prices/reviews/availability; unknowns are `null` + `TODO`.
- [ ] Landmark names everywhere; no unit codes; parity respected.
- [ ] WhatsApp + Reserve reachable; CTAs never dead.
- [ ] “Good to know” present on villa + The Place.
- [ ] SEO head + JSON-LD present; page indexable/noindex as intended.
- [ ] Tokens used (no stray hex); reduced-motion honoured; alt text set.
- [ ] Lighthouse ≥ 95 on the changed page.

## Do NOT

- Invent facts, prices, occupancy, or reviews. Undercut OTA public rates. Use unit codes in guest text/URLs. Add real-estate sales to main nav. Fire analytics pre-consent. Add a CMS or heavy client framework. Use empty superlatives or exclamation marks. Ship client JS where a static island isn't needed.

*Companion docs: `03_Архитектура_сайта_RU.md` (IA), `02_Tone_of_Voice_RU.md` (voice), `Website_Build_Spec_EN.md` (full brief/ТЗ), `01_Стратегия_продвижения_RU.md` (GTM).*
