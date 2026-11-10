<!--
┌────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
├────────────────────────────────────────────────────────────────────┤
│  File      : README.md
│  Purpose   : Readme
│  Author    : Jack — Jack[at]SatuRumah[dot]Net
│  GitHub    : https://github.com/setuju
│  Website   : https://saturumah.net
│  Created   : 10-11-2026
│  License   : MIT
└────────────────────────────────────────────────────────────────────┘
└────────────────────────────────────────────────────────────────────┘
-->

<!--
-->

# Financial OS

**Natural-language finance with ethical surplus distribution.**

Type money like you text — `"spent 20 on coffee"` or `"bayar listrik 1.250.000"` — and let the parser do the work. Track ethical surplus, plan long-term goals, and route a slice to vetted causes via PayPal Payouts. **Sandbox only. No real money moves.**

[![Live Demo](https://img.shields.io/badge/demo-financial.saturumah.net-0070ba?style=flat-square)](https://financial.saturumah.net)
[![API](https://img.shields.io/badge/api-financial--api.saturumah.net-059669?style=flat-square)](https://financial-api.saturumah.net/health)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Hackathon](https://img.shields.io/badge/PayPal%20AI%20Hackathon-2026-ffb700?style=flat-square)](https://paypalaihackathon.devpost.com/)

**Live:** [financial.saturumah.net](https://financial.saturumah.net) · **API:** [financial-api.saturumah.net](https://financial-api.saturumah.net/health)

> **First visit after 15 min idle** may take ~50s (Render free tier). Subsequent: 100–300ms.

---

## Table of Contents

- [Why this exists](#why-this-exists)
- [Core concepts](#core-concepts)
- [Features](#features)
- [Sponsor tools](#sponsor-tools)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [Testing](#testing)
- [Ethics & security](#ethics--security)
- [Roadmap](#roadmap)
- [License](#license)

---

## Why this exists

Most finance apps treat every dollar left as "disposable". Financial OS introduces **Ethical Surplus** — surplus calculated *after* obligations (rent, bills, savings goals), never touching principal. Users predict next month's surplus, plan long-term goals, and route 10% to vetted causes via PayPal Payouts. Every allocation requires explicit two-step confirmation.

**No auto-donate. No guilt trip. No touching your rent money.**

---

## Core concepts

**Anti-Budget Parser** — Natural-language input, English or Bahasa Indonesia. Rejects plans ("i want to buy a bike") and cancellations ("never mind") — journal reflects reality, not intentions.

**Ethical Surplus** — Only surplus after obligations can be distributed. Cascade formula, month-to-month:
```
closing = opening + income - expense - horizon_bills - donations
```
Each month's closing becomes next month's opening.

**Surplus Oracle** — Predict next week/month surplus. Track what you're saving for. When achieved, mark it done — celebration included.

**Financial Horizon** — Long-term goals on Bryntum Gantt timeline. Horizon bills subtracted from each month's surplus before distributable.

**Impact Wallet** — Verified surplus from last month routed to vetted causes via PayPal Payouts. Two-step confirm. Sandbox-only. Log preserves audit trail after soft-delete.

**Scoped AI Assistant** — Floating "?" panel explains app features. Refuses coding, advice, jailbreaks, off-topic. Canary-protected prompt.

---

## Features

### Input
- **Natural language parser** — EN + Bahasa Indonesia, USD-first
- **Voice input** — Web Speech API
- **Amount editor** — inline correction for ASR misfires
- **OCR receipt scan** — Gemini Vision → auto-fill

### Tracking
- **Journal** — pagination (20/50/100/all), edit, delete, PDF export
- **Ledger** — Grid/Notebook, 36 filters, Opening/Closing cascade, PDF
- **Projections** — forecast rows with `PROJECTED` badge

### Planning
- **Goals** — add/edit/delete, auto-duration, progress bars
- **Horizon Gantt** — month/year scale, zoom-to-fit, financial fields
- **Oracle** — predict, edit, achieve, celebrate

### Impact
- **Verified** (last month) + **In-Progress** (current) cards
- **6-month history** strip
- **Next-month Horizon warning**
- **Donation log** with soft-delete
- **PayPal Payouts** two-step confirm

### AI (4 modalities)
- **Text** — parser
- **Voice** — Web Speech API
- **Vision** — OCR (Gemini 3 Flash)
- **Chat** — scoped assistant

### UI
- **Dark mode** — CSS variables, 300ms smooth inversion
- **Wallet favicon** — SVG, PayPal blue
- **Responsive** — mobile-first, cards on mobile / table on desktop

---

## Sponsor tools

| Tool | Used for | Status |
|---|---|---|
| **PayPal Payouts** | Impact Wallet distribution (sandbox) | ✅ Live |
| **APIMatic** | Generated TypeScript SDK from OpenAPI | ✅ Live |
| **Bryntum Gantt 8** | Financial Horizon | ✅ Live |
| **Elastic Cloud** | Transaction search index | ✅ Deployed |
| **OpenRouter** | AI Assistant | ✅ Live |
| **Google AI Studio** | OCR receipt | ✅ Live |
| **Postman** | API testing collection | ✅ In repo |
| **AG Grid** | Tabular display | ⏸ Deferred (custom CSS grid) |
| **KERNEL** | Computer-use fallback | ⏸ Deferred |
| **Zapier** | Time-to-Value | ⏸ Deferred |

---

## Tech stack

**Frontend** — Next.js 14.2 (App Router) · TypeScript strict · Tailwind CSS 3.4 (CSS variables) · lucide-react · jspdf · @bryntum/gantt-react-enterprise 8

**Backend** — Fastify 4 · TypeScript strict ESM · PostgreSQL 16 (Neon) · ioredis (Upstash) · Elastic Cloud · PayPal Payouts API · OpenRouter · Google AI Studio

**Infra** — Vercel (frontend) · Render (backend, free tier) · Neon (Postgres, ap-southeast-1) · Upstash (Redis) · Cloudflare (DNS)

---

## Architecture

```
Browser
  │
  ├── Server Components ──▶ Backend (direct, API_URL)
  │
  └── Client Components ──▶ /api/proxy/* ──▶ Backend
                          (Vercel Node)         │
                                                ├── PostgreSQL (Neon)
                                                ├── Redis (Upstash)
                                                ├── Elastic Cloud
                                                ├── PayPal Payouts
                                                ├── OpenRouter
                                                └── Google AI Studio
```

**Why proxy route**: Next.js only inlines `NEXT_PUBLIC_*` into client bundle. `/api/proxy/*` runs on Vercel server (has `API_URL`), forwards to Render. Zero CORS, zero env leak.

---

## Quick start

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
SEED_CONFIRM=yes-wipe-demo-data pnpm seed   # optional: demo data
pnpm dev                                    # :3001

# 3. Frontend
cd frontend
pnpm install
pnpm dev                                    # :3000
```

---

## Environment variables

### Backend (Render)

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `REDIS_URL` | Upstash `rediss://...` |
| `ELASTIC_URL` + `ELASTIC_API_KEY` | Elastic Cloud |
| `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` | PayPal sandbox |
| `PAYPAL_MODE` | `sandbox` |
| `OPENROUTER_API_KEY` | AI Assistant |
| `GEMINI_API_KEY` | OCR receipt |

### Frontend (Vercel)

| Variable | Value |
|---|---|
| `API_URL` | Backend base URL |
| `BRYNTUM_LICENSE_KEY` | Bryntum trial key |

---

## API reference

Base: `https://financial-api.saturumah.net`

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | PG + Redis + uptime |
| `GET` | `/transactions?limit&offset` | List |
| `POST` | `/transactions` | Create (natural language) |
| `PUT` | `/transactions/:id` | Update (re-parse) |
| `DELETE` | `/transactions/:id` | Delete |
| `GET` | `/transactions/search?q=` | Elasticsearch |
| `GET` | `/reports/summary` | Aggregated buckets |
| `GET` | `/goals` | List |
| `POST` | `/goals` | Create (camelCase body) |
| `DELETE` | `/goals/:id` | Delete |
| `GET` | `/surplus/current` | Income/expense/surplus |
| `GET` | `/surplus/predictions` | Oracle list |
| `POST` | `/surplus/predict` | Create prediction |
| `PUT` | `/surplus/predict/:id` | Update |
| `DELETE` | `/surplus/predict/:id` | Delete |
| `POST` | `/surplus/predictions/:id/achieve` | Mark achieved |
| `GET` | `/impact/receivers` | Vetted recipients |
| `GET` | `/impact/surplus` | Verified + in-progress + history |
| `GET` | `/impact/payouts` | Donation log |
| `DELETE` | `/impact/payouts/:id` | Soft-delete |
| `GET` | `/impact/horizon-commitment` | Next month bills |
| `POST` | `/impact/payout` | PayPal Payouts (sandbox) |
| `POST` | `/receipts/ocr` | Gemini Vision |
| `GET` | `/assistant/info` | Config |
| `POST` | `/assistant/chat` | Scoped AI chat |

**Postman:** `docs/postman/financial-os.postman_collection.json`

---

## Testing

```bash
# Unit tests (parser)
cd backend && pnpm test              # 40/40 pass

# Type check
cd backend && pnpm typecheck
cd frontend && pnpm typecheck
```

Coverage: IDR/USD formats, negation/intent rejection, category detection, error paths.

---

## Ethics & security

- **Sandbox only** — no real money moves
- **Human-in-the-loop** — every payout requires two-step confirmation
- **Principal untouched** — surplus after obligations only
- **Verbatim raw text** preserved for audit
- **Parser rejects plans/cancellations**
- **Soft-delete preserves audit trail**
- **Scoped AI, canary-protected prompt**
- **No secrets in source** — env vars only
- **No `dangerouslySetInnerHTML`** — all React nodes

---

## Roadmap

### Shipped ✅
Natural-language parser · Journal + PDF + pagination + edit/delete · Ledger (Grid/Notebook, 36 filters, Opening/Closing) · Voice + amount editor · **OCR receipt** · Surplus Oracle (predict, achieve, celebrate) · **Impact Wallet** (verified/in-progress/history, donation log, soft-delete) · Financial Horizon (Bryntum 8) · **AI Assistant** (scoped, canary) · **Dark mode** · USD-first

### Planned (v2) ⏸
PDF invoice OCR · User accounts + multi-tenant · Elasticsearch UI · Time-to-Value (Zapier) · Mobile app · PayPal live mode

---

## License

[MIT](LICENSE) © 2026 Jack (setuju)

---

**Built for [PayPal AI Hackathon 2026](https://paypalaihackathon.devpost.com/)** · Solo developer · [penulis@live.com](mailto:penulis@live.com)

## 🔐 Multi-Tenant Demo (In Progress)

Financial OS is being upgraded from **single-user demo** to **multi-tenant demo**:

- Each visitor signs up with a **name** → gets a generated **5-character password**
- Data (transactions, goals, payouts) is **isolated per session**
- **Admin** session (`admin` / `financial-os`) sees the seeded baseline
- Demo reset via `/reset` (rate-limited) — no data loss for other users
- **Status**: plan at [`docs/multitenant-plan.md`](docs/multitenant-plan.md), implementation in progress

Until multi-tenant ships:
- Current mode is **shared demo** — all visitors see the same data
- Any visitor can reset via `https://financial.saturumah.net/reset`
