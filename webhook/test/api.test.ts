import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { sign } from "hono/jwt";
import { buildSmsBody, CODE_ALPHABET, createApp, type AppHandle } from "../src/app";

const SIGNING_KEY = "test_signing_key_secret";
const GATEWAY = "+385998710482";
const ADMIN_USER = "admin";
const ADMIN_PASS = "test_admin_pass";
const ADMIN_AUTH = "Basic " + btoa(ADMIN_USER + ":" + ADMIN_PASS);

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
      gatewayNumbers: [GATEWAY],
      ttlMs: 60_000,
      codeLen: 6,
      adminUser: ADMIN_USER,
      adminPass: ADMIN_PASS,
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

  test("ignores unknown event types", async () => {
    const v = await startVerification(handle.app);
    const r = await postWebhook(handle.app, { content: v.code, eventType: "phone.unknown.foo" });
    const body = await r.json();
    expect(body.ignored).toBe(true);

    const poll = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll.status).toBe("pending");
  });

  test("heartbeat events update gateway health and don't consume codes", async () => {
    const v = await startVerification(handle.app);

    // online heartbeat
    let r = await postWebhook(handle.app, {
      content: "ignored",
      eventType: "phone.heartbeat.online",
    });
    expect(r.status).toBe(200);
    let body = await r.json();
    expect(body.gateway).toBe(GATEWAY);
    expect(body.status).toBe("online");

    // verification untouched
    let poll = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll.status).toBe("pending");

    // gateways admin endpoint reflects the heartbeat (now under /admin/* + Basic Auth)
    const list = await (
      await handle.app.request("/admin/api/gateways", {
        headers: { authorization: ADMIN_AUTH },
      })
    ).json();
    expect(list.count).toBe(1);
    expect(list.online_count).toBe(1);
    expect(list.items[0].number).toBe(GATEWAY);
    expect(list.items[0].is_online).toBe(true);

    // offline heartbeat flips status
    r = await postWebhook(handle.app, {
      content: "ignored",
      eventType: "phone.heartbeat.offline",
    });
    body = await r.json();
    expect(body.status).toBe("offline");

    const list2 = await (
      await handle.app.request("/admin/api/gateways", {
        headers: { authorization: ADMIN_AUTH },
      })
    ).json();
    expect(list2.online_count).toBe(0);
    expect(list2.items[0].status).toBe("offline");

    // verification still pending — heartbeats never touch verification state
    poll = await (await handle.app.request(`/api/verifications/${v.id}`)).json();
    expect(poll.status).toBe("pending");
  });

  test("selection prefers online phones over offline ones", async () => {
    const numbers = ["+385990000001", "+385990000002", "+385990000003"];
    const multi = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumbers: numbers,
      ttlMs: 60_000,
      codeLen: 6,
      onlineCutoffMs: 60_000,
    });

    // Mark only the second number as online via a heartbeat webhook.
    const headers = {
      "content-type": "application/json",
      "x-event-type": "phone.heartbeat.online",
      authorization: `Bearer ${await buildJwt()}`,
    };
    await multi.app.request("/webhook", {
      method: "POST",
      headers,
      body: JSON.stringify({ data: { owner: numbers[1] } }),
    });

    // Every verification should now pick numbers[1], even though all 3 are
    // in the static fallback list.
    for (let i = 0; i < 20; i++) {
      const v = await startVerification(multi.app);
      expect(v.gateway_number).toBe(numbers[1]);
    }
  });

  test("selection falls back to known phones when none online, then to static", async () => {
    const numbers = ["+385990000001", "+385990000002"];
    const fallback = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumbers: numbers,
      ttlMs: 60_000,
      codeLen: 6,
      onlineCutoffMs: 60_000,
    });

    // Cold start: no heartbeats yet — pulls from static fallback.
    const v1 = await startVerification(fallback.app);
    expect(numbers).toContain(v1.gateway_number);

    // Mark numbers[0] online then offline. After that it's "known" but not "online".
    const baseHeaders = {
      "content-type": "application/json",
      authorization: `Bearer ${await buildJwt()}`,
    };
    for (const eventType of ["phone.heartbeat.online", "phone.heartbeat.offline"]) {
      await fallback.app.request("/webhook", {
        method: "POST",
        headers: { ...baseHeaders, "x-event-type": eventType },
        body: JSON.stringify({ data: { owner: numbers[0] } }),
      });
    }

    // No online phones anywhere → tier "known" picks the offline-but-seen one.
    for (let i = 0; i < 10; i++) {
      const v = await startVerification(fallback.app);
      expect(v.gateway_number).toBe(numbers[0]);
    }
  });

  test("allowlist excludes phones from rotation even when online", async () => {
    const numbers = ["+385990000001", "+385990000002", "+385990000003"];
    const allow = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumbers: numbers,
      gatewayAllowList: [numbers[0], numbers[2]], // exclude middle
      ttlMs: 60_000,
      codeLen: 6,
      onlineCutoffMs: 60_000,
    });

    // Even bringing the excluded phone online doesn't put it in rotation.
    const headers = {
      "content-type": "application/json",
      "x-event-type": "phone.heartbeat.online",
      authorization: `Bearer ${await buildJwt()}`,
    };
    await allow.app.request("/webhook", {
      method: "POST",
      headers,
      body: JSON.stringify({ data: { owner: numbers[1] } }),
    });

    for (let i = 0; i < 20; i++) {
      const v = await startVerification(allow.app);
      expect(v.gateway_number).not.toBe(numbers[1]);
    }
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
      gatewayNumbers: [GATEWAY],
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

  test("sms_body fits one GSM-7 segment and contains the code + browser cue", async () => {
    const v = await startVerification(handle.app);
    const r = await handle.app.request("/api/verifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ purpose: "test" }),
    });
    const body = await r.json();
    const sms: string = body.sms_body;

    // Single SMS segment in GSM-7 (no Croatian diacritics → no UCS-2 split).
    expect(typeof sms).toBe("string");
    expect(sms.length).toBeLessThanOrEqual(160);
    expect(sms).toContain(body.code);
    // Reminder to come back to the browser (the UX gap on iOS Messages).
    expect(sms.toLowerCase()).toContain("browser");
    // No Croatian diacritics; if these slip in, the carrier promotes the
    // segment to UCS-2 and the body suddenly has a 70-char limit.
    expect(sms).not.toMatch(/[šđčćžŠĐČĆŽ]/);
    // Sanity-bind the test to the helper used by the QR endpoint too.
    expect(sms).toBe(buildSmsBody(body.code));

    // Also exercised the freshly-started v above to make sure repeated
    // POSTs keep producing valid bodies.
    expect(v.code).toHaveLength(6);
  });

  test("sms_body template has no 6-char run from CODE_ALPHABET (no false-positive code substring)", async () => {
    // The matcher in findCodeInContent does a case-insensitive substring
    // search for any pending code inside the SMS content. If the surrounding
    // copy ever contains 6 consecutive chars from CODE_ALPHABET, a randomly
    // generated code could collide with the template itself.
    const template = buildSmsBody("XXXXXX").replace("XXXXXX", "");
    const alphabet = new Set(CODE_ALPHABET);
    const upper = template.toUpperCase();
    let run = 0;
    let maxRun = 0;
    for (const ch of upper) {
      if (alphabet.has(ch)) {
        run += 1;
        if (run > maxRun) maxRun = run;
      } else {
        run = 0;
      }
    }
    expect(maxRun).toBeLessThan(6);
  });

  test("SMS body still verifies: webhook matches code embedded in friendly template", async () => {
    // End-to-end: start a verification, simulate the user sending the SMS
    // *with the friendly template wrapped around the code* (which is what
    // they'd actually do from iOS Messages via the deep link), and confirm
    // the regex still extracts the code.
    const r = await handle.app.request("/api/verifications", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ purpose: "test" }),
    });
    const v = await r.json();
    const webhookRes = await postWebhook(handle.app, { content: v.sms_body });
    expect(webhookRes.status).toBe(200);
    const body = await webhookRes.json();
    expect(body.status).toBe("verified");
  });

  test("opt.domovina.ai typo redirects 301 to canonical otp.domovina.ai (root)", async () => {
    const r = await handle.app.request("https://opt.domovina.ai/");
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe("https://otp.domovina.ai/");
  });

  test("opt.domovina.ai redirect preserves path and query string", async () => {
    const r = await handle.app.request(
      "https://opt.domovina.ai/api/verifications/abc?foo=bar&baz=1"
    );
    expect(r.status).toBe(301);
    expect(r.headers.get("location")).toBe(
      "https://otp.domovina.ai/api/verifications/abc?foo=bar&baz=1"
    );
  });

  test("canonical otp.domovina.ai is served normally (no redirect loop)", async () => {
    const r = await handle.app.request("https://otp.domovina.ai/health");
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.ok).toBe(true);
  });

  test("QR endpoint returns SVG encoding the sms: URI for the verification", async () => {
    const v = await startVerification(handle.app);
    const r = await handle.app.request(`/api/verifications/${v.id}/qr.svg`);
    expect(r.status).toBe(200);
    expect(r.headers.get("content-type")).toMatch(/image\/svg\+xml/);
    const svg = await r.text();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    // qrcode-svg renders the QR modules as a single <path>; presence of a
    // path with a non-empty `d` attribute proves the encoder actually ran
    // on the sms: payload (an empty/failed QR would have no modules).
    expect(svg).toMatch(/<path[^>]+d="[^"]+/);
  });

  test("QR endpoint returns 404 for unknown verification id", async () => {
    const r = await handle.app.request("/api/verifications/does-not-exist/qr.svg");
    expect(r.status).toBe(404);
  });

  test("admin list (with Basic Auth) returns recent verifications DESC", async () => {
    const a = await startVerification(handle.app);
    await new Promise((r) => setTimeout(r, 2)); // distinct createdAt
    const b = await startVerification(handle.app);
    const r = await handle.app.request("/admin/api/verifications", {
      headers: { authorization: ADMIN_AUTH },
    });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.total).toBe(2);
    expect(body.total_all).toBe(2);
    // DESC by created_at — most recent first.
    expect(body.items[0].id).toBe(b.id);
    expect(body.items[1].id).toBe(a.id);
  });

  test("admin list requires Basic Auth — 401 without header", async () => {
    await startVerification(handle.app);
    const r = await handle.app.request("/admin/api/verifications");
    expect(r.status).toBe(401);
    expect(r.headers.get("www-authenticate")).toMatch(/^Basic/i);
  });

  test("admin list rejects wrong credentials with 401", async () => {
    const r = await handle.app.request("/admin/api/verifications", {
      headers: { authorization: "Basic " + btoa("admin:wrong") },
    });
    expect(r.status).toBe(401);
  });

  test("admin page (HTML) also requires Basic Auth", async () => {
    const noAuth = await handle.app.request("/admin");
    expect(noAuth.status).toBe(401);
    const withAuth = await handle.app.request("/admin", {
      headers: { authorization: ADMIN_AUTH },
    });
    expect(withAuth.status).toBe(200);
    expect(withAuth.headers.get("content-type") ?? "").toMatch(/text\/html/);
    const html = await withAuth.text();
    expect(html).toContain("Verifikacije");
    expect(html).toContain("/admin/api/verifications");
  });

  test("admin list supports status filter + pagination", async () => {
    // 3 verifications; verify 1, leave 2 pending.
    const a = await startVerification(handle.app);
    await new Promise((r) => setTimeout(r, 2));
    const b = await startVerification(handle.app);
    await new Promise((r) => setTimeout(r, 2));
    await startVerification(handle.app);
    await postWebhook(handle.app, { content: b.code, from: "+385991234567" });

    // status=verified returns just b
    const verifiedRes = await handle.app.request(
      "/admin/api/verifications?status=verified",
      { headers: { authorization: ADMIN_AUTH } }
    );
    const verified = await verifiedRes.json();
    expect(verified.total).toBe(1);
    expect(verified.items).toHaveLength(1);
    expect(verified.items[0].id).toBe(b.id);
    expect(verified.items[0].verified_phone).toBe("+385991234567");
    expect(verified.total_all).toBe(3);
    expect(verified.verified_count).toBe(1);
    expect(verified.pending_count).toBe(2);

    // limit=1&offset=0 → newest; offset=1 → second newest
    const p1 = await (await handle.app.request(
      "/admin/api/verifications?limit=1&offset=0",
      { headers: { authorization: ADMIN_AUTH } }
    )).json();
    const p2 = await (await handle.app.request(
      "/admin/api/verifications?limit=1&offset=1",
      { headers: { authorization: ADMIN_AUTH } }
    )).json();
    expect(p1.items).toHaveLength(1);
    expect(p2.items).toHaveLength(1);
    expect(p1.items[0].id).not.toBe(p2.items[0].id);
    expect(p1.items[0].id).not.toBe(a.id); // a is oldest, should not be on first page
  });

  test("admin returns 503 when credentials are not configured (fail-closed)", async () => {
    const noAdmin = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumbers: [GATEWAY],
      ttlMs: 60_000,
      codeLen: 6,
      // adminUser/adminPass intentionally omitted
    });
    const r = await noAdmin.app.request("/admin/api/verifications", {
      headers: { authorization: ADMIN_AUTH },
    });
    expect(r.status).toBe(503);
  });

  test("old public /api/verifications GET no longer exists (404)", async () => {
    await startVerification(handle.app);
    const r = await handle.app.request("/api/verifications");
    expect(r.status).toBe(404);
  });

  test("multi-gateway: random selection eventually hits every configured number", async () => {
    const numbers = ["+385990000001", "+385990000002", "+385990000003"];
    const multi = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumbers: numbers,
      ttlMs: 60_000,
      codeLen: 6,
    });
    const seen = new Set<string>();
    // 60 picks across 3 numbers — chance of missing one is (2/3)^60 ≈ 1e-10.
    for (let i = 0; i < 60; i++) {
      const v = await startVerification(multi.app);
      seen.add(v.gateway_number);
    }
    for (const n of numbers) expect(seen.has(n)).toBe(true);
  });

  test("multi-gateway: webhook accepts SMS regardless of which gateway received it", async () => {
    const numbers = ["+385990000001", "+385990000002"];
    const multi = createApp({
      signingKey: SIGNING_KEY,
      gatewayNumbers: numbers,
      ttlMs: 60_000,
      codeLen: 6,
    });
    const v = await startVerification(multi.app);
    // SMS arrives reporting `owner` as a gateway *different* from the one shown
    // to the user — webhook must still match by code, not by recipient number.
    const otherGateway = numbers.find((n) => n !== v.gateway_number)!;
    const headers = {
      "content-type": "application/json",
      "x-event-type": "message.phone.received",
      authorization: `Bearer ${await buildJwt()}`,
    };
    const r = await multi.app.request("/webhook", {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: { contact: "+385991111111", owner: otherGateway, content: v.code },
      }),
    });
    expect(r.status).toBe(200);
    const body = await r.json();
    expect(body.status).toBe("verified");
  });
});
