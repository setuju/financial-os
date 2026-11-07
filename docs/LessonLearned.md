# Lesson Learned — Sesi Perencanaan

## Kesalahan 1: Menilai Bryntum "Tidak Relevan" Terlalu Cepat
**Apa yang terjadi**: Saya awalnya menyatakan Bryntum hanya untuk Gantt manajemen proyek dan tidak cocok untuk keuangan pribadi.
**Koreksi**: Bryntum Gantt dapat direpurpose sebagai **Financial Horizon** dengan field kustom pada `TaskModel`.
**Pelajaran**: Jangan menilai alat dari nama kategorinya; periksa data model dan API extension point-nya.

## Kesalahan 2: Menganggap KERNEL "Opsional dan Berisiko"
**Apa yang terjadi**: Saya menyebut KERNEL sebagai tambahan yang menambah kompleksitas tanpa nilai jelas.
**Koreksi**: Dokumentasi KERNEL mendukung pola **"Playwright with computer use fallback"**.
**Pelajaran**: Fallback adalah kebutuhan arsitektur, bukan fitur tambahan.

## Kesalahan 3: Mengabaikan Kebutuhan `unset GITHUB_TOKEN`
**Apa yang terjadi**: Saya tidak secara eksplisit memperingatkan bahwa `GITHUB_TOKEN` dapat menimpa kredensial `gh`.
**Koreksi**: Selalu jalankan `unset GITHUB_TOKEN` sebelum `gh auth status` / `gh repo create`.
**Pelajaran**: Environment variable tersembunyi adalah sumber bug otorisasi paling umum di CLI.

## Kesalahan 4: Tidak Memisahkan "Dana Dampak" dari "Pokok Tabungan"
**Apa yang terjadi**: Pada draf awal, saya tidak cukup jelas membedakan sumber dana kontribusi.
**Koreksi**: Hanya **yield** atau **cashback intercept** yang dialokasikan; pokok tetap milik pengguna.
**Pelajaran**: Dalam aplikasi keuangan, kejelasan asal dana adalah prasyarat kepercayaan pengguna.

## Kesalahan 8: Melanggar Aturan `clear` yang Saya Sendiri Tulis
**Apa yang terjadi**: Pada bubble koreksi repo ownership (STEP 1–10), saya TIDAK menyertakan `clear` di awal. Ini melanggar R2 di `docs/rules.md` yang saya tulis sendiri: "Satu bubble cukup satu `clear` di awal".
**Dampak**: Output bubble langsung menempel ke prompt terminal sebelumnya, sulit dibaca; user kehilangan konteks visual.
**Koreksi**: Setiap bubble yang dikirim ke user WAJIB diawali `clear` sebagai perintah pertama.
**Pelajaran**: Aturan yang saya tulis untuk user juga berlaku untuk saya. Konsistensi internal adalah bagian dari kualitas.

## Kesalahan 9: Menggunakan `!!` di Dalam String Bubble
**Apa yang terjadi**: Bubble diagnosis push (Sesi 2) memuat `echo "!! gh repo view FAILED"`. Di shell interaktif, `!!` di-expand menjadi perintah sebelumnya — pada kasus ini `clear`. Output menjadi `"clear gh repo view FAILED"` dan menyesatkan.
**Dampak**: Diagnosis pertama gagal dieksekusi; waktu terbuang. Untungnya tidak ada perintah destruktif yang tak sengaja tereksekusi.
**Koreksi**: Setiap bubble memakai `set +H` di awal untuk mematikan history expansion. Hindari `!!`, `!$`, `!*` di dalam string bubble.
**Pelajaran**: Shell interaktif punya ekspansi tersembunyi. Perintah yang tampak literal bisa berubah sebelum dieksekusi.

## Kesalahan 10: Push Gagal "Repository not found" Meski gh Auth Valid
**Apa yang terjadi**: `git push` gagal 2× (`f85a9b3`) dengan `remote: Repository not found` meski `gh auth status` = setuju dan `gh repo view` berhasil. Diagnosis 8-bagian mengonfirmasi: repo ada, token valid, credential helper `gh auth git-credential` terpasang benar, tidak ada `GITHUB_TOKEN`/`GH_TOKEN` shadow.
**Dampak**: ~15 menit terpakai untuk diagnosis; commit tertahan lokal.
**Koreksi**:
- `gh auth setup-git` (idempotent) + retry → sukses. Config before=after, jadi bukan helper yang berubah — kandidat penyebab: race mid-session switch akun, stale cache, atau blip GitHub.
- **R12 ditambahkan**: verifikasi akun gh tepat sebelum setiap remote git op, dengan dua sumber (`gh auth status` + `gh api user`).
**Pelajaran**: Auth check di awal sesi tidak menjamin auth di tengah sesi pada lingkungan multi-akun. Verifikasi harus tepat sebelum operasi kritis. GitHub membalas **404** (bukan 403) untuk repo privat tanpa akses — jangan percaya "not found" begitu saja.

