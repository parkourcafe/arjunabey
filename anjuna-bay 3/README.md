# Anjuna Bay — website (M0/M1 scaffold)

Marketing + direct-booking site for Anjuna Bay villas, Thomas Beach, Uluwatu. Stack: **Astro + Tailwind**, content in code (MDX + Content Collections), booking via **Guesty**, enquiries via **WhatsApp** + a serverless form. Full brief: `docs/BUILD.md`. Working rules: `CLAUDE.md`.

## ⚠️ Before you do anything else

This project was authored in a sandboxed environment with **no access to the npm registry or any CDN** — every file here was hand-written and passed a set of static checks (`scripts/verify-structure.mjs`, plus a standalone TypeScript check on `src/lib/*.ts`), but **`pnpm install` has never actually been run against it, and neither has `astro build`.** Treat this as a careful first draft that needs one real build pass, not as pre-verified.

### First run, in order

```bash
pnpm install
pnpm check     # astro check + tsc --noEmit — expect to fix a handful of small issues
pnpm lint
pnpm build
pnpm dev       # http://localhost:4321
```

Astro's own compiler (`astro check`) will catch anything the static checks couldn't — mismatched prop types across `.astro` component boundaries, template-expression typos, etc. Budget an hour to true it up; nothing here is architecturally in question, but a hand-written multi-file Astro project's first real compile reliably turns up a few nits.

### What's real vs placeholder

- **Real:** all page routes, all components, the content schema (`src/content/config.ts`), the three sample villas (two `live`, one `off-plan` to demonstrate the mandate gate), the WhatsApp/Guesty fallback logic, the consent-gated analytics wiring, the enquiry API route.
- **Placeholder:** every image (`src/assets/placeholders/`) is a generated brand-colored gradient, each labelled "photography pending" — see `scripts/generate-placeholders.mjs`. Swap in real photography (pro + drone + vertical video, per `01_Promotion_Strategy_RU.md` §5) and delete that script's output.
- **Not wired up:** `PUBLIC_GUESTY_BOOKING_URL`, `guestyUnitId`s, `PUBLIC_WHATSAPP_NUMBER`, `EMAIL_API_KEY`, analytics IDs — all empty in `.env.example`. The site is written to degrade gracefully with all of these unset (Reserve buttons fall back to WhatsApp; WhatsApp buttons render nothing rather than a dead link; the enquiry form logs a warning server-side instead of 500ing). Fill in `.env` from the real accounts before launch — see `docs/BUILD.md` §14 for who owns each one.

### Fonts

`src/styles/tokens.css` specifies Fraunces (display) + Inter (body), self-hosted — the `@font-face` block is commented out until real font files land in `public/fonts/`. Until then the CSS fallback stack (Georgia / system-ui) renders, so nothing is blocked on it.

### Scripts in `scripts/`

- `generate-placeholders.mjs` — regenerates the placeholder imagery (needs `sharp`, already a dependency).
- `verify-structure.mjs` — the offline stand-in check used during authoring (import resolution, dead-link scan, brace balance, required-field spot check). Not a replacement for `pnpm check` — run both.
- `build-static-preview.mjs` — builds a zero-dependency, self-contained HTML mockup of the visual direction (used to sanity-check the design before a real build was possible). Not part of the site; safe to delete once you've compared it against the real `pnpm dev` output.

## Deploy

`astro.config.mjs` is set up for Netlify (`@astrojs/netlify`). Swap to `@astrojs/vercel` if hosting there instead — one line. See `docs/BUILD.md` §11/§15.
