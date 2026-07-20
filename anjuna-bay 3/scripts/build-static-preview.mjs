/**
 * scripts/build-static-preview.mjs
 *
 * Builds a STANDALONE, dependency-free HTML preview of the site's visual
 * direction (Aman New York reference: video/image-first hero, alternating
 * 2-card and full-width feature blocks, a centered "Peace of Aman"-style
 * text moment, warm restrained palette).
 *
 * This is NOT the real site output — the real site is the Astro project in
 * src/ (see docs/BUILD.md). It exists only because the authoring sandbox
 * has no npm-registry or CDN access (see delivery notes), so `astro build`
 * cannot run here. This script has zero dependencies beyond Node's stdlib,
 * inlines every image as a base64 data URI, and uses only system font
 * stacks — so the output HTML renders identically with no network at all,
 * and can be opened/screenshotted directly.
 *
 * Run: node scripts/build-static-preview.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const PH = path.join(ROOT, 'src/assets/placeholders');

function b64(file) {
  return readFileSync(path.join(PH, file)).toString('base64');
}
function dataUri(file) {
  return `data:image/jpeg;base64,${b64(file)}`;
}

const img = {
  homeHero: dataUri('home-hero.jpg'),
  sunset: dataUri('villa-sunset-hero.jpg'),
  sunset1: dataUri('villa-sunset-1.jpg'),
  reef: dataUri('villa-card-generic.jpg'),
  thePlace: dataUri('the-place-hero.jpg'),
  surf: dataUri('experience-surf.jpg'),
  wellness: dataUri('experience-wellness.jpg'),
  dining: dataUri('experience-dining.jpg'),
  celebrations: dataUri('experience-celebrations.jpg'),
  journal: dataUri('journal-generic.jpg'),
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Anjuna Bay — Design Preview (static, no build tools)</title>
<style>
  :root {
    --sand:#f3eee7; --paper:#faf7f2; --ink:#1c1a17; --muted:#6f6a61;
    --ocean:#2b4c53; --ocean-dark:#1e363b; --clay:#c08a6a; --hairline:#e4ded4;
    --serif: Georgia, 'Times New Roman', serif; /* production: self-hosted Fraunces, see tokens.css */
    --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; /* production: self-hosted Inter */
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--sand); color:var(--ink); font-family:var(--sans); line-height:1.6; }
  h1,h2,h3 { font-family:var(--serif); font-weight:500; margin:0; letter-spacing:-0.01em; }
  a { color:inherit; text-decoration:none; }
  .wrap { max-width:1200px; margin:0 auto; padding:0 24px; }
  .eyebrow { font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--muted); font-weight:600; margin:0 0 10px; }
  .btn-primary { display:inline-flex; align-items:center; justify-content:center; background:var(--ocean); color:var(--paper); padding:13px 28px; font-size:14px; font-weight:500; letter-spacing:.02em; border:none; cursor:pointer; }
  .btn-ghost { display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(250,247,242,.6); color:var(--paper); padding:13px 28px; font-size:14px; font-weight:500; letter-spacing:.02em; background:transparent; }
  .btn-secondary { display:inline-flex; align-items:center; justify-content:center; border:1px solid rgba(28,26,23,.3); color:var(--ink); padding:13px 28px; font-size:14px; font-weight:500; background:transparent; }

  /* ---- header ---- */
  header { position:fixed; top:0; left:0; right:0; z-index:40; background:linear-gradient(to bottom, rgba(20,18,15,.4), transparent); transition:background .3s ease; }
  header.solid { background:rgba(243,238,231,.96); border-bottom:1px solid var(--hairline); }
  .header-inner { display:flex; align-items:center; justify-content:space-between; height:84px; }
  .mark { font-family:var(--serif); font-size:20px; color:var(--paper); }
  header.solid .mark { color:var(--ink); }
  nav.primary { display:flex; gap:32px; }
  nav.primary a { font-size:13px; font-weight:500; letter-spacing:.02em; color:var(--paper); }
  header.solid nav.primary a { color:var(--ink); }
  .header-actions { display:flex; align-items:center; gap:14px; }
  .wa-icon { width:38px; height:38px; border-radius:50%; border:1px solid rgba(250,247,242,.5); display:flex; align-items:center; justify-content:center; color:var(--paper); }
  header.solid .wa-icon { border-color:rgba(28,26,23,.2); color:var(--ink); }

  /* ---- hero ---- */
  .hero { position:relative; height:94vh; min-height:600px; display:flex; align-items:flex-end; overflow:hidden; background:var(--ink); }
  .hero img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .hero::after { content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(20,18,15,.75), rgba(20,18,15,.1) 55%, transparent); }
  .hero-content { position:relative; z-index:2; padding:0 0 90px; color:var(--paper); max-width:640px; }
  .hero-content .eyebrow { color:rgba(250,247,242,.8); }
  .hero-content h1 { font-size:clamp(34px,5vw,64px); line-height:1.06; }
  .hero-content p { font-size:17px; color:rgba(250,247,242,.88); max-width:480px; margin:18px 0 0; }
  .hero-ctas { display:flex; gap:14px; margin-top:32px; flex-wrap:wrap; }

  section { padding:96px 0; }
  .section-tight { padding:64px 0; }
  .statement { max-width:680px; margin:0 auto; text-align:center; }
  .statement p { font-family:var(--serif); font-size:clamp(22px,2.6vw,32px); line-height:1.45; margin:0; }

  /* ---- two-card feature (Aman "Accommodation Overview" pattern) ---- */
  .two-card { display:grid; grid-template-columns:1fr 1fr; gap:2px; background:var(--hairline); }
  .feature-card { background:var(--paper); position:relative; }
  .feature-card img { width:100%; height:420px; object-fit:cover; display:block; }
  .feature-card .fc-body { padding:32px; }
  .feature-card .eyebrow { margin-bottom:10px; }
  .feature-card h3 { font-size:26px; margin-bottom:12px; }
  .feature-card p.copy { font-size:14.5px; color:var(--muted); line-height:1.65; margin:0 0 18px; }

  /* ---- full-width heritage-style block ---- */
  .full-feature { position:relative; height:78vh; min-height:520px; overflow:hidden; }
  .full-feature img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
  .full-feature::after { content:''; position:absolute; inset:0; background:linear-gradient(to top, rgba(20,18,15,.72), rgba(20,18,15,.05) 60%); }
  .full-feature .ff-content { position:relative; z-index:2; height:100%; display:flex; flex-direction:column; justify-content:flex-end; padding-bottom:64px; color:var(--paper); max-width:560px; }
  .full-feature h2 { font-size:clamp(26px,3.4vw,42px); }
  .full-feature p { color:rgba(250,247,242,.85); margin:14px 0 22px; font-size:15px; max-width:460px; }

  /* ---- experiences grid ---- */
  .exp-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:28px; margin-top:44px; }
  .exp-tile img { width:100%; aspect-ratio:4/5; object-fit:cover; }
  .exp-tile h4 { font-size:17px; margin:16px 0 4px; }
  .exp-tile p { font-size:13px; color:var(--muted); margin:0; }

  /* ---- proof stats ---- */
  .proof { display:grid; grid-template-columns:1fr 1fr; gap:40px; align-items:center; }
  .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
  .stat-card { border:1px solid var(--hairline); padding:26px; background:var(--paper); }
  .stat-card .num { font-family:var(--serif); font-size:34px; }
  .stat-card .lab { font-size:13px; color:var(--muted); margin-top:6px; }

  /* ---- book direct band ---- */
  .band { background:var(--ocean); color:var(--paper); padding:72px 0; }
  .band-inner { display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
  .band h2 { font-size:clamp(22px,2.6vw,32px); max-width:420px; }
  .band .eyebrow { color:rgba(250,247,242,.65); }

  /* ---- good to know demo ---- */
  .gtk { border-left:2px solid var(--clay); background:var(--paper); padding:22px 26px; max-width:640px; margin:0 auto; }
  .gtk .eyebrow { color:var(--clay); }
  .gtk p { font-size:14px; line-height:1.65; margin:0; }

  /* ---- footer ---- */
  footer { border-top:1px solid var(--hairline); background:var(--paper); }
  .footer-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:32px; padding:72px 0 48px; }
  .footer-grid .eyebrow { margin-bottom:14px; }
  .footer-grid ul { list-style:none; margin:0; padding:0; }
  .footer-grid li { font-size:13.5px; margin-bottom:9px; color:var(--ink); }
  .footer-bottom { border-top:1px solid var(--hairline); padding:22px 0; display:flex; justify-content:space-between; font-size:12px; color:var(--muted); flex-wrap:wrap; gap:8px; }

  .preview-tag { position:fixed; bottom:16px; right:16px; z-index:50; background:var(--ink); color:var(--paper); font-size:11px; letter-spacing:.05em; padding:8px 14px; border-radius:3px; font-family:var(--sans); opacity:.85; }

  @media (max-width: 860px) {
    nav.primary, .header-actions { display:none; }
    .two-card { grid-template-columns:1fr; }
    .exp-grid { grid-template-columns:repeat(2,1fr); }
    .footer-grid { grid-template-columns:repeat(2,1fr); }
    .proof { grid-template-columns:1fr; }
    section { padding:64px 0; }
  }
