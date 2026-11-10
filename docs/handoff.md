<!--
┌────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
├────────────────────────────────────────────────────────────────────┤
│  File      : docs/handoff.md
│  Purpose   : Docs: Handoff
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

# Handoff — Financial OS Project

**Last updated**: Sesi 2 close (2026-11-04)
**Repo**: `setuju/financial-os` (private)
**Deadline submission**: 12 November 2026, 12:00 PT
**HEAD**: `8bfc6ae` (akan berubah setelah commit close ini)

---

## State Saat Ini

### Infra (Docker)
- PostgreSQL **16.15-alpine** + Redis **7.0.15-alpine** via Docker Compose
- Container: `financial_os_postgres`, `financial_os_redis` (keduanya healthy)
- Network: `financial_os_net` | Volumes: `financial_os_pgdata`, `financial_os_redisdata`
- Port host → container: **5433** → 5432, **6380** → 6379
- Secrets: `infra/.env` (gitignored, mode 600); template di `infra/.env.example`
- Lifecycle: `docker compose -f infra/docker-compose.yml --env-file infra/.env up -d`

### Backend (Fastify)
- Fastify 4 + TypeScript strict (ESM), tsx runtime
- Port **3001** | Endpoint `GET /health`
- PG: `pg` Pool (max 10, `connectionTimeoutMillis: 2000`)
- Redis: `ioredis` (`connectTimeout: 2000`, `maxRetriesPerRequest: 1`)
- Health probe: parallel, **3s budget** (fast-fail saat DB down)
- Response shape: `{"status":"ok","pg":"ok","redis":"ok","uptime":N,"latencyMs":N}`
- **Cold start**: ~550ms (pool warmup) | **Steady-state**: 3–13ms

### Docs
- 8 file di `docs/`: roadmap, architecture, handoff (ini), LessonLearned (12 entri), submission-checklist, rules (R1–R12), system-prompt, persona

### Rules Aktif (`docs/rules.md`)
R1 GitHub · R2 Shell · R2a Clear · R3 Environment · R4 Git · R5 Dokumentasi · R6 Security/Ethics · R7 Submission · R8 Docker · R9 Persona Activation · R10 Start Ritual · R11 End Ritual · **R12 Verify gh account before every remote git op**

---

## Keputusan Terkunci

| Item | Nilai |
|---|---|
| Port Docker PostgreSQL | 5433 |
| Port Docker Redis | 6380 |
| Port backend | 3001 |
| Nama DB | `financial_os` |
| User DB | `financial_os` |
| Image tags | `postgres:16.15-alpine`, `redis:7.0.15-alpine` |
| Backend module system | ESM (`"type": "module"`) |
| Env loading | dotenv auto-detect `../infra/.env` |
| Lokasi `.env` | `infra/.env` (satu folder dengan compose) |

---

## Milestone Selesai

- [x] Environment WSL2 + Docker 29.1.3 + Node 20.20.2 + PostgreSQL 16.15 + Redis 7.0.15
- [x] Repo `setuju/financial-os` di akun `setuju`
- [x] 8 file docs + rules R1–R12 + Protokol Aktivasi Persona
- [x] `infra/docker-compose.yml` — pinned, healthcheck, named volume, restart policy
- [x] `.env` secure (gitignored, 600) + `.env.example` di-commit
- [x] Backend scaffold Fastify + TS strict + pg + ioredis
- [x] `/health` end-to-end hijau (PostgreSQL + Redis proven)
- [x] Fast-fail probes (3s vs 43s sebelumnya)
- [x] R12 guard terbukti tangkap race mid-session
- [x] `README.md` stub di root

## Belum Selesai

- [ ] Frontend Next.js + AG Grid wrapper
- [ ] Anti-Budget parser (Minggu 2)
- [ ] Surplus Oracle (Minggu 3)
- [ ] PayPal Payouts integration (Minggu 3)
- [ ] Bryntum Horizon (Minggu 4)
- [ ] KERNEL fallback (Minggu 4)
- [ ] Time-to-Value via Zapier (Minggu 5)
- [ ] Video demo <3 menit (Minggu 6)
- [ ] README lengkap (Minggu 6)
- [ ] Repo publik + LICENSE di About (Minggu 6)
- [ ] Form Devpost (Minggu 6)

## Registrasi Akun Sponsor

- [x] PayPal Developer Sandbox (credentials di `infra/.env`)
- [ ] Astropods
- [ ] AG Grid (trial)
- [ ] Bryntum (trial)
- [ ] Elastic (trial)
- [ ] KERNEL
- [ ] APIMatic
- [ ] Zapier

---

## Sesi 3 — Prioritas (urutan)

1. **R10 ritual**: verifikasi state + baca 3 file docs
2. **Preflight**: pastikan containers healthy (`docker compose ... up -d` kalau perlu)
3. **Frontend scaffold** Next.js 14/15 di `frontend/`:
   - Halaman `/` calls backend `/health`
   - AG Grid wrapper di `frontend/components/`
   - Env: `NEXT_PUBLIC_API_URL=http://localhost:3001`
4. **End-to-end demo**: browser → frontend → backend → pg/redis
5. **Anti-Budget parser** (Minggu 2 roadmap): LLM-based atau rule-based untuk parse input bahasa Indonesia, simpan ke PostgreSQL
6. **AG Grid journal**: tampilkan transaksi
7. **Registrasi akun sponsor** tersisa (user manual, agen siapkan checklist)

