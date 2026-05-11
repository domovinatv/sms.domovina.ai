/**
 * Verification storage abstraction.
 *
 * Two implementations live next to each other:
 * - createMemoryStorage(): Map-backed, used by `bun run dev` and tests.
 * - createDurableObjectStorage(): SQLite-backed, used in the Cloudflare Worker.
 *
 * App code calls these intent-shaped methods (markVerified / markExpired /
 * sweepExpired) rather than mutating Verification objects directly, so the
 * persistence layer can be swapped without touching app.ts.
 */

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

export interface Storage {
  create(v: Verification): void;
  getById(id: string): Verification | undefined;
  getByCode(code: string): Verification | undefined;
  list(opts: { limit: number; offset?: number; status?: Status }): Verification[];
  count(status?: Status): number;
  /** Codes currently held by pending verifications (for collision check). */
  pendingCodes(): Set<string>;
  /** Mark expired and remove from code index. Returns updated row. */
  markExpired(id: string): Verification | undefined;
  /** Mark verified, record phone, remove from code index. Returns updated row. */
  markVerified(id: string, phone: string): Verification | undefined;
  /** Bulk mark stale pending rows as expired. */
  sweepExpired(now: number): void;

  // ── Gateway health tracking ────────────────────────────────────────────
  /** Upsert a heartbeat from a gateway phone. */
  recordHeartbeat(number: string, status: GatewayStatus, at: number): void;
  /** All known gateways, most-recently-heard first. */
  listGateways(): GatewayRow[];
  /** Numbers with status='online' AND last_heartbeat_at >= cutoff. */
  onlineGateways(cutoff: number): string[];
}

export type GatewayStatus = "online" | "offline";

export interface GatewayRow {
  number: string;
  firstSeenAt: number;
  lastHeartbeatAt: number;
  status: GatewayStatus;
}

// ── Memory implementation ──────────────────────────────────────────────────

export interface MemoryStorageState {
  verifications: Map<string, Verification>;
  codeToId: Map<string, string>;
}

export interface MemoryStorage extends Storage {
  state: MemoryStorageState;
}

export function createMemoryStorage(): MemoryStorage {
  const verifications = new Map<string, Verification>();
  const codeToId = new Map<string, string>();
  const gateways = new Map<string, GatewayRow>();

  return {
    state: { verifications, codeToId },

    create(v) {
      verifications.set(v.id, v);
      codeToId.set(v.code, v.id);
    },

    getById(id) {
      return verifications.get(id);
    },

    getByCode(code) {
      const id = codeToId.get(code);
      return id ? verifications.get(id) : undefined;
    },

    list({ limit, offset = 0, status }) {
      let arr = Array.from(verifications.values()).sort(
        (a, b) => b.createdAt - a.createdAt
      );
      if (status) arr = arr.filter((v) => v.status === status);
      return arr.slice(offset, offset + limit);
    },

    count(status) {
      if (!status) return verifications.size;
      let n = 0;
      for (const v of verifications.values()) if (v.status === status) n++;
      return n;
    },

    pendingCodes() {
      return new Set(codeToId.keys());
    },

    markExpired(id) {
      const v = verifications.get(id);
      if (!v) return undefined;
      v.status = "expired";
      codeToId.delete(v.code);
      return v;
    },

    markVerified(id, phone) {
      const v = verifications.get(id);
      if (!v) return undefined;
      v.status = "verified";
      v.verifiedAt = Date.now();
      v.verifiedPhone = phone;
      codeToId.delete(v.code);
      return v;
    },

    sweepExpired(now) {
      for (const v of verifications.values()) {
        if (v.status === "pending" && v.expiresAt < now) {
          v.status = "expired";
          codeToId.delete(v.code);
        }
      }
    },

    recordHeartbeat(number, status, at) {
      const existing = gateways.get(number);
      gateways.set(number, {
        number,
        firstSeenAt: existing?.firstSeenAt ?? at,
        lastHeartbeatAt: at,
        status,
      });
    },

    listGateways() {
      return Array.from(gateways.values()).sort(
        (a, b) => b.lastHeartbeatAt - a.lastHeartbeatAt
      );
    },

    onlineGateways(cutoff) {
      return Array.from(gateways.values())
        .filter((g) => g.status === "online" && g.lastHeartbeatAt >= cutoff)
        .map((g) => g.number);
    },
  };
}
