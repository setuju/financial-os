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