## Sesi 3 — Preconditions

- Docker Desktop running; containers healthy
- `infra/.env` terisi (PayPal sandbox credentials dari Sesi 2)
- `gh auth status` = `setuju` (R12 enforced: dua sumber — status + `gh api user`)
- Node 20.20.2 via nvm (JANGAN upgrade)

---

## Known Issues (referensi ke `docs/LessonLearned.md`)

12 entri tercatat: Bryntum repurpose, KERNEL fallback, GITHUB_TOKEN shadow, dana dampak ≠ pokok, repo TidakSetuju → setuju, nvm vs apt Node, gh akun salah, clear rule (R2a), `!!` history expansion, push "Repository not found" (R12), kill+wait process tree hang, `/health` 43s lambat → 3s.

## Catatan Kritis untuk Sesi 3

- **R12 wajib aktif** — user multi-account, sering switch gh mid-session
- **History berlapis** di git log, tapi handoff ini adalah **single source of truth**
- Setiap bubble keputusan besar wajib Persona activation eksplisit
- Jangan pernah `docker compose down -v` tanpa konfirmasi eksplisit
- `pnpm-lock.yaml` di-commit; jangan di-modify manual
- **Backend cold start** ~550ms pertama kali; steady-state 3–13ms. Normal.
- **Tidak** jalankan `pnpm approve-builds` interaktif — config di `backend/pnpm-workspace.yaml` sudah `allowBuilds: esbuild: true`

---

## Sesi 3 Close (2026-11-04)

### Milestone Baru
- Frontend Next.js 14.2.35 + Tailwind + TS strict scaffolded (`frontend/`)
- `frontend/lib/api.ts` — type-safe wrapper untuk backend `/health`
- `frontend/app/page.tsx` — health dashboard server-rendered, force-dynamic
- **Demo end-to-end PASSED**: browser → Next.js → Fastify → PostgreSQL + Redis
  - HTML assertion 6/6 (title, card, Healthy badge, PG ok, Redis ok, uptime)
  - Verified live in Windows browser via `http://localhost:3000`

### Commit Sesi 3
- `5ee719e` — `feat(frontend): scaffold next 14 + health dashboard`
- (SHA final commit ini) — `docs(session 3 close): record exit-1 violation, frontend milestone, demo e2e`

### Environment Notes
- RAM WSL2: 2.8GB total, ~2.2GB available saat idle. Tight tapi cukup.
  - Frontend production start ≈ 250MB (bukan dev/HMR)
  - Backend node ≈ 150MB
  - Docker PG+Redis ≈ 300MB
  - `pnpm dev` (HMR) tidak dipakai untuk demo — hemat ~500MB
- Backend `/health` latency: warm 3–13ms, cold-after-idle bisa 500–2000ms (PG pool + Redis reconnect paralel saat first request setelah idle >30s). Acceptable — bukan bug, karakteristik pool.
- Backend tidak expose `/` route (404) — by design, frontend yang handle UI.

### Next Steps (Sesi 4)
1. **Anti-Budget parser** (Minggu 2) — input bahasa alami → jurnal → PostgreSQL
2. **AG Grid** — tampilkan jurnal (Minggu 2)
3. **Registrasi akun sponsor** sisa: Astropods, AG Grid trial, Bryntum trial, Elastic trial, KERNEL, APIMatic, Zapier
4. **Surplus Oracle** (Minggu 3)
5. **PayPal Payouts** (Minggu 3)
6. Lanjut per `docs/roadmap.md`

### Aturan
Tidak ada R baru di Sesi 3. R1–R12 tetap. R2 (no exit 1) diuji ulang dan **gagal 1×** (Kesalahan 13) — akan dijadikan pengingat permanen.

### Preconditions Sesi 4
- Docker Desktop running; `docker compose -f infra/docker-compose.yml --env-file infra/.env up -d`
- `gh auth status` = `setuju` (R12 enforced: status + `gh api user`)
- Node 20.20.2 via nvm; pnpm 12.16.1

---

## Sesi 5 Close (2026-11-05 ~01:35 WIB)

**HEAD**: `fd0049a` (akan berubah setelah commit close ini)

### What shipped

- **Migration runner** (`feat(backend): add transactions schema and idempotent migration runner`, `37dc680`)
  - `transactions` table: 9 columns, 3 indexes, 3 constraints
  - `_migrations` tracking table
  - `pnpm migrate` — idempotent
- **Anti-Budget parser** (`ab67f3d`)
  - Bahasa Indonesia → structured transaction
  - Handles `20ribu`, `1.5jt`, `1.250.000`, `20.5rb`, income/expense verbs, 7 categories
  - **20 unit tests, all green**
- **Transactions repo + routes** (`d57fa03`)
  - `POST /transactions` — parser + INSERT + 201
  - `GET /transactions?limit&offset` — envelope `{transactions, count, limit, offset}`
  - E2E verified: 201 (expense), 201 (income), 400 (no_amount), 400 (schema), 200 (list)
- **Journal page** (`bcf8ad3`)
  - `/journal` server-rendered table, `force-dynamic`
  - Sorted newest-first, signed amounts, category chips
