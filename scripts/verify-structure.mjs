/**
 * scripts/verify-structure.mjs — static sanity checks that DON'T require the
 * Astro compiler or npm registry access (unavailable in the authoring
 * sandbox — see docs/BUILD.md changelog / delivery notes). This is a
 * stand-in for `astro check`, not a replacement — run the real
 * `pnpm check && pnpm lint && pnpm build` once dependencies are installed.
 *
 * Checks:
 *  1. Every relative import/reference in .astro/.ts files resolves to a
 *     real file on disk (catches path typos — the most common class of
 *     error in hand-authored code).
 *  2. Every internal href="/..." used in nav/components maps to a route
 *     that actually exists under src/pages (catches dead links).
 *  3. Braces/tags are balanced per file (a coarse syntax smoke test).
 *  4. Every content .mdx file's frontmatter has the fields the Zod schema
 *     in content/config.ts requires.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const SRC = path.join(ROOT, 'src');

let errors = 0;
let warnings = 0;
let filesChecked = 0;

function walk(dir, exts, cb) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, exts, cb);
    else if (exts.some((e) => entry.endsWith(e))) cb(full);
  }
}

// ---- 1. Relative import/reference resolution -----------------------------
const importRe = /(?:from\s+|import\s*\(?\s*|src=\{?['"])(\.\.?\/[^'"\)\s;]+)['")]?/g;
const astroImportRe = /import\s+.*?from\s+['"](\.\.?\/[^'"]+)['"]/g;

function checkImportsInFile(file) {
  filesChecked++;
  const content = readFileSync(file, 'utf-8');
  const dir = path.dirname(file);
  const re = /import\s+(?:[\s\S]*?)\s+from\s+['"](\.[^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content))) {
    const spec = m[1];
    const resolved = path.resolve(dir, spec);
    const candidates = [
      resolved,
      `${resolved}.ts`,
      `${resolved}.astro`,
      `${resolved}.mdx`,
      `${resolved}.js`,
      `${resolved}.jpg`,
      `${resolved}.png`,
    ];
    if (!candidates.some((c) => existsSync(c))) {
      console.error(`✗ IMPORT NOT FOUND: ${path.relative(ROOT, file)} → "${spec}"`);
      errors++;
    }
  }
}

walk(SRC, ['.astro', '.ts'], checkImportsInFile);

// ---- 2. Internal href="/..." → real route existence ----------------------
const PAGES_DIR = path.join(SRC, 'pages');
const staticRoutes = new Set();
const dynamicPrefixes = [];

function collectRoutes(dir, prefix = '') {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectRoutes(full, `${prefix}/${entry}`);
      continue;
    }
    if (!entry.endsWith('.astro') && !entry.endsWith('.ts')) continue;
    if (entry.startsWith('api')) continue; // API routes aren't page hrefs
    let route = `${prefix}/${entry}`.replace(/\/index\.astro$/, '/').replace(/\.astro$/, '').replace(/\.ts$/, '');
    if (route === '') route = '/';
    if (route.includes('[')) {
      dynamicPrefixes.push(route.split('[')[0]);
    } else {
      staticRoutes.add(route || '/');
    }
  }
}
collectRoutes(PAGES_DIR);
staticRoutes.add('/'); // index.astro

function routeExists(href) {
  const clean = href.split('?')[0].split('#')[0];
  if (clean === '/') return true;
  if (staticRoutes.has(clean) || staticRoutes.has(clean + '/')) return true;
  return dynamicPrefixes.some((p) => clean.startsWith(p));
}

const hrefRe = /href=["']\/(?!\/)([^"'{]*)["']/g;
const STATIC_ASSET_EXT = /\.(svg|ico|png|jpe?g|webp|xml|txt|pdf)$/i;
function checkHrefsInFile(file) {
  const content = readFileSync(file, 'utf-8');
  let m;
  while ((m = hrefRe.exec(content))) {
    const href = `/${m[1]}`;
    if (href.startsWith('/api/')) continue;
    if (STATIC_ASSET_EXT.test(href)) continue; // public/ files, not page routes
    if (!routeExists(href)) {
      console.error(`✗ DEAD LINK: ${path.relative(ROOT, file)} → href="${href}"`);
      errors++;
    }
  }
}
walk(SRC, ['.astro'], checkHrefsInFile);

// ---- 3. Coarse brace/tag balance -----------------------------------------
function checkBalance(file) {
  const content = readFileSync(file, 'utf-8');
  const open = (content.match(/\{/g) || []).length;
  const close = (content.match(/\}/g) || []).length;
  if (open !== close) {
    console.error(`✗ UNBALANCED BRACES: ${path.relative(ROOT, file)} (${open} "{" vs ${close} "}")`);
    errors++;
  }
  const frontmatterFences = (content.match(/^---$/gm) || []).length;
  if (file.endsWith('.astro') && frontmatterFences % 2 !== 0) {
    console.error(`✗ UNCLOSED FRONTMATTER FENCE: ${path.relative(ROOT, file)}`);
    errors++;
  }
}
walk(SRC, ['.astro'], checkBalance);

// ---- 4. Content frontmatter required-field spot check ---------------------
const CONTENT_DIR = path.join(SRC, 'content');
const REQUIRED = {
  villas: ['landmarkName', 'status', 'bedrooms', 'goodToKnow', 'heroImage'],
  experiences: ['category', 'title', 'heroImage'],
  journal: ['title', 'excerpt', 'heroImage', 'date'],
  offers: ['title', 'terms'],
  pages: ['title'],
};

for (const [collection, fields] of Object.entries(REQUIRED)) {
  const dir = path.join(CONTENT_DIR, collection);
  if (!existsSync(dir)) continue;
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.mdx')) continue;
    const content = readFileSync(path.join(dir, entry), 'utf-8');
    for (const field of fields) {
      const re = new RegExp(`^${field}:`, 'm');
      if (!re.test(content)) {
        console.error(`✗ MISSING FIELD "${field}" in ${collection}/${entry}`);
        errors++;
      }
    }
  }
}

// ---- Report -----------------------------------------------------------
console.log(`\nChecked ${filesChecked} .astro/.ts files.`);
if (errors === 0) {
  console.log(`✓ Structural checks passed (0 errors, ${warnings} warnings).`);
  console.log('  Note: this does NOT replace `pnpm check` (real Astro/TS compiler) —');
  console.log('  run that once `pnpm install` has network access to the npm registry.');
} else {
  console.error(`\n${errors} error(s) found.`);
  process.exit(1);
}
