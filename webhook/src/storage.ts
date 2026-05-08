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
  list(limit: number): Verification[];
  count(): number;
  /** Codes currently held by pending verifications (for collision check). */
  pendingCodes(): Set<string>;
  /** Mark expired and remove from code index. Returns updated row. */
  markExpired(id: string): Verification | undefined;
  /** Mark verified, record phone, remove from code index. Returns updated row. */
  markVerified(id: string, phone: string): Verification | undefined;
  /** Bulk mark stale pending rows as expired. */
  sweepExpired(now: number): void;
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

    list(limit) {
      return Array.from(verifications.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
    },

    count() {
      return verifications.size;
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
  };
}
