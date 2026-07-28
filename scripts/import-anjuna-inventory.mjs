import { cp, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const repo = new URL('..', import.meta.url).pathname;
const researchRoot = '/Users/msnigmatullaeva/Documents/actor/anjuna-villa-full-inventory';
const research = JSON.parse(await readFile(join(researchRoot, 'ANJUNA_PUBLIC_INVENTORY_MASTER.json'), 'utf8'));

const approved = [
  ['A1', 'Reef'], ['A2', 'Sol'], ['A3', 'Nalu'], ['A4', 'Marea'], ['A5', 'Sora'],
  ['A6', 'Luma'], ['A7', 'Cove'], ['A8', 'Tide'], ['B1', 'Dune'], ['B2', 'Halo'],
  ['A9', 'Sunset'], ['A10', 'Karang'], ['A11', 'Aruna'], ['A12', 'Selene'],
  ['A13', 'Calma'], ['B5', 'Neru'], ['B7', 'Aster'], ['B8', 'Maris'],
  ['B11', 'Terra'], ['B12', 'Elara'], ['B13', 'Vela'],
  ['A14', 'Horizon'], ['A15', 'Meridian'],
];

const slugify = (value) => value.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-').replaceAll(/^-|-$/g, '');
const yaml = (value) => JSON.stringify(value);
const codeMap = new Map(research.map((row) => [row.unit_code, row]));
const nameMapRows = [];

for (let order = 0; order < approved.length; order += 1) {
  const [code, name] = approved[order];
  const row = codeMap.get(code);
  if (!row) throw new Error(`Missing research row for ${code}`);
  const type = `${row.bedrooms}-bedroom-pool-villa`;
  const slug = `${slugify(name)}-${type}`;
  const sourceDir = join(researchRoot, 'photos', `ANJ-${code}`);
  const assetDir = join(repo, 'src', 'assets', 'villas', slug);
  await mkdir(assetDir, { recursive: true });
  const filenames = ['hero.jpg', 'gallery-01.jpg', 'gallery-02.jpg', 'gallery-03.jpg', 'gallery-04.jpg', 'gallery-05.jpg'];
  for (const filename of filenames) await cp(join(sourceDir, filename), join(assetDir, filename));
  const heroPath = join(assetDir, 'hero.jpg');
  const heroStats = await stat(heroPath);
  if (heroStats.size < 20_000) {
    // Airbnb sometimes exposes its app icon before the listing photos.
    // Never use that service artwork as a villa hero image.
    await cp(join(assetDir, 'gallery-01.jpg'), heroPath);
  }

  const amenities = [
    'Private pool',
    'Fast wifi',
    'Fully equipped kitchen',
    'Air conditioning',
    'Free parking',
    'Safety box',
    ...(row.workspace === true ? ['Dedicated workspace'] : []),
  ];
  const guestType = row.bedrooms === 1 ? 'a couple or solo stay' : row.bedrooms === 2 ? 'two couples, friends or a family' : 'families and groups of up to six';
  const mdx = `---
landmarkName: ${yaml(name)}
status: "live"
bedrooms: ${row.bedrooms}
bathrooms: ${row.bathrooms}
view: "private pool courtyard"
walkTimes:
  thomasBeach: 3
  padangPadang: 5
amenities:
${amenities.map((item) => `  - ${yaml(item)}`).join('\n')}
includes:
  - "Daily housekeeping"
ratePublic: null
currency: "USD"
guestyUnitId: null
rating: ${row.airbnb_rating ?? 'null'}
reviewCount: ${row.airbnb_review_count ?? 'null'}
quietForDates: false
goodToKnow: >
  Daytime construction continues within parts of the Anjuna Bay estate, and
  music from nearby Uluwatu nightlife may sometimes be audible. Ask us about
  the current conditions for your dates before confirming your stay.
heroImage: "../../assets/villas/${slug}/hero.jpg"
gallery:
${filenames.slice(1).map((filename) => `  - "../../assets/villas/${slug}/${filename}"`).join('\n')}
video: null
order: ${order + 1}
seo:
  title: ${yaml(`${name} — ${row.bedrooms}-Bedroom Pool Villa near Thomas Beach | Anjuna Bay`)}
  description: ${yaml(`${name} is a private ${row.bedrooms}-bedroom pool villa at Anjuna Bay, a three-minute walk from Thomas Beach in Uluwatu.`)}
---

${name} is a ${row.bedrooms}-bedroom pool villa arranged for ${guestType}. The
villa pairs a private courtyard pool with an air-conditioned living area, a
full kitchen and daily housekeeping, within a short walk of Thomas Beach.

Rates and availability are confirmed on request while the direct booking
connection is being completed.
`;
  await writeFile(join(repo, 'src', 'content', 'villas', `${slug}.mdx`), mdx);
  nameMapRows.push({
    landmark_name: name,
    slug,
    internal_unit_code: code,
    airbnb_listing_id: row.airbnb_listing_id,
    airbnb_url: row.airbnb_url,
    booking_property_id: row.booking_property_id ?? '',
    booking_com_url: row.booking_com_url ?? '',
    trip_com_hotel_id: row.trip_com_hotel_id ?? '',
    trip_com_url: row.trip_com_url ?? '',
    guesty_listing_id: '',
    publication_status: 'live',
  });
}

const activeSlugs = new Set(nameMapRows.map((row) => `${row.slug}.mdx`));
const legacyFiles = [
  'horizon-3br-estate.mdx',
  'karang-2br-cliffside.mdx',
  'reef-1br-pool.mdx',
  'sunset-2br-cliffside.mdx',
];
const { rm } = await import('node:fs/promises');
for (const file of legacyFiles) {
  if (!activeSlugs.has(file)) await rm(join(repo, 'src', 'content', 'villas', file), { force: true });
}

const headers = Object.keys(nameMapRows[0]);
const csv = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
await writeFile(
  join(repo, 'docs', 'ANJUNA_VILLA_NAME_MAP.csv'),
  [headers.join(','), ...nameMapRows.map((row) => headers.map((key) => csv(row[key])).join(','))].join('\n') + '\n',
);
console.log(JSON.stringify({ imported: nameMapRows.length, assets: nameMapRows.length * 6 }, null, 2));
