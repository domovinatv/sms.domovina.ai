/**
 * Branded HTML + SVG assets for otp.domovina.ai.
 *
 * Colors mirror the parent domovina.ai brand: Croatian tricolour
 * (red #FF0000, white #FFFFFF, navy #002F6C) on a white surface, with
 * #5A6570 for muted body text. Font stack matches the parent web app.
 */

const TITLE = "DOMOVINA.ai — Provjera broja telefona";
const DESCRIPTION =
  "Potvrdite svoj broj telefona slanjem jednog SMS-a. Besplatno, bez čekanja, bez registracije.";
const OG_ALT = "DOMOVINA.ai — provjera broja telefona SMS-om";
const SITE_NAME = "DOMOVINA.ai";

export const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
<defs>
<linearGradient id="croFlagVertical" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#FF0000"/><stop offset="33.3%" stop-color="#FF0000"/>
<stop offset="33.3%" stop-color="#FFFFFF"/><stop offset="66.6%" stop-color="#FFFFFF"/>
<stop offset="66.6%" stop-color="#002F6C"/><stop offset="100%" stop-color="#002F6C"/>
</linearGradient>
</defs>
<rect width="512" height="512" rx="32" fill="white"/>
<path d="M72 64H248C354.071 64 440 149.929 440 256C440 362.071 354.071 448 248 448H72V64Z" fill="url(#croFlagVertical)"/>
<path d="M168 160H248C301.019 160 344 202.981 344 256C344 309.019 301.019 352 248 352H168V160Z" fill="white"/>
<g stroke="#002F6C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<line x1="205" y1="205" x2="295" y2="225"/>
<line x1="295" y1="225" x2="285" y2="285"/>
<line x1="285" y1="285" x2="205" y2="307"/>
<line x1="205" y1="307" x2="205" y2="205"/>
<line x1="205" y1="205" x2="245" y2="256"/>
<line x1="295" y1="225" x2="245" y2="256"/>
<line x1="285" y1="285" x2="245" y2="256"/>
<line x1="205" y1="307" x2="245" y2="256"/>
</g>
<g fill="#002F6C">
<circle cx="205" cy="205" r="10"/>
<circle cx="295" cy="225" r="10"/>
<circle cx="205" cy="307" r="10"/>
<circle cx="285" cy="285" r="10"/>
<circle cx="245" cy="256" r="14"/>
</g>
</svg>`;

export const OG_IMAGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#FFFFFF"/>
<rect x="0" y="0" width="400" height="6" fill="#FF0000"/>
<rect x="400" y="0" width="400" height="6" fill="#FFFFFF"/>
<rect x="800" y="0" width="400" height="6" fill="#002F6C"/>
<rect x="0" y="624" width="400" height="6" fill="#FF0000"/>
<rect x="400" y="624" width="400" height="6" fill="#FFFFFF"/>
<rect x="800" y="624" width="400" height="6" fill="#002F6C"/>
<g transform="translate(290, 110) scale(0.625)">
<defs>
<linearGradient id="croFlag" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#FF0000"/><stop offset="33.3%" stop-color="#FF0000"/>
<stop offset="33.3%" stop-color="#FFFFFF"/><stop offset="66.6%" stop-color="#FFFFFF"/>
<stop offset="66.6%" stop-color="#002F6C"/><stop offset="100%" stop-color="#002F6C"/>
</linearGradient>
</defs>
<path d="M72 64H248C354.071 64 440 149.929 440 256C440 362.071 354.071 448 248 448H72V64Z" fill="url(#croFlag)"/>
<path d="M168 160H248C301.019 160 344 202.981 344 256C344 309.019 301.019 352 248 352H168V160Z" fill="white"/>
<g stroke="#002F6C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<line x1="205" y1="205" x2="295" y2="225"/>
<line x1="295" y1="225" x2="285" y2="285"/>
<line x1="285" y1="285" x2="205" y2="307"/>
<line x1="205" y1="307" x2="205" y2="205"/>
<line x1="205" y1="205" x2="245" y2="256"/>
<line x1="295" y1="225" x2="245" y2="256"/>
<line x1="285" y1="285" x2="245" y2="256"/>
<line x1="205" y1="307" x2="245" y2="256"/>
</g>
<g fill="#002F6C">
<circle cx="205" cy="205" r="10"/>
<circle cx="295" cy="225" r="10"/>
<circle cx="205" cy="307" r="10"/>
<circle cx="285" cy="285" r="10"/>
<circle cx="245" cy="256" r="14"/>
</g>
</g>
<text x="600" y="450" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="56" font-weight="800" letter-spacing="3">
<tspan fill="#002F6C">DOMOVINA</tspan><tspan fill="#FF0000">.ai</tspan>
</text>
<text x="600" y="510" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="32" font-weight="600" fill="#002F6C">
Provjera broja telefona
</text>
<text x="600" y="555" text-anchor="middle" font-family="system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="22" fill="#5A6570" letter-spacing="0.5">
Potvrdite broj jednim SMS-om — besplatno i bez čekanja
</text>
</svg>`;

