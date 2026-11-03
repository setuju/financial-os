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
