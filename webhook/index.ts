/**
 * Bun entry point for local development. Production runs on Cloudflare via
 * src/worker.ts. The Hono app + storage abstractions live in src/ and are
 * shared between both runtimes.
 *
 * NOTE: in-memory storage. Restart wipes pending verifications. For prod,
 * use the Cloudflare deploy (DO SQLite-backed).
 */
import { createApp } from "./src/app";

const PORT = Number(process.env.PORT) || 8000;
const PUBLIC_URL =
  process.env.NGROK_URL ?? "https://uniformly-credible-opossum.ngrok-free.app";
const SIGNING_KEY =
  process.env.HTTPSMS_SIGNING_KEY ??
  "wh_sign_dasdasdafrete45345gdfvb767834rfsdfsd";
const GATEWAY_NUMBERS = (process.env.GATEWAY_NUMBERS ?? process.env.GATEWAY_NUMBER ?? "+385998710482")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const TTL_MS = Number(process.env.VERIFICATION_TTL_MS) || 10 * 60 * 1000;
const CODE_LEN = Number(process.env.CODE_LEN) || 6;

const handle = createApp({
  signingKey: SIGNING_KEY,
  gatewayNumbers: GATEWAY_NUMBERS,
  ttlMs: TTL_MS,
  codeLen: CODE_LEN,
  publicOrigin: PUBLIC_URL,
});

setInterval(handle.sweepExpired, 30_000);

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

console.log();
console.log(bold("Reverse OTP PoC (Hono + Bun)"));
console.log(`  ${dim("local:")}    http://localhost:${PORT}`);
console.log(`  ${dim("public:")}   ${yellow(PUBLIC_URL)}`);
console.log(`  ${dim("gateways:")} ${GATEWAY_NUMBERS.join(", ")}`);
console.log(`  ${dim("signing:")}  HS256 JWT, key=${SIGNING_KEY.slice(0, 10)}...`);
console.log(`  ${dim("ttl:")}      ${TTL_MS / 1000}s, code length=${CODE_LEN}`);
console.log();
console.log(dim(`  Open ${PUBLIC_URL}/  for the demo UI.`));
console.log(dim(`  Configure httpsms webhook: URL=${PUBLIC_URL}, Signing Key=${SIGNING_KEY}`));
console.log(dim(`  State is in-memory; restart wipes pending verifications.`));
console.log();

export default {
  port: PORT,
  fetch: handle.app.fetch,
};