const HEADER_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="40" height="40" aria-hidden="true">
<defs>
<linearGradient id="hdrFlag" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="#FF0000"/><stop offset="33.3%" stop-color="#FF0000"/>
<stop offset="33.3%" stop-color="#FFFFFF"/><stop offset="66.6%" stop-color="#FFFFFF"/>
<stop offset="66.6%" stop-color="#002F6C"/><stop offset="100%" stop-color="#002F6C"/>
</linearGradient>
</defs>
<rect width="512" height="512" rx="32" fill="white"/>
<path d="M72 64H248C354.071 64 440 149.929 440 256C440 362.071 354.071 448 248 448H72V64Z" fill="url(#hdrFlag)"/>
<path d="M168 160H248C301.019 160 344 202.981 344 256C344 309.019 301.019 352 248 352H168V160Z" fill="white"/>
<g stroke="#002F6C" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
<line x1="205" y1="205" x2="295" y2="225"/><line x1="295" y1="225" x2="285" y2="285"/>
<line x1="285" y1="285" x2="205" y2="307"/><line x1="205" y1="307" x2="205" y2="205"/>
<line x1="205" y1="205" x2="245" y2="256"/><line x1="295" y1="225" x2="245" y2="256"/>
<line x1="285" y1="285" x2="245" y2="256"/><line x1="205" y1="307" x2="245" y2="256"/>
</g>
<g fill="#002F6C">
<circle cx="205" cy="205" r="10"/><circle cx="295" cy="225" r="10"/>
<circle cx="205" cy="307" r="10"/><circle cx="285" cy="285" r="10"/>
<circle cx="245" cy="256" r="14"/>
</g>
</svg>`;

interface HomePageOptions {
  /** Public origin without trailing slash, e.g. https://otp.domovina.ai */
  origin: string;
}

export function renderHomePage({ origin }: HomePageOptions): string {
  const safeOrigin = origin || "https://otp.domovina.ai";
  const ogImage = `${safeOrigin}/og-image.svg`;

  return `<!doctype html>
<html lang="hr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />

<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}" />
<link rel="canonical" href="${safeOrigin}/" />

<meta property="og:type" content="website" />
<meta property="og:locale" content="hr_HR" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${TITLE}" />
<meta property="og:description" content="${DESCRIPTION}" />
<meta property="og:url" content="${safeOrigin}/" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:type" content="image/svg+xml" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${OG_ALT}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${TITLE}" />
<meta name="twitter:description" content="${DESCRIPTION}" />
<meta name="twitter:image" content="${ogImage}" />
<meta name="twitter:image:alt" content="${OG_ALT}" />

<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="${SITE_NAME}" />
<link rel="apple-touch-icon" href="/icon.svg" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<meta name="theme-color" content="#002F6C" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "${TITLE}",
  "url": "${safeOrigin}/",
  "description": "${DESCRIPTION}",
  "inLanguage": "hr",
  "applicationCategory": "SecurityApplication",
  "operatingSystem": "Any",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
  "publisher": {
    "@type": "Organization",
    "name": "${SITE_NAME}",
    "logo": {
      "@type": "ImageObject",
      "url": "${safeOrigin}/icon.svg"
    }
  }
}
</script>

<style>
:root {
  --navy: #002F6C;
  --red: #FF0000;
  --muted: #5A6570;
  --border: #E1E5EA;
  --surface: #F5F7F9;
  --bg: #FFFFFF;
  --success: #2E8540;
  --warning: #B45309;
  --danger: #B42318;
  font-family: system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--navy); }
body { min-height: 100vh; display: flex; flex-direction: column; }
.tricolor { display: flex; height: 6px; }
.tricolor span { flex: 1; }
.tricolor .red { background: var(--red); }
.tricolor .white { background: var(--bg); }
.tricolor .navy { background: var(--navy); }
header { padding: 1.6rem 1.25rem; border-bottom: 1px solid var(--border); }
.brand { display: flex; align-items: center; gap: .65rem; max-width: 38rem; margin: 0 auto; }
.brand .word { font-weight: 800; font-size: 1.25rem; letter-spacing: .04em; }
.brand .word .accent { color: var(--red); }
main { flex: 1; padding: 2.5rem 1.25rem; max-width: 38rem; margin: 0 auto; width: 100%; }
/* When the QR is on screen the card grows wider so QR + code can sit
   side-by-side without wrapping. */
