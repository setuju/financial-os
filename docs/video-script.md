# Video Script — Financial OS (2:30)

**Status**: draft, siap rekam
**Deadline**: 12 Nov 2026 12:00 PT (Thu 13 Nov 03:00 WIB)
**Upload**: YouTube public, title "Financial OS — Natural-Language Finance (PayPal AI Hackathon 2026)"

## Pre-recording (10 menit)

1. Warm backend: `curl https://financial-os-api-lykz.onrender.com/health` (tunggu 200, ~50s)
2. Buka Chrome/Edge → hard refresh 6 tab: `/`, `/journal`, `/journal/new`, `/ledger`, `/impact`, `/horizon`
3. Zoom browser 100%. Fullscreen F11. Sembunyikan bookmark bar (Ctrl+Shift+B)
4. OBS Studio: 1920x1080, 30fps. Record "Window" atau "Display" (jangan webcam)
5. Mic test 5 detik. Tidak ada background music (copyright = diskualifikasi)

## Script (150 detik)

### [0:00-0:12] Hook (12s)
**Visual**: Black → fade in `/` dashboard, cursor idle
**Voice**: "What if tracking money felt like texting a friend? Meet Financial OS — natural-language finance with an ethical twist."

### [0:12-0:42] Natural language input (30s)
**Visual**:
- `/journal/new` → type `spent 20 on coffee` → submit → redirect `/journal`, row muncul atas
- Kembali `/journal/new` → klik mic → ucap `got paid 500` → submit
- Type `i want to buy a bike` → submit → **error banner** merah
**Voice**: "Type or speak — English or Bahasa Indonesia. The parser understands intent, not just keywords. Plans and cancellations are rejected — so your journal always reflects what actually happened."
**Cue**: saat error banner muncul, pause 1 detik

### [0:42-1:02] Journal + Ledger (20s)
**Visual**:
- `/journal` scroll 2s → klik PDF export → toast unduhan
- `/ledger` → flip Grid ↔ Notebook 1× → filter Last Month + Expense → PDF export
**Voice**: "Journal and ledger, exportable to PDF. 36 filter combinations — day, week, month, projections on or off — everything instant."

### [1:02-1:32] Ethical Surplus + PayPal (30s)
**Visual**:
- `/` → Surplus Oracle card → submit prediksi $200
- `/impact` → Ethical Surplus Distribution card
- Klik **Distribute 10%** → **Confirm** (2 langkah) → success state dengan **batch ID PayPal**
**Voice**: "Surplus is what's left after obligations — never your principal savings. When validated, route ten percent to a vetted cause. Two-step confirmation, PayPal Payouts in sandbox. Nothing moves without your explicit click."
**Cue**: hover cursor ke batch ID 1 detik — BUKTI live integration

### [1:32-1:48] Financial Horizon (16s)
**Visual**: `/horizon` → hover task "Emergency Fund" → custom fields muncul (targetAmount, monthlySaving)
**Voice**: "Financial Horizon uses Bryntum Gantt to plan long-term goals — emergency fund, house down payment — with target amounts, interest rates, and monthly savings."

### [1:48-2:08] AI Assistant (20s)
**Visual**:
- Klik FAB Sparkles → panel buka
- Kirim `how do I add a transaction?` → reply muncul (rendered, code chips)
- Kirim `write me a python script` → refusal sopan
**Voice**: "A scoped AI assistant explains the app — features, input syntax, exports. Ask it to write code, and it politely declines. Scope is a feature, not a limitation."

### [2:08-2:22] Tech slide (14s)
**Visual**: Static PNG (buat di Canva/Figma 1920x1080) — logo grid: Next.js · Fastify · PostgreSQL · Redis · Elastic · PayPal Payouts · APIMatic · Bryntum · Gemini 3.8 Flash
**Voice**: "Under the hood: Next.js on Vercel, Fastify on Render, Neon Postgres, Upstash Redis, Elastic Cloud. PayPal Payouts via APIMatic SDK. Sandbox only — no real money moves."

### [2:22-2:30] Closing (8s)
**Visual**: fade back ke home page. URL pill "financial-os-nu.vercel.app" di bawah
**Voice**: "Financial OS. Track with words. Give with intent."
**Cue**: hold 3s, fade out 1s. TOTAL 2:30.

## Must-win shots (jangan compromise)

1. Parser rejection (`i want to buy a bike`) — Innovation
2. PayPal batch ID visible — Technology
3. Assistant refusal (`write me a python script`) — Innovation + ethics
4. Ethical surplus card — Potential Impact

Kalau 4 shot ini bersih, video lolos 3 dari 5 kriteria juri.

## Recording approach (untuk user dengan waktu terbatas)

**Rekomendasi: VOICE + VISUAL bersamaan, stop-record antar section.**
- Buka OBS, klik Record, lakukan section 1, stop, save as `shot1.mkv`
- Repeat untuk 8 sections (~5 menit total recording, sisanya prep antar shot)
- Edit di **CapCut** (gratis, drag-drop, 15 menit) — gabung semua, trim, export MP4
- Total: ~90 menit focused (10 setup + 30 record + 20 edit + 10 upload + 20 buffer)

Jangan coba one-take sempurna. Shot-per-section lebih cepat, lebih toleran mistake.

## Post-recording

1. Export MP4 H.264, 1080p, ~5 Mbps
2. Upload YouTube → **public** (bukan unlisted)
3. Copy URL → paste ke Devpost form
4. Verify URL di incognito browser (tidak login)