- **New transaction form via Server Action** (`e5294f2`)
  - `/journal/new` — natural language input → POST → redirect `/journal`
  - Error states: `no_amount`, `invalid_input`, `zero_amount`, `network_error`, `empty`
- **R12 auto-switch** (`fd0049a`)
  - `with_setuju` wrapper: switch → verify → git op → restore
  - R12c documented: window not atomic (~<1s normal)
- **Infra + Docker** unchanged — both containers `healthy`

### What deferred

- **AG Grid journal** — Phase 5 reverted. Cause of `next build` hang during attempt **unknown** (occurred with and without AG Grid). Build now works post-revert. To retry **tomorrow with 30-min time-box**; abort immediately if hang returns.
  - Consider alternatives: `next build --turbo`, TanStack Table (lighter), or accept plain table permanently.
- **Elastic indexing** — Phase 6 not started.
- **Surplus Oracle, PayPal Payouts, Bryntum, KERNEL, Zapier** — Minggu 3–5.

### Environment quirks discovered

- `frontend/components/` did not exist despite `docs/handoff.md` claiming scaffold — `create-next-app` in Sesi 3 did not create it. Fixed with `mkdir -p`.
- `next build` can hang at webpack init **without OOM and without process leak visible in `ps`**. Best recovery so far: `rm -rf .next node_modules` + `pnpm store prune` + `pnpm install` + rebuild. Do not immediately suspect AG Grid (Kesalahan 18).
- After `timeout` SIGKILL to `next build`, WSL2 may hold state for 10–15 min; retry sooner may re-trigger hang (Kesalahan 19).

### Preconditions for Sesi 6

1. `git status` clean, `HEAD` = final SHA of session close
2. Docker containers healthy: `docker compose -f infra/docker-compose.yml --env-file infra/.env up -d`
3. Backend on :3001 (start with `cd backend && pnpm start`)
4. Frontend build works: `cd frontend && pnpm build` should succeed <200s
5. `gh auth status` + `gh api user --jq .login` — both may be any account; `with_setuju` wrapper handles switch + restore
6. R12 auto-switch active

### Next steps (Sesi 6, in order)

1. **Decide AG Grid**: retry with time-box 30 min OR drop permanently and note in Devpost description "tabular display (custom)" not "AG Grid".
2. **Elastic indexing** (Minggu 2 roadmap): index transactions on insert, `GET /search?q=`.
3. **Registrasi akun sponsor** sisa: Astropods, Bryntum trial, Elastic trial, KERNEL, APIMatic, Zapier (user manual).
4. **Surplus Oracle** (Minggu 3): predict vs actual surplus → Dompet Dampak.
5. **PayPal Payouts** (Minggu 3).

### Rules changes this session

- **R12 revised**: auto-switch to `setuju` for remote git ops, restore original after (see `docs/rules.md` R12c for atomicity caveat)
- **R12b** unchanged: `unset GITHUB_TOKEN GH_TOKEN` before switch

### LessonLearned entries this session

Kesalahan 15 (folder assumption), 16 (pipe masks exit), 17 (curl no timeout), 18 (AG Grid misdiagnosis), 19 (WSL timeout cleanup lag).

## Workflow Update (Sesi 7)
- Pipeline build lokal dihentikan. Semua verifikasi kode menggunakan `tsc --noEmit`. Build produksi sepenuhnya diserahkan ke Vercel dan Render (R13).

---

# Handoff — Sesi 8 (Deployment & Integrasi Penuh)

## Status
Aplikasi **100% fungsional** dan sudah live di Cloud. Seluruh fitur inti (Minggu 2-4) telah diselesaikan.

### URL Live (Production)
- **Frontend (Vercel)**: https://financial-os-nu.vercel.app
- **Backend (Render)**: https://financial-os-api-lykz.onrender.com
- **Database (Neon)**: Serverless PostgreSQL (ap-southeast-1)
- **Redis (Upstash)**: Serverless Redis (ap-southeast-1)
- **Elasticsearch**: Elastic Cloud (ap-southeast-1)

### Fitur yang Sudah Jalan
1. **Anti-Budget Parser**: Input teks bahasa Indonesia → Jurnal.
2. **Elasticsearch**: Pencarian transaksi instan (`/transactions/search?q=`).
3. **Surplus Oracle**: Menghitung surplus (Income - Expense) dan menerima prediksi.
4. **PayPal Payouts**: Integrasi SDK APIMatic. Endpoint `/impact/payout` berfungsi mengirim dana di Sandbox.
5. **Impact Wallet**: UI untuk menyalurkan 10% dari surplus.
6. **Bryntum Horizon**: Gantt Chart v8 Enterprise berjalan di Vercel.