</style>
</head>
<body>

<div class="preview-tag">Static design preview — placeholders pending real photography</div>

<header id="header">
  <div class="wrap header-inner">
    <a href="#" class="mark">Anjuna Bay</a>
    <nav class="primary">
      <a href="#villas">Villas</a>
      <a href="#experiences">Experiences</a>
      <a href="#place">The Place</a>
      <a href="#offers">Offers</a>
      <a href="#journal">Journal</a>
      <a href="#about">About</a>
    </nav>
    <div class="header-actions">
      <span class="wa-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.87 9.87 0 0 0 12.04 2Z"/></svg>
      </span>
      <a href="#book" class="btn-primary">Reserve</a>
    </div>
  </div>
</header>

<section class="hero" style="padding:0;">
  <img src="${img.homeHero}" alt="Cliffside pool villa at Anjuna Bay, Uluwatu, at sunset" />
  <div class="wrap hero-content">
    <p class="eyebrow">Anjuna Bay · Thomas Beach, Uluwatu</p>
    <h1>Cliffside pool villas above Thomas Beach.</h1>
    <p>The Uluwatu you came for — the view, the pool, the quiet. Without the Canggu crowds.</p>
    <div class="hero-ctas">
      <a href="#book" class="btn-primary">Reserve</a>
      <a href="#villas" class="btn-ghost">Explore the villas</a>
    </div>
  </div>