## Kesalahan 11: Kill + Wait pada Multi-Layer Process Tree
**Apa yang terjadi**: Bubble smoke test A3c (Sesi 2) menjalankan `pnpm start &` → `kill $BACK_PID` → `wait $BACK_PID`. `pnpm start` men-spawn `tsx` yang men-spawn `node`. SIGTERM ke pnpm tidak membunuh grandchildren; `wait` menunggu seluruh job selesai — hang ~15 menit sampai user menekan Ctrl+C.
**Dampak**: Waktu user terbuang; terminal macet; diagnosis harus recovery manual.
**Koreksi**:
- Pakai `exec node --import tsx src/index.ts` — flatten process tree jadi 1 layer.
- Atau `setsid` + `kill -9 -$PGID` untuk membunuh seluruh process group.
- Jangan pernah `wait` setelah `kill` tanpa memastikan tidak ada grandchild.
- Selalu fallback `pkill -9 -f "<pattern>"` setelah kill utama.
- `trap cleanup EXIT INT TERM` untuk cleanup otomatis pada semua exit path.
**Pelajaran**: "Kill job leader" di bash ≠ "kill process tree". Selalu flatten atau pakai process group.

## Kesalahan 12: /health Butuh 43 Detik untuk Melaporkan 503 Saat Backend Down
**Apa yang terjadi**: Saat container PG/Redis mati (laptop sleep semalam), `/health` handler menunggu 43 detik sebelum mengembalikan `{"status":"degraded","pg":"fail","redis":"fail"}` dengan HTTP 503. Kombinasi `pg.connectionTimeoutMillis: 5000` × retry pool + ioredis `maxRetriesPerRequest: 3` × retryStrategy (200ms × n, cap 2000ms).
**Dampak**: Demo juri berpotensi terlihat "backend hang" bukan "backend sehat tapi DB down". Observability buruk.
**Koreksi (target Minggu 6)**:
- `pg.connectionTimeoutMillis: 2000` (dari 5000)
- `ioredis` `connectTimeout: 2000` + `maxRetriesPerRequest: 1`
- `/health` handler overall timeout 3 detik via `Promise.race`
- Return 503 cepat saat DB down — lebih informatif daripada menggantung.
**Pelajaran**: Health check harus cepat. Latensi tinggi pada probe = observability rusak.

## Kesalahan 13: Top-Level `exit 1` Mematikan Shell Interaktif
**Apa yang terjadi**: Bubble demo (Sesi 3) menulis `if ! curl ...; then ...; exit 1; fi` di top-level shell interaktif. Meskipun R2 melarang, saya melanggarnya. Terminal user crash dengan "process exited with code 1", harus reopen.
**Dampak**: User kehilangan state terminal. Ini **kedua kalinya** saya melanggar aturan yang saya tulis sendiri (Kesalahan 8 = `clear`, Kesalahan 13 = `exit 1`).
**Koreksi**:
- `exit` HANYA boleh di dalam `( ... )` — subshell menyerap exit code, shell interaktif hidup.
- Top-level: gunakan `echo` + natural return, atau wrap seluruh logika dalam subshell.
- Standard pattern tiap bubble ke user: `clear` + `( set +H; ... )` — tanpa pengecualian.
- Gate dengan `if ! R12 ...; then echo STOP; else ...; fi` — jangan `|| { ... }` yang membiarkan sisa blok tetap jalan.
**Pelajaran**: Aturan yang saya tulis untuk user harus saya patuhi lebih ketat dari siapapun. Kalau R2 melarang `exit 1`, maka `exit 1` tidak boleh ada di bubble saya — titik. Ini kontrak, bukan preferensi.

