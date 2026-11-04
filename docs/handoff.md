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
