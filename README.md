# Financial OS

**Financial OS** is a personal finance app built for **PayPal AI Hackathon 2026**. Type money in natural language (English or Bahasa Indonesia), track ethical surplus, and distribute 10% of verified surplus to vetted causes via PayPal Payouts. **Sandbox only — no real money moves.**

## 🚀 Live Demo

- **Frontend**: https://financial-os-nu.vercel.app
- **Backend API**: https://financial-os-api-lykz.onrender.com
- **Health check**: https://financial-os-api-lykz.onrender.com/health

**First visit after idle**: Render free tier cold-start ~50 seconds. Backend warms up on first request. Wait a moment, then refresh.

## 💡 Core Concepts

**Anti-Budget** — Skip forms. Type or speak `"spent 20 on coffee"` or `"bayar listrik 1.250.000"`. The parser extracts amount (USD or IDR), type (income/expense), and category. Rejects plans (`"i want to buy X"`) and cancellations (`"never mind X"`) with helpful errors.

**Ethical Surplus** — Income minus expenses minus obligations. Only what's safely left after real needs is available for impact. Never touches principal savings.

**Surplus Oracle** — Predict next week's surplus. Later compared to actual. Accurate predictions earn impact credit.

**Impact Wallet** — Distribute 10% of verified surplus to a vetted cause via PayPal Payouts. Two-step confirmation. Sandbox only.

**Financial Horizon** — Visualize long-term goals (emergency fund, house down payment) with target amounts, monthly savings, interest rates, and loan terms. Powered by Bryntum Gantt 8.

## ✨ Features

### Input
- **Natural language parser** — English + Bahasa Indonesia, USD-first, IDR backward-compat. Rejects plans and cancellations.
- **Voice input** — Web Speech API. Click mic, speak. Works on Chrome/Edge desktop and mobile.
- **Amount editor** — After typing or speaking, if a number is detected, inline card shows `"Detected amount: $20.00 [✏️]"`. Click pencil to fix ASR misfires. Only first number is replaced.
- **OCR receipt** — Planned (Gemini Vision).

### Journal
- Latest 50 transactions, newest first
- Mini stats: count · total in · total out
- **PDF export** — Download formatted A4 report with summary + table

### Ledger
- **Grid view** (Excel-style) ↔ **Notebook view** (clean list)
- **36 filter combinations**: view × type (All/Income/Expense) × group (Day/Week/Month/Year) × range (7d/30d/this month/last month/this year/all time/custom) × projections (on/off)
- **PDF export** — Filter context embedded in PDF header
- All filters instant (client-side state, URL sync)

### Impact
- Surplus Oracle form (predict next week)
- Ethical Surplus Distribution card (10% suggestion)
- Two-step confirmation (inline, not modal)
- PayPal Payouts sandbox: batch ID + receiver + amount on success
- Trust badges: PayPal Sandbox · Human-in-the-loop · Never touches principal

### Horizon
- Bryntum Gantt 8 Enterprise
- Custom task fields: `targetAmount`, `monthlySaving`, `interestRate`, `loanTerm`
- Progress bars per goal
- Critical paths, dependency lines

### AI Assistant (Scoped)
- **Endpoint**: `POST /assistant/chat`, `GET /assistant/info`
- Explains app features, input syntax, filters, exports, troubleshooting
- **Refuses**: general coding, off-topic, financial advice, jailbreaks
- **Canary-protected** — prompt has versioned canary string; output scanned for leaks
- **Model**: `google/gemini-3.8-flash` via OpenRouter

## 🛠 Tech Stack

### Frontend
- **Next.js 14.2** — App Router, Server Components, Server Actions
- **TypeScript** strict
- **Tailwind CSS 3.4** — custom design tokens (surface, line, ink, accent, success, danger, warning)
- **lucide-react** — icon system
- **jspdf + jspdf-autotable** — client-side PDF export (dynamic import)
- **@bryntum/gantt-react-enterprise 8.0** — Financial Horizon
- **Web Speech API** — voice input (browser-native, zero cost)

### Backend
- **Fastify 4** — high-performance Node framework
- **TypeScript** strict ESM
- **@fastify/cors@9** — CORS (v9 for Fastify 4 compat)
- **PostgreSQL** (Neon Serverless, ap-southeast-1)
- **ioredis** — Redis cache (Upstash Serverless)
- **@elastic/elasticsearch** — search index (Elastic Cloud)

### Infrastructure
- **Vercel** — frontend hosting
- **Render** — backend hosting (free tier, auto-deploy on commit)
- **Neon** — serverless PostgreSQL
- **Upstash** — serverless Redis
- **Elastic Cloud** — managed Elasticsearch
- **Docker Compose** — local dev (PostgreSQL 16.15-alpine, Redis 7.0.15-alpine)