## Kesalahan 14: `gh auth switch` Dipanggil Sebelum `unset GITHUB_TOKEN`
**Apa yang terjadi**: Bubble R10b (Sesi 4) menaruh `gh auth switch -u setuju` di dalam subshell, sebelum `unset GITHUB_TOKEN GH_TOKEN`. Akibatnya `gh` menolak switch dengan *"The value of the GITHUB_TOKEN environment variable is being used for authentication"*. R12 verify tetap gagal: `active=TidakSetuju token=TidakSetuju`.
**Dampak**: Waktu terbuang; user harus switch manual di luar subshell.
**Koreksi**:
- `unset GITHUB_TOKEN GH_TOKEN` HARUS di **top-level** shell (bukan dalam subshell), sebelum `gh` command apa pun.
- Termasuk `gh auth switch`, bukan hanya `gh auth status` / `gh api user`.
- R12b ditambahkan ke `docs/rules.md` sebagai pengingat eksplisit urutan.
**Pelajaran**: Aturan kompleks butuh checklist eksplisit per-bubble, bukan andalkan memori. Tiga pelanggaran aturan sendiri (Kesalahan 8, 13, 14) dalam 2 sesi menunjukkan pola sistematis: "aturan yang saya tulis untuk user juga harus saya periksa di setiap bubble yang saya kirim, bukan mengandalkan ingatan."

## Kesalahan 15: Asumsi `frontend/components/` Ada Tanpa `.gitkeep`
**Apa yang terjadi**: Bubble Phase 5 menulis `frontend/components/TransactionGrid.tsx`. Direktori tidak ada — Sesi 1 buat kosong, git tidak track folder kosong, Sesi 3 (create-next-app) tidak buat ulang.
**Dampak**: Bubble STOP di step 2, ag-grid ter-install sia-sia (belum di-commit), ~10 menit terbuang.
**Koreksi**: Selalu `mkdir -p` sebelum menulis file di direktori yang mungkin belum ada. Folder kerangka pakai `.gitkeep`.
**Pelajaran**: Jangan asumsikan struktur direktori dari handoff — verifikasi dengan `test -d` sebelum menulis.

## Kesalahan 16: `cmd | tail` Menyembunyikan Exit Code
**Apa yang terjadi**: `timeout 200 pnpm build 2>&1 | tail -25` — pipe membuat `$?` = exit code `tail` (selalu 0), bukan `build`. `timeout` SIGTERM diabaikan `set -e`.
**Dampak**: Build terpotong di tengah, subshell lanjut, `.next` incomplete. Baru ketahuan dari log start "Could not find a production build".
**Koreksi**: Pakai `set -o pipefail` + `RC=${PIPESTATUS[0]}`. Atau jangan pipe output kritikal.
**Pelajaran**: Pipe menyembunyikan error secara default. Untuk command kritikal, `pipefail` wajib.

## Kesalahan 17: `curl -sf` Tanpa `--max-time` Bisa Hang
**Apa yang terjadi**: Loop wait `curl -sf http://localhost:3000/` tanpa `--max-time`. Jika TCP listener ada tapi HTTP tidak responsif, curl menunggu selamanya.
**Dampak**: Bubble bisa hang tanpa batas; terminal user macet.
**Koreksi**: Selalu `curl -sf --max-time N` (2–5 detik untuk readiness, 5–10 untuk response).
**Pelajaran**: Setiap network probe di bubble wajib punya timeout eksplisit.

## Kesalahan 18: AG Grid Build Hang — Miskategorisasi Penyebab
**Apa yang terjadi**: Setelah menambah `ag-grid-community@31.3.4` + `ag-grid-react@31.3.4` dengan pola `dynamic(ssr:false)`, `next build` hang permanen di "Creating an optimized production build …". Saya menyimpulkan "AG Grid adalah penyebabnya" setelah 2 kegagalan (200s, 600s). Setelah revert penuh AG Grid, build **tetap hang**. Kesimpulan pertama saya salah.
**Dampak**: ~90 menit terbuang pada misdiagnosis; akhirnya AG Grid di-revert; waktu hilang.
**Koreksi**:
  - Untuk perubahan multi-variabel (paket + file + page rewrite), lakukan **differential diagnosis**: revert semua ke known-good, build, konfirmasi baseline OK, lalu tambah satu variabel per percobaan.
  - Jika `next build` hang > 5 menit dengan `.next` < 1MB (hanya skeleton), itu **bukan lambat** — itu webpack init yang macet. Curigai environmental, bukan kode.
**Pelajaran**: Jangan konfirmasi hipotesis dari kegagalan berulang yang sama. Isolasi variabel sebelum menyimpulkan.

