# Financial OS — Roadmap Eksekusi (Hackathon PayPal AI)

**Repo**: `setuju/financial-os` (private → public sebelum submission)
**Deadline submission**: **12 November 2026, 12:00 PT** (hard deadline)
**Winners announced**: sekitar 21 Desember 2026

## Prinsip Produk
1. Input bahasa alami → jurnal keuangan (tanpa tabel).
2. Hanya surplus *bebas etis* (setelah buffer & kewajiban) yang boleh dialokasikan ke mode kontribusi.
3. Dana kontribusi berasal dari **yield, cashback intercept, atau sponsor** — bukan donasi atau pokok tabungan.
4. Setiap alokasi memerlukan **persetujuan eksplisit** pengguna (human-in-the-loop).

## Fase Eksekusi (6 Minggu)

### Minggu 1 — Fondasi & Rekon
- [x] Rekon environment WSL2 & instal toolchain.
- [x] Buat struktur folder & file docs.
- [x] Inisialisasi repo Git & push ke `setuju/financial-os` (private).
- [ ] Daftar akun: PayPal Developer Sandbox, Astropods, AG Grid trial, Bryntum trial, Elastic trial, KERNEL, APIMatic.

### Minggu 2 — Anti-Budget Core (Wajib Selesai)
- [x] Bangun parser bahasa alami (rule-based) untuk kalimat seperti "saya baru jajan 20ribu; tadi dapat hadiah 15ribu".
- [x] Simpan transaksi ke PostgreSQL.
- [ ] Indeks ke **Elastic** (deferred ke Sesi 6).
- [x] Tampilkan jurnal (HTML table; **AG Grid deferred** — build hang, akan di-retry).

### Minggu 3 — Surplus Oracle & PayPal Integration
- Hitung **Surplus Bebas Etis** per periode (harian, mingguan, bulanan).
- Bangun **Surplus Oracle**: pengguna memprediksi surplus minggu depan; selisih positif dialokasikan ke "Dompet Dampak".
- Integrasikan **PayPal Payouts** untuk menyalurkan dana dampak setelah approval.
- Gunakan **APIMatic** untuk generate SDK PayPal dari OpenAPI spec.

### Minggu 4 — Financial Horizon (Bryntum) + KERNEL Fallback
- Bangun **Bryntum Gantt** dengan field kustom `targetAmount`, `monthlySaving`, `interestRate`, `loanTerm` pada `TaskModel`.
- Implementasikan **satu** resep KERNEL: *Playwright with computer use fallback*.

### Minggu 5 — Time-to-Value Ledger (Opsional)
- Gunakan **Zapier** sebagai simulated trigger penyelesaian kursus.
- Konversi jam belajar → kredit dampak.

### Minggu 6 — Polishing & Submission
- Rekam video demo **<3 menit** (YouTube publik).
- Tulis `README.md` lengkap.
- Pastikan repo **publik** dengan **LICENSE** terlihat di "About".
- Isi formulir Devpost sebelum **12 November 2026, 12:00 PT**.

## Milestone Pengingat
| Tanggal | Aksi |
|---|---|
| 5 Nov 2026 | Anti-Budget + AG Grid berjalan |
| 8 Nov 2026 | Bryntum Horizon & PayPal Payouts terintegrasi |
| 10 Nov 2026 | Video demo selesai direkam |
| 11 Nov 2026 | Repo dijadikan **publik**, lisensi terpasang |
| 12 Nov 2026, 12:00 PT | **Submission Devpost ditutup** |

## Backlog / Optional (Jika Waktu Tersisa)
- [ ] **Scan Receipt (OCR)**: Upload foto struk → AI Vision (Gemini API) ekstrak teks → masuk ke parser → simpan sebagai transaksi. Memanfaatkan Neon Object Storage (`assets` bucket) dan `GEMINI_API_KEY`.