## 🤝 Sponsor Tools Integration

| Tool | Used For | Status |
|---|---|---|
| **PayPal Payouts** | Impact Wallet distribution (sandbox) | ✅ Live |
| **APIMatic** | Generated TypeScript SDK from OpenAPI spec (`backend/src/paypal/sdk/`) | ✅ Live |
| **Bryntum Gantt** | Financial Horizon visualization (v8 Enterprise) | ✅ Live |
| **Elastic Cloud** | Transaction search index | ✅ Deployed (UI indexing deferred) |
| **OpenRouter** | AI Assistant (Gemini 3.8 Flash) | ✅ Live |
| **Astropods** | Agent orchestration | 📄 Referenced in docs |
| **AG Grid** | Tabular display | ⏸ Deferred (custom CSS grid used) |
| **KERNEL** | Computer-use fallback | ⏸ Deferred |
| **Zapier** | Time-to-Value trigger | ⏸ Deferred |
| **Postman** | API testing collection | ⏸ Deferred |

## 📦 Quick Start (Local)

```bash
git clone https://github.com/setuju/financial-os.git
cd financial-os

# 1. Infra (Docker)
cp infra/.env.example infra/.env   # fill credentials
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d

# 2. Backend
cd backend
pnpm install
pnpm migrate
pnpm seed                          # optional: seed demo data
                                   # (requires SEED_CONFIRM=yes-wipe-demo-data)
pnpm dev                           # port 3001

# 3. Frontend (new terminal)
cd frontend
pnpm install
pnpm dev                           # port 3000
```

Or use cloud services directly. Set in env:
`DATABASE_URL`, `REDIS_URL`, `ELASTIC_URL`, `ELASTIC_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `OPENROUTER_API_KEY`.

## 🏗 Architecture

```
User (browser)
  │
  ├── Server Components (Next.js) ── direct fetch ──▶ Backend
  │                                                    │
  └── Client Components ── /api/proxy/* ──▶ Backend ◀──┤
                            (Node proxy)               │
                                                       ├── PostgreSQL (Neon)
                                                       ├── Redis (Upstash)
                                                       ├── Elastic Cloud
                                                       ├── PayPal Payouts API
                                                       └── OpenRouter (Gemini 3.8 Flash)
```

**Why proxy route**: Next.js only inlines `NEXT_PUBLIC_*` env vars into client bundle. For client components that need backend access, `/api/proxy/*` runs on Vercel server (has `API_URL`), forwards to Render. Zero CORS for browser, zero env leak.

## 🧪 Testing

Backend parser: **40/40 tests pass** (vitest).

```bash
cd backend && pnpm test
```

Coverage:
- IDR amount formats (`20rb`, `1.5jt`, `1.250.000`)
- USD amount formats (`$20`, `$120.50`, `$1,500`, `250.000` → $250)
- Type detection (income/expense verbs, EN + ID)
- Category detection (7 categories, EN + ID keywords)
- Negation rejection ("dont want", "cancel that", "never mind")
- Intent rejection ("want to", "planning to", "hopefully")
- Error handling (empty, no amount, zero amount)
- Backward compat: normal transactions still work

## 🔒 Ethics & Security

- **PayPal Sandbox only** — no real money moves
- **Human-in-the-loop** — every payout requires explicit confirmation
- **Principal untouched** — 10% calculated from surplus, never from savings
- **Verbatim input stored** — every transaction preserves raw user text for audit
- **Parser rejects plans/cancellations** — no accidental record of "want to buy" as completed
- **AI Assistant guardrails** — scoped to app only, refuses off-topic/jailbreak, canary-protected prompt
- **No personal data** — transactions have `user_id: null` (single-user demo, no auth in v1)

## 🗺 Roadmap

### Completed ✅
- Natural language parser (EN + ID, USD)
- Journal + PDF export
- Ledger (Grid/Notebook, filters, PDF)
- Voice input + AmountEditor
- Surplus Oracle
- PayPal Payouts (sandbox, APIMatic SDK)
- Financial Horizon (Bryntum Gantt 8)
- AI Assistant (Gemini 3.8 Flash, scoped)
- USD-first data model

### Planned (v2) ⏸
- OCR receipt (Gemini Vision)
- User accounts + admin panel
- Elasticsearch full-text search UI
- Time-to-Value ledger (Zapier trigger)
- Mobile app (React Native)
- Real PayPal live mode

## 📄 License

MIT — see [LICENSE](LICENSE).

---

**Built for PayPal AI Hackathon 2026** · Solo developer (jack / setuju) · [penulis@live.com](mailto:penulis@live.com)