## Kesalahan 19: `timeout` Kill tidak Membersihkan State WSL2 Segera
**Apa yang terjadi**: Setelah 3× kill (`timeout 200`, `timeout 600`, `timeout 300`), build tetap hang selama ~15 menit ke depan. Pada 01:27 (13 menit setelah kegagalan terakhir) build sukses tanpa perubahan kode/restart/env. Dugaan: WSL2 menahan file lock / cache lebih lama dari yang diharapkan setelah SIGKILL berlapis; state akhirnya bersih setelah delay alami.
**Dampak**: Saya menyimpulkan "environment rusak, restart wajib". Ternyata cukup tunggu 10-15 menit.
**Koreksi**:
  - Setelah `timeout` kill build: **beri jeda minimal 5 menit** sebelum retry, atau verifikasi cleanup dengan `lsof frontend/.next/BUILD_ID 2>/dev/null` dan `ss -tlnp | grep :3000`.
  - Jika build macet berulang tanpa perubahan kode: coba `pnpm store prune` + `rm -rf node_modules .next` sebelum menyimpulkan "restart WSL".
**Pelajaran**: WSL2 tidak menyelesaikan cleanup proses SIGKILL seketika. Beri waktu sebelum retry atau nuklir state.

## Kesalahan 20: Vercel 404 Karena File Belum Di-Commit
**Apa yang terjadi**: Halaman `/horizon` mengembalikan 404 di Vercel meskipun build sukses. Ternyata file `app/horizon/page.tsx` belum pernah masuk ke Git (tertinggal di commit sebelumnya).
**Koreksi**: Selalu periksa output commit. Jika ada `create mode` untuk file yang seharusnya sudah ada, berarti file itu belum pernah di-commit.
**Pelajaran**: Selalu verifikasi `git status` dan file fisik sebelum menyalahkan platform deployment.

## Kesalahan 21: Bryntum v8 License Key Prop vs Global
**Apa yang terjadi**: Mencoba mengirim `licenseKey` sebagai prop ke `<BryntumGantt>`, tetapi TypeScript error karena prop tersebut tidak ada di tipe `BryntumGanttProps`. 
**Koreksi**: Bryntum v8 mengharuskan registrasi via objek global: `(globalThis.bryntum ??= {}).licenseKey = '...'` sebelum komponen dirender.
**Pelajaran**: Baca dokumentasi *library* untuk versi mayor terbaru. API sering berubah drastis.

## Kesalahan 22: ESLint `no-explicit-any` Menggagalkan Vercel Build
**Apa yang terjadi**: Kode berjalan di lokal, tetapi Vercel gagal build karena Next.js secara ketat melarang penggunaan `any` di production.
**Koreksi**: Gunakan `unknown` atau tipe spesifik (seperti `Record<string, unknown>`). Untuk variabel global, gunakan *type assertion* `as unknown as { ... }`.
**Pelajaran**: Jangan pernah menggunakan `any` di proyek Next.js yang akan di-deploy ke Vercel. Gunakan `tsc --noEmit` secara rutin.

## Kesalahan 23: Render Missing Dependency (SDK di dalam Folder)
**Apa yang terjadi**: Render crash `ERR_MODULE_NOT_FOUND: zod` karena SDK APIMatic memiliki `package.json` sendiri di dalam folder `backend/src/paypal/sdk/`. Render hanya menjalankan `pnpm install` di root `backend`.
**Koreksi**: Tambahkan dependensi yang dibutuhkan SDK (seperti `zod`) ke `package.json` utama backend.
**Pelajaran**: Jika memiliki sub-project di dalam monorepo, pastikan dependensinya terdaftar di level root yang di-build oleh platform deployment.

## Kesalahan 24: Render Missing Env Var ELASTIC_URL
**Apa yang terjadi**: Backend crash saat menyala karena `config.ts` memanggil `required('ELASTIC_URL')`, tetapi variabel tersebut belum dimasukkan ke dashboard Render.
**Koreksi**: Tambahkan `ELASTIC_URL` dan `ELASTIC_API_KEY` ke menu Environment di Render.
**Pelajaran**: Setiap kali menambahkan `required('...')` baru di `config.ts`, segera catat di handoff agar tidak lupa dimasukkan ke environment variables platform cloud.

## Kesalahan 25: `@fastify/cors@11` Incompatible with Fastify 4 — Production Down

