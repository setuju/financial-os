# Video Script — Financial OS (2:30)
**Deadline**: 12 Nov 2026 12:00 PT (Thu 13 Nov 03:00 WIB)
**Upload**: YouTube public

## Pre-recording (10 menit)
1. Warm backend: `curl https://financial-os-api-lykz.onrender.com/health` (~50s)
2. Hard refresh 6 tab: `/`, `/journal`, `/journal/new`, `/ledger`, `/impact`, `/horizon`
3. Browser 100%, fullscreen F11, hide bookmark bar (Ctrl+Shift+B)
4. OBS 1920x1080 30fps, window/display capture
5. No background music (copyright = disqualification)

## Shot list

### [0:00-0:12] Hook (12s)
**Visual**: Black → fade in `/` dashboard
**Voice**: "What if tracking money felt like texting a friend? Meet Financial OS — natural-language finance with an ethical twist."

### [0:12-0:42] Natural language input (30s)
- `/journal/new` → type `spent 20 on coffee` → submit → row muncul
- `/journal/new` → klik mic → ucap `got paid 500` → submit
- Type `i want to buy a bike` → submit → **error banner merah**
**Voice**: "Type or speak — English or Bahasa Indonesia. The parser understands intent, not just keywords. Plans and cancellations are rejected."
**Cue**: pause 1s saat error banner muncul

### [0:42-1:02] Journal + Ledger (20s)
- `/journal` scroll → PDF export → toast
- `/ledger` → flip Grid↔Notebook 1× → filter Last Month + Expense → PDF
**Voice**: "Journal and ledger, exportable to PDF. 36 filter combinations — instant."

### [1:02-1:32] Ethical Surplus + PayPal (30s)
- `/` → Surplus Oracle submit $200
- `/impact` → Distribute 10% → Confirm 2-step → **batch ID PayPal terlihat**
**Voice**: "Surplus is what's left after obligations. Two-step confirmation, PayPal Payouts sandbox. Nothing moves without your click."
**Cue**: hover cursor di batch ID 1s

### [1:32-1:48] Financial Horizon (16s)
- `/horizon` → hover Emergency Fund → custom fields muncul
**Voice**: "Financial Horizon uses Bryntum Gantt to plan long-term goals."

### [1:48-2:08] AI Assistant (20s)
- Klik FAB → chat `how do I add a transaction?` → reply muncul
- Chat `write me a python script` → **refusal sopan**
**Voice**: "A scoped AI assistant. Ask it to write code, and it politely declines. Scope is a feature."

### [2:08-2:22] Tech slide (14s)
**Visual**: PNG 1920x1080 — Next.js · Fastify · PostgreSQL · Redis · Elastic · PayPal Payouts · APIMatic · Bryntum · Gemini 3.8
**Voice**: "Next.js on Vercel, Fastify on Render, Neon Postgres, Upstash Redis, Elastic Cloud. PayPal Payouts via APIMatic SDK. Sandbox only."

### [2:22-2:30] Closing (8s)
**Visual**: fade back home. URL pill "financial-os-nu.vercel.app"
**Voice**: "Financial OS. Track with words. Give with intent."
**Cue**: hold 3s, fade 1s. Total 2:30.

## Must-win shots
1. Parser rejection (`i want to buy a bike`)
2. PayPal batch ID visible
3. Assistant refusal (`write me a python script`)
4. Ethical surplus card

## Recording approach
Record per-section (8 clips), edit di CapCut (~15 mnt), export MP4 H.264 1080p.
