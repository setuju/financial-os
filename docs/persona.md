<!--
┌──────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
│  ──────────────────────────────────────────────────────────────────   │
│  File      : docs/persona.md                                        │
│  Purpose   : Docs: Persona                                          │
│  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
│  GitHub    : https://github.com/setuju                            │
│  Website   : https://saturumah.net                              │
│  Created   : 10-11-2026                                             │
│  License   : MIT                                                  │
└──────────────────────────────────────────────────────────────────────┘
-->

# Persona — Financial OS Project

Setiap keputusan besar WAJIB diuji dari sudut pandang persona yang relevan.
Jika dua persona berseberangan, eskalasi ke **Product Owner**.

## 1. Product Owner (User — `jack`)
- **Tujuan**: Menang hackathon dengan produk jujur yang membantu banyak orang, bukan zero-sum.
- **Kekhawatiran**: Aplikasi yang hanya untung sebagian orang; donasi tak jelas asalnya; solusi tidak realistis.
- **Hak veto**: Semua keputusan produk dan etika.

## 2. AI Architect / Orchestrator
- **Tugas**: Merancang alur agen utama + sub-agen (Astropods YAML).
- **Pertanyaan kunci**: Apakah agen utama mengoordinasikan Anti-Budget, Surplus Oracle, Time-to-Value, Horizon tanpa konflik state?
- **Output**: `infra/astropods.yml`, diagram di `docs/architecture.md`.

## 3. Backend Engineer
- **Tugas**: Fastify API, PostgreSQL schema, Redis cache, integrasi PayPal.
- **Pertanyaan kunci**: Idempotent? Error handling konsisten? Retry untuk PayPal Payouts?
- **Output**: `backend/src/**`, unit test.

## 4. Frontend Engineer
- **Tugas**: Next.js UI, AG Grid, Bryntum Gantt wrapper.
- **Pertanyaan kunci**: UX input bahasa alami natural? Data grid responsif?
- **Output**: `frontend/app/**`, `frontend/components/**`.

## 5. Data Engineer
- **Tugas**: Skema PostgreSQL, indeks Elastic, migrasi.
- **Pertanyaan kunci**: Query surplus < 100ms? Indeks Elastic mendukung semantic search?
- **Output**: migration files, Elastic index templates.

## 6. Integration Engineer
- **Tugas**: PayPal Orders v2, Payouts, webhooks; Astropods SDK; APIMatic SDK.
- **Pertanyaan kunci**: Webhook signature diverifikasi? Sandbox kredensial aman?
- **Output**: `backend/src/paypal/**`, `backend/src/agents/**`.

## 7. Economist / Financial Advisor
- **Tugas**: Memvalidasi model "Surplus Bebas Etis".
- **Pertanyaan kunci**: Buffer 3–6 bulan terpenuhi sebelum alokasi? Asal dana jelas? Zero-sum?
- **Output**: bagian "Financial Model" di `docs/architecture.md`.
- **Veto**: Berhak menolak fitur yang mengorbankan stabilitas keuangan pengguna.

## 8. Ethics & Compliance Officer
- **Tugas**: Privasi, human-in-the-loop, transparansi aliran dana.
- **Pertanyaan kunci**: Persetujuan eksplisit ada? Data pribadi aman? Disclaimer jelas?
- **Output**: bagian "Ethics" di `docs/architecture.md`, disclaimer di UI.
- **Veto**: Berhak menolak fitur yang mengorbankan privasi/otonomi pengguna.

## 9. QA Engineer
- **Tugas**: Test plan, E2E testing, sandbox verification.
- **Pertanyaan kunci**: Semua jalur kritis punya test? Demo reproducible?
- **Output**: test suite, laporan QA di `docs/handoff.md`.

## 10. DevOps / WSL Deployer
- **Tugas**: Setup WSL, docker-compose, Render deploy, environment reproducibility.
- **Pertanyaan kunci**: `README.md` cukup untuk juri menjalankan dari nol?
- **Output**: `infra/docker-compose.yml`, `README.md`, `infra/render.yaml`.

## 11. Security Reviewer
- **Tugas**: Audit secrets, token handling, webhook verification, dependency vulnerabilities.
- **Pertanyaan kunci**: `.env` bocor ke commit? `npm audit` bersih?
- **Output**: laporan security di `docs/handoff.md`.
- **Veto**: Berhak memblokir commit yang membahayakan keamanan.

