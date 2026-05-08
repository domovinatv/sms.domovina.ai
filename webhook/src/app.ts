/**
 * Hono app for the Reverse OTP service. Persistence is pluggable via the
 * Storage interface (see ./storage.ts) — Bun dev uses an in-memory Map,
 * the Cloudflare Worker uses a SQLite-backed Durable Object.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { verify } from "hono/jwt";
import { createMemoryStorage, type MemoryStorage, type Storage, type Verification } from "./storage";
import { renderHomePage, OG_IMAGE_SVG, LOGO_SVG } from "./views";

const DIM = (s: string) => `\x1b[2m${s}\x1b[0m`;
const CYAN = (s: string) => `\x1b[36m${s}\x1b[0m`;
const GREEN = (s: string) => `\x1b[32m${s}\x1b[0m`;
const YELLOW = (s: string) => `\x1b[33m${s}\x1b[0m`;
const RED = (s: string) => `\x1b[31m${s}\x1b[0m`;
const BOLD = (s: string) => `\x1b[1m${s}\x1b[0m`;

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

export interface AppOptions {
  signingKey: string;
  /**
   * One or more gateway phone numbers. The user-facing instructions show
   * a randomly-picked number per verification; the webhook accepts SMS
   * arriving on any of them, so adding/removing numbers is just config.
   * Single-element array is the legacy single-gateway shape.
   */
  gatewayNumbers: string[];
  ttlMs: number;
  codeLen: number;
  /** Public origin used in canonical/og:url meta tags. No trailing slash. */
  publicOrigin?: string;
  /** Optional custom storage backend. Defaults to in-memory. */
  storage?: Storage;
  /** Optional log sink. Defaults to console.log unless NODE_ENV=test. */
  log?: (line: string) => void;
}

function pickGateway(numbers: string[]): string {
  if (numbers.length === 0) throw new Error("at least one gateway number required");
  if (numbers.length === 1) return numbers[0];
  const idx = crypto.getRandomValues(new Uint32Array(1))[0] % numbers.length;
  return numbers[idx];
}

export interface AppHandle {
  app: Hono;
  storage: Storage;
  /** Present only when using the default in-memory storage (test convenience). */
  state: MemoryStorageState;
  sweepExpired: () => void;
}

// Re-exported for tests that import from app.ts
export type { Verification, Status } from "./storage";
import type { MemoryStorageState } from "./storage";

