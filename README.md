# Financial OS — Ethical Surplus & Agentic Personal Finance

> **PayPal AI Hackathon 2026 Submission** · *Ethical personal finance powered by natural-language reasoning and autonomous AI advisors.*

## 🚀 The Core Vision
Traditional finance apps treat every dollar as disposable income and push users toward reckless spending or guilt-driven automation. **Financial OS** fundamentally redefines personal finance by introducing the **Ethical Surplus Model**: only money safely left *after* committing to obligations (rent, emergency goals) and reserving principal savings can be allocated to impact.

We combine a deterministic natural-language parser with an autonomous **F-OS Trio** (Financial-Advisor, Ombar-The Cashier, Sikitong) and real-time Elasticsearch analytics—wrapped in a strict, multi-tenant architecture.

---

## 💳 How We Used PayPal
We deeply integrated the **PayPal Payouts REST API v1** to power our "Impact Wallet".
- **SDK Generation:** We used **APIMatic** to auto-generate our TypeScript PayPal SDK directly from the OpenAPI spec.
- **Meaningful Integration:** When a user's Ethical Surplus is verified, they can route a suggested 10% of those funds to vetted causes. The payout requires a strict two-step human-in-the-loop confirmation.
- **Atomic Security:** We wrapped the API call in an atomic SQL transaction (`BEGIN/COMMIT/ROLLBACK`) so the ledger is never out of sync.

## 🤖 How We Used AI
- **Agentic Advisors (The F-OS Trio):** Orchestrated via **Astropods MCP**. Unlocked after 100 transactions, users get personalized audits from three distinct personas.
- **Scoped Assistant:** Powered by **OpenRouter (Gemini 3.8 Flash)**, secured with a canary string to prevent prompt injection.
- **Vision OCR:** Powered by **Groq (Qwen 3.8 27B)** with an OCR.space fallback to automatically parse receipt images into structured data.

---

## 💎 Why Financial OS Stands Out
- **Ethical Surplus Engine**: `closing = opening + income − expense − horizon_bills − donations`. Principal savings are protected automatically.
- **Elasticsearch-Powered Semantic Search**: Instant drill-down into transactions via a global search bar and an interactive word cloud, backed by PostgreSQL fallback.
- **Channel3 Real-World Anchoring**: Users search real products directly through Channel3 to anchor long-term Horizon goals with actual market prices.
- **Strict Zero-Trust Security**: Strict 401 enforcement, no admin UUID fallback, rate-limited endpoints, and PII-free sandbox sessions.

---

## 🏆 Sponsor Tools Integrated
- **Bryntum Gantt 8**: Powers the Financial Horizon goals.
- **Channel3 API**: Enables real-world product search.
- **Elastic Cloud**: Powers NLP Word Cloud and Global Search aggregations.
- **APIMatic**: Generates the PayPal SDK.
- **Astropods**: Orchestrates our AI agent workflows.
- **Render**: Backend deployment.

---

## 🛠️ Architecture & Tech Stack
- **Frontend**: Next.js 14 App Router, Tailwind CSS, Recharts, Lucide, Bryntum Gantt React.
- **Backend**: Fastify 4 (TypeScript strict ESM), PostgreSQL (Neon), Redis (Upstash), Elasticsearch.

---

## 🚦 Live Demo & Test Credentials
| Access | Credentials | View |
|---|---|---|
| **Admin Demo** | Name: `admin` · Password: `financial-os` | 117 seeded transactions, 3 goals, AI advisors unlocked |
| **New Session** | Choose any name on `/signup` | Fresh isolated workspace |

- **Live App**: [financial.saturumah.net](https://financial.saturumah.net)
- **Backend Health**: [financial-api.saturumah.net/health](https://financial-api.saturumah.net/health)

> *Note: Render free tier may take up to 50s on first request due to cold start.*

---

## 🧪 Local Setup & Testing
```bash
# 1. Install dependencies
pnpm install

# 2. Run Database Migrations
cd backend && pnpm migrate

# 3. Run Test Suite (Vitest)
pnpm test

# 4. Start Development
cd frontend && pnpm dev
```

## ⚖️ License & Disclaimer
Released under the **MIT License**. See [`NOTICE`](NOTICE) for copyright and commercial licensing inquiries. All PayPal interactions run in **Sandbox**—no real money moves.