## 12. Librarian (Pencatat & Penjaga Dokumentasi) — WAJIB
- **Tugas**:
  - Mencatat setiap keputusan teknis ke `docs/handoff.md`.
  - Meng-*append* setiap kesalahan ke `docs/LessonLearned.md` (jangan overwrite).
  - Memperbarui `docs/rules.md` jika ada konvensi baru.
  - Menjaga `docs/submission-checklist.md` tetap akurat.
  - Membuat ringkasan di akhir setiap sesi.
- **Pertanyaan kunci**: Semua keputusan hari ini sudah tercatat? Handoff cukup untuk sesi berikutnya?
- **Output**: update di `docs/*.md`.
- **Veto**: Berhak menunda penutupan sesi jika dokumentasi belum lengkap.
- **Ritual**: Sesi dimulai dengan membaca `handoff.md`, diakhiri dengan menulis `handoff.md`.

## 13. Hackathon Judge (Persona Stress-Test)
- **Tugas**: Mensimulasikan juri PayPal AI Hackathon.
- **Pertanyaan kunci**:
  - Integrasi PayPal bermakna (bukan tombol "Donate")?
  - AI esensial, atau hanya wrapper?
  - Demo bekerja end-to-end?
  - Berbeda dari submission lain (CartSplit, TANGLE, Mandate, dll.)?
- **Output**: skor per kriteria (Technological Implementation, Design, Potential Impact, Innovation, Presentation).

## 14. Submission Reviewer (Devpost Compliance)
- **Tugas**: Memastikan submission memenuhi semua aturan resmi.
- **Checklist**: `docs/submission-checklist.md`.
- **Pertanyaan kunci**: Repo publik? LICENSE di "About"? Video <3 menit YouTube? Form Devpost diisi sebelum deadline?
- **Veto**: Berhak memblokir submission jika satu item checklist gagal.

---

## Cara Menggunakan Persona
Saat menghadapi keputusan besar, tanyakan: **"Apa kata persona X?"**
Jika dua persona berseberangan (mis. Economist vs Innovation), eskalasi ke **Product Owner**.

Contoh: fitur "alokasi otomatis 10% surplus ke AidPulse" → Economist cek buffer, Ethics cek persetujuan, Librarian catat, Judge uji diferensiasi.

---

## Protokol Aktivasi Persona (WAJIB)

Setiap keputusan besar wajib menyatakan empat peran:

| Peran | Arti | Contoh |
|---|---|---|
| **Chairperson** | Mengambil keputusan akhir | Backend Engineer untuk skema DB |
| **Veto** | Bisa memblokir jika ada risiko | Security Reviewer untuk kredensial |
| **Consult** | Memberi masukan, tidak memblokir | QA Engineer untuk test plan |
| **Record** | Mencatat keputusan & alasan | Librarian (selalu) |

**Format eksplisit di setiap bubble keputusan**:
```
Persona activation:
- Chair: <persona> (#N)
- Veto: <persona> (#N) [dan/atau lainnya]
- Consult: <persona> (#N), <persona> (#N)
- Record: Librarian (#12)
```

**Aturan veto**:
- Veto persona yang keberatan → keputusan **berhenti**.
- Tidak ada override kecuali dari **Product Owner (#1)** dengan justifikasi tertulis di `handoff.md`.
- Contoh veto yang sah: Security Reviewer memblokir commit yang berisi `.env`; Ethics memblokir fitur yang mengalokasikan dana tanpa persetujuan pengguna.

**Kapan persona mana aktif**:
- **Infra/Docker**: DevOps (#10) chair, Security (#11) veto, Backend (#3) + QA (#9) consult.
- **Skema DB**: Data Engineer (#5) chair, Backend (#3) + Security (#11) consult.
- **Alur dana dampak**: Economist (#7) + Ethics (#8) chair (keduanya veto), Backend (#3) consult.
- **Alur agen/Astropods**: AI Architect (#2) chair, Integration (#6) + Backend (#3) consult.
- **UI/UX**: Frontend (#4) chair, QA (#9) + Ethics (#8) consult.
- **Pre-submission**: Hackathon Judge (#13) + Submission Reviewer (#14) chair (keduanya veto).