main.has-qr { max-width: 46rem; }
h1 { font-size: 1.75rem; line-height: 1.2; margin: 0 0 .4rem; font-weight: 800; }
.lede { color: var(--muted); margin: 0 0 1.75rem; font-size: 1rem; line-height: 1.5; }
.btn-primary {
  width: 100%; background: var(--navy); color: #FFFFFF; border: 0;
  padding: .95rem 1.4rem; font-size: 1.05rem; font-weight: 600;
  border-radius: .5rem; cursor: pointer; font-family: inherit;
  transition: background .15s;
}
.btn-primary:hover:not(:disabled) { background: #001D4A; }
.btn-primary:disabled { background: #8A95A5; cursor: not-allowed; }
.card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: .75rem; padding: 1.6rem; margin-top: 1.5rem;
}
.card .instructions { margin: 0 0 1rem; color: var(--muted); font-size: .95rem; }
.code-display { text-align: center; padding: 1rem 0 1.2rem; }
.code-display .code {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 2.6rem; letter-spacing: .15em; font-weight: 800;
  color: var(--navy); margin: 0;
}
.code-display .target {
  margin: .5rem 0 0; font-size: .95rem; color: var(--muted);
}
.code-display .target strong { color: var(--navy); font-weight: 700; }
.actions { display: flex; gap: .5rem; margin: .25rem 0 1rem; }
.action-btn {
  flex: 1; padding: .8rem .9rem; font-size: .95rem; font-weight: 600;
  border-radius: .45rem; cursor: pointer; text-decoration: none;
  text-align: center; font-family: inherit; border: 1px solid var(--navy);
  background: var(--bg); color: var(--navy); transition: background .15s;
}
.action-btn:hover { background: var(--surface); }
.action-btn.primary { background: var(--navy); color: #FFFFFF; }
.action-btn.primary:hover { background: #001D4A; }
.hint { font-size: .85rem; color: var(--muted); margin: 0 0 1rem; line-height: 1.45; }
.card-top { display: flex; flex-direction: column; }
.card-top.has-qr {
  /* Desktop: QR left, code + actions right, vertically centered so the
     column heights line up without forcing scroll on shorter laptops. */
  flex-direction: row; align-items: center; gap: 1.5rem;
  margin-bottom: .25rem;
}
.card-top.has-qr .code-side { flex: 1; min-width: 0; }
.card-top.has-qr .code-display { text-align: left; padding: 0 0 .8rem; }
.card-top.has-qr .actions { margin: 0; }
.qr-wrap {
  display: flex; flex-direction: column; align-items: center; gap: .6rem;
  margin: .25rem 0 1rem; padding: .9rem; background: var(--bg);
  border: 1px solid var(--border); border-radius: .5rem;
}
.card-top.has-qr .qr-wrap { margin: 0; flex: 0 0 auto; }
.qr-wrap img { width: 200px; height: 200px; display: block; }
.qr-wrap .qr-caption {
  font-size: .85rem; color: var(--muted); text-align: center; margin: 0;
  line-height: 1.4;
}
.card-top.has-qr .qr-wrap .qr-caption { display: none; }
.progress {
  position: relative; height: 3px; background: var(--border);
  border-radius: 2px; overflow: hidden; margin: .9rem 0 .25rem;
}
.progress::before {
  content: ""; position: absolute; top: 0; left: 0; height: 100%;
  width: 35%; background: var(--navy); border-radius: 2px;
  animation: progress-slide 1.4s ease-in-out infinite;
}
@keyframes progress-slide {
  0%   { transform: translateX(-100%); }
  50%  { transform: translateX(150%); }
  100% { transform: translateX(330%); }
}
.success-overlay {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0,47,108,.55);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
  animation: fade-in .2s ease-out;
}
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.success-modal {
  background: var(--bg); border-radius: .9rem; padding: 2rem 1.75rem 1.5rem;
  max-width: 22rem; width: 100%; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.3);
  animation: success-pop .45s cubic-bezier(.34,1.56,.64,1);
}
@keyframes success-pop {
  0%   { transform: scale(.6); opacity: 0; }
  100% { transform: scale(1);  opacity: 1; }
}
.success-modal .check {
  width: 64px; height: 64px; margin: 0 auto .75rem;
  border-radius: 50%; background: var(--success);
  display: flex; align-items: center; justify-content: center;
  animation: check-pop .5s cubic-bezier(.34,1.56,.64,1) .1s both;
}
@keyframes check-pop {
  0%   { transform: scale(0); }
  100% { transform: scale(1); }
}
.success-modal .check svg { width: 36px; height: 36px; }
.success-modal .check svg path {
  stroke-dasharray: 36; stroke-dashoffset: 36;
  animation: check-draw .35s ease-out .35s forwards;
}
@keyframes check-draw { to { stroke-dashoffset: 0; } }
.success-modal h2 { margin: 0 0 .35rem; font-size: 1.35rem; color: var(--navy); }
.success-modal .sub { margin: 0 0 1.2rem; color: var(--muted); font-size: .95rem; line-height: 1.45; }
.success-modal .sub strong { color: var(--navy); }
.success-modal .actions-row {
  display: flex; gap: .5rem; justify-content: center; flex-wrap: wrap;
}
.success-modal .ok-btn, .success-modal .home-btn {
  padding: .75rem 1.4rem; font-size: 1rem; font-weight: 600;
  border-radius: .45rem; cursor: pointer; font-family: inherit;
  text-decoration: none; display: inline-block;
}
.success-modal .ok-btn {
  background: var(--bg); color: var(--navy); border: 1px solid var(--navy);
}
.success-modal .ok-btn:hover { background: var(--surface); }
.success-modal .home-btn {
  background: var(--navy); color: #FFFFFF; border: 1px solid var(--navy);
}
.success-modal .home-btn:hover { background: #001D4A; }
.rate-banner {
  background: #FDF1E0; border: 1px solid #E8B96E; color: #6B3F05;
  padding: .6rem .85rem; border-radius: .45rem; font-size: .9rem;
  margin: 0 0 1rem; line-height: 1.4;
}
.history { margin-top: 2rem; }
.history-title {
  font-size: .85rem; margin: 0 0 .55rem; color: var(--muted);
  font-weight: 700; text-transform: uppercase; letter-spacing: .05em;
}
.history-list {
  list-style: none; padding: 0; margin: 0;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--bg);
}
.history-list li {
  display: flex; justify-content: space-between; align-items: center;
  padding: .55rem .8rem; border-bottom: 1px solid var(--border);
  font-size: .9rem; gap: .6rem;
}
.history-list li:last-child { border-bottom: 0; }
.history-time {
  color: var(--muted); font-size: .82rem;
  font-variant-numeric: tabular-nums;
}
.history-detail {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: .85rem; color: var(--navy);
}
.history-badge {
  font-size: .72rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .04em; padding: .2rem .5rem; border-radius: 1rem;
  white-space: nowrap;
}
.history-badge.verified { background: #E0F1E5; color: var(--success); }
.history-badge.pending  { background: #FDF1E0; color: var(--warning); }
.history-badge.expired  { background: #F8E2E0; color: var(--danger); }
.history-note {
  font-size: .78rem; color: var(--muted); margin: .55rem 0 0;
  display: flex; justify-content: space-between; gap: .5rem;
  align-items: center; flex-wrap: wrap;
}
.history-clear {
  background: none; border: 0; color: var(--navy); cursor: pointer;
  padding: 0; font-family: inherit; font-size: inherit;
  text-decoration: underline; font-weight: 600;
}
.divider { border: 0; border-top: 1px solid var(--border); margin: 1rem 0; }
.row { display: flex; justify-content: space-between; padding: .45rem 0; font-size: .92rem; border-bottom: 1px solid var(--border); }
.row:last-child { border: 0; }
.row .label { color: var(--muted); }
.row .value { color: var(--navy); font-weight: 600; }
.status-pending { color: var(--warning); }
.status-verified { color: var(--success); font-weight: 700; }
.status-expired { color: var(--danger); }
footer {
  padding: 1.25rem; border-top: 1px solid var(--border);
  color: var(--muted); font-size: .85rem; text-align: center;
}
footer a { color: var(--navy); text-decoration: none; font-weight: 600; }
footer a:hover { text-decoration: underline; }
.hidden { display: none; }

/* Mobile compaction — tuned to fit iPhone 17 Pro Chrome viewport
   (≈402×720 usable after address + bottom bars) without scrolling once
   verification is active. */
@media (max-width: 480px) {
  /* Let footer sit directly under main instead of being pushed to the
     viewport bottom by the flex:1 stretch — keeps the page compact when
     content is shorter than the viewport. */
  body { min-height: 0; }
  main { flex: none; }
  header { padding: .75rem 1rem; }
  .brand .word { font-size: 1.1rem; }
  main { padding: 1.1rem 1rem; }
  h1 { font-size: 1.3rem; margin-bottom: .25rem; }
  .lede { font-size: .9rem; margin-bottom: 1rem; line-height: 1.4; }
  .btn-primary { padding: .8rem 1.2rem; font-size: 1rem; }
  .card { padding: 1rem; margin-top: 1rem; border-radius: .6rem; }
  .card .instructions { font-size: .85rem; margin-bottom: .5rem; line-height: 1.35; }
  .code-display { padding: .35rem 0 .55rem; }
  .code-display .code { font-size: 2rem; letter-spacing: .12em; }
  .code-display .target { font-size: .85rem; margin-top: .2rem; }
  .actions { margin: .15rem 0 .55rem; gap: .4rem; }
  .action-btn { padding: .65rem .7rem; font-size: .9rem; }
  .hint { font-size: .78rem; margin-bottom: .55rem; line-height: 1.35; }
  .divider { margin: .55rem 0; }
  .row { padding: .3rem 0; font-size: .85rem; }
  footer { padding: .75rem 1rem; font-size: .78rem; }
}
</style>
</head>
<body>
<div class="tricolor"><span class="red"></span><span class="white"></span><span class="navy"></span></div>
<header>
  <div class="brand">
    ${HEADER_LOGO_SVG}
    <div class="word">DOMOVINA<span class="accent">.ai</span></div>
  </div>
</header>
<main>
  <h1>Provjera broja telefona</h1>
  <p class="lede">${DESCRIPTION}</p>
  <div id="rateBanner" class="rate-banner hidden" role="status" aria-live="polite"></div>
  <button id="startBtn" class="btn-primary" onclick="start()">Pokreni provjeru</button>
  <div id="card" class="card hidden" aria-live="polite">
    <p class="instructions" id="instructions">Pošaljite SMS koji sadrži ovaj kod s telefona koji želite potvrditi:</p>
    <div class="card-top" id="cardTop">
      <div id="qrWrap" class="qr-wrap hidden">
        <img id="qr" alt="QR kod za pokretanje SMS aplikacije na mobitelu" />
        <p class="qr-caption">Skenirajte QR kod mobitelom — otvorit će se SMS aplikacija s unaprijed unesenim brojem i kodom. Samo pošaljite poruku.</p>
      </div>
      <div class="code-side">
        <div class="code-display">
          <p class="code" id="code">––––––</p>
          <p class="target">na broj <strong id="num"></strong></p>
        </div>
        <div class="actions" id="actions">
          <a id="smsLink" class="action-btn primary" href="#">Otvori SMS aplikaciju</a>
          <button class="action-btn" type="button" id="copyBtn" onclick="copyCode()">Kopiraj kod</button>
        </div>
        <p class="hint" id="hint">Na mobitelu pritisnite „Otvori SMS aplikaciju" — vaš SMS klijent otvorit će se s unaprijed unesenim brojem i kodom. Samo pošaljite poruku.</p>
      </div>
    </div>
    <div class="progress" id="progress" aria-hidden="true"></div>
    <hr class="divider" />
    <div class="row"><span class="label">Status</span><span class="value" id="status">u tijeku</span></div>
    <div class="row"><span class="label">Istječe u</span><span class="value" id="exp">—</span></div>
    <div class="row"><span class="label">Provjereni broj</span><span class="value" id="phone">—</span></div>
  </div>
  <section id="historySection" class="history hidden" aria-label="Povijest verifikacija s ovog uređaja">
    <h2 class="history-title">Vaše provjere s ovog uređaja</h2>
    <ul class="history-list" id="historyList"></ul>
    <div class="history-note">
      <span>Pohranjeno lokalno u ovom pregledniku.</span>
      <button type="button" class="history-clear" onclick="clearHistory()">Obriši povijest</button>
    </div>
  </section>
</main>
<div id="successOverlay" class="success-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="successTitle">
  <div class="success-modal">
    <div class="check" aria-hidden="true">
      <svg viewBox="0 0 36 36" fill="none">
        <path d="M9 18.5l6 6 12-12" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h2 id="successTitle">Broj potvrđen</h2>
    <p class="sub">Vaš broj <strong id="successPhone">—</strong> je uspješno potvrđen.</p>
    <div class="actions-row">
      <button type="button" class="home-btn" onclick="restart()">Nova provjera</button>
    </div>
  </div>
</div>
<footer>
  Dio platforme <a href="https://domovina.ai">DOMOVINA.ai</a> — besplatni servis bez registracije.
</footer>
<div class="tricolor"><span class="red"></span><span class="white"></span><span class="navy"></span></div>
<script>
let id, timer, code, num, audioCtx, lastStatus = "pending";

const STATUS_LABEL = { pending: "u tijeku", verified: "potvrđeno", expired: "isteklo" };

// ── Local history + soft rate limit ────────────────────────────────────────
// Stored only in this browser's localStorage so the user can see every
// verification they have started from this device. Acts as both a UX
// affordance and the source for the client-side 60s rate limit (server
// enforces nothing — this is a soft, dismissable nudge).
const HISTORY_KEY = "otp.history.v1";
const HISTORY_CAP = 50;          // hard storage cap
const HISTORY_VISIBLE = 10;       // visible row cap on the landing page
const RATE_LIMIT_MS = 60_000;     // 1 verification / minute from same browser
let countdownTimer = null;

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveHistory(arr) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(arr.slice(0, HISTORY_CAP))); } catch {}
}
function pushHistory(entry) {
  const arr = loadHistory();
  arr.unshift(entry); // newest first
  saveHistory(arr);
  renderHistory();
}
function patchHistory(entryId, patch) {
  const arr = loadHistory();
  const i = arr.findIndex(function(x) { return x.id === entryId; });
  if (i < 0) return;
  arr[i] = Object.assign({}, arr[i], patch);
  saveHistory(arr);
  renderHistory();
}
function clearHistory() {
  if (!confirm("Obrisati povijest provjera s ovog uređaja?")) return;
  try { localStorage.removeItem(HISTORY_KEY); } catch {}
  renderHistory();
  refreshRateLimit();
}
function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
  });
}
function fmtTime(ms) {
  const d = new Date(ms);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return d.toLocaleString("hr-HR", sameDay
    ? { timeStyle: "short" }
    : { dateStyle: "short", timeStyle: "short" });
}
function deriveStatus(entry, now) {
  if (entry.verified_at) return "verified";
  if (entry.expires_at && entry.expires_at < now) return "expired";
  return "pending";
}
function renderHistory() {
  const section = document.getElementById("historySection");
  const list = document.getElementById("historyList");
  const arr = loadHistory();
  if (arr.length === 0) { section.classList.add("hidden"); return; }
  section.classList.remove("hidden");
  const now = Date.now();
  const visible = arr.slice(0, HISTORY_VISIBLE);
  list.innerHTML = visible.map(function(e) {
    const status = deriveStatus(e, now);
    const label = STATUS_LABEL[status] || status;
    const detail = e.verified_phone ? e.verified_phone : ("kod " + e.code);
    return '<li>' +
      '<span><span class="history-time">' + escapeHtml(fmtTime(e.created_at)) + '</span> · ' +
      '<span class="history-detail">' + escapeHtml(detail) + '</span></span>' +
      '<span class="history-badge ' + status + '">' + label + '</span>' +
      '</li>';
  }).join("");
}

