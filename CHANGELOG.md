# Changelog

All notable changes to Financial OS are documented here.

## [1.0.0] — 2026-11-12 — Final Hackathon Submission
### Added
- **F-OS Trio (Astropods)**: Three autonomous advisors (Financial-Advisor, Ombar-The Cashier, Sikitong) with 100-transaction gating, database persistence, and custom prompts.
- **Elasticsearch Integration**: Global search bar and interactive word cloud with PostgreSQL fallback.
- **Channel3 Product Search**: Real-world product lookup in Horizon with auto-fill for target amounts.
- **Advanced Dashboard**: Recharts-based visualization (health score, runway, top expenses, word cloud) plus modern hover tooltips.
- **Security Hardening**: Strict session enforcement, CORS restrictions, atomic payouts, and CI/CD checks.

### Fixed
- Voice STT duplication on mobile browsers (Web Speech API overlap).
- Missing `source` enum constraints in database migrations.
- Render monorepo build loops and Vercel ESLint strict-mode errors.

## [0.6.0] — 2026-11-10 — Interactive Preview & Impact
### Added
- Live preview with inline editing (pencil icon) for parsed transactions.
- Batch insert API (`/transactions/batch`) with atomic rollback.
- Multi-parser V8 (context inheritance, first-verb-wins).
- 8 real donation organizations and live USGS earthquake feed.

## [0.5.0] — 2026-11-08 — Multi-Tenant & Auth
### Added
- Session-based auth (`/demo/signup`, `/demo/login`, `/demo/reset`).
- PostgreSQL row-level isolation via `session_id`.
- 5-character password generation.

## [0.4.0] — 2026-11-05 — Core Features
### Added
- Natural language parser (English, USD-centric).
- Surplus Oracle and Financial Horizon (Bryntum Gantt).
- PayPal Payouts integration via APIMatic SDK.
