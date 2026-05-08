/**
 * Reverse OTP PoC — receives signed httpsms webhooks, lets a frontend start
 * verifications and poll for a result that arrives as an inbound SMS.
 *
 * NOTE: state is held in-memory. For production, persist verifications in a
 * database (Postgres / Cloudflare D1 / Redis) so they survive restarts and
 * can be shared across multiple instances. The two Maps below are the only
 * stateful pieces — swapping them for a DAO is the entire migration.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { verify } from "hono/jwt";

// ─── Config ─────────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT) || 8000;
const PUBLIC_URL =
  process.env.NGROK_URL ?? "https://uniformly-credible-opossum.ngrok-free.app";
const SIGNING_KEY =
  process.env.HTTPSMS_SIGNING_KEY ??
  "wh_sign_dasdasdafrete45345gdfvb767834rfsdfsd";
const GATEWAY_NUMBER = process.env.GATEWAY_NUMBER ?? "+385998710482";
const TTL_MS = Number(process.env.VERIFICATION_TTL_MS) || 10 * 60 * 1000; // 10 min
const CODE_LEN = Number(process.env.CODE_LEN) || 6;

// ─── State (in-memory; replace with DB for production) ──────────────────────
type Status = "pending" | "verified" | "expired";

interface Verification {
  id: string;
  code: string;
  gatewayNumber: string;
  status: Status;
  createdAt: number;
  expiresAt: number;
  verifiedAt?: number;
  verifiedPhone?: string;
  purpose?: string;
}

const verifications = new Map<string, Verification>(); // by id
const codeToId = new Map<string, string>(); // CODE (uppercase) -> id

// Sweep expired entries every 30s. Idempotent and cheap.
setInterval(() => {
  const now = Date.now();
  for (const v of verifications.values()) {
    if (v.status === "pending" && v.expiresAt < now) {
      v.status = "expired";
      codeToId.delete(v.code);
    }
  }
}, 30_000);

// ─── Helpers ────────────────────────────────────────────────────────────────
// Avoid ambiguous chars in SMS: no 0/O, 1/I/L, 5/S, 8/B, 2/Z
const CODE_ALPHABET = "ACDEFGHJKMNPQRTUVWXY3467";

function generateCode(): string {
  let attempt = 0;
  while (attempt < 50) {
    let code = "";
    const bytes = crypto.getRandomValues(new Uint8Array(CODE_LEN));
    for (let i = 0; i < CODE_LEN; i++) {
      code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
    if (!codeToId.has(code)) return code;
    attempt++;
  }
  throw new Error("could not generate unique code (state too crowded?)");
}

function publicView(v: Verification) {
  return {
    id: v.id,
    code: v.code,
    gateway_number: v.gatewayNumber,
    status: v.status,
    created_at: new Date(v.createdAt).toISOString(),
    expires_at: new Date(v.expiresAt).toISOString(),
    verified_at: v.verifiedAt ? new Date(v.verifiedAt).toISOString() : null,
    verified_phone: v.verifiedPhone ?? null,
    purpose: v.purpose ?? null,
  };
}

// ─── Logging ────────────────────────────────────────────────────────────────
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

function logEvent(line: string) {
  console.log(`${dim(new Date().toISOString())}  ${line}`);
}

// ─── App ────────────────────────────────────────────────────────────────────
const app = new Hono();

app.use("/api/*", cors());

// ─── 1) Start verification ──────────────────────────────────────────────────
app.post("/api/verifications", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const purpose: string | undefined = body?.purpose;
  const id = crypto.randomUUID();
  const code = generateCode();
  const now = Date.now();
  const v: Verification = {
    id,
    code,
    gatewayNumber: GATEWAY_NUMBER,
    status: "pending",
    createdAt: now,
    expiresAt: now + TTL_MS,
    purpose,
  };
  verifications.set(id, v);
  codeToId.set(code, id);
  logEvent(`${cyan("verification.start")} id=${id.slice(0, 8)} code=${bold(code)} purpose=${purpose ?? "-"}`);
  return c.json({
    ...publicView(v),
    instructions: `Send an SMS containing the code "${code}" to ${GATEWAY_NUMBER} from the phone you want to verify. Code is case-insensitive and can be embedded in any text.`,
  });
});

// ─── 2) Poll verification status ────────────────────────────────────────────
app.get("/api/verifications/:id", (c) => {
  const v = verifications.get(c.req.param("id"));
  if (!v) return c.json({ error: "not_found" }, 404);
  // lazily flip to expired on read too
  if (v.status === "pending" && v.expiresAt < Date.now()) {
    v.status = "expired";
    codeToId.delete(v.code);
  }
  return c.json(publicView(v));
});

// ─── 3) Admin / debug: list all in-memory entries ───────────────────────────
app.get("/api/verifications", (c) => {
  return c.json({
    count: verifications.size,
    items: Array.from(verifications.values())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 100)
      .map(publicView),
  });
});

// ─── 4) Health ──────────────────────────────────────────────────────────────
app.get("/health", (c) => c.json({ ok: true, public_url: PUBLIC_URL }));

// ─── 5) Webhook receiver (httpsms posts here) ───────────────────────────────
type SignatureResult =
  | { kind: "missing" }
  | { kind: "invalid"; error: string }
  | { kind: "valid"; claims: Record<string, unknown> };

async function checkSignature(authorization: string | undefined): Promise<SignatureResult> {
  if (!authorization) return { kind: "missing" };
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return { kind: "missing" };
  try {
    const claims = (await verify(token, SIGNING_KEY, "HS256")) as Record<string, unknown>;
    return { kind: "valid", claims };
  } catch (e) {
    return { kind: "invalid", error: (e as Error).message };
  }
}

function findCodeInContent(content: string): string | null {
  // Walk all currently-pending codes and check substring (case-insensitive).
  // Cheap because there are typically tens of pending codes at most. Lets
  // users embed the code anywhere: "code A4YTAP", "preffixa4ytap", "...A4YTAP."
  // all match — no whitespace or boundary requirements.
  const upper = content.toUpperCase();
  for (const code of codeToId.keys()) {
    if (upper.includes(code)) return code;
  }
  return null;
}

// Catchall POST: httpsms webhook URL might be set to /, /webhook, /sms, etc.
// Treat any POST that has the X-Event-Type header as a webhook delivery so the
// user doesn't have to fight URL-path strictness.
app.post("*", async (c) => {
  const sig = await checkSignature(c.req.header("authorization"));
  const eventType = c.req.header("x-event-type") ?? "(unknown)";

  const bodyText = await c.req.text();
  let payload: any = null;
  try {
    payload = JSON.parse(bodyText);
  } catch {
    /* ignore; empty/invalid JSON */
  }

  const sigBadge = sig.kind === "valid"
    ? green("✓ valid")
    : sig.kind === "invalid"
      ? red(`✗ invalid (${sig.error})`)
      : yellow("⚠ missing");
  logEvent(`${cyan("webhook.in")}  event=${yellow(eventType)} sig=${sigBadge}`);

  if (sig.kind === "invalid") {
    return c.json({ error: "invalid signature" }, 401);
  }
  // Production: also reject "missing". Allowing here so manual curl tests work.

  if (eventType !== "message.phone.received") {
    logEvent(dim(`  ignored (event type not message.phone.received)`));
    return c.json({ ok: true, ignored: true });
  }

  // httpsms CloudEvent shape: { specversion, type, source, id, data: { ... } }
  // The MessagePhoneReceivedPayload has: { from, to, content, message_id, ... } as `data`.
  const data = payload?.data ?? payload;
  const from: string | undefined = data?.contact ?? data?.from;
  const to: string | undefined = data?.owner ?? data?.to;
  const content: string | undefined = data?.content;
  const messageId: string | undefined = data?.message_id ?? data?.messageID ?? data?.id;

  if (!from || !content) {
    logEvent(red(`  malformed payload (missing from/content)`));
    return c.json({ error: "malformed_payload" }, 400);
  }

  const code = findCodeInContent(content);
  logEvent(`  ${dim("from=")}${from} ${dim("to=")}${to ?? "?"} ${dim("content=")}${JSON.stringify(content)}`);

  if (!code) {
    logEvent(yellow(`  no known code found in content; ignoring`));
    return c.json({ ok: true, matched: false });
  }

  const id = codeToId.get(code)!;
  const v = verifications.get(id);
  if (!v) {
    // race: code present in index but verification gone — shouldn't happen, but defensive
    logEvent(red(`  code ${code} indexed but verification ${id} missing`));
    return c.json({ ok: true, matched: false }, 200);
  }

  if (v.status !== "pending") {
    logEvent(yellow(`  code ${code} already ${v.status}; ignoring`));
    return c.json({ ok: true, matched: true, status: v.status });
  }

  if (v.expiresAt < Date.now()) {
    v.status = "expired";
    codeToId.delete(code);
    logEvent(yellow(`  code ${code} expired before SMS arrived`));
    return c.json({ ok: true, matched: true, status: "expired" });
  }

  v.status = "verified";
  v.verifiedAt = Date.now();
  v.verifiedPhone = from;
  codeToId.delete(code); // single-use
  logEvent(green(`  ✓ verified id=${id.slice(0, 8)} code=${code} phone=${from} (msg ${messageId?.slice(0, 8) ?? "?"})`));

  return c.json({
    ok: true,
    matched: true,
    status: "verified",
    verification_id: v.id,
    verified_phone: from,
  });
});

