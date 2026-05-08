/**
 * Cloudflare Worker entry + Durable Object for otp.domovina.ai.
 *
 * Architecture:
 *   Worker `fetch` → forwards every request to a single DO instance
 *   (idFromName("global")). The DO owns the Hono app and a SQLite-backed
 *   Storage implementation. A 60s alarm sweeps stale pending rows.
 *
 * Why singleton: OTP verification needs strong consistency between writes
 * (webhook receive) and reads (poll). A single DO serializes these.
 */

import { DurableObject } from "cloudflare:workers";
import { createApp } from "./app";
import type { GatewayRow, GatewayStatus, Storage, Verification } from "./storage";

export interface Env {
  HTTPSMS_SIGNING_KEY: string;
  /**
   * Static cold-start gateway phone numbers (CSV). Used only until the
   * first phone.heartbeat.online events arrive; after that, dynamic
   * health-tracked pool takes over. Falls back to GATEWAY_NUMBER for
   * backwards compat.
   */
  GATEWAY_NUMBERS?: string;
  GATEWAY_NUMBER?: string;
  /**
   * Optional CSV allowlist. If set, only phones in this list are used
   * for selection regardless of heartbeats. Useful to keep a test phone
   * out of the rotation.
   */
  GATEWAY_ALLOW_LIST?: string;
  PUBLIC_ORIGIN: string;
  VERIFICATION_TTL_MS?: string;
  CODE_LEN?: string;
  ONLINE_CUTOFF_MS?: string;
  VERIFICATION_STORE: DurableObjectNamespace;
}

const SWEEP_INTERVAL_MS = 60_000;

export class VerificationStore extends DurableObject<Env> {
  private fetcher: (req: Request) => Promise<Response>;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    const sqlStorage = createSqlStorage(ctx);

    const csv = (s: string | undefined) =>
      (s ?? "")
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean);

    const handle = createApp({
      signingKey: env.HTTPSMS_SIGNING_KEY,
      gatewayNumbers: csv(env.GATEWAY_NUMBERS ?? env.GATEWAY_NUMBER),
      gatewayAllowList: csv(env.GATEWAY_ALLOW_LIST),
      ttlMs: Number(env.VERIFICATION_TTL_MS) || 10 * 60 * 1000,
      codeLen: Number(env.CODE_LEN) || 6,
      onlineCutoffMs: Number(env.ONLINE_CUTOFF_MS) || 120_000,
      publicOrigin: env.PUBLIC_ORIGIN,
      storage: sqlStorage,
    });

    this.fetcher = handle.app.fetch.bind(handle.app);

    // Arm the recurring sweep alarm exactly once per DO lifetime.
    ctx.blockConcurrencyWhile(async () => {
      const next = await ctx.storage.getAlarm();
      if (next === null) {
        await ctx.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
      }
    });
  }

  override async fetch(req: Request): Promise<Response> {
    return this.fetcher(req);
  }

  override async alarm(): Promise<void> {
    const sql = this.ctx.storage.sql;
    sql.exec(
      `UPDATE verifications SET status='expired' WHERE status='pending' AND expires_at < ?`,
      Date.now()
    );
    await this.ctx.storage.setAlarm(Date.now() + SWEEP_INTERVAL_MS);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const id = env.VERIFICATION_STORE.idFromName("global");
    const stub = env.VERIFICATION_STORE.get(id);
    return stub.fetch(request);
  },
};

// ── SQLite-backed storage implementation ───────────────────────────────────

interface VerificationRow {
  id: string;
  code: string;
  gateway_number: string;
  status: "pending" | "verified" | "expired";
  created_at: number;
  expires_at: number;
  verified_at: number | null;
  verified_phone: string | null;
  purpose: string | null;
}

function rowToVerification(row: VerificationRow): Verification {
  return {
    id: row.id,
    code: row.code,
    gatewayNumber: row.gateway_number,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    verifiedAt: row.verified_at ?? undefined,
    verifiedPhone: row.verified_phone ?? undefined,
    purpose: row.purpose ?? undefined,
  };
}

