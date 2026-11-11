# Changelog

All notable changes to Financial OS. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

## [0.5.0] — 2026-11-11 — Submission-ready

**Full-featured multi-tenant natural-language finance demo for PayPal AI Hackathon 2026.**

### Added — Multi-Tenant (B1–B5)
- Migration 007: `demo_sessions` table + `session_id` UUID on 5 data tables + backfill to admin + composite indexes
- `demo-sessions` repository: `registerSession` (5-char A-Z2-9 password), `verifyLogin` (bcrypt), `verifySession`, `ensureAdminSession` (idempotent bootstrap)
- `POST /demo/signup`, `POST /demo/login`, `POST /demo/reset` endpoints
- Session-aware seed (`lib/seed-runner.ts`): `DELETE WHERE session_id` + re-insert per session
- Frontend auth flow: `/signup` (name → 5-char password), `/login` (name + password), `/reset` (session-scoped)
- Middleware cookie gate: `fos_session_id` (httpOnly) + `fos_name`, `fos_is_admin` (readable)
- `lib/api-server.ts`: server-only fetch helpers pass `X-Session-Id` from `cookies()` — **fixes server component data leak**
- `/api/proxy/[...path]` forwards `X-Session-Id` from cookie to backend
- NavBar "Hi, {name}" + ResetButton (RotateCcw icon)

### Added — AI Assistant (dual-provider)
- `google/gemini-3.8-flash` via OpenRouter as primary
- **Fallback to Gemini native** (`gemini-3-flash-preview` via Google AI Studio) when OpenRouter fails
- `/assistant/info` exposes `providers.{openrouter,gemini}.available`
- Canary protection on both providers

### Added — SEO + Features page
- `app/features/page.tsx`: 12 feature cards (5 groups) + 7-step User Journey Map + tooltips
- `app/sitemap.ts` (10 public URLs) + `app/robots.ts` (allow public, disallow 5 dynamic pages)
- Metadata: `metadataBase`, keywords, OG, Twitter, robots, icons, `translate="no"`
- JSON-LD: SoftwareApplication (landing), WebPage (features)

### Added — UX polish
- Onboarding banner for new users (dismissible, localStorage)
- Signup redirects to `/features` (journey map immediately after account creation)
- NavBar + LandingNav tooltips (`title` attribute, zero JS)
- Ledger sortable columns (period/income/expense/net/status, click to toggle, default period DESC)
- Ledger hint banner: "Goals are in Horizon · Oracle in Horizon"
- Light/dark mode with CSS variables + 300ms inversion
- Voice input with mic permission flow, audio meter, silence hint, cancel button

### Fixed — Critical bugs
- **Impact cache stale**: `POST /transactions` etc. now invalidate `surplus_periods` cache → next read recomputes
- **Reports date range**: `fromTs`/`toTs` end-of-day inclusive → today's transactions visible in Ledger
- **Malformed UUID 500** → `verifySession` validates UUID regex before query → returns null (fallback to admin)
- **Journal `<= now` filter** → `<= endOfToday` → today's transactions visible
- **Hydration #418/#423** → theme `<script>` moved inside `<head>` (was invalid child of `<html>`)

### Fixed — Security
- Permissions-Policy `microphone=()` → `microphone=(self)` (was blocking voice for all origins)
- Backend `onSend` hook: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
- Frontend `next.config.mjs` `headers()`: same 4 headers
- `verifySession` rejects malformed UUIDs before DB query

### Fixed — Accessibility (WCAG AA)
- `--ink-faint` light: #A1A1AA → #71717A (2.56:1 → 4.7:1)
- `--ink-faint` dark: #52525B → #A1A1AA (3.5:1 → 9.5:1)
- Footer text: `text-ink-faint` → `text-ink-soft`
- NavBar + LandingNav logo links: `aria-label="Financial OS home"`

