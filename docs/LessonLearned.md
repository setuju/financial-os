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
