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
- **R2a — WAJIB**: Setiap bubble perintah yang dikirim ke user, baik dari AI maupun manual, HARUS diawali `clear` sebagai perintah pertama. Pelanggaran = pelanggaran R2.

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

## R8 — Infra/Docker (Wajib untuk semua service)
- **Pin versi image**: `postgres:16.15-alpine`, BUKAN `postgres:latest`.
- **Healthcheck wajib** untuk setiap service; tanpa healthcheck, `depends_on` tidak bermakna.
- **Port non-standar jika host sudah punya service di port standar**. Proyek ini: PostgreSQL host 5432 → docker **5433**; Redis host 6379 → docker **6380**.
- **Kredensial via `.env`**, BUKAN hardcoded di `docker-compose.yml`. `.env.example` di-commit; `.env` di-gitignore.
- **Named volume atau bind mount eksplisit**, bukan anonymous volume.
- **`restart: unless-stopped`** untuk semua service.
- **README wajib** mendokumentasikan: `docker compose up -d`, `down`, `down -v` (dengan peringatan data hilang), dan connection string.

## R9 — Persona Activation (Wajib di setiap keputusan besar)
- Setiap keputusan signifikan WAJIB menyatakan: **Chairperson** (pemutus), **Veto** (pemblokir), **Consult** (masukan), **Record** (Librarian).
- Format: `Persona activation: DevOps (chair), Security Reviewer (veto), Backend Engineer (consult), Librarian (record)`.
- Veto persona yang keberatan → eskalasi ke **Product Owner (#1)** dengan justifikasi tertulis di `handoff.md`.
- Definisi "keputusan besar": perubahan skema DB, penambahan dependency, perubahan arsitektur, keputusan port/versi, perubahan alur pembayaran.

## R10 — Session Start Ritual (urutan tidak boleh diubah)
1. Verifikasi: `git log --oneline -3`, `git status --short`, `gh auth status | grep "Active account"`, `docker --version`.
2. Baca berurutan: `docs/handoff.md` → `docs/rules.md` → `docs/persona.md`.
3. Laporkan ke user: SHA terakhir, akun gh aktif, versi docker, konfirmasi 3 file terbaca.
4. Baru mulai bekerja.

## R11 — Session End Ritual (wajib sebelum user menutup sesi)
1. **Librarian**: update `handoff.md`, append `LessonLearned.md` jika ada kesalahan, verifikasi konsistensi `rules.md` & `persona.md`.
2. `git status` harus bersih.
3. Jika ada commit: `git push origin main` sukses.
4. Laporkan final SHA ke user.
5. Librarian berhak **menunda penutupan sesi** jika dokumentasi belum lengkap (veto).

## R12 — Verify Akun gh SEBELUM Setiap Operasi Remote Git (WAJIB)

- Verifikasi akun gh aktif BUKAN hanya di awal sesi. Wajib dijalankan **tepat sebelum** setiap perintah yang menyentuh remote: `git push`, `git fetch`, `git pull`, `git ls-remote`, `git clone`.
- Alasan: user bekerja di banyak proyek paralel dan bisa switch akun kapan saja.
- **Auto-switch pattern (revisi Sesi 4)**: jika akun aktif ≠ `setuju`, **switch otomatis ke `setuju`**, jalankan operasi git, lalu **restore akun asal** setelah operasi selesai (jika akun asal ≠ `setuju`). Jika akun asal sudah `setuju`, tidak perlu restore.
- Verifikasi ganda setelah switch — dua sumber harus sama-sama `setuju`:
  1. `gh auth status` → "Active account: true" = `setuju`
  2. `gh api user --jq .login` = `setuju`
- Jika verifikasi gagal setelah switch → **STOP**, restore akun asal, laporkan.
- Defensive: `unset GITHUB_TOKEN GH_TOKEN` SEBELUM switch (R12b tetap berlaku).
- Pattern wajib (wrapper function, gunakan di setiap remote git op):

```bash
with_setuju() {
  unset GITHUB_TOKEN GH_TOKEN
  local ORIG=$(gh auth status 2>&1 | grep -B1 "Active account: true" | head -1 | sed 's/.*account \([^ ]*\).*/\1/')
  local RESTORE=0
  if [ "$ORIG" != "setuju" ]; then
    gh auth switch -u setuju > /dev/null 2>&1 || { echo "R12: switch failed"; return 1; }
    RESTORE=1
  fi
  local ACTIVE=$(gh auth status 2>&1 | grep -B1 "Active account: true" | head -1 | sed 's/.*account \([^ ]*\).*/\1/')
  local EFFECTIVE=$(gh api user --jq .login 2>/dev/null || echo "")
  if [ "$ACTIVE" != "setuju" ] || [ "$EFFECTIVE" != "setuju" ]; then
    echo "R12: verify failed (active=$ACTIVE token=$EFFECTIVE)"
    [ "$RESTORE" = "1" ] && gh auth switch -u "$ORIG" > /dev/null 2>&1 || true
    return 1
  fi
  local rc=0
  "$@" || rc=$?
  if [ "$RESTORE" = "1" ]; then
    gh auth switch -u "$ORIG" > /dev/null 2>&1 || true
  fi
  return $rc
}
```

- **R12a**: Jika bubble berisi >1 operasi remote, panggil `with_setuju` untuk **setiap** operasi.
- **R12b**: `unset GITHUB_TOKEN GH_TOKEN` sebelum switch (di dalam wrapper).
- **R12c (baru)**: Wrapper mengubah global gh state sementara. Terminal lain user bisa terkena dampak selama window eksekusi (<1s normal). Wrapper restore akun asal di akhir, tapi window tetap tidak atomik — kesadaran user diperlukan.

