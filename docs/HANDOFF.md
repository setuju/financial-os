# Project Handoff & Maintenance Guide — Financial OS

This document serves as the operational handbook for future maintainers and hackathon judges evaluating the repository health.

## 1. System Topology
- **Frontend Host**: Vercel (Next.js 14 App Router, edge middleware for cookie checks).
- **Backend Host**: Render (Fastify 4, Singapore region).
- **Database**: Neon PostgreSQL (Serverless).
- **Cache & Store**: Upstash Redis, Elastic Cloud.
- **CI/CD**: GitHub Actions (`.github/workflows/ci.yml`); enforces `tsc --noEmit` and `vitest run` on every push.

## 2. Security Model & Tenancy
- **No implicit admin fallback**: Requests without a valid `X-Session-Id` receive `401 Unauthorized`.
- **Strict CORS**: Allowed origins restricted to production domains and local development.
- **Atomic Payouts**: Payouts and ledger inserts are wrapped in SQL transactions with `BEGIN/COMMIT/ROLLBACK`.
- **Rate Limiting**: Global `100 req/min` guard; OCR is isolated to prevent quota exhaustion.

## 3. Environment Variables
Refer to `backend/.env.example` for the authoritative list. Key variables:
- `DATABASE_URL` / `DATABASE_URL_UNPOOLED`
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE` (`sandbox`)
- `ASTROPODS_CLIENT_ID`, `ASTROPODS_CLIENT_SECRET`
- `OPENROUTER_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `OCR_SPACE_KEY`
- `ELASTIC_URL`, `ELASTIC_API_KEY`

## 4. Database Schema Highlights
- **`transactions`**: Stores parsed entries; supports `is_projection` for Horizon forecasts and `source` enum (`rule`, `llm`, `manual_edit`, `payout`).
- **`surplus_periods`**: Handles month-to-month closing balance cascades.
- **`advisor_advice`**: Persists AI advisor responses keyed by session and persona.

## 5. Running E2E Verification
Use the provided diagnostic script:
```bash
# Check headers, IDOR, SQLi, and OCR payload limits
bash scripts/security-scan.sh
```
*(Ensure you have `curl` and `jq` installed locally.)*

## 6. Render Cold Start & Deployment
- The `render.yaml` file defines a single web service with `rootDir: backend/`.
- Build command: `npm install -g pnpm && pnpm install && pnpm migrate`.
- Because Render uses a free tier, cold starts take ~50s; a keep-alive ping to `/health` is recommended before demos.
