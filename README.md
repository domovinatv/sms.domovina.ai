# sms.domovina.ai

Self-hosted SMS gateway for **domovina.ai**, built on top of [`NdoleStudio/httpsms`](https://github.com/NdoleStudio/httpsms) and deployed to a private Coolify instance behind Cloudflare Tunnel. Includes a **Reverse OTP** PoC service that lets a web frontend verify a phone number by asking the user to send an SMS to the gateway.

- **Web UI:** <https://sms.domovina.ai>
- **API:** <https://sms-api.domovina.ai>
- **Android app:** <https://github.com/domovinatv/sms.domovina.ai/releases/latest>

## What's in this repo

```
.
├── httpsms/        upstream NdoleStudio/httpsms (pulled in as a git subtree)
│                   contains the Go API server, Vue/Nuxt 2 web frontend,
│                   Kotlin Android client, integration tests
├── coolify/        deployment overlay for our private Coolify on Oracle ARM
│                   docker-compose.yml + ARM-friendly Dockerfiles + nginx + .env.example
└── webhook/        Reverse OTP service — Hono + Bun, JWT-verified webhook
                    receiver from httpsms, in-memory verification store, demo HTML
                    UI, Bun test suite (32 tests covering matcher + API)
```

## Architecture

```
                          ┌─────────────────┐
   browser  ──HTTPS──▶    │  Cloudflare     │ ── tunnel ──▶  Oracle Cloud (ARM)
                          │  edge + tunnel  │                   │
                          └─────────────────┘                   ▼
                                                       ┌────────────────┐
                                                       │ Coolify proxy  │
                                                       │   (Traefik)    │
                                                       └───┬───────┬────┘
                                                           │       │
                                            sms.…ai  ──────┘       └──── sms-api.…ai
                                                │                        │
                                                ▼                        ▼
                                         ┌────────────┐           ┌────────────┐
                                         │  web (Nuxt │           │  api (Go,  │
                                         │  static    │           │  Fiber)    │
                                         │  → nginx)  │           │            │
                                         └────────────┘           └─────┬──────┘
                                                                        │
                                                  ┌──────────┐  ┌───────┴───┐  ┌────────┐
                                                  │ postgres │  │ redis     │  │  FCM   │
                                                  └──────────┘  └───────────┘  └───┬────┘
                                                                                   │
                                                            (push notifications)   │
                                                                                   ▼
                                                                       ┌────────────────┐
                                                                       │ Android client │
                                                                       │ (ai.domovina.  │
                                                                       │  sms package)  │
                                                                       │                │
                                                                       │ - SIM gateway  │
                                                                       │ - foreground   │
                                                                       │   service      │
                                                                       │ - in-app log   │
                                                                       └────────────────┘
                                                                              │
                                                                              ▼
                                                                          GSM network
```

The Android client is the actual SMS sender/receiver. Inbound messages get forwarded to the API as `message.phone.received` events; outbound messages from the API arrive on the device via FCM, which wakes the app and triggers `SmsManager.sendTextMessage()`.

## Deploying the server

Coolify (Docker Compose application type), pointed at this repo:

| Setting | Value |
| --- | --- |
| **Source** | `https://github.com/domovinatv/sms.domovina.ai`, branch `main` |
| **Compose path** | `coolify/docker-compose.yml` |
| **Domains** | `sms.domovina.ai` for `web`, `sms-api.domovina.ai` for `api` |
| **Env vars** | see `coolify/.env.example` — all 32 keys |
| **Build args** | enable build-time toggle for `FIREBASE_*` and `API_BASE_URL` |
| **Secrets** | `POSTGRES_PASSWORD`, `FIREBASE_CREDENTIALS`, `SMTP_PASSWORD` |

Cloudflare Tunnel routes both hostnames to Coolify's Traefik on `http://localhost:80`. TLS terminates at Cloudflare's edge.

## Building & releasing the Android app

```bash
cd httpsms/android
./gradlew :app:assembleRelease

# Sideload to a connected device
./gradlew :app:installRelease

# Publish a GitHub release with the APK attached
gh release create v0.1.x \
  --repo domovinatv/sms.domovina.ai \
  --title "v0.1.x — short description" \
  --notes-file release-notes.md \
  --latest \
  app/build/outputs/apk/release/app-release.apk
```

The release variant currently reuses the debug signing config so the APK installs on any device without setting up a Play Store keystore. **Replace with a dedicated signingConfig before publishing to Play Store.**

The Android package is renamed from upstream's `com.httpsms` to `ai.domovina.sms` so it can be installed alongside the original httpSMS app, and so a Firebase Android app under the user's own GCP project (`sms-domovina-ai-production`) can register cleanly.

## Reverse OTP service

```bash
cd webhook
bun install
bun test            # 32 tests, ~50ms
bun run dev         # serves on :8000, demo HTML at /
```

Endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/verifications` | Start a verification — returns `{ id, code, gateway_number }` |
| `GET` | `/api/verifications/:id` | Poll status (`pending` / `verified` / `expired`) |
| `GET` | `/api/verifications` | Admin list of last 100 |
| `POST` | `*` (catchall) | httpsms webhook endpoint, JWT-verified (HS256) |
| `GET` | `/` | Demo HTML — start a verification, copy code, tap "Open SMS app" |

The flow: a user wants to prove ownership of a phone number → frontend calls `/api/verifications` → user sends an SMS containing the issued code (e.g. `KFVT7Y`) to the gateway number → Android client forwards to httpsms → httpsms fires a signed webhook → service marks the verification as verified and returns the sender's phone number.

State is held in two `Map`s in `app.ts`. **Production deployments should swap these for a database** — see the `createApp(opts)` factory in `app.ts:createApp`.

## Upstream maintenance

Upstream is pulled in as a git subtree:

```bash
# Fetch the latest from NdoleStudio/httpsms into the httpsms/ folder
git subtree pull --prefix=httpsms httpsms-upstream main --squash
```

Local fork-modifications inside `httpsms/`:

- Android package renamed `com.httpsms` → `ai.domovina.sms` (applicationId, namespace, Kotlin source layout, manifest, strings, fallback URLs).
- `LogzTree.kt` no longer ships logs to upstream's Axiom dataset; replaced with an in-memory ring buffer surfaced through a new `LogActivity`.
- `BootReceiver.kt` now also handles `LOCKED_BOOT_COMPLETED`, `MY_PACKAGE_REPLACED`, `QUICKBOOT_POWERON`, with a `UserUnlockedReceiver` for Direct Boot handoff.
- Release builds reuse the debug signing config (development convenience).
- `MainActivity` heartbeat error reporting upgraded with a copy-able dialog.
- New `ai.domovina.sms.LogActivity` shows gateway events as a list (← received, → sent, ✓ delivered, ✗ failed).

These will need to be re-applied or rebased when pulling upstream.

## Filed upstream issues

- [`NdoleStudio/httpsms#881`](https://github.com/NdoleStudio/httpsms/issues/881) — API key rotation does not invalidate the auth ristretto cache; old keys remain valid up to 2h after rotation.

## License

httpsms is AGPL-3.0; this repo inherits that license for everything inside `httpsms/`. The deployment overlay (`coolify/`) and Reverse OTP service (`webhook/`) are this project's own work, also distributed under AGPL-3.0 to stay compatible.
