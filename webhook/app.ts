import { Hono } from "hono";
import { cors } from "hono/cors";
import { verify } from "hono/jwt";

// ─── Types & state ──────────────────────────────────────────────────────────
export type Status = "pending" | "verified" | "expired";

export interface Verification {
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

export interface AppOptions {
  signingKey: string;
  gatewayNumber: string;
  ttlMs: number;
  codeLen: number;
}

// Avoid ambiguous chars in SMS: no 0/O, 1/I/L, 5/S, 8/B, 2/Z
export const CODE_ALPHABET = "ACDEFGHJKMNPQRTUVWXY3467";

export function generateCode(opts: { codeLen: number; existing: Set<string> }): string {
  const { codeLen, existing } = opts;
  for (let attempt = 0; attempt < 50; attempt++) {
    let code = "";
    const bytes = crypto.getRandomValues(new Uint8Array(codeLen));
    for (let i = 0; i < codeLen; i++) {
      code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
    }
    if (!existing.has(code)) return code;
  }
  throw new Error("could not generate unique code");
}

/** Walk all candidate codes and check case-insensitive substring match. */
export function findCodeInContent(content: string, codes: Iterable<string>): string | null {
  const upper = content.toUpperCase();
  for (const code of codes) {
    if (upper.includes(code)) return code;
  }
  return null;
}

type SignatureResult =
  | { kind: "missing" }
  | { kind: "invalid"; error: string }
  | { kind: "valid"; claims: Record<string, unknown> };

export async function checkSignature(
  authorization: string | undefined,
  signingKey: string
): Promise<SignatureResult> {
  if (!authorization) return { kind: "missing" };
  const token = authorization.replace(/^Bearer\s+/i, "");
  if (!token) return { kind: "missing" };
  try {
    const claims = (await verify(token, signingKey, "HS256")) as Record<string, unknown>;
    return { kind: "valid", claims };
  } catch (e) {
    return { kind: "invalid", error: (e as Error).message };
  }
}

// ─── Public-facing JSON shape ───────────────────────────────────────────────
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

// ─── App factory ────────────────────────────────────────────────────────────
export interface AppHandle {
  app: Hono;
  state: {
    verifications: Map<string, Verification>;
    codeToId: Map<string, string>;
  };
  /** Force-expire any pending verifications past their TTL. Idempotent. */
  sweepExpired: () => void;
}

export function createApp(opts: AppOptions): AppHandle {
  const verifications = new Map<string, Verification>();
  const codeToId = new Map<string, string>();

  const sweepExpired = () => {
    const now = Date.now();
    for (const v of verifications.values()) {
      if (v.status === "pending" && v.expiresAt < now) {
        v.status = "expired";
        codeToId.delete(v.code);
      }
    }
  };

  const app = new Hono();
  app.use("/api/*", cors());

  // ── Start verification ──
  app.post("/api/verifications", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const purpose: string | undefined = body?.purpose;
    const id = crypto.randomUUID();
    const code = generateCode({ codeLen: opts.codeLen, existing: new Set(codeToId.keys()) });
    const now = Date.now();
    const v: Verification = {
      id,
      code,
      gatewayNumber: opts.gatewayNumber,
      status: "pending",
      createdAt: now,
      expiresAt: now + opts.ttlMs,
      purpose,
    };
    verifications.set(id, v);
    codeToId.set(code, id);
    return c.json({
      ...publicView(v),
      instructions: `Send an SMS containing the code "${code}" to ${opts.gatewayNumber} from the phone you want to verify. Code is case-insensitive and can be embedded in any text.`,
    });
  });

  // ── Poll status ──
  app.get("/api/verifications/:id", (c) => {
    const v = verifications.get(c.req.param("id"));
    if (!v) return c.json({ error: "not_found" }, 404);
    if (v.status === "pending" && v.expiresAt < Date.now()) {
      v.status = "expired";
      codeToId.delete(v.code);
    }
    return c.json(publicView(v));
  });

  // ── Admin / debug list ──
  app.get("/api/verifications", (c) => {
    return c.json({
      count: verifications.size,
      items: Array.from(verifications.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 100)
        .map(publicView),
    });
  });

  // ── Health ──
  app.get("/health", (c) => c.json({ ok: true }));

  // ── Demo UI ──
  app.get("/", (c) => c.html(DEMO_HTML));

  // ── Webhook receiver ──
  app.post("*", async (c) => {
    const sig = await checkSignature(c.req.header("authorization"), opts.signingKey);
    const eventType = c.req.header("x-event-type") ?? "(unknown)";

    if (sig.kind === "invalid") {
      return c.json({ error: "invalid signature" }, 401);
    }
    // Production: also reject "missing". Allowed here so manual curl tests work.

    if (eventType !== "message.phone.received") {
      return c.json({ ok: true, ignored: true });
    }

    const bodyText = await c.req.text();
    let payload: any = null;
    try {
      payload = JSON.parse(bodyText);
    } catch {}

    const data = payload?.data ?? payload;
    const from: string | undefined = data?.contact ?? data?.from;
    const content: string | undefined = data?.content;

    if (!from || !content) {
      return c.json({ error: "malformed_payload" }, 400);
    }

    const code = findCodeInContent(content, codeToId.keys());
    if (!code) return c.json({ ok: true, matched: false });

    const id = codeToId.get(code)!;
    const v = verifications.get(id);
    if (!v) return c.json({ ok: true, matched: false });

    if (v.status !== "pending") {
      return c.json({ ok: true, matched: true, status: v.status });
    }

    if (v.expiresAt < Date.now()) {
      v.status = "expired";
      codeToId.delete(code);
      return c.json({ ok: true, matched: true, status: "expired" });
    }

    v.status = "verified";
    v.verifiedAt = Date.now();
    v.verifiedPhone = from;
    codeToId.delete(code); // single-use

    return c.json({
      ok: true,
      matched: true,
      status: "verified",
      verification_id: v.id,
      verified_phone: from,
    });
  });

  return { app, state: { verifications, codeToId }, sweepExpired };
}

// ─── Demo HTML ──────────────────────────────────────────────────────────────
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
