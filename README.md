# Financial OS

> Personal finance with natural-language input, ethical surplus allocation, and PayPal-powered impact.

**Status**: Under active development for [PayPal AI Hackathon 2026](https://www.paypal.ai/hackathon).

## Quick Start

Full setup instructions coming in Minggu 6. For now:

```bash
# 1. Start databases (requires Docker + infra/.env, see infra/.env.example)
docker compose -f infra/docker-compose.yml --env-file infra/.env up -d

# 2. Run backend
cd backend
pnpm install
pnpm start
# → http://localhost:3001/health
```

Verify: `curl -s http://localhost:3001/health | jq` → should return `{"status":"ok","pg":"ok","redis":"ok",...}`.

## Architecture

See [`docs/architecture.md`](docs/architecture.md).

## Tech Stack

- **Backend**: Node.js 20, Fastify, PostgreSQL 16, Redis 7, TypeScript
- **Frontend**: Next.js + AG Grid (Minggu 2)
- **AI/Agent**: Astropods (orchestration)
- **Payments**: PayPal Orders v2, Payouts, Webhooks
- **Sponsor tools**: Astropods, AG Grid, Elastic, Bryntum, KERNEL, APIMatic, Zapier

## Project Docs

- [`docs/roadmap.md`](docs/roadmap.md) — 6-week execution plan
- [`docs/rules.md`](docs/rules.md) — R1–R12 (project rules)
- [`docs/submission-checklist.md`](docs/submission-checklist.md) — Devpost compliance

## License

MIT — see [`LICENSE`](LICENSE).
