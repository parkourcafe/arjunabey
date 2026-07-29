/**
 * render.mjs — turns the document HTML into PDF with the real brand fonts.
 *
 * Chromium is used rather than a PDF library because the documents are styled
 * with the site's own CSS: same tokens, same self-hosted Fraunces / Cormorant
 * Garamond / Inter. Rendering them in a browser is what makes a document sit
 * beside the website and read as the same brand.
 *
 *   node docs/proposal/render.mjs            # all documents
 *   node docs/proposal/render.mjs summary    # one, by filename stem
 */
import { chromium } from 'playwright';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const DIR = path.dirname(new URL(import.meta.url).pathname);
const only = process.argv.slice(2);

const files = (await readdir(DIR))
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !only.length || only.some((o) => f.includes(o)))
  .sort();

if (!files.length) {
  console.error('No matching .html documents in', DIR);
  process.exit(1);
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();

for (const file of files) {
  const src = path.join(DIR, file);
  await page.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });
  // Webfonts are font-display: block; without this the first page can rasterise
  // before Fraunces has loaded and quietly fall back to Georgia.
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);

  // Orientation is a property of the document, not of the renderer — read it
  // off the first .page so portrait reports and landscape decks both work.
  const landscape = await page.evaluate(
    () => !document.querySelector('.page')?.classList.contains('page--portrait'),
  );

  const out = src.replace(/\.html$/, '.pdf');
  await page.pdf({
    path: out,
    format: 'A4',
    landscape,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  const pages = await page.evaluate(() => document.querySelectorAll('.page').length);
  const { size } = await stat(out);
  console.log(
    `${file} → ${path.basename(out)}  ${pages} page(s), ${landscape ? 'landscape' : 'portrait'}, ${Math.round(size / 1024)} KB`,
  );
}

await browser.close();