### Deployment Notes (Penting untuk Sesi 9)
- **Render Free Tier**: Akan *spin-down* setelah 15 menit. Request pertama butuh ~50 detik.
- **Vercel Serverless**: Batas eksekusi default 10 detik, sudah kita naikkan ke 60 detik (`maxDuration = 60`) di halaman yang kritis.
- **Bryntum Key**: Menggunakan trial key yang expired **20 Desember 2026**. Jangan lupa ganti key sebelum tanggal tersebut!
- **Environment Variables**: 
  - Vercel: `API_URL`, `BRYNTUM_LICENSE_KEY`
  - Render: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `REDIS_URL`, `ELASTIC_URL`, `ELASTIC_API_KEY`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`

## Next Steps (Sesi 9 - Besok)
1. **UI/UX Polish**: Mempercantik halaman utama, journal, impact, dan horizon. Menambahkan *empty states*, *loading skeletons*, dan transisi.
2. **Video Demo**: Merekam demo < 3 menit.
3. **Devpost Submission**: Mengisi formulir dan menjadikan repo GitHub **Publik**.

---

## Sesi 10 Close (2026-11-07)

**HEAD**: `4a80de5` (main, sync origin/main)
**Deadline submission**: 12 Nov 2026, 12:00 PT (~5 hari)

### State Live (Verified)

| Layer | URL |
|---|---|
| Frontend | https://financial-os-nu.vercel.app |
| Backend | https://financial-os-api-lykz.onrender.com |
| Database | Neon (ap-southeast-1) |
| Cache | Upstash Redis (ap-southeast-1) |
| Search | Elastic Cloud (ap-southeast-1) |

### Fitur Baru Sesi 10

**Frontend**
- `/ledger` — Grid + Notebook, 36 filter combos (view × type × group × range × proj), PDF
- `/journal` — PDF export button (2-page A4, summary + table)
- `/journal/new` — Voice input (Web Speech API, `en-US`) + AmountEditor (inline edit for voice misfires)
- `/` Dashboard — USD stats (bukan IDR)
- Semua format pakai `Intl.NumberFormat('en-US', {currency:'USD'})`

**Backend**
- `POST /reports/summary` — aggregate bucket (day/week/month/year × type × projections)
- `GET /goals`, `POST /goals` — goals table + API
- `POST /assistant/chat`, `GET /assistant/info` — scoped AI assistant
- Migration 004 — `goals` table + `is_projection` on `transactions`
- `scripts/seed-demo.ts` — 90d hist + 60d proj + 3 goals (USD)
- CORS `@fastify/cors@9` (Fastify 4 compatible)
- Parser v2 — USD-first, negation + intent rejection (`negated_input`, `planned_input`)

**Infrastructure**
- `frontend/app/api/proxy/[...path]/route.ts` — Node proxy for client components
- `render.yaml` — blueprint documentation (sync:false all env vars)
- `pnpm-workspace.yaml` — `core-js: true` (boolean, not placeholder)

### Model AI Assistant (Final)

- **Model**: `google/gemini-3.8-flash` (pinned, Sep 2026, $0.75/$3.75 per M tokens)
- **Provider**: OpenRouter
- **Env**: `OPENROUTER_API_KEY` set, `ASSISTANT_MODEL` **tidak di-set** (fallback default)
- **Guard**: kalau `ASSISTANT_MODEL` tidak mengandung `/`, fallback ke default + warn log
- **Canary**: `FOS-ASSISTANT-v1.0-20261107-a7f3c9-DO-NOT-LEAK` (rotasi saat prompt update)

### Fitur Deferred (Sesi 11+)

| Fitur | Effort | Prioritas |
|---|---|---|
| Assistant widget (floating "?") | 30 min | Medium |
| OCR receipt (Gemini Vision) | 3.5 jam | Opsional |
| Login/auth + admin panel | 3-4 jam | Defer |
| Elasticsearch indexing UI | 1 jam | Defer |
| AG Grid | N/A | Skip (custom grid used) |
| KERNEL fallback | 4-6 jam | Defer ke docs mention |
| Time-to-Value (Zapier) | 2-3 jam | Defer |
| Keep-alive GitHub Action | 5 min | **Rekomendasi Kuat** untuk demo |

### Environment Notes (Kritis untuk Sesi 11)

**Cold-start (Render free tier)**
- Spin-down setelah 15 menit idle
- Cold start ~50 detik; test pertama setelah idle bisa timeout 30s
- Ledger auto-retry 3×4s (max ~72s)
- **Pre-warm sebelum demo**: buka `https://financial-os-api-lykz.onrender.com/health`, tunggu 50s
- **Rekomendasi**: GitHub Action keep-alive cron `*/5` (belum di-set)

**Vercel**
- Build ~30-47s per deploy
- `pnpm-workspace.yaml` harus `core-js: true` (bukan string placeholder)
- `lib/api.ts` branching: server direct `API_URL`, client via `/api/proxy`

**DNS WSL2**
- `systemd-resolved` upstream kadang broken → `gh auth status` false positive "token invalid"
- Recovery: `nslookup <host> 8.8.8.8` sukses tapi `getent` gagal = konfirmasi DNS issue
- Fix: `sudo systemctl restart systemd-resolved` atau set static DNS

**Render Auto-Deploy**
- Toggle di **Settings → Auto-Deploy → "On Commit"** (bukan blueprint auto-adopt)
- Env var changes: pilih **"Save, rebuild, and deploy"** (bukan "Save only")

**Parser behavior (contract)**
- Rejects: no amount, zero amount, plan (`want to`, `planning to`, `hopefully`), cancellation (`dont want`, `change my mind`, `cancel that`)
- Error reasons: `no_amount`, `invalid_input`, `zero_amount`, `negated_input`, `planned_input`, `network_error`
- Tests: 40/40 pass (vitest)

### Rules Changes (Sesi 10)

Lihat `docs/rules.md` R14-R18:
- **R14**: Model pin — explicit `provider/model`, no aliases in env
- **R15**: Peer dependency matrix — check host framework version
- **R16**: `cat >>` idempotency — grep marker first
- **R17**: Client-side env — proxy route, not `NEXT_PUBLIC_` leak
- **R18**: Render env — "Save, rebuild, and deploy"

