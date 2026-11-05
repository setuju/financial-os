# Financial OS

**Financial OS** adalah aplikasi manajemen keuangan pribadi berbasis bahasa alami yang berfokus pada **"Surplus Bebas Etis"**. Aplikasi ini didesain untuk PayPal AI Hackathon 2026.

## 💡 Konsep Utama
1. **Anti-Budget (Natural Language Input)**: Pengguna mencatat transaksi dengan kalimat bebas (Bahasa Indonesia), tanpa perlu mengisi formulir tabel yang rumit.
2. **Surplus Oracle**: Memprediksi dan menghitung surplus keuangan yang aman (setelah kebutuhan pokok).
3. **Impact Wallet**: Menyalurkan sebagian surplus (bukan pokok tabungan) ke tujuan sosial menggunakan **PayPal Payouts**.
4. **Financial Horizon**: Memproyeksikan tujuan jangka panjang menggunakan visualisasi **Bryntum Gantt Chart**.

## 🛠️ Stack Teknologi & Sponsor Tools
- **Frontend**: Next.js 14, Tailwind CSS, TypeScript
- **Backend**: Fastify, TypeScript, Node.js
- **Database**: PostgreSQL (Neon Serverless)
- **Cache**: Redis (Upstash)
- **Search Index**: Elasticsearch (Elastic Cloud)
- **AI/Agent**: Astropods (diintegrasikan via logika AI)
- **SDK Generation**: APIMatic (men-generate SDK TypeScript resmi untuk PayPal)
- **Payments**: PayPal Payouts API (melalui APIMatic SDK)
- **Project Management**: Bryntum Gantt (Enterprise Trial) untuk *Financial Horizon*.
- **Deployment**: Vercel (Frontend) & Render (Backend)

## 🚀 Fitur yang Sudah Berjalan
- [x] Pencatatan transaksi via *Natural Language Parser* (Bahasa Indonesia).
- [x] Pencarian transaksi instan menggunakan Elasticsearch.
- [x] Perhitungan Surplus Aktual (Pemasukan - Pengeluaran).
- [x] Integrasi PayPal Payouts Sandbox end-to-end (menggunakan SDK APIMatic).
- [x] Dashboard visualisasi Financial Horizon (Bryntum Gantt).

## ⚙️ Cara Menjalankan Secara Lokal
*(Instruksi lengkap untuk juri)*

1. Clone repository ini.
2. Salin `.env.example` menjadi `.env` dan isi kredensial database Anda.
3. Jalankan database (Docker lokal atau gunakan URL Neon).
4. Backend:
   ```bash
   cd backend
   pnpm install
   pnpm migrate
   pnpm start
   ```
5. Frontend:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```
6. Buka `http://localhost:3000`.

## 🌐 Live Demo
- **Frontend**: [https://financial-os-nu.vercel.app](https://financial-os-nu.vercel.app)
- **Backend**: [https://financial-os-api-lykz.onrender.com](https://financial-os-api-lykz.onrender.com)

## 🔒 Keamanan & Etika
Aplikasi ini menggunakan **PayPal Sandbox** untuk seluruh demonstrasi. Pengguna harus memberikan **persetujuan eksplisit** (klik tombol) sebelum dana dampak disalurkan. Dana dampak dihitung sebagai persentase dari surplus bersih, tidak pernah menyentuh pokok tabungan pengguna.

---
*Dibuat untuk PayPal AI Hackathon 2026.*
