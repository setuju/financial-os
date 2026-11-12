# Architecture Overview

Financial OS uses a modern, decoupled architecture designed for high throughput and analytical querying.

## Data Flow
1. **Ingestion**: User input (text, voice, OCR) → `POST /transactions/preview` → Parser.
2. **Persistence**: Parsed transactions → PostgreSQL (`transactions` table) + Elasticsearch index.
3. **Analytics**: Dashboard aggregates via `GET /reports/summary`, `GET /reports/word-cloud`, and `GET /reports/search`.
4. **Payouts**: Verified surplus → `POST /impact/payout` → PayPal Payouts API (Sandbox) → Atomic DB commit.

## Security Boundaries
- All API routes require a valid `X-Session-Id` header.
- CORS is restricted to production domains.
- No secrets are hardcoded; environment variables are injected at runtime.

## Elasticsearch Strategy
- Index `transactions` is recreated on application start to apply strict mappings (`raw_text: text/standard`, `session_id: keyword`).
- Bulk indexing is used during seeding with `refresh: true` to ensure immediate searchability.
- Search queries use `bool.must` with `match` and filter on `session_id`; if Elasticsearch is unavailable, queries fall back to PostgreSQL `ILIKE`.