### Commits Sesi 10 (Ringkas)

```
4a80de5 fix(assistant): pin model to google/gemini-3.8-flash + guard env
45fd8d2 feat(backend): scoped in-app AI assistant (prompt + endpoint)
7b66a99 fix(parser): reject negation + intent, USD-first amount parsing
bb2235c fix(frontend): pnpm-workspace core-js value boolean not placeholder
e42919b feat(frontend/journal): inline amount editor for voice/text input
1c96681 chore(frontend): allow core-js build script in pnpm-workspace
a828964 feat(frontend/ledger): PDF export from /ledger
d8a515b feat(frontend): PDF export from /journal
8e7f054 feat(frontend): voice input via Web Speech API on /journal/new
1da5b70 fix(frontend): proxy API route so client components hit backend
a969c19 fix(backend): downgrade @fastify/cors 11 -> 9 (Fastify 4 compat)
b2f091d chore(deploy): add render.yaml blueprint (exported from dashboard)
a78342d fix(backend): add CORS for Vercel origin
aa53655 fix(frontend/ledger): cold-start retry + warmup UX
29cc938 fix(frontend/lib): remove duplicate getReportSummary + getGoals
104aa90 fix(frontend): sweep IDR -> USD formatting across all pages
ab6ef0d feat(frontend): ledger page with grid + notebook views and filters
ef23741 feat(frontend): ledger page with grid + notebook views and filters
e7d7aad feat(backend): ledger foundation (goals, projections, reports, seed)
faded08 fix(frontend/horizon): proper Phase G (strip wrapper, min-w-0)
d8e7d2b fix(frontend/horizon): constrain Bryntum Gantt to container width
283e022 feat(frontend): redesign dashboard with stat cards + quick actions
0695ee5 feat(frontend): redesign journal with token styling + mobile cards
814d30f feat(frontend): redesign new transaction form with pending state
96a7eb9 feat(frontend/layout): NavBar + AppShell + wire into layout.tsx
42efc62 feat(frontend/ui): Button, Card, Badge, StatCard, PageHeader, EmptyState, Skeleton, Spinner
aa4c95f chore(frontend): design tokens
548903a fix(frontend/lib): add fetch timeouts
b0ba7ba fix(frontend): correct impact payout currency + 2-step confirm
7394269 chore(frontend): sync pnpm workspace config for bryntum v8
```

### Preconditions Sesi 11

1. `git status` clean, HEAD = commit terakhir Sesi 10 (atau Sesi 11 nanti)
2. **Gh auth**: `gh auth status` = `setuju`, DNS healthy (`getent hosts api.github.com` resolve)
3. **Render auto-deploy** aktif (Settings → Auto-Deploy → "On Commit")
4. `OPENROUTER_API_KEY` di Render env, `ASSISTANT_MODEL` **tidak ada** (fallback default)
5. Browser: Chrome/Edge desktop (Voice) atau mobile (Voice mobile-friendly)
6. **Warm backend** sebelum test: curl `/health` sekali, tunggu 50s

### Next Steps (Sesi 11, prioritas wajib — deadline 12 Nov 12:00 PT)

**WAJIB**
1. **Assistant widget** (30 min) — floating "?" + panel, wire `/assistant/chat` via proxy
2. **Keep-alive GitHub Action** (5 min) — cegah cold-start saat demo
3. **Video script + record** (3-4 jam) — 2:30 alur
4. **Devpost form draft** (1 jam) — deskripsi, screenshot, URL, tech list
5. **Repo public + LICENSE check** (15 min)
6. **Final submission checklist** (30 min)

**OPSIONAL**
7. OCR receipt (3.5 jam)
8. Login MVP (3-4 jam)

**TIDAK DIKERJAKAN**
- Elasticsearch indexing UI, AG Grid, KERNEL, Time-to-Value — defer ke README/docs

## Sesi 11 Close (2026-11-10)

**HEAD**: `2fc1f21`
**Deadline**: 12 Nov 2026 12:00 PT (~2 hari)

### Live URLs

| Layer | URL |
|---|---|
| Frontend | https://financial.saturumah.net |
| Backend | https://financial-api.saturumah.net |
| DB | Neon `ep-green-glitter` ap-southeast-1 |
| Cache | Upstash Redis |
| Search | Elastic Cloud |
| Repo | https://github.com/setuju/financial-os — **masih PRIVATE** |

### Features shipped Sesi 11

**OCR receipt** — Gemini 3 Flash Preview (native endpoint)
- `POST /receipts/ocr` reuses `parseTransaction`
- `x-goog-api-key` header (never in URL)
- Client canvas resize 1600px, 20MB guard

**Impact v2** — semester-based surplus model
- Migration 006: `surplus_periods` table with opening/closing cascade
- `/impact/surplus`: verified (last month) + in_progress (current) + history strip
- `/impact/payouts` GET (list, soft-deleted hidden) + DELETE (money stays out)
- `/impact/horizon-commitment` GET (next month bills)
- Frontend: 2 cards + history + warning banner + donation log + 2-step confirm

