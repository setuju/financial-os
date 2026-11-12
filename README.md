# Financial OS

**Natural-language personal finance with ethical surplus distribution.**

Type, speak, or photograph money transactions. Track only surplus after obligations, plan long-term goals on a Gantt timeline, and route 10% of verified surplus to vetted causes via **PayPal Payouts**. Principal savings are never touched. Every payout requires two-step confirmation.

> **Sandbox only. No real money moves.**

[![Live Demo](https://img.shields.io/badge/demo-financial.saturumah.net-0070ba?style=for-the-badge)](https://financial.saturumah.net)
[![API](https://img.shields.io/badge/api-financial--api.saturumah.net-059669?style=for-the-badge)](https://financial-api.saturumah.net/health)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![PayPal AI Hackathon 2026](https://img.shields.io/badge/PayPal%20AI%20Hackathon-2026-ffb700?style=for-the-badge)](https://paypalaihackathon.devpost.com/)

---

## Try it now

| Access | Credentials | What you see |
|---|---|---|
| **Admin** | name `admin` · password `financial-os` | Seeded demo data (Jul–Nov 2026): 117 transactions, 3 goals, 2 oracles, 5 surplus periods |
| **New session** | [financial.saturumah.net/signup](https://financial.saturumah.net/signup) — pick a name, get a 5-char password | Empty slate. Isolated per session. |

**Live frontend:** https://financial.saturumah.net · **API:** https://financial-api.saturumah.net/health

---

## Core Concepts

**Anti-Budget Parser** — Natural-language input in English. Rejects plans (`"i want to buy a bike"` → `planned_input`), cancellations (`"never mind the coffee"` → `negated_input`), and negations. Supports **multiple transactions** in one sentence. Uses **First-Verb-Wins** logic for context.

**Ethical Surplus** — Only surplus after obligations can be distributed:
```
closing = opening + income − expense − horizon_bills − donations
```
Each month's closing becomes the next month's opening. `horizon_bills` = committed obligations from active Horizon goals.

**Intelegentia-Agentic Advisors (The F-OS Trio)** — Hidden behind a 100-transaction gate (Easter Egg). Once unlocked, users get personalized, multi-perspective financial advice:
- **Financial-Advisor**: Macro-level auditor (risk, health score, runway).
- **Ombar-The Cashier**: Frontline eyes (daily habits, leaks, coffee spending).
- **Stephen-The Insider**: Brutally honest ex-employee (unrealistic goals, financial culture).

**Advanced Dashboard** — 11 interactive visualizations including Income vs Expense, Top Categories, Surplus Trend, Financial Runway, Health Score, Transaction Frequency, and a Word Cloud.

**Channel3 Integration** — Search real products (MacBooks, iPhones) and auto-fill Horizon goals with actual market prices.

**Astropods AI Fallback** — If a user types an unrecognized expense (e.g., `"bought a rare pokemon card"`), the parser falls back to Astropods AI to classify the category dynamically.

---

## Hackathon 2026

Built for [PayPal AI Hackathon 2026](https://paypalaihackathon.devpost.com/) between **Oct 1 – Nov 12, 2026**, solo, targeting:

- 🎯 **Most Impactful** — ethical surplus, principal untouched, human-in-the-loop
- 🎯 **Most Creative** — parser rejects plans & cancellations; multi-transaction parsing; AI Advisors
- 🎯 **Best Demo Delivery** — end-to-end flow within 3 minutes
- 🎯 **Best Use of Bryntum** — Gantt timeline gates PayPal payouts
- 🎯 **Best Use of APIMatic** — generated TypeScript SDK from PayPal OpenAPI
- 🎯 **Best Use of PayPal + AI** — 4 AI modalities feeding a live payout pipeline

---

## Sponsor tools

| Tool | Purpose | Status |
|---|---|---|
| **PayPal Payouts** | Impact Wallet (sandbox) | ✅ Live |
| **APIMatic** | TypeScript SDK from PayPal OpenAPI | ✅ Live |
| **Bryntum Gantt 8** | Financial Horizon | ✅ Live |
| **Channel3** | Product catalog for Horizon goals | ✅ Live |
| **Elastic Cloud** | Search index (query layer; writes deferred to v2) | 🟡 Provisioned |
| **OpenRouter** | AI assistant primary | ✅ Live |
| **Google AI Studio** | Assistant fallback | ✅ Live |
| **Groq** | OCR vision (Qwen 3.8 27B) | ✅ Live |
| **Astropods** | Dynamic category AI fallback | ✅ Live |

---

## Tech stack

**Frontend:** Next.js 14.2 (App Router) · TypeScript strict · Tailwind CSS 3.4 · lucide-react · Recharts · jspdf · @bryntum/gantt-react-enterprise 8 · @channel3/sdk

**Backend:** Fastify 4 · TypeScript strict (ESM) · PostgreSQL 16 (Neon) · ioredis (Upstash) · Elastic Cloud · PayPal Payouts · OpenRouter · Groq · Google AI Studio · Astropods · bcrypt

**Infra:** Vercel (frontend) · Render (backend) · Neon (Postgres) · Upstash (Redis) · Cloudflare (DNS)

---

## Testing

```bash
cd backend && pnpm test       # 16/16 parser unit tests
cd backend && pnpm typecheck
cd frontend && pnpm typecheck
```

---

## License

[MIT](LICENSE) · See [NOTICE](NOTICE) for copyright and reproduction terms.
