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
Potvrdite broj jednim SMS-om — besplatno, bez koda
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
@media (max-width: 480px) {
  h1 { font-size: 1.45rem; }
  .code-display .code { font-size: 2.1rem; }
  main { padding: 2rem 1rem; }
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
  <button id="startBtn" class="btn-primary" onclick="start()">Pokreni provjeru</button>
  <div id="card" class="card hidden" aria-live="polite">
    <p class="instructions">Pošaljite SMS koji sadrži ovaj kod s telefona koji želite potvrditi:</p>
    <div class="code-display">
      <p class="code" id="code">––––––</p>
      <p class="target">na broj <strong id="num"></strong></p>
    </div>
    <div class="actions">
      <a id="smsLink" class="action-btn primary" href="#">Otvori SMS aplikaciju</a>
      <button class="action-btn" type="button" id="copyBtn" onclick="copyCode()">Kopiraj kod</button>
    </div>
    <p class="hint">Na mobitelu kliknite "Otvori SMS aplikaciju" — vaš SMS klijent će se otvoriti s prefilovanim brojem i kodom. Samo pošaljite poruku.</p>
    <hr class="divider" />
    <div class="row"><span class="label">Status</span><span class="value" id="status">u tijeku</span></div>
    <div class="row"><span class="label">Istječe u</span><span class="value" id="exp">—</span></div>
    <div class="row"><span class="label">Provjereni broj</span><span class="value" id="phone">—</span></div>
  </div>
</main>
<footer>
  Dio platforme <a href="https://domovina.ai">DOMOVINA.ai</a> — besplatni servis bez registracije.
</footer>
<div class="tricolor"><span class="red"></span><span class="white"></span><span class="navy"></span></div>
<script>
let id, timer, code, num;

const STATUS_LABEL = { pending: "u tijeku", verified: "potvrđeno", expired: "isteklo" };

async function start() {
  const btn = document.getElementById("startBtn");
  btn.disabled = true;
  btn.textContent = "Pokrećem…";
  try {
    const r = await fetch("/api/verifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ purpose: "web" })
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const v = await r.json();
    id = v.id; code = v.code; num = v.gateway_number;
    document.getElementById("code").textContent = code;
    document.getElementById("num").textContent = num;
    document.getElementById("exp").textContent = new Date(v.expires_at).toLocaleTimeString("hr-HR");
    document.getElementById("smsLink").href =
      "sms:" + encodeURIComponent(num) + "?body=" + encodeURIComponent(code);
    document.getElementById("card").classList.remove("hidden");
    btn.classList.add("hidden");
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
    if (v.status !== "pending") clearInterval(timer);
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
</script>
</body>
</html>`;
}