// Soft rate limit: based on the newest entry's created_at. The user can
// always bypass by clearing localStorage — that's fine, it's a nudge to
// prevent accidental double-taps, not a security control.
function nextAllowedAt() {
  const arr = loadHistory();
  if (arr.length === 0) return 0;
  return (arr[0].created_at || 0) + RATE_LIMIT_MS;
}
function refreshRateLimit() {
  const btn = document.getElementById("startBtn");
  const banner = document.getElementById("rateBanner");
  // Only manage the start button (it's hidden once a verification is active).
  if (!btn || btn.classList.contains("hidden")) {
    banner.classList.add("hidden");
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    return;
  }
  const remaining = Math.ceil((nextAllowedAt() - Date.now()) / 1000);
  if (remaining <= 0) {
    btn.disabled = false;
    btn.textContent = "Pokreni provjeru";
    banner.classList.add("hidden");
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    return;
  }
  btn.disabled = true;
  btn.textContent = "Pričekajte " + remaining + " s";
  banner.classList.remove("hidden");
  banner.textContent = "Već ste pokrenuli provjeru. Nova provjera moguća za " + remaining + " s.";
  if (!countdownTimer) countdownTimer = setInterval(refreshRateLimit, 1000);
}

// Init AudioContext under the user gesture (start click) so the success
// chime is allowed to play later when poll() flips to verified.
function ensureAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume();
  } catch {}
}

