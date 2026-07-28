const { chromium } = require('@playwright/test');
const fs = require('fs');
const OUT = '/tmp/claude-0/-home-user-arjunabey/78c14f09-bd43-591c-a11a-049ef3eb10c2/scratchpad';
const pages = [
  ['/', 'home'],
  ['/villas/', 'villas'],
  ['/villas/sol-1-bedroom-pool-villa/', 'villa-sol'],
  ['/the-place/', 'place'],
  ['/experiences/', 'experiences'],
  ['/offers/', 'offers'],
  ['/journal/', 'journal'],
  ['/about/', 'about'],
  ['/contact/', 'contact'],
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8899/', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => localStorage.setItem('anjuna-consent', 'denied'));
  const report = {};
  for (const [url, name] of pages) {
    await p.goto('http://localhost:8899' + url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1200);
    // trigger scroll reveals
    await p.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(900);
    const dims = await p.evaluate(() => ({ h: document.body.scrollHeight, w: document.body.scrollWidth }));
    // segmented screenshots
    const seg = 1300;
    const n = Math.min(Math.ceil(dims.h / seg), 8);
    for (let i = 0; i < n; i++) {
      await p.evaluate((y) => window.scrollTo(0, y), i * seg);
      await p.waitForTimeout(450);
      await p.screenshot({ path: `${OUT}/${name}-${i}.jpg`, quality: 70, type: 'jpeg' });
    }
    const text = await p.evaluate(() => document.body.innerText);
    const title = await p.title();
    const meta = await p.evaluate(() => {
      const g = (s) => (document.querySelector(s) || {}).content || null;
      return { desc: g('meta[name=description]'), og: g('meta[property="og:image"]'), robots: g('meta[name=robots]') };
    });
    const jsonld = await p.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent)['@type'] || JSON.parse(s.textContent)['@graph']?.map(x => x['@type']); } catch (e) { return 'PARSE_ERR'; } }));
    report[name] = { url, title, meta, jsonld, height: dims.h, segments: n, text };
    console.log('done', name, dims.h, n);
  }
  fs.writeFileSync(OUT + '/report.json', JSON.stringify(report, null, 2));
  // mobile
  const mctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const mp = await mctx.newPage();
  await mp.goto('http://localhost:8899/', { waitUntil: 'domcontentloaded' });
  await mp.evaluate(() => localStorage.setItem('anjuna-consent', 'denied'));
  for (const [url, name] of [['/', 'home'], ['/villas/sol-1-bedroom-pool-villa/', 'villa-sol']]) {
    await mp.goto('http://localhost:8899' + url, { waitUntil: 'networkidle' });
    await mp.waitForTimeout(1200);
    await mp.screenshot({ path: `${OUT}/m-${name}.jpg`, quality: 70, type: 'jpeg' });
  }
  await b.close();
})();