// ─── 6) Demo HTML (visit / in browser to try the full flow) ─────────────────
app.get("/", (c) => c.html(DEMO_HTML));

const DEMO_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Reverse OTP demo</title>
<meta name="viewport" content="width=device-width,initial-scale=1" />
<style>
  :root { color-scheme: dark; font-family: ui-sans-serif, system-ui, sans-serif; }
  body { max-width: 36rem; margin: 4rem auto; padding: 0 1rem; background: #0d1117; color: #e6edf3; }
  h1 { font-size: 1.6rem; margin-bottom: .25rem; }
  .sub { color: #8b949e; margin-top: 0; margin-bottom: 2rem; }
  button { background: #238636; color: #fff; border: 0; padding: .8rem 1.4rem; font-size: 1rem; border-radius: .4rem; cursor: pointer; }
  button:disabled { background: #30363d; cursor: not-allowed; }
  .actions { display: flex; gap: .6rem; margin: 1.2rem 0 .6rem; }
  .action-btn { flex: 1; text-align: center; padding: .9rem 1rem; font-size: 1rem; border-radius: .4rem; cursor: pointer; text-decoration: none; border: 1px solid #30363d; background: #21262d; color: #e6edf3; font-family: inherit; }
  .action-btn.primary { background: #238636; border-color: #238636; }
  .action-btn:active { transform: translateY(1px); }
  .hint { font-size: .85rem; color: #8b949e; margin: .25rem 0 0; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: .6rem; padding: 1.4rem; margin-top: 1.5rem; }
  .code { font-family: ui-monospace, monospace; font-size: 2.4rem; letter-spacing: .15em; font-weight: 700; color: #58a6ff; }
  .row { display: flex; justify-content: space-between; padding: .35rem 0; border-bottom: 1px solid #21262d; font-size: .9rem; }
  .row:last-child { border: 0; }
  .row span:first-child { color: #8b949e; }
  .status-pending { color: #d29922; }
  .status-verified { color: #3fb950; font-weight: 700; }
  .status-expired { color: #f85149; }
</style>
<body>
<h1>Reverse OTP demo</h1>
<p class="sub">Click start, send the SMS, watch the page update.</p>
<button id="btn" onclick="start()">Start verification</button>
<div id="card" class="card" style="display:none">
  <p style="margin-top:0">Send an SMS containing this code from the phone you want to verify:</p>
  <p class="code" id="code"></p>
  <p>to <strong id="num"></strong></p>
  <div class="actions">
    <a id="smsLink" class="action-btn primary" href="#">📱 Open SMS app</a>
    <button class="action-btn" onclick="copyCode()">Copy code</button>
  </div>
  <p class="hint">On mobile, tap "Open SMS app" — your default messenger opens with the recipient and code prefilled. Hit send.</p>
  <hr style="border-color:#30363d" />
  <div class="row"><span>Status</span><span id="status" class="status-pending">pending</span></div>
  <div class="row"><span>Expires</span><span id="exp"></span></div>
  <div class="row"><span>Verified phone</span><span id="phone">—</span></div>
</div>
<script>
let id, timer, code, num;
async function start() {
  const btn = document.getElementById("btn");
  btn.disabled = true; btn.textContent = "Starting…";
  const r = await fetch("/api/verifications", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ purpose: "demo" }) });
  const v = await r.json();
  id = v.id; code = v.code; num = v.gateway_number;
  document.getElementById("code").textContent = code;
  document.getElementById("num").textContent = num;
  document.getElementById("exp").textContent = new Date(v.expires_at).toLocaleTimeString();
  // sms: URI — "?body=" works on Android 5+ and iOS 8+. Encode body for safety.
  document.getElementById("smsLink").href = "sms:" + encodeURIComponent(num) + "?body=" + encodeURIComponent(code);
  document.getElementById("card").style.display = "block";
  btn.style.display = "none";
  timer = setInterval(poll, 1500);
  poll();
}
async function poll() {
  const r = await fetch("/api/verifications/" + id);
  const v = await r.json();
  const s = document.getElementById("status");
  s.textContent = v.status;
  s.className = "status-" + v.status;
  document.getElementById("phone").textContent = v.verified_phone ?? "—";
  if (v.status !== "pending") clearInterval(timer);
}
async function copyCode() {
  try {
    await navigator.clipboard.writeText(code);
    const b = event.target;
    const orig = b.textContent;
    b.textContent = "Copied ✓";
    setTimeout(() => { b.textContent = orig; }, 1500);
  } catch (e) {
    alert("Code: " + code);
  }
}
</script>
`;

// ─── Boot ───────────────────────────────────────────────────────────────────
console.log();
console.log(bold("Reverse OTP PoC (Hono + Bun)"));
console.log(`  ${dim("local:")}    http://localhost:${PORT}`);
console.log(`  ${dim("public:")}   ${yellow(PUBLIC_URL)}`);
console.log(`  ${dim("gateway:")}  ${GATEWAY_NUMBER}`);
console.log(`  ${dim("signing:")}  HS256 JWT, key=${SIGNING_KEY.slice(0, 10)}…`);
console.log(`  ${dim("ttl:")}      ${TTL_MS / 1000}s, code length=${CODE_LEN}`);
console.log();
console.log(dim(`  Open ${PUBLIC_URL}/  for the demo UI.`));
console.log(dim(`  Configure httpsms webhook: URL=${PUBLIC_URL}/webhook, Signing Key=${SIGNING_KEY}`));
console.log(dim(`  ⚠ State is in-memory; restart wipes pending verifications.`));
console.log();

export default {
  port: PORT,
  fetch: app.fetch,
};
