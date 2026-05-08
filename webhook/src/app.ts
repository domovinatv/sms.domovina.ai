/**
 * Hono app for the Reverse OTP service. Persistence is pluggable via the
 * Storage interface (see ./storage.ts) — Bun dev uses an in-memory Map,
 * the Cloudflare Worker uses a SQLite-backed Durable Object.
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { verify } from "hono/jwt";
import {
  createMemoryStorage,
  type GatewayRow,
  type MemoryStorage,
  type Storage,
  type Verification,
} from "./storage";
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
   * Static gateway phone numbers. Used as cold-start fallback when no
   * heartbeat data is yet available; once gateways start sending
   * heartbeat.online events, the dynamic pool takes over. May be empty
   * if you want pure auto-discovery from heartbeats.
   */
  gatewayNumbers: string[];
  /**
   * Optional allowlist. If non-empty, only numbers in this list are
   * eligible for selection (even if other heartbeats arrive). Useful to
   * exclude a test phone from the rotation. Empty/undefined means any
   * discovered phone is fine.
   */
  gatewayAllowList?: string[];
  /**
   * A gateway is considered "online" if its last heartbeat arrived within
   * this many milliseconds. Default 120000 (2 min) — Android sends every
   * 15 min normally, but heartbeat.online/offline events are emitted on
   * status transitions, so the timestamp tracks transitions not pings.
   */
  onlineCutoffMs?: number;
  ttlMs: number;
  codeLen: number;
  /** Public origin used in canonical/og:url meta tags. No trailing slash. */
  publicOrigin?: string;
  /** Optional custom storage backend. Defaults to in-memory. */
  storage?: Storage;
  /** Optional log sink. Defaults to console.log unless NODE_ENV=test. */
  log?: (line: string) => void;
}

function randomFrom<T>(items: T[]): T {
  if (items.length === 1) return items[0];
  const idx = crypto.getRandomValues(new Uint32Array(1))[0] % items.length;
  return items[idx];
}

/**
 * Tiered gateway selection. Returns the chosen number plus a tier label
 * for observability:
 *  1. "online"  — preferred: random among online phones (heartbeat fresh)
 *  2. "known"   — fallback: random among any-ever-seen phones
 *  3. "static"  — cold-start: random from the env-configured list
 */
function pickGateway(opts: {
  storage: Storage;
  staticNumbers: string[];
  allowList: string[] | undefined;
  onlineCutoff: number;
}): { number: string; tier: "online" | "known" | "static" } {
  const { storage, staticNumbers, allowList, onlineCutoff } = opts;
  const allow = allowList && allowList.length > 0 ? new Set(allowList) : null;
  const filter = (n: string) => (allow === null ? true : allow.has(n));

  const online = storage.onlineGateways(onlineCutoff).filter(filter);
  if (online.length > 0) return { number: randomFrom(online), tier: "online" };

  const known = storage
    .listGateways()
    .map((g) => g.number)
    .filter(filter);
  if (known.length > 0) return { number: randomFrom(known), tier: "known" };

  const fallback = staticNumbers.filter(filter);
  if (fallback.length === 0) {
    throw new Error("no gateway available (no heartbeats, no static config, or all filtered)");
  }
  return { number: randomFrom(fallback), tier: "static" };
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

  const onlineCutoffMs = opts.onlineCutoffMs ?? 120_000;
  const publicOrigin = opts.publicOrigin?.replace(/\/+$/, "") ?? "";

  const app = new Hono();
  app.use("/api/*", cors());

  // ── Start verification ──
  app.post("/api/verifications", async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const purpose: string | undefined = body?.purpose;
    const id = crypto.randomUUID();
    const code = generateCode({ codeLen: opts.codeLen, existing: storage.pendingCodes() });
    const pick = pickGateway({
      storage,
      staticNumbers: opts.gatewayNumbers,
      allowList: opts.gatewayAllowList,
      onlineCutoff: Date.now() - onlineCutoffMs,
    });
    const gatewayNumber = pick.number;
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
    log(`${CYAN("verification.start")} id=${id.slice(0, 8)} code=${BOLD(code)} gateway=${gatewayNumber} tier=${pick.tier} purpose=${purpose ?? "-"}`);
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

  // ── Gateway health (admin / debug) ──
  app.get("/api/gateways", (c) => {
    const cutoff = Date.now() - onlineCutoffMs;
    const all = storage.listGateways();
    return c.json({
      online_cutoff_ms: onlineCutoffMs,
      count: all.length,
      online_count: all.filter((g) => g.status === "online" && g.lastHeartbeatAt >= cutoff).length,
      static_fallback: opts.gatewayNumbers,
      allow_list: opts.gatewayAllowList ?? null,
      items: all.map((g) => ({
        number: g.number,
        status: g.status,
        first_seen_at: new Date(g.firstSeenAt).toISOString(),
        last_heartbeat_at: new Date(g.lastHeartbeatAt).toISOString(),
        last_heartbeat_age_seconds: Math.floor((Date.now() - g.lastHeartbeatAt) / 1000),
        is_online: g.status === "online" && g.lastHeartbeatAt >= cutoff,
      })),
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

    const bodyText = await c.req.text();
    let payload: any = null;
    try {
      payload = JSON.parse(bodyText);
    } catch {}
    const data = payload?.data ?? payload;

    // Heartbeat events update the gateway health table; we don't proceed
    // to the message-matching pipeline for these.
    if (
      eventType === "phone.heartbeat.online" ||
      eventType === "phone.heartbeat.offline"
    ) {
      const owner: string | undefined = data?.owner;
      if (!owner) {
        log(YELLOW(`  heartbeat without owner; ignoring`));
        return c.json({ ok: true, ignored: true });
      }
      const status = eventType === "phone.heartbeat.online" ? "online" : "offline";
      storage.recordHeartbeat(owner, status, Date.now());
      log(`  ${CYAN("gateway." + status)} owner=${owner}`);
      return c.json({ ok: true, gateway: owner, status });
    }

    if (eventType !== "message.phone.received") {
      log(DIM(`  ignored (event type ${eventType})`));
      return c.json({ ok: true, ignored: true });
    }

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