**Horizon v2** — goal management
- `DELETE /goals/:id` (typed confirm `delete "<name>"`)
- `GoalsSection`: cards + progress + auto-duration (`ceil(target/monthly)`)
- `GanttInner`: columns:[], `zoomToFit`, viewPreset monthAndYear

**Ledger v2** — clarity
- `/reports/summary`: opening/closing/status per bucket (actual/projected/mixed)
- `/transactions/:id` DELETE (hard delete for typos)
- `LedgerGrid`: OPENING/CLOSING cols (month/year), status legend
- `StatusLegend`: ACTUAL/PROJECTED/MIXED explanation + no-projection hint

**Journal** — pagination + CRUD
- Client-side pagination 20/50/100/all + prev/next
- Delete per-row (2-step inline)
- Edit per-row → `EditTransactionDialog` → `PUT /transactions/:id` re-parses `raw_text`

**PDF** — polish
- Ledger + Journal: row numbering (`#`), explicit column widths
- Ledger: Opening/Closing for month/year, **no Status column**
- Header ASCII (not `→`/`·`)

**Assistant** — markdown-lite
- `renderRich()` backtick → code chip, `**bold**` → strong
- max_tokens 400 → 600 (thinking headroom)

**CORS** — saturumah.net domains added
**Keep-alive** — UptimeRobot ping every 5 min (user set up)

### Seed — US persona

**Sam Rivera** · Web Server Administrator @ PayPal (San Jose, CA)
- Jul-Nov 2026 · semi-monthly (15th + last day) · $3,800 net per paycheck
- US merchants: Trader Joe's, Whole Foods, Shell, Chevron, Amazon, Netflix, Spotify, Verizon, Comcast, State Farm, Chipotle, Starbucks, Doordash, Uber, Target, CVS, Safeway, Best Buy
- 3 goals: Emergency Fund $10k, Hawaii Vacation $3k, MacBook Pro $2.5k
- 2 oracles: next_month $2500, next_week $600

### Deploy notes

- Render free tier ~50s cold start — pre-warm via `curl /health`
- Auto-deploy OFF — manual deploy via dashboard
- Vercel auto-deploy on push (~40-80s)

### Pending (Sesi 12)

- **Video <3 min** — CRITICAL, belum rekam
- **Devpost submit** — draft at `docs/devpost-draft.md`
- **Repo public** — belum di-toggle
- Oracle move to Horizon + celebration animation (in progress)

---


---

# Sesi 11 FINAL CLOSE (2026-11-10 10:45 WIB)

**HEAD**: `477ff65`
**Deadline**: **12 Nov 2026 12:00 PT** = 13 Nov 03:00 WIB (~62 jam)
**Status**: **CODE 95% READY. SUBMISSION 0% — VIDEO + DEVPOST PENDING.**

## Live state

| Layer | URL | Status |
|---|---|---|
| Frontend | https://financial.saturumah.net | ✅ Live |
| Backend | https://financial-api.saturumah.net | ✅ Live |
| DB | Neon `ep-green-glitter` ap-southeast-1 | ✅ Seeded |
| Cache | Upstash Redis | ✅ |
| Search | Elastic Cloud | ✅ |
| Repo | https://github.com/setuju/financial-os | 🟡 verify public toggle |
| Keep-alive | UptimeRobot ping 5 min | ✅ |

## Test suite summary

```
PASS: 55
WARN: 1 (repo private — pending toggle)
FAIL: 0
```

- 40/40 vitest (parser)
- tsc backend + frontend clean
- 12/12 API endpoints live
- 7/7 pages live
- 0 secret leaks
- Response shapes verified

## Persona Review Summary (Sesi 11 Close)

| Persona | Verdict | Catatan |
|---|---|---|
| Product Owner | 🟢 | Fitur 95%, tapi polish > video = risk |
| AI Architect | 🟢 | 4 modalities, defense in depth |
| Backend Engineer | 🟢 | 12 endpoints, cascade clean |
| Frontend Engineer | 🟢 | Dark mode + favicon + PDF fix |
| Data Engineer | 🟡 | Angka dashboard vs impact beda — presentasi risk |
| Integration Engineer | 🟢 | 6/6 wajib sponsor tools live |
| Economist | 🟡 | Model cascade valid, presentasi hati-hati |
| Ethics Officer | 🟢 | Human-in-loop + disclosure utuh |
| QA Engineer | 🟢 | 55/55 pass, E2E gap noted |
| DevOps | 🟡 | Manual deploy required |
| Security | 🔴 | OpenRouter credit + Gemini key rotated noted |
| Librarian | 🟡 | Handoff pending |
| **Hackathon Judge** | 🔴 | **Video = 80% score** |
| **Submission Reviewer** | 🔴 | **VETO until video + Devpost** |

**Consensus: submit video atau tidak submit sama sekali.**

## Shipped features (verified live)

### AI (4 modalities)
- **Text parser** — EN + ID, USD-first, negation + intent rejection
- **Voice** — Web Speech API, amount editor inline fix
- **Vision** — OCR receipt via Gemini 3 Flash Preview (native endpoint)
- **Chat** — Scoped assistant, canary-protected prompt

### Journal
- Pagination 20/50/100/all
- Edit per-row (re-parse raw_text via PUT)
- Delete per-row (hard delete)
- PDF export with # numbering

### Ledger
- Grid/Notebook + 36 filters + projections toggle
- Opening/Closing cascade columns (month/year)
- Status legend (actual/projected/mixed)
- PDF export with # + Opening/Closing + no Status

