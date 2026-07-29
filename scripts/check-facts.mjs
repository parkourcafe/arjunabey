/**
 * check:facts — everything on the site that is not yet confirmed by the owner.
 *
 * ТЗ §20 asks for one command that lists every unverified fact, every image
 * whose rights are unconfirmed and every TODO, so the "what we need from the
 * owner" list is generated rather than maintained by hand and quietly going
 * stale. At PUBLIC_SITE_STATUS=production it exits non-zero, so none of it can
 * reach a published site by being forgotten.
 *
 *   npm run check:facts
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const VILLAS = 'src/content/villas';
const ASSETS = 'src/assets/villas';
const LIB = 'src/lib';
const isProduction = process.env.PUBLIC_SITE_STATUS === 'production';

const findings = [];
const add = (category, detail, where) => findings.push({ category, detail, where });

/** Frontmatter values a guest could check and complain about. */
async function checkVillas() {
  const files = (await readdir(VILLAS)).filter((f) => f.endsWith('.mdx'));
  for (const file of files) {
    const raw = await readFile(path.join(VILLAS, file), 'utf8');
    const fm = raw.split('---')[1] ?? '';
    const value = (key) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim();
    const where = `${VILLAS}/${file}`;

    const rate = value('ratePublic');
    if (!rate || rate === 'null') add('rate', 'No published rate — guest cannot self-qualify', where);

    const guesty = value('guestyUnitId');
    if (!guesty || guesty === 'null')
      add('booking', 'No guestyUnitId — booking falls back to Airbnb or enquiry', where);

    if (value('rating') && value('rating') !== 'null')
      add('rating', `Rating ${value('rating')} is OTA-collected, not ours — source must stay named`, where);

    if (value('photographyNote'))
      add('photography', 'Gallery shows another villa of the same type', where);

    if (/TODO/.test(raw)) add('todo', 'TODO left in content', where);
  }
}

/**
 * Image rights. If the photographs came out of the operator's Booking or
 * Airbnb listings, copyright may sit with the operator or the photographer
 * who shot them, not with the property — publishing them on the property's own
 * site is exactly the kind of exposure this meeting is about.
 */
async function checkImageRights() {
  let dirs = [];
  try {
    dirs = await readdir(ASSETS);
  } catch {
    return;
  }
  let unconfirmed = 0;
  for (const dir of dirs) {
    const full = path.join(ASSETS, dir);
    if (!(await stat(full)).isDirectory()) continue;
    const licence = (await readdir(full)).some((f) => /licen[cs]e|rights/i.test(f));
    if (!licence) unconfirmed += (await readdir(full)).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).length;
  }
  if (unconfirmed)
    add(
      'image-rights',
      `${unconfirmed} villa photographs with no rights confirmation on file`,
      ASSETS,
    );
}

/** Contact routes that are configured by variable rather than in content. */
function checkContactChannels() {
  const env = (key) => process.env[key];
  if (!env('PUBLIC_WHATSAPP_NUMBER'))
    add('contact', 'PUBLIC_WHATSAPP_NUMBER unset — no WhatsApp link renders anywhere', '.env');
  if (!env('ENQUIRY_TO') || !env('EMAIL_API_KEY'))
    add('contact', 'ENQUIRY_TO / EMAIL_API_KEY unset — enquiry form renders disabled', '.env');
  if (!env('PUBLIC_SITE_URL'))
    add('site', 'PUBLIC_SITE_URL unset — canonical follows the Vercel deployment URL', '.env');
}

/** TODOs the libraries mark against facts nobody has verified yet. */
async function checkLibraryTodos() {
  for (const file of await readdir(LIB)) {
    if (!file.endsWith('.ts')) continue;
    const raw = await readFile(path.join(LIB, file), 'utf8');
    for (const match of raw.matchAll(/TODO\(([^)]+)\):\s*(.+)/g))
      add('todo', `${match[1]}: ${match[2].trim()}`, `${LIB}/${file}`);
  }
}

await checkVillas();
await checkImageRights();
checkContactChannels();
await checkLibraryTodos();

const byCategory = findings.reduce((acc, f) => {
  (acc[f.category] ??= []).push(f);
  return acc;
}, {});

console.log('\nUNVERIFIED FACTS AND MISSING PERMISSIONS');
console.log('This is the list to take to the owner.\n');

for (const [category, items] of Object.entries(byCategory)) {
  console.log(`${category.toUpperCase()}  (${items.length})`);
  // Villa-level findings repeat across 23 files; show the shape, not 23 lines.
  const sample = items.slice(0, 3);
  for (const item of sample) console.log(`  · ${item.detail}\n      ${item.where}`);
  if (items.length > sample.length) console.log(`  · …and ${items.length - sample.length} more`);
  console.log('');
}

console.log(`${findings.length} item(s) outstanding.`);

if (isProduction && findings.length) {
  console.error('\nPUBLIC_SITE_STATUS=production with unconfirmed facts — refusing to build.');
  process.exit(1);
}