**Apa yang terjadi**: `pnpm add @fastify/cors` (default latest = v11.4.1) untuk fix CORS. Server crash startup: `FST_ERR_PLUGIN_VERSION_MISMATCH: @fastify/cors - expected '5.x' fastify version, '4.29.1' is installed`. Backend **down ~5 menit**, semua fitur frontend broken.

**Dampak**: Production outage 5 menit, semua endpoint fail.

**Koreksi**:
- Matrix compatibility: `@fastify/cors` v9 → Fastify 4, v10/v11 → Fastify 5.
- Pin: `pnpm add @fastify/cors@^9` untuk Fastify 4 project.
- Verify startup di Render logs sebelum assume fix works.

**Pelajaran**: Peer-dependent plugins wajib pin major version matching host framework. Jangan `pnpm add` tanpa specify version saat plugin punya fastify peer dep.

## Kesalahan 26: `cat >>` Not Idempotent — Duplicate Exports in lib/api.ts

**Apa yang terjadi**: Bubble G2 pakai `cat >> lib/api.ts` untuk append types. Bubble jalan 2× (paste partial + retry), block ter-append 2× → `getReportSummary` + `getGoals` defined twice. Vercel build fail: "name X is defined multiple times". Fix pakai marker split di commit `29cc938`.

**Dampak**: Build fail ~2 menit, debug 10 menit.

**Koreksi**:
- Check marker: `if ! grep -q '// ---- Reports ----' file; then cat >> ...; fi`
- Atau `cat >` full content (idempotent by overwrite)
- Verify exports count after append: `grep -c "export async function $name"`

**Pelajaran**: `cat >>` tidak idempotent. File writes harus safe di-run 2×.

## Kesalahan 27: `process.env.API_URL` Undefined di Client Components — Feature Broken

**Apa yang terjadi**: `lib/api.ts` pakai `const API_URL = process.env.API_URL ?? 'http://localhost:3001'`. Server components work (`/`, `/journal`, `/impact` initial load). Client components (`LedgerClient`, `SurplusOracleCard`, `DistributeButton`) fetch ke `localhost:3001` dari browser → connection refused. Curl test konfirmasi CORS headers present — bukan CORS issue, tapi env boundary.

**Dampak**: Ledger, Save prediction, Distribute button semua broken. 20+ menit diagnosis (user assumed CORS).

**Koreksi**:
- Next.js hanya inline `NEXT_PUBLIC_*` ke client bundle. `process.env.API_URL` = `undefined` di client.
- Fix: Next.js API proxy route `/api/proxy/[...path]/route.ts` — client fetch same-origin, server route forward ke Render.
- `lib/api.ts` branch: `typeof window === 'undefined' ? API_URL : '/api/proxy'`

**Pelajaran**: Next.js strict env boundary. Server-only env vars butuh proxy route untuk client access.

## Kesalahan 28: `pnpm-workspace.yaml` Placeholder String `set this to true or false`

**Apa yang terjadi**: Setelah `pnpm add jspdf`, pnpm auto-modify `pnpm-workspace.yaml`. Value ditulis sebagai string `set this to true or false` (placeholder), bukan boolean. Commit `1c96681` mungkin bikin Vercel error. Fix di `bb2235c` (change to `core-js: true`).

**Dampak**: Potential Vercel build fail, diagnosa 10 menit.

**Koreksi**:
- Sebelum commit: `grep "set this to true" file && fail`
- Atau `pnpm approve-builds` (interactive) atau edit manual
- Always inspect diff pada `pnpm-workspace.yaml` sebelum commit

**Pelajaran**: pnpm auto-modify files on `add`. Placeholder strings harus di-reject.

## Kesalahan 29: Model ID Without Provider Prefix Rejected by OpenRouter

**Apa yang terjadi**: Set `ASSISTANT_MODEL=gemini-flash-latest` di Render (missing `google/` or `~google/`). Tilde di-strip saat save. Model ID rejected by OpenRouter (400 model not found), translate ke 502 upstream_error. Semua chat fail.

**Dampak**: Assistant endpoint hidup tapi tidak bisa chat ~20 menit. Fix di `4a80de5` (pin `google/gemini-3.8-flash` + guard env).

**Koreksi**:
- Pin explicit version di code: `DEFAULT_MODEL = 'google/gemini-3.8-flash'`
- Guard env: `if (envModel.includes('/')) return envModel; return DEFAULT_MODEL`
- Response error include `reason` + `model` for debugging

**Pelajaran**: Model IDs butuh `provider/model` format. Alias (`~`) tidak aman di env vars — bisa di-strip. Pin explicit di code, env var optional.

