/**
 * diversify-heroes.mjs — choose each villa's lead photograph so the collection
 * grid reads as a collection.
 *
 * The source catalogue photographs identical unit types identically: several
 * villas ship the same frames, and even where the files differ the framing is
 * near-identical (the same two-storey glass wall, staircase and pool). Left
 * alone the index looks like one villa repeated twenty-three times, which
 * reads as a broken page rather than an estate.
 *
 * This picks, for every villa, the frame from its own gallery that looks least
 * like the frames already chosen for other villas — so pools, courtyards,
 * interiors, walkways and aerials spread across the grid instead of clustering.
 * Every villa still leads with a real photograph of itself; only the choice of
 * frame changes.
 *
 * Similarity is judged on a small perceptual fingerprint (a downsampled colour
 * grid), which is enough to separate "dusk walkway" from "midday pool" without
 * pretending to understand the subject.
 *
 * Idempotent: reads candidates from each villa's `.originals/`, so re-running
 * re-derives the same answer rather than compounding a previous pass.
 *
 * Usage: node scripts/diversify-heroes.mjs [--dry]
 */
import { readdir, copyFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VILLAS = join(ROOT, 'src/assets/villas');
const DRY = process.argv.includes('--dry');

const GRID = 6; // fingerprint resolution (6x6 RGB cells)

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

/** Downsampled RGB grid — a cheap stand-in for "what does this photo look like". */
async function fingerprint(file) {
  const { data } = await sharp(file)
    .resize(GRID, GRID, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return Float64Array.from(data, (v) => v / 255);
}

function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

const villas = (await readdir(VILLAS, { withFileTypes: true }))
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

// Gather every candidate frame per villa, fingerprinted once.
const candidates = new Map();
for (const villa of villas) {
  const dir = join(VILLAS, villa);
  const originals = join(dir, '.originals');
  const source = (await exists(originals)) ? originals : dir;
  const files = (await readdir(source)).filter((f) => /\.jpe?g$/i.test(f));

  const entries = [];
  const seenPrints = new Set();
  for (const file of files) {
    const print = await fingerprint(join(source, file));
    // Skip frames identical to one already collected for this villa.
    const key = Array.from(print, (v) => Math.round(v * 32)).join(',');
    if (seenPrints.has(key)) continue;
    seenPrints.add(key);
    entries.push({ file, print, key });
  }
  candidates.set(villa, entries);
}

// Greedy max-min selection: each villa takes the frame furthest from every
// frame already chosen. Villas with the fewest distinct options choose first,
// so a villa with only one usable frame is never left without a choice.
const order = [...villas].sort(
  (a, b) => candidates.get(a).length - candidates.get(b).length
);

const chosen = new Map();
const takenKeys = new Set();
const takenPrints = [];

for (const villa of order) {
  const options = candidates.get(villa);
  if (options.length === 0) continue;

  const fresh = options.filter((o) => !takenKeys.has(o.key));
  const pool = fresh.length > 0 ? fresh : options; // identical sets: reuse rather than skip

  let best = pool[0];
  let bestScore = -1;
  for (const option of pool) {
    const score =
      takenPrints.length === 0
        ? 0
        : Math.min(...takenPrints.map((p) => distance(option.print, p)));
    if (score > bestScore) {
      bestScore = score;
      best = option;
    }
  }

  chosen.set(villa, best);
  takenKeys.add(best.key);
  takenPrints.push(best.print);
}

for (const villa of villas) {
  const pick = chosen.get(villa);
  if (!pick) continue;
  const dir = join(VILLAS, villa);
  console.log(`${villa.padEnd(34)} ← ${pick.file}`);
  if (DRY) continue;
  for (const base of [join(dir, '.originals'), dir]) {
    if (await exists(join(base, pick.file))) {
      await copyFile(join(base, pick.file), join(base, 'hero.jpg'));
    }
  }
}
console.log(`\n${DRY ? '[dry] ' : ''}Chose ${chosen.size} lead photographs.`);