function createSqlStorage(ctx: DurableObjectState): Storage {
  const sql = ctx.storage.sql;

  // Schema is created once; CREATE IF NOT EXISTS is cheap on subsequent boots.
  sql.exec(`
    CREATE TABLE IF NOT EXISTS verifications (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      gateway_number TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      verified_at INTEGER,
      verified_phone TEXT,
      purpose TEXT
    )
  `);
  sql.exec(`CREATE INDEX IF NOT EXISTS idx_status_expires ON verifications(status, expires_at)`);
  sql.exec(`CREATE INDEX IF NOT EXISTS idx_code ON verifications(code)`);

  // Gateway health table: one row per known phone number, kept fresh by
  // phone.heartbeat.online / .offline webhook events.
  sql.exec(`
    CREATE TABLE IF NOT EXISTS gateways (
      number TEXT PRIMARY KEY,
      first_seen_at INTEGER NOT NULL,
      last_heartbeat_at INTEGER NOT NULL,
      status TEXT NOT NULL
    )
  `);
  sql.exec(`CREATE INDEX IF NOT EXISTS idx_gw_status_hb ON gateways(status, last_heartbeat_at)`);

  function getById(id: string): Verification | undefined {
    const rows = sql.exec<VerificationRow>(
      `SELECT * FROM verifications WHERE id = ? LIMIT 1`,
      id
    ).toArray();
    return rows.length > 0 ? rowToVerification(rows[0]) : undefined;
  }

  return {
    create(v: Verification) {
      sql.exec(
        `INSERT INTO verifications
         (id, code, gateway_number, status, created_at, expires_at, verified_at, verified_phone, purpose)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        v.id,
        v.code,
        v.gatewayNumber,
        v.status,
        v.createdAt,
        v.expiresAt,
        v.verifiedAt ?? null,
        v.verifiedPhone ?? null,
        v.purpose ?? null
      );
    },

    getById,

    getByCode(code) {
      const rows = sql.exec<VerificationRow>(
        `SELECT * FROM verifications WHERE code = ? AND status = 'pending' LIMIT 1`,
        code
      ).toArray();
      return rows.length > 0 ? rowToVerification(rows[0]) : undefined;
    },

    list(limit) {
      const rows = sql.exec<VerificationRow>(
        `SELECT * FROM verifications ORDER BY created_at DESC LIMIT ?`,
        limit
      ).toArray();
      return rows.map(rowToVerification);
    },

    count() {
      const rows = sql.exec<{ c: number }>(`SELECT COUNT(*) as c FROM verifications`).toArray();
      return rows[0]?.c ?? 0;
    },

    pendingCodes() {
      const rows = sql.exec<{ code: string }>(
        `SELECT code FROM verifications WHERE status = 'pending'`
      ).toArray();
      return new Set(rows.map((r) => r.code));
    },

    markExpired(id) {
      const before = getById(id);
      if (!before) return undefined;
      sql.exec(`UPDATE verifications SET status = 'expired' WHERE id = ?`, id);
      return { ...before, status: "expired" };
    },

    markVerified(id, phone) {
      const before = getById(id);
      if (!before) return undefined;
      const verifiedAt = Date.now();
      sql.exec(
        `UPDATE verifications SET status = 'verified', verified_at = ?, verified_phone = ? WHERE id = ?`,
        verifiedAt,
        phone,
        id
      );
      return { ...before, status: "verified", verifiedAt, verifiedPhone: phone };
    },

    sweepExpired(now) {
      sql.exec(
        `UPDATE verifications SET status = 'expired' WHERE status = 'pending' AND expires_at < ?`,
        now
      );
    },

    recordHeartbeat(number, status, at) {
      // Upsert: keep first_seen_at on conflict, refresh last_heartbeat_at + status.
      sql.exec(
        `INSERT INTO gateways (number, first_seen_at, last_heartbeat_at, status)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(number) DO UPDATE SET
           last_heartbeat_at = excluded.last_heartbeat_at,
           status = excluded.status`,
        number,
        at,
        at,
        status
      );
    },

    listGateways() {
      const rows = sql.exec<{
        number: string;
        first_seen_at: number;
        last_heartbeat_at: number;
        status: GatewayStatus;
      }>(`SELECT * FROM gateways ORDER BY last_heartbeat_at DESC`).toArray();
      return rows.map<GatewayRow>((r) => ({
        number: r.number,
        firstSeenAt: r.first_seen_at,
        lastHeartbeatAt: r.last_heartbeat_at,
        status: r.status,
      }));
    },

    onlineGateways(cutoff) {
      const rows = sql.exec<{ number: string }>(
        `SELECT number FROM gateways WHERE status = 'online' AND last_heartbeat_at >= ?`,
        cutoff
      ).toArray();
      return rows.map((r) => r.number);
    },
  };
}
