<!--
┌────────────────────────────────────────────────────────────────────┐
│  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
├────────────────────────────────────────────────────────────────────┤
│  File      : docs/video-script.md
│  Purpose   : Docs: Video Script
│  Author    : Jack — Jack[at]SatuRumah[dot]Net
│  GitHub    : https://github.com/setuju
│  Website   : https://saturumah.net
│  Created   : 10-11-2026
│  License   : MIT
└────────────────────────────────────────────────────────────────────┘
└────────────────────────────────────────────────────────────────────┘
-->

<!--
-->

# Video Script — Financial OS (2:30)
**Deadline**: 12 Nov 2026 12:00 PT (Thu 13 Nov 03:00 WIB)
**Upload**: YouTube public — title "Financial OS — Natural-Language Finance (PayPal AI Hackathon 2026)"

## Pre-recording (10 menit)
1. **Warm backend**: `curl https://financial-os-api-lykz.onrender.com/health` → tunggu 200 (~50s)
2. Chrome/Edge → hard refresh 6 tab: `/`, `/journal`, `/journal/new`, `/ledger`, `/impact`, `/horizon`
3. Browser 100% zoom, fullscreen F11, hide bookmark bar (Ctrl+Shift+B)
4. OBS: 1920x1080 @ 30fps, window capture. No background music (copyright = disqualification)
5. Mic test 5 detik. Siapkan receipt: `/tmp/receipt.png` (or `\\wsl.localhost\Ubuntu\tmp\receipt.png`)
6. Prepare a fresh transaction NOT already in DB: use "spent 45 on dinner" (different from seed data)

## Shot list

### [0:00-0:12] Hook (12s)
**Visual**: Black → fade in `/` dashboard. Cursor idle. Overview 3 stat cards.
**Voice**: "What if tracking money felt like texting a friend? Meet Financial OS — natural-language finance with an ethical twist."
**Cue**: fade in 1s, hold 11s.

### [0:12-0:34] Text + Voice input (22s)
**Visual**:
- `/journal/new` → type `spent 45 on dinner` → **Parse & Save** → redirect `/journal`, row muncul atas
- `/journal/new` → klik mic → ucap `got paid 500 bonus` → submit
- Type `i want to buy a bike` → submit → **error banner merah** (`planned_input`)
**Voice**: "Type or speak — English or Bahasa Indonesia. The parser understands intent, not just keywords. Plans and cancellations are rejected."
**Cue**: pause 1s saat error banner muncul (juri baca).

### [0:34-0:49] OCR receipt ⭐ (15s)
**Visual**:
- `/journal/new` → klik **Scan** → file picker → pilih `/tmp/receipt.png`
- Loading spinner ~3s (button label "Reading…")
- Field **auto-terisi**: `spent 9.00 dollars on coffee and croissant at Kopi Kenangan`
- Cursor hover di disclosure text: "Receipt scan sends the image to Google Gemini..."
**Voice**: "Snap a receipt. Gemini Vision reads it — our parser structures it. Four AI modalities in one app: text, voice, chat, and vision."
**Cue**: pastikan field text fully visible saat auto-fill terjadi. Kalau loading >5s, stop & retry (cold start).

### [0:49-1:06] Journal + Ledger (17s)
**Visual**:
- `/journal` scroll 2s → klik PDF export → toast unduhan
- `/ledger` → flip Grid ↔ Notebook 1× → filter Last Month + Expense → PDF export
**Voice**: "Journal and ledger, exportable to PDF. Thirty-six filter combinations — instant."

### [1:06-1:34] Ethical Surplus + PayPal (28s)
**Visual**:
- `/` → Surplus Oracle card → submit prediksi $200
- `/impact` → Ethical Surplus Distribution card
- Klik **Distribute 10%** → **Confirm** (2-step) → **success state dengan batch ID PayPal**
**Voice**: "Surplus is what's left after obligations — never your principal savings. When validated, route ten percent to a vetted cause. Two-step confirmation, PayPal Payouts, sandbox. Nothing moves without your explicit click."
**Cue**: hover cursor ke batch ID 1 detik — BUKTI live integration.

### [1:34-1:50] Financial Horizon (16s)
**Visual**:
- `/horizon` → hover task "Emergency Fund" → tooltip custom fields muncul (targetAmount, monthlySaving, interestRate)
**Voice**: "Financial Horizon uses Bryntum Gantt to plan long-term goals — emergency fund, house down payment — with target amounts, interest rates, monthly savings."

### [1:50-2:08] AI Assistant (18s)
**Visual**:
- Klik FAB Sparkles → panel buka
- Kirim `how do I add a transaction?` → reply muncul (rendered, code chips)
- Kirim `write me a python script` → **refusal sopan**
**Voice**: "A scoped AI assistant explains the app. Ask it to write code, and it politely declines. Scope is a feature."
**Cue**: reply pertama harus utuh (max_tokens fixed). Kalau terpotong, stop & retry.

### [2:08-2:22] Tech slide (14s)
**Visual**: Static PNG 1920×1080. Text slide:
- Row 1: Next.js · Fastify · PostgreSQL · Redis
- Row 2: PayPal Payouts · APIMatic · Bryntum · Gemini 3.8 Flash
- Row 3: Vercel · Render · Neon · Upstash
- Subtitle: "Sandbox only — no real money moves."
**Voice**: "Next.js on Vercel, Fastify on Render, Neon Postgres, Upstash Redis. PayPal Payouts via APIMatic SDK. Sandbox only."
**Cue**: bisa dibuat di Canva/Figma/PPT. Background #fafafa, text #18181b, accent bar #0070ba.

### [2:22-2:30] Closing (8s)
**Visual**: fade back to home page. Overlay teks: `financial-os-nu.vercel.app`
**Voice**: "Financial OS. Track with words. Give with intent."
**Cue**: hold 3s, fade out 1s. Total **2:30**.

## Must-win shots (jangan compromise)
1. **OCR auto-fill** (0:34-0:49) — Innovation, 4th AI modality
2. **Parser rejection** `i want to buy a bike` (0:12-0:34) — Innovation
3. **PayPal batch ID visible** (1:06-1:34) — Technology, live not mocked
4. **Assistant refusal** `write me a python script` (1:50-2:08) — Innovation + ethics
5. **Ethical surplus card** (1:06-1:34) — Potential Impact

Kalau 5 shot ini bersih, video lolos 3+ dari 5 kriteria juri.

## Recording approach (untuk waktu terbatas)

**Record per-section (9 clips), edit di CapCut:**
1. Buka OBS → Record → perform Section 1 (Hook, 12s) → Stop → save `01_hook.mkv`
2. Repeat untuk 8 section lainnya
3. Total recording: ~5 menit (interupsi prep di antar shot tidak masuk rekaman)
4. Edit: import 9 clips ke CapCut → drag ke timeline berurutan → tambah slide tech (2:08) → export MP4

**Jangan one-take**. Shot-per-section toleran retake individual.

## Post-recording
1. Export MP4 H.264, 1920x1080, ≥5 Mbps, audio AAC 192kbps
2. YouTube → **Public** (not unlisted) → paste URL ke Devpost
3. Verify URL di incognito (tidak login)
