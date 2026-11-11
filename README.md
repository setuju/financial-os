<!--
┌────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
├────────────────────────────────────────────────────────────────────┤
│  File      : README.md
│  Purpose   : GitHub front door — for judges, users, and future devs
│  Author    : Jack — Jack[at]SatuRumah[dot]Net
│  GitHub    : https://github.com/setuju
│  Website   : https://saturumah.net
│  Created   : 10-11-2026
│  License   : MIT
└────────────────────────────────────────────────────────────────────┘
-->

# Financial OS

**Natural-language personal finance with ethical surplus distribution.**

Type money like you text — `"spent 20 on coffee"` or `"bought groceries 45 dollars"`. Track only surplus after obligations, plan long-term goals on a Gantt timeline, and route 10% of verified surplus to vetted causes via **PayPal Payouts**. Principal savings are never touched. Every payout requires two-step confirmation.

> **Sandbox only. No real money moves.**

[![Live Demo](https://img.shields.io/badge/demo-financial.saturumah.net-0070ba?style=for-the-badge)](https://financial.saturumah.net)
[![API](https://img.shields.io/badge/api-financial--api.saturumah.net-059669?style=for-the-badge)](https://financial-api.saturumah.net/health)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![PayPal AI Hackathon 2026](https://img.shields.io/badge/PayPal%20AI%20Hackathon-2026-ffb700?style=for-the-badge)](https://paypalaihackathon.devpost.com/)

---

## Try it now

| Access | Credentials | What you see |
|---|---|---|
| **Admin** | name `admin` · password `financial-os` | Seeded demo data (Jul–Nov 2026): 116 transactions, 3 goals, 2 oracles, donation history |
| **New session** | `https://financial.saturumah.net/signup` — pick a name, get a 5-char password | Empty slate. Data is isolated per session. |

**Live frontend:** https://financial.saturumah.net
**Live backend:** https://financial-api.saturumah.net/health

> **First request after 15 min idle** may take ~50s (Render free tier). Subsequent requests: 100–300ms.

---

## Demo Showcase: AI Receipt Scanning

Below is a mock receipt used to test the 4th AI modality (Vision). The app uses **Groq Qwen 3.8 27B** (with OCR.space fallback) to extract the text, and our rule-based parser automatically structures it into a transaction.

<p align="center">
  <img src="docs/assets/mock-receipt.png" alt="Mock Receipt" width="350">
</p>

**Test result:**
- **Extracted text:** `"spent 9 dollars on coffee and a butter croissant at Kopi Kenangan"`
- **Parsed transaction:** `$9.00` · `expense` · `food` · `Kopi Kenangan` · `2026-11-07`
- **Latency:** ~1.0 second (Groq API)

> **Disclaimer:** The receipt image shown above is a **synthetic mock created for demonstration purposes**. The store name, address, items, and prices are fictional. Any resemblance to actual receipts, stores, or transactions is purely coincidental. This is not real financial data. We are not liable for any similarities to real-world entities.

---

## Hackathon 2026

Built for the [**PayPal AI Hackathon 2026**](https://paypalaihackathon.devpost.com/) between **Oct 1 – Nov 12, 2026**, solo, targeting:

- 🎯 **Most Impactful** — ethical surplus model, principal untouched, human-in-the-loop
- 🎯 **Most Creative** — parser rejects plans and cancellations; Surplus Oracle prediction game
- 🎯 **Best Demo Delivery** — end-to-end flow within 3 minutes
- 🎯 **Best Use of Bryntum** — Gantt timeline gates PayPal payouts
- 🎯 **Best Use of APIMatic** — generated TypeScript SDK from PayPal OpenAPI
- 🎯 **Best Use of PayPal + AI** — 4 AI modalities feeding a live payout pipeline

**AI tools used** (per submission rules):
- **Groq (Qwen 3.8 27B)** → OCR vision extraction (primary path)
- **OCR.space** → OCR fallback path (traditional OCR, no LLM)
- **Gemini 3.8 Flash** via OpenRouter → scoped in-app assistant (primary path)
- **Gemini 3 Flash Preview** via Google AI Studio → assistant fallback (proven live when OpenRouter was unavailable during final submission week)

---

## Why this exists

Most finance apps treat every leftover dollar as "disposable." Financial OS introduces **Ethical Surplus** — surplus calculated *after* obligations (rent, bills, savings goals), never touching principal savings. Users predict next month's surplus, plan long-term goals, and route 10% to vetted causes. Every allocation requires explicit two-step confirmation.

**No auto-donate. No guilt trip. No touching your rent money.**

---

## Core concepts

**Anti-Budget Parser** — Natural-language input in English or Bahasa Indonesia. Rejects plans (`"i want to buy a bike for 500 dollars"`), cancellations (`"never mind the coffee"`), and negations — the journal reflects what *actually happened*, not intentions.

**Ethical Surplus** — Only surplus after obligations can be distributed. Cascade formula, month-to-month:

```
closing = opening + income − expense − horizon_bills − donations
```

Each month's closing becomes the next month's opening. `horizon_bills` = committed future obligations extracted from active Horizon goals. `donations` = successful payouts tagged to that period.

**Surplus Oracle** — Predict next week's or next month's surplus. When achieved, mark it done — celebration modal included. Low-stakes gamification of a serious decision.

**Financial Horizon** — Long-term goals rendered on a **Bryntum Gantt 8** timeline. Each active goal contributes `monthly_saving` to `horizon_bills`, which is subtracted from each month's distributable surplus. **The Gantt gates the payout.**

**Impact Wallet** — Verified surplus (last closed month) plus in-progress (current month) plus 6-month history. A payout moves money from verified surplus to a vetted cause via **PayPal Payouts sandbox**. Two-step confirm. Log preserves audit trail after soft-delete.

**Scoped AI Assistant** — Floating "?" panel explains app features. Refuses coding, general advice, jailbreaks, and off-topic prompts. Prompt is canary-protected; leaks are detected server-side and blocked before rendering.

**Multi-Tenant Demo** — Every visitor gets an isolated session. Data is scoped per `session_id` on every table. Admin session owns the seeded baseline; new sessions start empty.

---

## Features

### Input
- **Natural-language parser** — English + Bahasa Indonesia, USD-first, rejects plans/negations/cancellations
- **Voice input** — Web Speech API with continuous mode, audio meter, and per-error diagnostics
- **Amount editor** — inline correction when ASR misfires or parser misses a number
- **OCR receipt scan** — Groq Qwen 3.8 27B vision (primary) + OCR.space fallback auto-fills the entry from a photo

### Tracking
- **Journal** — pagination (20 / 50 / 100 / all), inline edit, delete with undo window, PDF export
- **Ledger** — Grid and Notebook views, 36 filter combinations (view × type × group × range × projection), Opening / Closing cascade columns, status legend (ACTUAL / PROJECTED / MIXED), PDF export
- **Projections** — forecast rows flagged `PROJECTED` and excluded from "actual" aggregates

### Planning
- **Goals** — add / edit / delete, auto-duration (`ceil(target / monthly_saving)`), progress bars, typed confirmation on delete
- **Financial Horizon** — **Bryntum Gantt 8** with custom fields: `targetAmount`, `monthlySaving`, `interestRate`, `loanTermMonths`, `progress`, `startDate`, `endDate`, `duration`
- **Surplus Oracle** — predict, edit, delete, mark achieved, celebration modal

### Impact
- **Verified surplus** (last closed month) + **in-progress** (current month)
- **6-month history** strip
- **Next-month Horizon commitment** warning banner
- **Donation log** with soft-delete (audit trail preserved)
- **PayPal Payouts** via APIMatic-generated TypeScript SDK — sandbox, two-step confirm, batch ID surfaced

### AI (4 modalities)
- **Text** — rule-based parser (40/40 tests)
- **Voice** — Web Speech API, continuous capture
- **Vision** — Groq Qwen 3.8 27B (primary) + OCR.space fallback
- **Chat** — scoped assistant, dual-provider (OpenRouter primary + Gemini native fallback)

### UI
- **Dark mode** — CSS variables, 300ms smooth inversion, anti-flash inline script
- **Wallet favicon** — SVG, PayPal blue
- **Responsive** — mobile card list / desktop table
- **WCAG AA** — contrast tokens audited, screen-reader labels on icon-only links
- **5 legal pages** — privacy, terms, legal, security, support

---

## Demo access & multi-tenant

Every visitor signs up with a **name only** — no email, no PII. The system generates a **5-character password** (A–Z excluding O/I/L, 2–9). Data is fully isolated via `session_id` on `transactions`, `goals`, `surplus_oracles`, `payouts`, and `surplus_periods`.

| Flow | Endpoint | Notes |
|---|---|---|
| Signup | `POST /demo/signup` | `{ name }` → `{ sessionId, password }` |
| Login | `POST /demo/login` | `{ name, password }` → sets `fos_session_id` cookie |
| Reset | `POST /demo/reset` | Wipes data for **current session only** |

**Cookies:** `fos_session_id` (httpOnly) + `fos_name`, `fos_is_admin` (readable, for UI).

---

## Sponsor tools — honest fit

| Tool | Used for | Status |
|---|---|---|
| **PayPal Payouts** | Impact Wallet distribution (sandbox) | ✅ Live |
| **APIMatic** | Generated TypeScript SDK from PayPal OpenAPI | ✅ Live |
| **Bryntum Gantt 8** | Financial Horizon timeline | ✅ Live |
| **Elastic Cloud** | Transaction search index (query layer implemented, writes deferred to v2) | 🟡 Provisioned |
| **OpenRouter** | AI assistant primary provider | ✅ Live |
| **Google AI Studio** | Assistant fallback (Gemini 3 Flash Preview) | ✅ Live |
| **Groq** | OCR vision (Qwen 3.8 27B) | ✅ Live |
| **OCR.space** | OCR fallback path | ✅ Live |

---

## Tech stack

**Frontend** — Next.js 14.2 (App Router) · TypeScript strict · Tailwind CSS 3.4 · lucide-react · jspdf · @bryntum/gantt-react-enterprise 8

**Backend** — Fastify 4 · TypeScript strict (ESM) · PostgreSQL 16 (Neon) · ioredis (Upstash) · Elastic Cloud · PayPal Payouts API · OpenRouter · Groq · Google AI Studio · bcrypt

**Infra** — Vercel (frontend) · Render (backend) · Neon (Postgres) · Upstash (Redis) · Cloudflare (DNS) · UptimeRobot (keep-alive)

---

## Architecture

```
Browser
  │
  ├── Server Components ──▶ Backend (direct, API_URL + X-Session-Id)
  │
  └── Client Components ──▶ /api/proxy/* ──▶ Backend
                          (Vercel Node)         │
                                                 ├── PostgreSQL (Neon)
                                                 ├── Redis (Upstash)
                                                 ├── Elastic Cloud
                                                 ├── PayPal Payouts
                                                 ├── Groq (OCR)
                                                 └── OpenRouter / Gemini (Chat)
```

---

## Quick start (local)

```bash
git clone https://github.com/setuju/financial-os.git
cd financial-os

# 1. Infra
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d

# 2. Backend
cd backend
pnpm install
pnpm migrate
SEED_CONFIRM=yes-wipe-demo-data pnpm seed
pnpm dev

# 3. Frontend (new terminal)
cd frontend
pnpm install
pnpm dev
```

---

## API reference

Base: `https://financial-api.saturumah.net`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | PG + Redis + uptime |
| `POST` | `/demo/signup` | Create isolated session |
| `POST` | `/demo/login` | Authenticate session |
| `POST` | `/demo/reset` | Wipe current session data |
| `GET` | `/transactions` | List (paginated) |
| `POST` | `/transactions` | Create (natural language) |
| `PUT` | `/transactions/:id` | Update (re-parse) |
| `DELETE` | `/transactions/:id` | Delete |
| `GET` | `/transactions/search` | Elastic search |
| `GET` | `/reports/summary` | Aggregated buckets |
| `GET` | `/goals` | List goals |
| `POST` | `/goals` | Create goal |
| `GET` | `/surplus/current` | Income/expense/surplus |
| `POST` | `/surplus/predict` | Create Oracle prediction |
| `GET` | `/impact/receivers` | Vetted causes |
| `GET` | `/impact/surplus` | Verified + in-progress + history |
| `POST` | `/impact/payout` | PayPal Payouts (sandbox) |
| `POST` | `/receipts/ocr` | Groq Vision extraction |
| `POST` | `/assistant/chat` | Scoped AI chat |

---

## Ethics & security

- **Sandbox only** — no real money moves.
- **Human-in-the-loop** — every payout requires two-step confirmation.
- **Principal untouched** — savings goals are subtracted before surplus is calculated.
- **Verbatim raw text preserved** — for audit.
- **Parser rejects plans** — "i want to buy a bike" is not a transaction.
- **Scoped AI** — refuses coding, advice, off-topic, and jailbreaks.
- **No secrets in source** — env vars only.
- **`dangerouslySetInnerHTML` audited** — used only for JSON-LD and static theme script.

---

## License

[MIT](LICENSE) © 2026 Jack ([setuju](https://github.com/setuju))

---

**Built for [PayPal AI Hackathon 2026](https://paypalaihackathon.devpost.com/)** · Solo developer · [Jack@SatuRumah.net](mailto:Jack@SatuRumah.net)
