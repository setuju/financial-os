# Changelog

All notable changes to Financial OS. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versioning follows [SemVer](https://semver.org/).

---

## [0.6.0] — 2026-11-12 — Interactive Preview & Real Impact

### Added — Live Preview (Journal)
- Debounced (500ms) server-side parse while typing in `/journal/new`
- Editable transaction cards BEFORE saving: amount, type (IN/OUT), category, raw text
- Per-line pencil icon opens inline edit; hit ✓ to save
- Submit button disabled until preview has valid transactions
- Backend endpoint: `POST /transactions/preview` (no DB write)

### Added — Channel3 Product Search (Horizon)
- "Search Product" button opens modal; queries Channel3 API via `/api/channel3/search`
- Selected product auto-fills goal name + target_amount
- "Buy (Sandbox)" button opens confirmation modal (no redirect to /impact)
- API key: `CHANNEL3_API_KEY` (Vercel env)

### Added — Real Donation Organizations (Impact)
- 8 real orgs: American Red Cross, Direct Relief, UNICEF, World Central Kitchen, Water.org, Doctors Without Borders, Rainforest Alliance, Save the Children
- Each card has "Visit Website ↗" to real donation page
- PayPal Payouts routes to sandbox email for demo purposes

### Added — Live Disaster & News Feed
- `/api/disasters` merges USGS earthquake data + Google News for 8 orgs
- Displayed as "Live Global Alerts & Partner News" at bottom of `/impact`
- Footer disclaimer about third-party content

### Added — Current Balance Card
- `/journal`: 4th stat card = Total IN − Total OUT
- `/ledger` SummaryStats: "Net" → "Current Balance"
- Positive = accent blue, negative = danger red

### Added — Parser V8 (Context-Aware, Multi-Transaction)
- Word-boundary chunking (split by integer tokens, not character index)
- Context Inheritance: chunks without verbs inherit prior clause's type
- First-verb-wins logic for `"get pay"` (income) vs `"pay"` (expense)
- 17 transaction categories (was 12): + freelance, bonus, gift, donation, debt, investment
- Category type-gating: income chunks can't be `shopping`; expense chunks can't be `income`
- Removed person names (mom/dad) from `gift` category
- Removed `'pay'` from INCOME_VERBS (was false positive)
- Added `get`, `give to`, `freelance`, `bonus` as primary verbs/nouns

### Added — Batch Insert API
- `POST /transactions/batch` accepts array of pre-edited transactions
- Wrapped in BEGIN/COMMIT — atomic (all-or-nothing)
- DB check constraint respected (`source='rule'`)

### Fixed — Database
- `transactions_source_check` constraint: `'manual_edit'` → `'rule'`
- Seed data: trimmed to Nov 10 (removed donation entries); aligned with parser categories
- November seed enriched: freelance, dividend, bonus, donation examples

### Fixed — Frontend
- Hydration: removed duplicate `suppressHydrationWarning` in `layout.tsx`
- Impact page: `Dashboard` link → `/dashboard` (was going to `/`)
- PDF Journal + Ledger: amount column `halign: 'right'`, table width fills page
- Vercel ESLint: removed all unused vars/imports
- Category badges: format as `IN:category` / `OUT:category` (web + PDF)

### Fixed — Backend
- `/transactions/batch`: JSON schema validation + try/catch with raw error forwarding
- Batch error UI now shows specific backend message (not "Unknown error")

### Changed — UI
- Live Preview uses compact card layout with pencil edit
- `AmountEditor` permanently removed (superseded by inline edit in v0.6.0).
- Cleaned up orphaned references to `AmountEditor` in `/features` page.
- `IN:` / `OUT:` prefix universally applied (preview, journal table, PDF)

### Docs
- Added persona #15 (Linguist & Financial Grammar Expert)
- Documented "First Verb Wins" + "Context Inheritance" NLP strategies

---

## [0.5.0] — 2026-11-11 — Submission-ready

**Full-featured multi-tenant natural-language finance demo for PayPal AI Hackathon 2026.**

### Added — Multi-Tenant (B1–B5)
- Migration 007: `demo_sessions` table + `session_id` UUID on 5 data tables
- `demo-sessions` repository (5-char password, bcrypt, idempotent bootstrap)
- `POST /demo/signup`, `POST /demo/login`, `POST /demo/reset`
- Session-aware seed runner
- Frontend auth flow: `/signup`, `/login`, `/reset`
- Middleware cookie gate: `fos_session_id` (httpOnly) + `fos_name`, `fos_is_admin`
- `lib/api-server.ts`: server-side fetch with `X-Session-Id` from cookies
- `/api/proxy/[...path]` forwards session header

### Added — AI Assistant (Dual-Provider)
- Primary: OpenRouter → `google/gemini-3.8-flash`
- Fallback: Google AI Studio → `gemini-3-flash-preview`
- Provider status via `/assistant/info`
- Canary protection on both paths

### Added — Landing, Auth Gate, Legal Pages
- Public landing at `/`, dashboard for authed
- Auth gate middleware (307 redirect)
- 5 legal/info pages

### Added — SEO
- Per-page metadata, OG, Twitter cards
- `sitemap.xml`, `robots.txt`, JSON-LD, `/features` page
- Middleware whitelist for static assets

### Added — UX Polish
- Onboarding banner, NavBar tooltips
- Ledger sortable columns, hint banner
- Light/dark mode (CSS variables + 300ms inversion)
- Voice input with mic permission flow

### Fixed — Critical
- Impact cache stale → invalidate on mutations
- Reports date range end-of-day inclusive
- Malformed UUID 500 → graceful 401
- Journal `<= now` filter → `<= endOfToday`
- Hydration #418/#423 → theme `<script>` moved inside `<head>`

### Fixed — Security
- `Permissions-Policy: microphone=(self)` (was blocking own mic)
- `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`

### Fixed — Accessibility
- `--ink-faint` WCAG AA in both modes
- Footer text contrast
- `aria-label` on logo links

---

## [0.4.0] — 2026-11-08 — Ledger, PDF, Voice, OCR

### Added
- `/ledger`: Grid + Notebook, 36 filter combos, Opening/Closing columns, PDF export
- `/journal`: PDF export (2-page A4)
- `/journal/new`: voice input + inline amount editor
- `/` dashboard: USD stat cards + quick actions
- AI assistant: scoped prompt, `POST /assistant/chat`
- OCR receipt: `POST /receipts/ocr` (Groq Vision)
- Surplus Oracle: predict / edit / achieve / celebrate
- Goals API, Reports API
- Migrations 004/005/006
- Design system components

### Fixed
- Parser v2: negation + intent rejection
- USD-first formatting

---

## [0.3.0] — 2026-11-05 — Surplus Oracle + PayPal Payouts

### Added
- Surplus Oracle card
- PayPal Payouts via APIMatic SDK
- Ethical Surplus Distribution flow
- Impact Wallet page
- Vetted receivers

---

## [0.2.0] — 2026-11-04 — Backend + Frontend Scaffold

### Added
- Fastify 4 + TypeScript strict ESM
- Docker Compose: PostgreSQL 16.15 + Redis 7.0.15
- `/health` endpoint
- Next.js 14.2 + Tailwind scaffold
- Health dashboard

---

## [0.1.0] — 2026-11-04 — Foundation

### Added
- WSL2 Ubuntu environment
- GitHub repo `setuju/financial-os`
- Documentation structure
