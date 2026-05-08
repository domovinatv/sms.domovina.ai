import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import { createApp, type AppHandle } from "../app";

const SIGNING_KEY = "test_signing_key_secret";
const GATEWAY = "+385998710482";

function buildJwt(extra: Record<string, unknown> = {}) {
  const now = Math.floor(Date.now() / 1000);
  return sign(
    {
      aud: ["http://test.local/webhook"],
      iss: "api.httpsms.com",
      sub: "user-id",
      exp: now + 600,
      iat: now,
      nbf: now - 600,
      ...extra,
    },
    SIGNING_KEY,
    "HS256"
  );
}

async function postWebhook(
  app: AppHandle["app"],
  opts: {
    content: string;
    from?: string;
    eventType?: string;
    auth?: string | null;
  }
) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.eventType !== undefined) headers["x-event-type"] = opts.eventType;
  else headers["x-event-type"] = "message.phone.received";
  if (opts.auth !== null) {
    headers.authorization = opts.auth ?? `Bearer ${await buildJwt()}`;
  }
  return app.request("/webhook", {
    method: "POST",
    headers,
    body: JSON.stringify({
      data: { contact: opts.from ?? "+385991111111", owner: GATEWAY, content: opts.content },
    }),
  });
}

async function startVerification(app: AppHandle["app"]) {
  const r = await app.request("/api/verifications", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ purpose: "test" }),
  });
  expect(r.status).toBe(200);
  const body = await r.json();
  return body as { id: string; code: string; gateway_number: string };
}

describe("Reverse OTP integration", () => {
  let handle: AppHandle;

  beforeEach(() => {
    handle = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumber: GATEWAY,
      ttlMs: 60_000,
      codeLen: 6,
    });
  });

  afterEach(() => {
    handle.state.verifications.clear();
    handle.state.codeToId.clear();
  });

  test("happy path: start → poll → SMS arrives → verified", async () => {
    const v = await startVerification(handle.app);
    expect(v.gateway_number).toBe(GATEWAY);
    expect(v.code).toHaveLength(6);

    const poll1 = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll1.status).toBe("pending");

    const r = await postWebhook(handle.app, { content: `code is ${v.code} thanks`, from: "+385991111111" });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.status).toBe("verified");
    expect(body.verified_phone).toBe("+385991111111");

    const poll2 = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll2.status).toBe("verified");
    expect(poll2.verified_phone).toBe("+385991111111");
  });

  test("matches user-typed code variants (case + position)", async () => {
    for (const wrap of [
      (c: string) => c,
      (c: string) => c.toLowerCase(),
      (c: string) => `prefix${c}`,
      (c: string) => `prefix${c.toLowerCase()}`,
      (c: string) => `${c}suffix`,
      (c: string) => `${c.toLowerCase()}suffix`,
      (c: string) => `prefix${c}suffix`,
      (c: string) => `prefix${c.toLowerCase()}suffix`,
      (c: string) => `Hi, my code is ${c}.`,
      (c: string) => `Hi, my code is ${c.toLowerCase()}.`,
    ]) {
      const v = await startVerification(handle.app);
      const r = await postWebhook(handle.app, { content: wrap(v.code) });
      const body = await r.json();
      expect(body.status).toBe("verified");
    }
  });

  test("rejects invalid JWT with 401", async () => {
    const r = await postWebhook(handle.app, { content: "anything", auth: "Bearer not-a-real-jwt" });
    expect(r.status).toBe(401);
  });

  test("accepts missing signature for manual debugging (does not 401)", async () => {
    // Production should reject these. PoC is permissive so curl tests work.
    const v = await startVerification(handle.app);
    const r = await postWebhook(handle.app, { content: v.code, auth: null });
    expect(r.status).toBe(200);
  });

  test("ignores non-message.phone.received events", async () => {
    const v = await startVerification(handle.app);
    const r = await postWebhook(handle.app, { content: v.code, eventType: "phone.heartbeat.online" });
    const body = await r.json();
    expect(body.ignored).toBe(true);

    // Still pending — heartbeat event must not consume the code.
    const poll = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll.status).toBe("pending");
  });

  test("single-use: code is invalidated after first match", async () => {
    const v = await startVerification(handle.app);

    const first = await postWebhook(handle.app, { content: v.code, from: "+385991111111" });
    expect((await first.json()).status).toBe("verified");

    // Same code, different sender — should NOT verify a second time.
    const second = await postWebhook(handle.app, { content: v.code, from: "+385992222222" });
    const body = await second.json();
    expect(body.matched).toBe(false);

    const poll = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll.verified_phone).toBe("+385991111111"); // unchanged
  });

  test("expired code does not verify", async () => {
    handle = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumber: GATEWAY,
      ttlMs: 0, // immediately expires
      codeLen: 6,
    });
    const v = await startVerification(handle.app);

    // Give the clock a tick to advance past expiresAt.
    await new Promise((r) => setTimeout(r, 5));
    handle.sweepExpired();

    const r = await postWebhook(handle.app, { content: v.code });
    const body = await r.json();
    // Either the code is gone from the index (matched:false) or the
    // status path returns "expired" — both are acceptable outcomes.
    expect(body.matched === false || body.status === "expired").toBe(true);

    const poll = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll.status).toBe("expired");
  });

  test("unknown code in content returns matched:false", async () => {
    await startVerification(handle.app);
    const r = await postWebhook(handle.app, { content: "ZZZZZZ" });
    const body = await r.json();
    expect(body.matched).toBe(false);
  });

  test("malformed payload (no from / no content) returns 400", async () => {
    const headers = {
      "content-type": "application/json",
      "x-event-type": "message.phone.received",
      authorization: `Bearer ${await buildJwt()}`,
    };
    const r = await handle.app.request("/webhook", {
      method: "POST",
      headers,
      body: JSON.stringify({ data: { owner: GATEWAY } }),
    });
    expect(r.status).toBe(400);
  });

  test("admin list returns recent verifications", async () => {
    const a = await startVerification(handle.app);
    const b = await startVerification(handle.app);
    const r = await handle.app.request("/api/verifications");
    const body = await r.json();
    expect(body.count).toBe(2);
    const ids = body.items.map((i: any) => i.id);
    expect(ids).toContain(a.id);
    expect(ids).toContain(b.id);
  });
});