export function createApp(opts: AppOptions): AppHandle {
  const storage = opts.storage ?? createMemoryStorage();
  // Only the in-memory backend exposes a `state` field — for DO this is empty
  // (tests never run against DO storage, so the empty stub is fine).
  const state: MemoryStorageState =
    "state" in storage
      ? (storage as MemoryStorage).state
      : { verifications: new Map(), codeToId: new Map() };

  const log =
    opts.log ??
    (typeof process !== "undefined" && process?.env?.NODE_ENV === "test"
      ? () => {}
      : (line: string) => console.log(`${DIM(new Date().toISOString())}  ${line}`));

  const sweepExpired = () => storage.sweepExpired(Date.now());

  const publicOrigin = opts.publicOrigin?.replace(/\/+$/, "") ?? "";

  const app = new Hono();
  app.use("/api/*", cors());

  // ── Start verification ──
  app.post("/api/verifications", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const purpose: string | undefined = body?.purpose;
    const id = crypto.randomUUID();
    const code = generateCode({ codeLen: opts.codeLen, existing: storage.pendingCodes() });
    const gatewayNumber = pickGateway(opts.gatewayNumbers);
    const now = Date.now();
    const v: Verification = {
      id,
      code,
      gatewayNumber,
      status: "pending",
      createdAt: now,
      expiresAt: now + opts.ttlMs,
      purpose,
    };
    storage.create(v);
    log(`${CYAN("verification.start")} id=${id.slice(0, 8)} code=${BOLD(code)} gateway=${gatewayNumber} purpose=${purpose ?? "-"}`);
    return c.json({
      ...publicView(v),
      instructions: `Send an SMS containing the code "${code}" to ${gatewayNumber} from the phone you want to verify. Code is case-insensitive and can be embedded in any text.`,
    });
  });

  // ── Poll status ──
  app.get("/api/verifications/:id", (c) => {
    const id = c.req.param("id");
    let v = storage.getById(id);
    if (!v) return c.json({ error: "not_found" }, 404);
    if (v.status === "pending" && v.expiresAt < Date.now()) {
      v = storage.markExpired(id) ?? v;
    }
    return c.json(publicView(v));
  });

  // ── Admin / debug list ──
  app.get("/api/verifications", (c) => {
    const items = storage.list(100);
    return c.json({
      count: storage.count(),
      items: items.map(publicView),
    });
  });

  // ── Health ──
  app.get("/health", (c) => c.json({ ok: true }));

  // ── Branded landing page ──
  app.get("/", (c) => c.html(renderHomePage({ origin: publicOrigin || originFromRequest(c.req.url) })));

  // ── Static branded assets ──
  app.get("/og-image.svg", (c) => {
    return new Response(OG_IMAGE_SVG, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=86400",
      },
    });
  });

  app.get("/favicon.svg", (c) => {
    return new Response(LOGO_SVG, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=86400",
      },
    });
  });

  app.get("/icon.svg", (c) => {
    return new Response(LOGO_SVG, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "cache-control": "public, max-age=86400",
      },
    });
  });

  // ── Webhook receiver ──
  app.post("*", async (c) => {
    const sig = await checkSignature(c.req.header("authorization"), opts.signingKey);
    const eventType = c.req.header("x-event-type") ?? "(unknown)";
    const sigBadge =
      sig.kind === "valid"
        ? GREEN("ok")
        : sig.kind === "invalid"
          ? RED(`invalid (${sig.error})`)
          : YELLOW("missing");
    log(`${CYAN("webhook.in")}  event=${YELLOW(eventType)} sig=${sigBadge}`);

    if (sig.kind === "invalid") {
      return c.json({ error: "invalid signature" }, 401);
    }
    // Production: also reject "missing". Allowed here so manual curl tests work.

    if (eventType !== "message.phone.received") {
      log(DIM(`  ignored (event type not message.phone.received)`));
      return c.json({ ok: true, ignored: true });
    }

    const bodyText = await c.req.text();
    let payload: any = null;
    try {
      payload = JSON.parse(bodyText);
    } catch {}

    const data = payload?.data ?? payload;
    const from: string | undefined = data?.contact ?? data?.from;
    const to: string | undefined = data?.owner ?? data?.to;
    const content: string | undefined = data?.content;

    if (!from || !content) {
      log(RED(`  malformed payload (missing from/content)`));
      return c.json({ error: "malformed_payload" }, 400);
    }

    log(`  ${DIM("from=")}${from} ${DIM("to=")}${to ?? "?"} ${DIM("content=")}${JSON.stringify(content)}`);

    const code = findCodeInContent(content, storage.pendingCodes());
    if (!code) {
      log(YELLOW(`  no known code found in content; ignoring`));
      return c.json({ ok: true, matched: false });
    }

    const v = storage.getByCode(code);
    if (!v) return c.json({ ok: true, matched: false });

    if (v.status !== "pending") {
      log(YELLOW(`  code ${code} already ${v.status}; ignoring`));
      return c.json({ ok: true, matched: true, status: v.status });
    }

    if (v.expiresAt < Date.now()) {
      storage.markExpired(v.id);
      log(YELLOW(`  code ${code} expired before SMS arrived`));
      return c.json({ ok: true, matched: true, status: "expired" });
    }

    const verified = storage.markVerified(v.id, from);
    log(GREEN(`  verified id=${v.id.slice(0, 8)} code=${code} phone=${from}`));

    return c.json({
      ok: true,
      matched: true,
      status: "verified",
      verification_id: verified?.id ?? v.id,
      verified_phone: from,
    });
  });

  return { app, storage, state, sweepExpired };
}

function originFromRequest(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}
