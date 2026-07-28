// tailwind.config.mjs
// Design tokens for Anjuna Bay. Values mirror src/styles/tokens.css (CSS custom
// properties) — the two must stay in sync. Palette/type direction: understated,
// Aman-inspired luxury. See docs/BUILD.md §3 and 02_Tone_of_Voice_RU.md.

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      screens: {
        // 320px phones are still in use; below this the header drops its
        // 'Menu' label so the wordmark keeps its clearance.
        xs: '360px',
      },
      colors: {
        sand: '#f3eee7', // base surface — the dominant neutral
        paper: '#faf7f2', // card/section surface, slightly lifted off sand
        ink: '#1c1a17', // primary text
        muted: '#6f6a61', // secondary text, captions
        ocean: '#2b4c53', // primary accent — deep muted teal (CTAs, links, icons)
        'ocean-dark': '#1e363b', // hover/active state for ocean
        clay: '#c08a6a', // secondary accent — soft sunset clay (sparing use only)
        hairline: '#e4ded4', // dividers, borders — never a heavy rule
      },
      fontFamily: {
        // Self-hosted in production (see src/styles/tokens.css @font-face).
        // Fallback stack chosen to degrade gracefully if font files are missing.
        serif: ['"Fraunces"', 'Georgia', '"Times New Roman"', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        // Editorial scale — generous display sizes, restrained body. Positive
        // tracking on display type: light serifs need air between letters to
        // read as composed rather than condensed.
        display: ['clamp(2.75rem, 6.4vw, 6rem)', { lineHeight: '1.04', letterSpacing: '0.005em' }],
        h1: ['clamp(2rem, 3.5vw, 3rem)', { lineHeight: '1.15', letterSpacing: '0.005em' }],
        h2: ['clamp(1.5rem, 2.5vw, 2.25rem)', { lineHeight: '1.2', letterSpacing: '0.01em' }],
        h3: ['1.375rem', { lineHeight: '1.35', letterSpacing: '0.01em' }],
        eyebrow: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.2em' }],
      },
      maxWidth: {
        content: '1200px',
        prose: '65ch',
      },
      spacing: {
        section: '6rem', // 96px — desktop vertical rhythm floor (docs/BUILD.md §9)
        'section-lg': '8rem',
      },
      borderRadius: {
        DEFAULT: '2px', // luxury = restraint; never rounded-heavy
        sm: '1px',
      },
      boxShadow: {
        none: 'none',
        subtle: '0 1px 2px rgba(28,26,23,0.04)', // the only shadow allowed — near-invisible
      },
      transitionTimingFunction: {
        elegant: 'cubic-bezier(0.22, 1, 0.36, 1)', // slow ease-out for reveals/fades
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
    },
  },
  plugins: [],
};