</section>

<section class="section-tight">
  <div class="statement">
    <p>Brand-new pool villas a short walk from the sand, on the quiet side of the Bukit — the view and the privacy people come to Uluwatu for.</p>
  </div>
</section>

<section id="villas" style="padding-top:0;">
  <div class="wrap">
    <p class="eyebrow">Stay</p>
    <h2 style="font-size:32px;">The villas</h2>
  </div>
  <div class="two-card" style="margin-top:40px;">
    <div class="feature-card">
      <img src="${img.sunset}" alt="Sunset — 2-Bedroom Cliffside Pool Villa" />
      <div class="fc-body">
        <p class="eyebrow">2-Bedroom · 5-min walk to Thomas Beach</p>
        <h3>Sunset</h3>
        <p class="copy">Wake to the ocean and the sound of the reef. A private pool that faces the afternoon light, and a four-minute walk down to Thomas Beach.</p>
        <a href="#" class="btn-secondary">View villa</a>
      </div>
    </div>
    <div class="feature-card">
      <img src="${img.reef}" alt="Reef — 1-Bedroom Pool Villa" />
      <div class="fc-body">
        <p class="eyebrow">1-Bedroom · 6-min walk to Thomas Beach</p>
        <h3>Reef</h3>
        <p class="copy">A compact, private pool villa built for one couple or a solo long stay — fast wifi, a proper desk, and an easy walk to the reef breaks.</p>
        <a href="#" class="btn-secondary">View villa</a>
      </div>
    </div>
  </div>
</section>

<section id="experiences" style="padding-top:0;">
  <div class="wrap">
    <p class="eyebrow">Do</p>
    <h2 style="font-size:32px;">Experiences</h2>
    <div class="exp-grid">
      <div class="exp-tile">
        <img src="${img.surf}" alt="Surf" />
        <h4>Surf</h4>
        <p>Minutes from Padang Padang, Bingin, Impossibles.</p>
      </div>
      <div class="exp-tile">
        <img src="${img.wellness}" alt="Wellness" />
        <h4>Wellness</h4>
        <p>In-villa massage, sunrise yoga.</p>
      </div>
      <div class="exp-tile">
        <img src="${img.dining}" alt="Dining" />
        <h4>Dining</h4>
        <p>Floating breakfast, a private chef.</p>
      </div>
      <div class="exp-tile">
        <img src="${img.celebrations}" alt="Celebrations" />
        <h4>Celebrations</h4>
        <p>Small weddings on the cliff-front.</p>
      </div>
    </div>
  </div>
