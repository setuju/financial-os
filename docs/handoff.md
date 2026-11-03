# Handoff — Sesi 1 (Rekon & Perencanaan)

## Status
- Environment WSL2: siap (Node 22, pnpm, Python 3.x+uv, PostgreSQL, Redis, gh).
- Folder kerja: `~/saturumah/paypal/docs/`
- Repo GitHub: `setuju/financial-os` (private), branch `main`.
- Belum ada kode aplikasi; hanya file docs.

## Yang Sudah Diputuskan
- Nama proyek: **Financial OS**.
- Tiga lapisan: Anti-Budget → Surplus Oracle → Time-to-Value (opsional).
- Sponsor dipakai: Astropods, AG Grid, Elastic, Bryntum, KERNEL, APIMatic, Zapier.
- Deadline submission: **12 November 2026, 12:00 PT**.

## Next Session
1. `git init` di `~/saturumah/paypal` dan push ke `setuju/financial-os` jika belum.
2. Buat `docker-compose.yml` untuk PostgreSQL + Redis.
3. Scaffold backend Fastify + frontend Next.js.
4. Daftar akun: PayPal Developer Sandbox, Astropods, AG Grid trial, Bryntum trial, Elastic trial, KERNEL, APIMatic.
5. Implementasi parser bahasa alami (Minggu 2).

## Catatan Penting
- Jangan pernah mengekspor `GITHUB_TOKEN` di shell; gunakan `gh auth login`.
- Semua dependency Node/Python harus di dalam WSL ext4, bukan `/mnt/c`.
