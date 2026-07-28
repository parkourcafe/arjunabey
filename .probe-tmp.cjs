const { chromium } = require('@playwright/test');
const OUT = '/tmp/claude-0/-home-user-arjunabey/78c14f09-bd43-591c-a11a-049ef3eb10c2/scratchpad';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8899/', { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.setItem('anjuna-consent', 'denied'));
  await p.reload({ waitUntil: 'networkidle' });
  // scroll slowly and settle
  await p.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y < h; y += 300) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 250)); }
  });
  await p.waitForTimeout(2500);
  // find trust section
  const el = await p.$('text=Rated by the people');
  if (el) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500); await p.screenshot({ path: OUT + '/trust-settled.jpg', quality: 75, type: 'jpeg' }); }
  // check reveal opacities
  const op = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('[class*=reveal], [data-reveal]').forEach((n, i) => {
      const cs = getComputedStyle(n);
      if (parseFloat(cs.opacity) < 0.99) out.push({ i, cls: n.className.toString().slice(0, 60), op: cs.opacity, txt: (n.innerText || '').slice(0, 40) });
    });
    return { total: document.querySelectorAll('[class*=reveal],[data-reveal]').length, faded: out.slice(0, 20) };
  });
  console.log('REVEAL', JSON.stringify(op, null, 1));
  // whatsapp presence
  const wa = await p.evaluate(() => [...document.querySelectorAll('a[href*="wa.me"],a[href*="whatsapp"]')].map(a => ({ href: a.href.slice(0, 90), txt: (a.innerText || a.getAttribute('aria-label') || '').slice(0, 40), vis: a.offsetParent !== null })));
  console.log('WA', JSON.stringify(wa, null, 1));
  // images used
  const imgs = await p.evaluate(() => [...document.querySelectorAll('img')].map(i => ({ src: i.currentSrc.split('/').pop().slice(0, 60), alt: i.alt.slice(0, 70) })));
  console.log('IMGS', JSON.stringify(imgs, null, 1));
  await b.close();
})();
