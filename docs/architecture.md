# Arsitektur — Financial OS

## Alur Data
```
User input (bahasa alami)
   ↓
[Anti-Budget Parser] → PostgreSQL + Elastic (indeks)
   ↓
[Surplus Engine] → hitung surplus bebas etis
   ↓
[Surplus Oracle] → prediksi vs realisasi → Dompet Dampak
   ↓
[PayPal Payouts] → salurkan dana dampak (setelah approval)
   ↑
[Time-to-Value] ← Zapier/KERNEL (verifikasi bukti)
   ↑
[Bryntum Horizon] ← proyeksi tujuan jangka panjang
```

## Peran Sponsor
| Tool | Peran | Kapan Dipakai |
|---|---|---|
| **Astropods** | Orkestrasi agen utama (`astropods.yml`) | Fondasi agen |
| **AG Grid** | Tabel jurnal, dashboard surplus | Minggu 2 |
| **Elastic** | Indeks & pencarian transaksi | Minggu 2 |
| **Bryntum Gantt** | Financial Horizon (tujuan jangka panjang) | Minggu 4 |
| **KERNEL** | Fallback computer-use untuk verifikasi | Minggu 4 |
| **APIMatic** | Generate SDK PayPal dari OpenAPI | Minggu 3 |
| **Zapier** | Integrasi eksternal Time-to-Value | Minggu 5 |
| **Postman** | Dokumentasi & uji API | Minggu 5–6 |
| **Render** | Deploy demo (opsional) | Minggu 6 |
| **Channel3** | *Tidak dipakai* | — |

## Prinsip Integrasi
- **Wajib selesai**: Anti-Budget + AG Grid + Elastic + PayPal Payouts.
- **Sangat dianjurkan**: Bryntum Horizon.
- **Opsional**: KERNEL fallback & Time-to-Value.


## AI Assistant (In-App)

Financial OS includes a scoped in-app AI helper for users.

**Scope**: explains app features, input syntax, filters, exports, and troubleshooting. Refuses general coding, financial advice, off-topic, and jailbreak attempts.

**Files**:
- `backend/src/agents/assistant.prompt.ts` — system prompt (canary-protected)
- `backend/src/agents/README.md` — threat model, model config, testing
- `backend/src/routes/assistant.ts` — `POST /assistant/chat`, `GET /assistant/info`

**Model**: OpenRouter (`google/gemini-flash-1.5` default, override via `ASSISTANT_MODEL`). Requires `OPENROUTER_API_KEY` in env.

**Anti-leak**: prompt embeds a versioned canary string. Output is scanned for the canary before returning; if found, response 500s and logs alert.


## Ledger Data Model (Sesi 10)

### Tables
- `transactions` — 9 columns (id, user_id, raw_text, amount NUMERIC(15,2), type, category, occurred_at TIMESTAMPTZ, source, created_at) + `is_projection BOOLEAN DEFAULT false`
- `goals` — id, user_id, name, target_amount, monthly_saving, interest_rate, loan_term_months, start_date, duration_months, progress_percent, created_at

### Indexes
- `idx_transactions_occurred_at` (existing)
- `idx_transactions_category`, `idx_transactions_type` (existing)
- `idx_transactions_is_projection` (new Sesi 10)
- `idx_goals_start_date` (new Sesi 10)

### Endpoints
- `GET /reports/summary?from&to&groupBy&type&includeProjections` — aggregated buckets via `date_trunc`
- `GET /goals` — list all goals
- `POST /goals` — create goal (validated body)

### Frontend Proxy Route
`frontend/app/api/proxy/[...path]/route.ts` — Node.js route handler that forwards method/headers/body/query to `API_URL` (server-only env). Solves Next.js client-side env var boundary: browser fetches `/api/proxy/*` (same-origin, no CORS), server route forwards to Render.

## AI Assistant (Sesi 10, Extended)

See `backend/src/agents/README.md` for full threat model, model config, testing.

- **Files**: `backend/src/agents/assistant.prompt.ts` (prompt + canary), `backend/src/routes/assistant.ts` (endpoints)
- **Model**: `google/gemini-3.8-flash` via OpenRouter, `ASSISTANT_MODEL` env optional override (must contain `/`)
- **Endpoints**: `POST /assistant/chat` (rate-limited schema, 1000 char input cap, 6 message history cap, 30s timeout, 400 max_tokens), `GET /assistant/info` (version + configured flag)
- **Canary**: `FOS-ASSISTANT-v1.0-20261107-a7f3c9-DO-NOT-LEAK` — response scanned, 500 + log alert if leaked
- **Guardrails**: refuse off-topic, jailbreak, prompt disclosure, financial advice; 1-2 sentence refusal format; offer app alternative
- **Knowledge base**: 5 pages, key concepts, 10+ FAQ entries, ~11KB prompt
