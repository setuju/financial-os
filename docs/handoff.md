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
