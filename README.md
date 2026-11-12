# Financial OS — Ethical Surplus & Agentic Personal Finance

> **PayPal AI Hackathon 2026 Submission** · *Ethical personal finance powered by natural-language reasoning and autonomous AI advisors.*

## 🚀 The Core Vision
Traditional finance apps treat every dollar as disposable income and push users toward reckless spending or guilt-driven automation. **Financial OS** fundamentally redefines personal finance by introducing the **Ethical Surplus Model**: only money safely left *after* committing to obligations (rent, emergency goals) and reserving principal savings can be allocated to impact.

We combine a deterministic natural-language parser with an autonomous **F-OS Trio** (Financial-Advisor, Ombar-The Cashier, Sikitong) and real-time Elasticsearch analytics—wrapped in a strict, multi-tenant architecture.

---

## 💎 Why Financial OS Stands Out

- **Ethical Surplus Engine**: `closing = opening + income − expense − horizon_bills − donations`. Principal savings are protected automatically.
- **Agentic Advisors (The F-OS Trio)**: Unlocked after 100 transactions, users receive personalized, autonomous financial guidance from three distinct AI personas powered by Astropods MCP:
  - **Financial-Advisor**: Macro-level risk auditing and compliance.
  - **Ombar-The Cashier**: Frontline street-smart detection of daily micro-leaks.
  - **Sikitong**: Fearless, out-of-the-box diagnosis of financial habits.
- **Elasticsearch-Powered Semantic Search**: Instant drill-down into transactions via a global search bar and an interactive word cloud, backed by PostgreSQL fallback.
- **Channel3 Real-World Anchoring**: Users search real products directly through Channel3 to anchor long-term Horizon goals with actual market prices.
- **Strict Zero-Trust Security**: Strict 401 enforcement, no admin UUID fallback, rate-limited endpoints, atomic payout transactions, and PII-free sandbox sessions.

---

## 🏆 Hackathon Alignment
- **Best Overall & Best Use of PayPal + AI**: Deep integration with PayPal Payouts REST API v1 (OAuth2, batch payouts) and APIMatic-generated TypeScript SDK.
- **Most Impactful**: Principal-protected ethical giving (with two-step human confirmation).
- **Most Creative**: Bi-modal intent rejection parser + agentic trio that unlocks through gamified usage.
- **Sponsor Tracks**: Bryntum Gantt 8 (Horizon goals), Channel3 (Product Search), Elastic Cloud (Aggregations), APIMatic (PayPal SDK).

---

## 🛠️ Architecture & Tech Stack
- **Frontend**: Next.js 14 App Router, Tailwind CSS, Recharts, Lucide, Bryntum Gantt React.
- **Backend**: Fastify 4 (TypeScript strict ESM), PostgreSQL (Neon), Redis (Upstash), Elasticsearch.
- **AI & Payments**: OpenRouter/Gemini (Assistant), Groq/OCR.space (Vision), Astropods MCP, Channel3 API, PayPal Payouts v1 Sandbox.

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