function playSuccessChime() {
  if (!audioCtx) return;
  try {
    const t0 = audioCtx.currentTime;
    // Two ascending sine tones — pleasant "ding" pattern, no audio asset.
    [[660, 0, 0.18], [880, 0.12, 0.32]].forEach(function(spec) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = spec[0];
      gain.gain.setValueAtTime(0, t0 + spec[1]);
      gain.gain.linearRampToValueAtTime(0.18, t0 + spec[1] + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + spec[1] + spec[2]);
      osc.connect(gain).connect(audioCtx.destination);
      osc.start(t0 + spec[1]);
      osc.stop(t0 + spec[1] + spec[2] + 0.05);
    });
  } catch {}
}

function showSuccess(phone) {
  document.getElementById("successPhone").textContent = phone || "—";
  document.getElementById("successOverlay").classList.remove("hidden");
  playSuccessChime();
  if (navigator.vibrate) { try { navigator.vibrate([60, 40, 120]); } catch {} }
}

function closeSuccess() {
  document.getElementById("successOverlay").classList.add("hidden");
}

// Full reload to drop the verified session: clears id/timer/audio ctx and
// resets the page to its initial "Pokreni provjeru" state.
function restart() {
  if (timer) clearInterval(timer);
  location.href = "/";
}

// Desktop = hover-capable, fine pointer. iPhone/Android Chrome report
// (hover: none) + (pointer: coarse), so this reliably swaps the UI to
// "scan QR with phone" on desktop and "open SMS app" on mobile.
const IS_DESKTOP = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