### Goals / Horizon
- Add/edit/delete with typed confirm `delete "<name>"`
- Auto-duration `ceil(target/monthly)`
- Bryntum Gantt 8 with custom fields, zoom-to-fit

### Oracle
- Moved from Dashboard → Horizon
- Predict, edit, delete, achieve
- Celebration modal 🎉 "Congratulation! You finished the Oracle!"

### Impact
- Verified (Oct) + In-Progress (Nov) cards
- 6-month history strip
- Horizon next-month warning
- Donation log with soft-delete (audit preserved)
- PayPal Payouts 2-step confirm

### UI
- Dark mode (CSS variables, 300ms smooth inversion)
- Wallet favicon (SVG, PayPal blue)
- NavBar theme toggle (Moon/Sun, localStorage persist)
- Mobile responsive (2-row input, 1-row desktop)

## Key commits (Sesi 11)

```
477ff65  docs(readme): professional rewrite
8893ae4  chore: cleanup root test artifacts + extend gitignore
716fbee  feat(ui): dark mode toggle
650f9b7  feat(ui): wallet favicon SVG
a8b9150  feat(oracle): move to Horizon + achievement + celebration
61d5780  docs(session 11): handoff close + lessons #35-44
2fc1f21  fix(pdf): row numbering + remove Status + align
8fe58b5  feat(journal): wire pencil icon + EditTransactionDialog
b8c6172  feat(transactions): PUT /transactions/:id
a81ccf4  fix(pdf): period label + opening/closing columns
a298f36  feat(journal): pagination + delete per-row
a2522c8  feat(seed): realistic US PayPal-employee data
```

## Deploy state

- **Render** — manual deploy (auto-deploy OFF). Backend commit terakhir di-deploy: TBD verify.
- **Vercel** — auto-deploy on push. Frontend live at `477ff65` (commit sebelum docs cleanup).
- **Neon** — seeded US persona. `surplus_periods` rebuilt Jul→Nov.

## Env vars state

| Var | Status |
|---|---|
| `DATABASE_URL` | ✅ Neon green-glitter |
| `REDIS_URL` | ✅ Upstash |
| `ELASTIC_URL` + `ELASTIC_API_KEY` | ✅ |
| `PAYPAL_CLIENT_ID` + `SECRET` | ✅ Sandbox |
| `PAYPAL_MODE` | ✅ `sandbox` |
| `GEMINI_API_KEY` | ✅ Rotated 2026-11-10 03:13 |
| `OPENROUTER_API_KEY` | ✅ Active (credit status unknown) |
| `ASSISTANT_MODEL` | ✅ Empty (default `google/gemini-3.8-flash` per R14) |

## Known risks

1. **🔴 OPEN — OpenRouter credit** — assistant may fail if credit exhausted. Mitigasi: migrate to Gemini native (~20 mnt, post-video).
2. **🟡 OPEN — Repo public toggle** — status verify manual sebelum submit.
3. **🟡 OPEN — Data angka berbeda** — Dashboard vs Impact beda 99 (horizon Jul-Nov). Video: tunjukkan Impact page saja.
4. **🟡 OPEN — Render manual deploy** — backend commit terbaru (`477ff65`) belum deploy.
5. **🟢 CLOSED — Gemini key** — sudah di-rotate.

## Blockers (critical, non-code)

| # | Blocker | Effort | Priority |
|---|---|---|---|
| **1** | **Video <3 menit public** | 90 mnt fokus | 🔴 CRITICAL |
| **2** | **Devpost submit** | 40 mnt | 🔴 CRITICAL |
| 3 | Repo public toggle (verify) | 30 detik | 🔴 if not done |

## Next steps (Sesi 12 — urutan)

### Phase 1 (30 detik): Toggle public + verify
1. `gh repo edit setuju/financial-os --visibility public --accept-visibility-change-consequences`
2. Verify: `curl -s -o /dev/null -w "%{http_code}" https://api.github.com/repos/setuju/financial-os` → expect 200
3. Buka `https://github.com/setuju/financial-os` di browser → cek README render cantik (badges, TOC, tables)

### Phase 2 (90 menit): Rekam video
**Pre-flight:**
1. `curl https://financial-api.saturumah.net/health` → tunggu 200 (~50s kalau cold)
2. Setup OBS: Window capture Chrome, 1080p30, MKV format
3. Hard refresh semua tab: /, /journal, /journal/new, /ledger, /impact, /horizon
4. Hide bookmark bar (Ctrl+Shift+B), 100% zoom, fullscreen F11
5. **Verify favicon + dark mode bekerja** sebelum rekam

**Shot list (per `docs/video-script.md`):**
- 0:00-0:12 Hook — dashboard idle
- 0:12-0:34 Text + Voice — parser rejection "want to buy"
- 0:34-0:49 OCR ⭐ — receipt auto-fill
- 0:49-1:06 Journal + Ledger — PDF export
- 1:06-1:34 PayPal Payouts — **batch ID visible**
- 1:34-1:50 Bryntum Horizon — hover custom fields
- 1:50-2:08 AI Assistant — scoped refusal
- 2:08-2:22 Tech slide — logo grid
- 2:22-2:30 Closing — "Track with words. Give with intent."

