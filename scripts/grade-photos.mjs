/**
 * grade-photos.mjs — one consistent cinematic grade across every photograph.
 *
 * Luxury hotel collections read as a single brand because every image goes
 * through the same look, not because each shot is individually pretty. These
 * photos arrive from mixed sources (different cameras, times of day, white
 * balance), so left raw the grid reads as a listings site. The grade is
 * deliberately restrained — it warms and calms the set toward the brand
 * palette (sand / clay / ocean) without inventing detail that isn't in the
 * original frame:
 *
 *   1. gentle desaturation   — drops the over-saturated phone/HDR look
 *   2. warm channel gain     — unifies mixed white balance toward clay
 *   3. lifted blacks         — the low-contrast film response luxury
 *                              photography uses; nothing crushes to pure black
 *   4. faint vignette        — draws the eye into the frame
 *
 * Idempotent by design: the pristine source is kept in `<dir>/.originals/` and
 * every run grades from there, so re-running never compounds the effect.
 *
 * Usage: node scripts/grade-photos.mjs [--dry]
 */
import { readdir, mkdir, copyFile, access } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = [join(ROOT, 'src/assets/villas'), join(ROOT, 'src/assets/placeholders')];
const DRY = process.argv.includes('--dry');

// --- The look ---------------------------------------------------------------
// Calibrated against a dusk exterior: the aim is depth, not brightness. An
// earlier pass lifted the blacks hard and the result read washed-out — the
// opposite of expensive. Contrast is now carried by the gain slope while the
// small negative offset keeps shadows rich without crushing them to zero.
const SATURATION = 0.93; // pull back the HDR/phone punch
const BRIGHTNESS = 1.0; // exposure comes from the curve, not a flat boost
const HUE = 3; // degrees toward warm — neutralises the cold blue cast
const GAIN = [1.09, 1.04, 0.97]; // r, g, b — contrast slope, warm-biased
const OFFSET = [-10, -9, -3]; // keeps blacks deep; blue least so shadows stay natural
const GAMMA = 1.03; // a whisper of lift back into the mids
const VIGNETTE_STRENGTH = 0.22;

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function* walkImages(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // directory absent — nothing to grade
  }
  for (const entry of entries) {
    if (entry.name === '.originals') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walkImages(full);
    else if (/\.(jpe?g|png)$/i.test(entry.name)) yield full;
  }
}

function vignetteFor(width, height) {
  return Buffer.from(
    `<svg width="${width}" height="${height}">
       <defs>
         <radialGradient id="v" cx="50%" cy="48%" r="78%">
           <stop offset="52%" stop-color="#000" stop-opacity="0"/>
           <stop offset="100%" stop-color="#000" stop-opacity="${VIGNETTE_STRENGTH}"/>
         </radialGradient>
       </defs>
       <rect width="${width}" height="${height}" fill="url(#v)"/>
     </svg>`
  );
}

async function grade(file) {
  // Grade from the pristine copy, never from the (possibly graded) file itself.
  const originalsDir = join(dirname(file), '.originals');
  const original = join(originalsDir, basename(file));
  if (!(await exists(original))) {
    await mkdir(originalsDir, { recursive: true });
    await copyFile(file, original);
  }

  const { width, height } = await sharp(original).metadata();

  const toned = await sharp(original)
    .modulate({ saturation: SATURATION, brightness: BRIGHTNESS, hue: HUE })
    .composite([{ input: vignetteFor(width, height), blend: 'over' }])
    .toBuffer();

  const out = await sharp(toned)
    .linear(GAIN, OFFSET)
    .gamma(GAMMA)
    .jpeg({ quality: 88, mozjpeg: true })
    .toBuffer();

  if (!DRY) await sharp(out).toFile(file);
}

let count = 0;
for (const dir of TARGETS) {
  for await (const file of walkImages(dir)) {
    await grade(file);
    count += 1;
    if (count % 25 === 0) console.log(`  ${count}…`);
  }
}
console.log(`${DRY ? '[dry] would grade' : 'Graded'} ${count} photographs.`);