async function start() {
  // Soft rate-limit guard — the button is normally disabled during cooldown,
  // but cover the keyboard/programmatic invocation path too.
  if (Date.now() < nextAllowedAt()) { refreshRateLimit(); return; }
  const btn = document.getElementById("startBtn");
  btn.disabled = true;
  btn.textContent = "Pokrećem…";
  ensureAudio();
  lastStatus = "pending";
  try {
    const r = await fetch("/api/verifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ purpose: "web" })
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const v = await r.json();
    id = v.id; code = v.code; num = v.gateway_number;
    // Record the attempt in localStorage immediately so the user sees it
    // in the history list even if they close the tab mid-verification.
    pushHistory({
      id: v.id,
      code: v.code,
      gateway_number: v.gateway_number,
      created_at: Date.parse(v.created_at) || Date.now(),
      expires_at: Date.parse(v.expires_at) || (Date.now() + 10 * 60 * 1000),
      verified_at: null,
      verified_phone: null,
      purpose: v.purpose || null,
    });
    document.getElementById("code").textContent = code;
    document.getElementById("num").textContent = num;
    document.getElementById("exp").textContent = new Date(v.expires_at).toLocaleTimeString("hr-HR");
    // Server-built body so the same friendly copy (incl. "vrati se u browser")
    // is shared between the mobile SMS link and the desktop QR payload.
    document.getElementById("smsLink").href =
      "sms:" + encodeURIComponent(num) + "?body=" + encodeURIComponent(v.sms_body);

    if (IS_DESKTOP) {
      document.getElementById("qr").src = "/api/verifications/" + encodeURIComponent(id) + "/qr.svg";
      document.getElementById("qrWrap").classList.remove("hidden");
      // Keep smsLink visible — macOS Continuity routes sms: through the
      // paired iPhone, so the button works on desktop too.
      document.getElementById("hint").classList.add("hidden");
      document.getElementById("instructions").textContent =
        "Skenirajte QR kod mobitelom, ili otvorite Poruke i pošaljite SMS s ovog Maca:";
      // Trigger the side-by-side layout: QR left, code + buttons right.
      document.getElementById("cardTop").classList.add("has-qr");
      document.querySelector("main").classList.add("has-qr");
    }

    document.getElementById("card").classList.remove("hidden");
    btn.classList.add("hidden");
    // Button is gone, no need to keep counting down.
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
    document.getElementById("rateBanner").classList.add("hidden");
    // Hide the lede on mobile to keep everything above the fold once the
    // card is showing (tested on iPhone 17 Pro Chrome).
    if (!IS_DESKTOP) {
      const lede = document.querySelector(".lede");
      if (lede) lede.classList.add("hidden");
    }
    timer = setInterval(poll, 1500);
    poll();
  } catch (e) {
    btn.disabled = false;
    btn.textContent = "Pokreni provjeru";
    alert("Greška pri pokretanju: " + e.message);
  }
}

async function poll() {
  try {
    const r = await fetch("/api/verifications/" + id);
    if (!r.ok) return;
    const v = await r.json();
    const s = document.getElementById("status");
    s.textContent = STATUS_LABEL[v.status] || v.status;
    s.className = "value status-" + v.status;
    document.getElementById("phone").textContent = v.verified_phone || "—";
    if (v.status !== "pending") {
      clearInterval(timer);
      // Stop the indeterminate spinner — final state reached.
      document.getElementById("progress").classList.add("hidden");
      // Mirror the final state into localStorage history.
      patchHistory(id, {
        verified_at: v.verified_at ? (Date.parse(v.verified_at) || Date.now()) : null,
        verified_phone: v.verified_phone || null,
        expires_at: v.status === "expired" ? Date.now() : Date.parse(v.expires_at),
      });
      if (v.status === "verified" && lastStatus !== "verified") {
        showSuccess(v.verified_phone);
      }
    }
    lastStatus = v.status;
  } catch {}
}

async function copyCode() {
  const btn = document.getElementById("copyBtn");
  const orig = btn.textContent;
  try {
    await navigator.clipboard.writeText(code);
    btn.textContent = "Kopirano";
    setTimeout(function() { btn.textContent = orig; }, 1500);
  } catch {
    prompt("Kopirajte kod ručno:", code);
  }
}

// Initial paint — show prior history + apply rate limit on page load.
renderHistory();
refreshRateLimit();
</script>
</body>
</html>`;
}

/**
 * Admin audit-log UI. Fetched from the browser after Basic Auth succeeds.
 * Tiny SPA: status filter + paginated table (50/page, DESC by created_at).
 * Sits behind the /admin/* basic-auth gate set up in app.ts.
 */
export function renderAdminPage(): string {
  return `<!doctype html>
<html lang="hr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Admin — DOMOVINA.ai OTP</title>
<meta name="robots" content="noindex,nofollow" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<style>
:root {
  --navy: #002F6C; --red: #FF0000; --muted: #5A6570;
  --border: #E1E5EA; --surface: #F5F7F9; --bg: #FFFFFF;
  --success: #2E8540; --warning: #B45309; --danger: #B42318;
  font-family: system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: var(--bg); color: var(--navy); }
.tricolor { display: flex; height: 6px; }
.tricolor span { flex: 1; }
.tricolor .red { background: var(--red); }
.tricolor .navy { background: var(--navy); }
header {
  padding: 1rem 1.5rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
header .brand { font-weight: 800; letter-spacing: .04em; }
header .brand .accent { color: var(--red); }
header .badge {
  background: var(--surface); border: 1px solid var(--border);
  padding: .25rem .6rem; border-radius: 1rem; font-size: .8rem;
  color: var(--muted); font-weight: 600;
}
main { padding: 1.5rem; max-width: 88rem; margin: 0 auto; }
h1 { font-size: 1.5rem; margin: 0 0 1rem; }
.stats {
  display: flex; gap: .75rem; flex-wrap: wrap; margin-bottom: 1rem;
}
.stat {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: .5rem; padding: .6rem .9rem; min-width: 7rem;
}
.stat .label { font-size: .75rem; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
.stat .value { font-size: 1.4rem; font-weight: 700; }
.stat.verified .value { color: var(--success); }
.stat.pending .value { color: var(--warning); }
.stat.expired .value { color: var(--danger); }
.controls {
  display: flex; gap: .75rem; align-items: center; flex-wrap: wrap;
  margin-bottom: 1rem;
}
.controls label { font-size: .9rem; color: var(--muted); font-weight: 600; }
.controls select, .controls button {
  border: 1px solid var(--border); border-radius: .4rem;
  padding: .45rem .8rem; font-size: .9rem; font-family: inherit;
  background: var(--bg); color: var(--navy); cursor: pointer;
}
.controls button { font-weight: 600; }
.controls button:hover:not(:disabled) { background: var(--surface); }
.controls button:disabled { opacity: .4; cursor: not-allowed; }
.table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: .5rem; }
table { width: 100%; border-collapse: collapse; font-size: .9rem; }
th, td {
  text-align: left; padding: .6rem .8rem;
  border-bottom: 1px solid var(--border); white-space: nowrap;
}
th { background: var(--surface); font-weight: 700; color: var(--muted); font-size: .8rem; text-transform: uppercase; letter-spacing: .04em; }
tbody tr:hover { background: var(--surface); }
tbody tr:last-child td { border-bottom: 0; }
.code-cell { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-weight: 700; }
.phone-cell { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; }
.status {
  display: inline-block; padding: .2rem .55rem; border-radius: 1rem;
  font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
}
.status.verified { background: #E0F1E5; color: var(--success); }
.status.pending  { background: #FDF1E0; color: var(--warning); }
.status.expired  { background: #F8E2E0; color: var(--danger); }
.pager {
  display: flex; justify-content: space-between; align-items: center;
  margin-top: 1rem; gap: 1rem; flex-wrap: wrap;
}
.pager .info { color: var(--muted); font-size: .9rem; }
.pager .nav { display: flex; gap: .5rem; align-items: center; }
.pager .nav span { font-size: .9rem; color: var(--muted); padding: 0 .5rem; }
.empty { text-align: center; padding: 2rem; color: var(--muted); }
.dim { color: var(--muted); }
@media (max-width: 640px) {
  header { padding: .75rem 1rem; }
  main { padding: 1rem; }
  th, td { padding: .5rem .55rem; font-size: .82rem; }
}
</style>
</head>
<body>
<div class="tricolor"><span class="red"></span><span style="background:#FFFFFF"></span><span class="navy"></span></div>
<header>
  <div class="brand">DOMOVINA<span class="accent">.ai</span> · Admin</div>
  <span class="badge">Audit log</span>
</header>
<main>
  <h1>Verifikacije</h1>
  <div class="stats" id="stats"></div>
  <div class="controls">
    <label for="filter">Status:</label>
    <select id="filter">
      <option value="">Sve</option>
      <option value="verified">Potvrđeno</option>
      <option value="pending">U tijeku</option>
      <option value="expired">Isteklo</option>
    </select>
    <label for="size">Po stranici:</label>
    <select id="size">
      <option selected>10</option>
      <option>25</option>
      <option>50</option>
      <option>100</option>
      <option>200</option>
    </select>
    <button type="button" id="refresh">↻ Osvježi</button>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Pokrenuto</th>
          <th>Status</th>
          <th>Provjereni broj</th>
          <th>Potvrđeno</th>
          <th>Gateway</th>
          <th>Kod</th>
          <th>Purpose</th>
          <th>ID</th>
        </tr>
      </thead>
      <tbody id="rows"><tr><td colspan="9" class="empty">Učitavam…</td></tr></tbody>
    </table>
  </div>
  <div class="pager">
    <div class="info" id="pageInfo"></div>
    <div class="nav">
      <button type="button" id="prev">‹ Prethodna</button>
      <span id="pageLabel">str. 1</span>
      <button type="button" id="next">Sljedeća ›</button>
    </div>
  </div>
</main>
<div class="tricolor"><span class="red"></span><span style="background:#FFFFFF"></span><span class="navy"></span></div>
<script>
let offset = 0;
let limit = 10;
let status = "";

const fmt = function(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("hr-HR", { dateStyle: "short", timeStyle: "medium" });
};
const esc = function(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, function(c) {
    return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
  });
};

async function load() {
  const tbody = document.getElementById("rows");
  tbody.innerHTML = '<tr><td colspan="9" class="empty">Učitavam…</td></tr>';
  const q = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status) q.set("status", status);
  let data;
  try {
    const r = await fetch("/admin/api/verifications?" + q.toString(), { credentials: "same-origin" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    data = await r.json();
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty">Greška: ' + esc(e.message) + '</td></tr>';
    return;
  }

  // Stats
  document.getElementById("stats").innerHTML =
    '<div class="stat"><div class="label">Ukupno</div><div class="value">' + data.total_all + '</div></div>' +
    '<div class="stat verified"><div class="label">Potvrđeno</div><div class="value">' + data.verified_count + '</div></div>' +
    '<div class="stat pending"><div class="label">U tijeku</div><div class="value">' + data.pending_count + '</div></div>' +
    '<div class="stat expired"><div class="label">Isteklo</div><div class="value">' + data.expired_count + '</div></div>';

  // Rows
  if (data.items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty">Nema rezultata.</td></tr>';
  } else {
    let html = "";
    for (let i = 0; i < data.items.length; i++) {
      const it = data.items[i];
      html +=
        '<tr>' +
        '<td class="dim">' + (offset + i + 1) + '</td>' +
        '<td>' + esc(fmt(it.created_at)) + '</td>' +
        '<td><span class="status ' + esc(it.status) + '">' + esc(it.status) + '</span></td>' +
        '<td class="phone-cell">' + esc(it.verified_phone || "—") + '</td>' +
        '<td>' + esc(fmt(it.verified_at)) + '</td>' +
        '<td class="phone-cell">' + esc(it.gateway_number) + '</td>' +
        '<td class="code-cell">' + esc(it.code) + '</td>' +
        '<td>' + esc(it.purpose || "—") + '</td>' +
        '<td class="dim" title="' + esc(it.id) + '">' + esc(it.id.slice(0, 8)) + '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }

  // Pager
  const start = data.total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + limit, data.total);
  const totalLabel = status ? '(' + status + ')' : '';
  document.getElementById("pageInfo").textContent =
    start + "–" + end + " od " + data.total + " " + totalLabel;
  const page = Math.floor(offset / limit) + 1;
  const pages = Math.max(1, Math.ceil(data.total / limit));
  document.getElementById("pageLabel").textContent = "str. " + page + " / " + pages;
  document.getElementById("prev").disabled = offset === 0;
  document.getElementById("next").disabled = end >= data.total;
}

document.getElementById("filter").addEventListener("change", function(e) {
  status = e.target.value;
  offset = 0;
  load();
});
document.getElementById("size").addEventListener("change", function(e) {
  limit = Number(e.target.value) || 10;
  offset = 0;
  load();
});
document.getElementById("refresh").addEventListener("click", load);
document.getElementById("prev").addEventListener("click", function() {
  offset = Math.max(0, offset - limit);
  load();
});
document.getElementById("next").addEventListener("click", function() {
  offset = offset + limit;
  load();
});

load();
</script>
</body>
</html>`;
}