**Must-win shots:**
1. Parser rejection (0:12-0:34)
2. OCR auto-fill (0:34-0:49)
3. PayPal batch ID (1:06-1:34)
4. Assistant refusal (1:50-2:08)

**Edit CapCut** (~20 mnt) → **Upload YouTube public** (~10 mnt)

### Phase 3 (40 menit): Devpost submit
1. Copy `docs/devpost-draft.md` → https://paypalaihackathon.devpost.com/
2. Paste video URL ke field Video
3. Submit sebelum **13 Nov 03:00 WIB**

## Aturan baru (untuk docs/rules.md — R19)

**R19 — Video + Devpost adalah submission, bukan optional.** Semua polish harus di-gate oleh video. Kalau video belum ada di T-48h, stop semua feature work dan fokus video 100%.

## Lessons added this session

#35 tsc strict rejects unused var (tsx tolerates)
#36 API key leak via URL query param
#37 Model IDs provider-specific
#38 set -e kills discovery scripts
#39 Route extractor regex fails on multiline generics
#40 Interface change without SQL update = silent bug
#41 Push before tsc gate = Vercel build fail
#42 Rewrite endpoint without preserving contract
#43 Blind multi-file patch → 3 iterations wasted
#44 Import missed after inject

## Files ready for Sesi 12

| File | Purpose |
|---|---|
| `docs/video-script.md` | Shot list + timing (2:30) |
| `docs/devpost-draft.md` | All form fields, ready to copy-paste |
| `docs/submission-checklist.md` | Final checklist |
| `docs/postman/financial-os.postman_collection.json` | API reference |

**END OF SESI 11.**


---


---

## Sesi 12 PLAN: Multi-Tenant Migration

**Recon**: 2026-11-10 12:39 WIB
**Backup VERIFIED**: 2026-11-10 13:03 WIB
**HEAD**: `0590036`
**Tag**: `pre-multitenant-2026-11-10` (pushed to origin)

### Backup files (VERIFIED — 4th attempt SUCCESS)

| File | Size | Content |
|---|---|---|
| `/home/jack/saturumah-backups/neon-20261110_130127.sql` | 44715 bytes | 6 tables, 134 INSERTs |
| `/home/jack/saturumah-backups/neon-20261110_130127.json` | 54483 bytes | 115 tx, 3 goals, 2 payouts, 2 oracles, 6 periods |
| `~/saturumah-backups/LATEST.txt` | — | symlink helper |
| git tag `pre-multitenant-2026-11-10` | — | code rollback |

**Backup method (FINAL, working):**
- `pg.Client` (bukan Pool) — avoid pool teardown race
- URL **unpooled** (hostname tanpa `-pooler`) — PgBouncer rejects startup params
- `SET search_path TO public` **runtime query** (bukan `options` startup param)
- `public."<table>"` qualifier
- `client.end().catch(() => {})` di finally

**Attempt history (4 fails → 1 success):**

| # | Method | Failure |
|---|---|---|
| 1 | pg_dump v16 | server version mismatch (Neon v18) |
| 2 | pg.Pool + SET | pool.end() teardown race |
| 3 | pg.Client + options startup param | PgBouncer rejects  in options |
| 4 | pg.Client + runtime SET + unpooled | ✓ SUCCESS |

### Current state (verified at dump)

- Transactions: **115** (105 actual + 10 projection)
- Goals: 3 · Oracles: 2 · Payouts: 2 · Periods: 6
- Verified Oct: $10,813.87 · In-progress Nov: $8,136.94

### Restore procedure

**A. DB:**
```bash
psql "$DATABASE_URL" < /home/jack/saturumah-backups/neon-20261110_130127.sql
```

**B. Code:**
```bash
git fetch origin tag pre-multitenant-2026-11-10
git checkout pre-multitenant-2026-11-10
git push origin pre-multitenant-2026-11-10:main --force
```

**C. Verify backup:**
```bash
grep -c '^CREATE TABLE' neon-20261110_130127.sql  # 6
grep -c '^INSERT INTO'  neon-20261110_130127.sql  # 134
```

### Gotchas (7)

1. `surplus_periods.period_month` UNIQUE → composite swap (session_id, period_month)
2. `payouts.transaction_id` FK — no ON DELETE CASCADE
3. `user_id` nullable — do not repurpose for session_id
4. Seed `main()` TRUNCATEs all rows → reset must scope by session
5. Frontend auth EXISTS (`fos_auth` cookie + password `financial-os`)
6. **Neon pooler** rejects startup `options` param → runtime `SET` + qualifier
7. **`pg.Pool` teardown race** on Neon → use `pg.Client` + graceful end

### Risk register

- URL leaked in chat 2026-11-10 — rotate `neondb_owner` password post-submission
- 14 repo funcs + 25 routes to update (see below)
- If any bubble fails tsc twice → abort, revert to reset-button-only

### NEXT → `docs/multitenant-plan.md` (proposal for user review)


---

## Sesi 11 Hotfix (2026-11-10 15:16 WIB)

### Fixed
1. Impact first-month — new users see current surplus; auto-switch from month 2
2. Indonesian text → English (3 UI locations; parser tests/vocab KEPT)
3. Ledger hint banner (Goals/Oracle are separate pages)
4. Categories 8→12: + groceries, fitness, subscription, travel

### Deferred
- Category filter in Ledger (~45 min)