## Kesalahan 30: Assumed Paths — `backend/scripts/` dan `saturumah.net`

**Apa yang terjadi**: Dua asumsi salah:
1. Bubble G1 tulis `backend/scripts/seed-demo.ts` — folder tidak ada (migrate.ts ada di `src/scripts/`). `cat >` silent fail, commit skipped.
2. Bubble pakai `cd ~/saturumah.net || cd ~/saturumah/paypal` — kedua ada, tapi `saturumah.net` adalah **repo lain** (`setuju/saturumah.net`). Write file ke repo yang salah.

**Dampak**: 1 iterasi recovery (~5 menit per issue), no data loss.

**Koreksi**:
- Verify directory: `[ -d backend/src/scripts ] || mkdir -p backend/src/scripts`
- Verify after write: `[ -f "$file" ] || exit 1`
- Hard path only: `cd ~/saturumah/paypal || exit 1` — no `||` fallback
- Verify remote: `case "$(git config --get remote.origin.url)" in *financial-os*) ;; *) exit 1;; esac`

**Pelajaran**: Directory structure wajib verify (bukan assume). `||` fallback untuk navigation dangerous.

## Kesalahan 31: WSL2 DNS Broken → `gh auth` False "Token Invalid"

**Apa yang terjadi**: `gh auth status` reported token invalid. User buka GitHub di browser — fine. Root cause: WSL2 `systemd-resolved` upstream tidak forward DNS. `nslookup api.github.com 8.8.8.8` sukses, tapi `getent hosts` gagal. `gh auth status` interpretasi network fail sebagai token invalid (misleading).

**Dampak**: 15+ menit troubleshooting, push blocked.

**Koreksi**:
- DNS check dulu: `getent hosts api.github.com` + `curl -I https://api.github.com`
- Kalau DNS fail: `sudo systemctl restart systemd-resolved`, atau set static DNS
- `nslookup <host> 8.8.8.8` sukses tapi `getent` gagal = definitive DNS stub issue

**Pelajaran**: "Token invalid" dari `gh` bisa false positive saat network issue. Verify network layer dulu sebelum cred layer.

## Kesalahan 32: Render Env "Save Only" Doesn't Trigger Deploy

**Apa yang terjadi**: Add `OPENROUTER_API_KEY` di Render Environment, klik "Save Changes" default. Setelah deploy selesai, `/assistant/info` tetap `configured:false`. Root cause: save default = "Save only" (no deploy trigger). Env tersimpan tapi belum aktif.

**Dampak**: 1 manual deploy iteration (~3 menit).

**Koreksi**:
- Klik dropdown setelah "Save Changes" → **"Save, rebuild, and deploy"**
- Atau setelah save: **Manual Deploy** → "Deploy latest commit"
- Verify via `/assistant/info` → `configured:true`

**Pelajaran**: Render env changes punya 3 save opsi. Always pick "Save, rebuild, and deploy".

## Kesalahan 33: Deprecated Model `gemini-1.5-flash` in Default Config

**Apa yang terjadi**: `DEFAULT_MODEL = 'google/gemini-flash-1.5'` (dari Sesi 9). Sep 2026 deprecated, tapi tidak di-update. User catch setelah cek dashboard. Fix `4a80de5` → `google/gemini-3.8-flash`.

**Dampak**: Model invalid → chat fail.

**Koreksi**:
- Pin `google/gemini-3.8-flash` (Sep 2026, $0.75/$3.75 per M tokens)
- Review deprecation quarterly
- Add model review to roadmap/session checklist

**Pelajaran**: Default model di code harus pinned + active + reviewed. Deprecated models break endpoints silently (no auto-upgrade).

## Kesalahan 34: Cold-Start False Negative — Test Too Early After Push

**Apa yang terjadi**: Push `45fd8d2` (assistant endpoint), curl `/assistant/info` immediately → 404. Assumed route not registered. 5 menit kemudian test ulang → 200. First test 36 seconds too early (Render build ~2-3 menit).

**Dampak**: 5 menit false alarm, potential wrong diagnosis path.

**Koreksi**:
- Wait 3 minutes setelah push sebelum test
- Atau check Render Deploys tab / Events tab for "Deploy live"
- Atau use `/health` uptime field: `if uptime < 120s` = just deployed, wait
- Auto-retry with backoff untuk demo scripts

**Pelajaran**: "It's not working" setelah push — check deploy status first. Deploy latency 2-3 min = normal, bukan bug.