### Changed
- Categories 8 → 12: `+ groceries, fitness, subscription, travel` (keyword dict ordered specific→generic)
- Indonesian UI text → English (parser tests + vocab KEPT = bilingual feature)
- Assistant `max_tokens`: 400 → 600 (thinking tokens headroom)
- `renderRich()` in assistant widget: backtick → code chip, **bold** → strong (React nodes, no `dangerouslySetInnerHTML` for messages)
- Impact first-month logic: current surplus as distributable for month 1, auto-switches to last-month-closing from month 2

### Infrastructure
- Docker Compose: PostgreSQL 16.15 + Redis 7.0.15 (healthchecks, named volumes, restart unless-stopped)
- Render: auto-deploy on commit, cold start ~50s on free tier, keep-alive via UptimeRobot
- Vercel: auto-deploy on push, Node.js proxy route for client env boundary
- Backup tag: `pre-multitenant-2026-11-10` (git rollback point)
- Backup SQL: `~/saturumah-backups/neon-2026*.sql` (Node dump, psql-restorable)

### Known limitations
- npm audit: 3 crit/7 high (backend), 3 crit/12 high (frontend) — all **transitive dependencies** of Next.js/Fastify/Bryntum/Elastic. Risky to fix at T-30h
- PayPal payout: synchronous 1.5s TTFB (acceptable for sandbox demo)
- Render cold start: ~50s after 15min idle (pre-warm required before demo)
- Firefox: Web Speech API not supported (browser limitation, not ours)

---

## [0.4.0] — 2026-11-08 — Sesi 10: Ledger, PDF, Voice, OCR

### Added
- `/ledger` page: Grid + Notebook view, 36 filter combinations, Opening/Closing columns, PDF export
- `/journal`: PDF export (2-page A4)
- `/journal/new`: voice input (Web Speech API) + inline amount editor for ASR misfires
- `/` dashboard: USD stat cards + quick actions
- AI assistant: scoped prompt (canary-protected), `POST /assistant/chat`, `GET /assistant/info`
- OCR receipt: `POST /receipts/ocr` via Gemini 3 Flash vision
- Surplus Oracle: predict / edit / achieve / celebrate
- Goals API: list / create
- Reports API: aggregated buckets (day/week/month/year × type × projections)
- `POST /reports/summary` for bucket aggregation
- Migration 004: `goals` + `is_projection` column on `transactions`
- Migration 005: oracle CRUD (period + reason columns)
- Migration 006: `surplus_periods` cascade table
- Design system: `Button`, `Card`, `Badge`, `StatCard`, `PageHeader`, `EmptyState`, `Skeleton`, `Spinner`
- `lib/api.ts`: `/api/proxy` branching for client components

### Fixed
- Parser v2: negation rejection + intent rejection ("want to", "planning to")
- USD-first formatting across all pages (was IDR)

### Changed
- Parser: negation + intent rejection is contract (tests 40/40)

---

## [0.3.0] — 2026-11-05 — Surplus Oracle + PayPal Payouts

### Added
- Surplus Oracle card (predict / edit / delete)
- PayPal Payouts integration via APIMatic-generated TypeScript SDK
- Ethical Surplus Distribution flow: two-step confirm → sandbox payout
- Impact Wallet page: verified / in-progress / donation log
- Vetted receivers (AidPulse, CareGrid, OpenTreasury)

---

## [0.2.0] — 2026-11-04 — Backend + Frontend scaffold

### Added
- Fastify 4 + TypeScript strict ESM backend
- Docker Compose: PostgreSQL 16.15 + Redis 7.0.15 (healthchecks, named volumes)
- `/health` endpoint (PG + Redis probes, 3s fast-fail budget)
- Next.js 14.2 + Tailwind frontend scaffold
- Health dashboard (server-rendered, force-dynamic)

---

## [0.1.0] — 2026-11-04 — Foundation

### Added
- WSL2 Ubuntu environment: Node 20.20.2 (nvm), pnpm 12.16.1, Docker 29.1.3
- GitHub repo `setuju/financial-os` (private)
- Documentation structure (system-prompt, rules, persona, roadmap)
- README stub
