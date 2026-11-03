# Rules of Engagement — Financial OS Project

Dokumen ini adalah aturan main proyek. Setiap sesi kerja WAJIB mengikuti aturan ini.
Jika ada konvensi baru, **Librarian persona** menambahkannya ke sini.

## R1 — Akun GitHub & Repo
- Repo utama: `setuju/financial-os`.
- Sebelum operasi write (`gh repo create`, `gh api -X`, `gh repo edit`), WAJIB verifikasi akun aktif:
  ```bash
  ACTIVE=$(gh auth status 2>&1 | grep -B1 "Active account: true" | head -1 | sed 's/.*account \([^ ]*\).*/\1/')
  [ "$ACTIVE" = "setuju" ] || gh auth switch -u setuju
  ```
- **JANGAN** pernah mengekspor `GITHUB_TOKEN` di shell. Gunakan `gh auth switch -u <user>`.
- Untuk menghapus repo milik akun lain, **harus** switch ke akun pemiliknya dulu. Tidak ada cara lain (token setuju tidak bisa menghapus repo TidakSetuju).

## R2 — Eksekusi Skrip di Shell Interaktif
- **JANGAN** pernah jalankan `exit 1` di shell interaktif — mematikan terminal.
- Bungkus skrip panjang dalam subshell: `( set -e; trap '...' ERR; ... )`. `set -e` hanya berlaku di subshell.
- Perintah yang boleh gagal (mis. hapus repo yang belum ada) WAJIB `|| true`.
- Perintah kritikal (create repo, commit, push) TIDAK diberi `|| true` — biarkan `set -e` menghentikan subshell.
- Satu bubble cukup satu `clear` di awal.

## R3 — Environment (Terverifikasi)
- **Node.js**: 20.20.2 via nvm (`which -a node` menampilkan nvm path lebih awal dari apt). Cukup untuk proyek. Jangan upgrade tanpa alasan.
- **Python**: 3.14.7 via uv/pyenv. Cukup. Tidak perlu disentuh.
- **PostgreSQL**: 16.15 (`postgres` / `postgres`), `psql --version` OK.
- **Redis**: 7.0.15, `redis-cli ping` → PONG.
- **pnpm**: 12.16.1. **uv**: 0.11.13. **gh**: 2.45.0.
- Semua dependency di WSL ext4 (`~/saturumah/paypal`), **bukan** `/mnt/c`.

## R4 — Git Workflow
- Branch utama: `main`.
- Commit message: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`).
- Untuk commit yang mungkin kosong: `git diff --cached --quiet || git commit -m "..."` — mencegah set -e trigger saat tidak ada perubahan.
- Sebelum submission (11 Nov 2026): repo WAJIB publik + LICENSE terlihat di "About".

## R5 — Dokumentasi
- **Librarian persona** mencatat semua keputusan ke `docs/handoff.md`.
- Semua kesalahan di-*append* ke `docs/LessonLearned.md` (JANGAN overwrite).
- Konvensi baru ditambahkan ke file ini (`docs/rules.md`).
- Setiap sesi dimulai dengan membaca `docs/handoff.md`, diakhiri dengan menulisnya.

## R6 — Keamanan & Etika
- JANGAN commit `.env`, token, kredensial.
- Alokasi dana dampak WAJIB lewat persetujuan eksplisit pengguna (human-in-the-loop).
- Hanya `yield` dan `cashback intercept` yang boleh dialokasikan — JANGAN pokok tabungan.
- Dana tidak boleh dari donasi paksa.

## R7 — Submission Hackathon
- Deadline: **12 November 2026, 12:00 PT** (hard).
- Video demo <3 menit, YouTube publik.
- Repo publik + LICENSE di "About".
- Checklist: `docs/submission-checklist.md`.
