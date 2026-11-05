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
