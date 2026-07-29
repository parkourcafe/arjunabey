import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage();
await page.goto(pathToFileURL(process.argv[2]).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const n = Number(process.argv[3]);
const out = await page.evaluate((n) => {
  const p = document.querySelectorAll('.page')[n - 1];
  const body = p.querySelector('.doc-body');
  const rows = [...body.children].map((c) => ({
    tag: c.tagName + '.' + c.className.split(' ')[0],
    h: Math.round(c.getBoundingClientRect().height),
  }));
  return { head: Math.round(p.querySelector('.doc-head').getBoundingClientRect().height), avail: body.clientHeight, content: body.scrollHeight, rows };
}, n);
console.log(JSON.stringify(out, null, 1));
await browser.close();
