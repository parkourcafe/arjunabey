/**
 * scripts/generate-placeholders.mjs
 *
 * Generates tasteful, brand-colored gradient placeholder images so the
 * content collections have real files to validate against before real
 * photography lands (pro photo + drone + vertical video, per
 * 01_Promotion_Strategy_RU.md §5 "Week 1–2"). Each placeholder carries a
 * small, low-opacity "Photography pending" mark so nobody downstream
 * mistakes it for a finished asset — per CLAUDE.md rule: "never [pass] stock
 * [off] as the villa."
 *
 * Run once during setup: `node scripts/generate-placeholders.mjs`
 * Delete this script's output (src/assets/placeholders/) and re-run
 * `pnpm dev` once real images are dropped into src/content collections.
 *
 * Requires `sharp` (already a project dependency — see package.json).
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../src/assets/placeholders');

// Brand palette (mirrors src/styles/tokens.css)
const SAND = '#f3eee7';
const PAPER = '#faf7f2';
const CLAY = '#c08a6a';
const OCEAN = '#2b4c53';
const INK = '#1c1a17';

/** A soft two-stop diagonal gradient plus a subtle "pending" mark. */
function gradientSvg({ w, h, from, to, angle = 135, label }) {
  const rad = (angle * Math.PI) / 180;
  const x2 = 50 + 50 * Math.cos(rad);
  const y2 = 50 + 50 * Math.sin(rad);
  return `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
        <feColorMatrix in="noise" type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.02 0"/>
        <feComposite operator="over" in2="SourceGraphic"/>
      </filter>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" filter="url(#grain)" opacity="0.5"/>
    <text x="${w - 24}" y="${h - 24}" text-anchor="end"
      font-family="Georgia, serif" font-size="${Math.max(12, w * 0.011)}"
      fill="${PAPER}" fill-opacity="0.55" letter-spacing="1">
      ${label}
    </text>
  </svg>`;
}

const PLATES = [
  // slug                 size        gradient                          label
  ['villa-sunset-hero',    1920, 1280, [CLAY, OCEAN], 40, 'Sunset — photography pending'],
  ['villa-sunset-1',       1200, 900,  [OCEAN, INK],  120, 'Sunset — pool, photography pending'],
  ['villa-sunset-2',       1200, 900,  [SAND, CLAY],  60, 'Sunset — interior, photography pending'],
  ['villa-sunset-3',       1200, 900,  [CLAY, SAND],  200, 'Sunset — view, photography pending'],
  ['villa-card-generic',   800, 600,   [OCEAN, CLAY], 100, 'Anjuna Bay — photography pending'],
  ['home-hero',            2400, 1500, [INK, OCEAN],  40,  'Anjuna Bay — photography pending'],
  ['the-place-hero',       2000, 1200, [CLAY, INK],   150, 'Thomas Beach — photography pending'],
  ['journal-generic',      1200, 800,  [SAND, OCEAN], 80,  'Journal — photography pending'],
  ['experience-surf',      1400, 1000, [OCEAN, INK],  70,  'Surf — photography pending'],
  ['experience-wellness',  1400, 1000, [SAND, CLAY],  110, 'Wellness — photography pending'],
  ['experience-dining',    1400, 1000, [CLAY, OCEAN], 30,  'Dining — photography pending'],
  ['experience-celebrations', 1400, 1000, [INK, CLAY], 160, 'Celebrations — photography pending'],
  ['experience-around',    1400, 1000, [OCEAN, SAND], 200, 'Around Uluwatu — photography pending'],
  ['about-hero',           2000, 1200, [OCEAN, INK],  45,  'The Anjuna Story — photography pending'],
];

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const [slug, w, h, [from, to], angle, label] of PLATES) {
    const svg = gradientSvg({ w, h, from, to, angle, label });
    const outPath = path.join(OUT_DIR, `${slug}.jpg`);
    await sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(outPath);
    console.log('wrote', path.relative(process.cwd(), outPath));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