</section>

<section id="place" class="full-feature" style="padding:0;">
  <img src="${img.thePlace}" alt="Thomas Beach, Uluwatu" />
  <div class="wrap ff-content">
    <p class="eyebrow" style="color:rgba(250,247,242,.7);">Where you are</p>
    <h2>Five minutes from Thomas Beach, on the quiet side of the Bukit.</h2>
    <p>Uluwatu draws surfers, honeymooners and anyone tired of Canggu's pace — cliffs, reef breaks, and a slower rhythm below the estate.</p>
    <a href="#" class="btn-ghost" style="width:fit-content;">Discover The Place</a>
  </div>
</section>

<section>
  <div class="wrap proof">
    <div>
      <p class="eyebrow">Trusted</p>
      <h2 style="font-size:30px; margin-bottom:14px;">Rated by the people who've stayed</h2>
      <p style="color:var(--muted); font-size:14.5px; max-width:420px;">Guests rate the villas among the best-reviewed on the Bukit — and the on-ground team, named and reachable, is the reason they come back.</p>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="num">4.9★</div><div class="lab">Average guest rating</div></div>
      <div class="stat-card"><div class="num">9.5</div><div class="lab">Staff score, Booking.com</div></div>
    </div>
  </div>
</section>

<section class="band" id="offers">
  <div class="wrap band-inner">
    <div>
      <p class="eyebrow">Book direct</p>
      <h2>Our best available rate, and a transfer on us.</h2>
    </div>
    <a href="#" class="btn-ghost">See the offer</a>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="gtk">
      <p class="eyebrow">Good to know</p>
      <p>Construction continues nearby on the estate, typically 8am–5pm, and Uluwatu's nightlife carries after dark. We'll always tell you which villas are quietest for your dates — honestly, before you book.</p>
    </div>
  </div>
</section>

<section id="journal">
  <div class="wrap">
    <p class="eyebrow">Read</p>
    <h2 style="font-size:32px; margin-bottom:40px;">From the Journal</h2>
    <div class="two-card">
      <div class="feature-card">
        <img src="${img.journal}" alt="Where to stay in Uluwatu if you surf" />
        <div class="fc-body">
          <p class="eyebrow">Surf</p>
          <h3 style="font-size:21px;">Where to stay in Uluwatu if you surf</h3>
          <p class="copy">A short, honest guide to basing yourself near the breaks — without ending up 20 minutes from the water.</p>
        </div>
      </div>
      <div class="feature-card">
        <img src="${img.sunset1}" alt="A honeymoon on the quiet side of the Bukit" />
        <div class="fc-body">
          <p class="eyebrow">Honeymoon</p>
          <h3 style="font-size:21px;">A honeymoon on the quiet side of the Bukit</h3>
          <p class="copy">Cliff views, a private pool, and a short walk to Padang Padang — without the Canggu crowds.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<footer id="about">
  <div class="wrap footer-grid">
    <div>
      <p class="eyebrow">Explore</p>
      <ul>
        <li>The Villas</li><li>Experiences</li><li>The Place</li><li>Offers</li><li>Journal</li><li>About</li>
      </ul>
    </div>
    <div>
      <p class="eyebrow">Contact</p>
      <ul>
        <li>Thomas Beach, Uluwatu</li><li>Pecatu, Bali, Indonesia</li><li>We usually reply within minutes.</li>
      </ul>
    </div>
    <div>
      <p class="eyebrow">Book direct</p>
      <ul>
        <li>Best available rate</li><li>Complimentary airport transfer</li><li>Same villa, direct team</li>
      </ul>
    </div>
    <div>
      <p class="eyebrow">Policies</p>
      <ul>
        <li>Privacy Notice</li><li>Terms</li><li>Accessibility</li><li>Cookie Preferences</li>
      </ul>
    </div>
  </div>
  <div class="wrap footer-bottom">
    <span>© 2026 Anjuna Bay. Independent villa operation.</span>
    <span>Property and investment enquiries → contact us</span>
  </div>
</footer>

<script>
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('solid', window.scrollY > 40);
  });
</script>

</body>
</html>
`;

const outPath = path.join(ROOT, '..', 'anjuna-bay-static-preview.html');
writeFileSync(outPath, html, 'utf-8');
console.log('wrote', outPath, `(${(html.length / 1024).toFixed(0)} KB)`);
