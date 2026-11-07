# Submission Checklist — Devpost

**Deadline**: 12 November 2026, 12:00 PT
**Status**: Sesi 10 close (2026-11-07)
**Legend**: `[x]` done · `[~]` partial · `[ ]` not yet

## Required

- [x] **LICENSE** — MIT (file present)
- [ ] **Repo public** — currently private, toggle by 11 Nov
- [x] **README complete** — updated with all features (see README.md)
- [x] **Demo works end-to-end** (not mockup)
  - Frontend: https://financial-os-nu.vercel.app
  - Backend: https://financial-os-api-lykz.onrender.com
  - All pages: `/`, `/journal`, `/journal/new`, `/ledger`, `/impact`, `/horizon`
  - Assistant endpoint: `POST /assistant/chat`, `GET /assistant/info`
- [ ] **Video <3 minutes, public YouTube**
- [ ] **Text description** (features + how it works)
- [x] **AI + sponsor tools listed** (in README.md and this checklist)
- [ ] **No copyrighted material** in video
- [ ] **Devpost form completed** before 12 Nov 12:00 PT

## Submission Content

### Required fields
- [ ] Project name: **Financial OS**
- [ ] Elevator pitch: **Natural-language finance with ethical surplus → PayPal Payouts for impact**
- [ ] Project URL: https://financial-os-nu.vercel.app
- [ ] Video URL: (TBD)
- [ ] GitHub: https://github.com/setuju/financial-os
- [ ] Tech stack: Next.js 14, Fastify 4, PostgreSQL (Neon), Redis (Upstash), Elastic Cloud, PayPal Payouts (APIMatic SDK), Bryntum Gantt, Gemini 3.8 Flash
- [ ] Sponsor tools: PayPal, APIMatic, Bryntum, Elastic, OpenRouter

### Descriptions
- [ ] What it does (2-3 paragraphs)
- [ ] How we built it (2-3 paragraphs)
- [ ] Challenges (2-3 bullets)
- [ ] Accomplishments (2-3 bullets)
- [ ] What we learned (2-3 bullets)
- [ ] What's next (2-3 bullets)
- [ ] Built with (tech list)

### Demo video requirements
- [ ] Duration <3 minutes
- [ ] Public (YouTube)
- [ ] Shows app running end-to-end
- [ ] No copyrighted music/imagery
- [ ] Voice-over or text captions explaining features

## Judging Criteria Coverage

### Technological Implementation
- [x] Full stack, working end-to-end
- [x] Meaningful PayPal integration (Payouts, not just "Donate" button)
- [x] APIMatic SDK generated from OpenAPI spec
- [x] Bryntum Gantt custom financial fields
- [x] Elastic Cloud deployed
- [x] AI assistant with canary-protected prompt

### Design
- [x] Clean fintech UI (Stripe/Linear-inspired)
- [x] Consistent design tokens
- [x] Responsive (mobile card list, desktop table)
- [x] Loading states, empty states, error states
- [x] PDF export for reports

### Potential Impact
- [x] Ethical surplus concept — no donation pressure, principal untouched
- [x] Human-in-the-loop for all payouts
- [x] Verbatim input storage for audit
- [x] Parser rejects plans/cancellations
- [x] Transparent sandbox mode

### Innovation
- [x] Natural language bilingual parser (EN + ID)
- [x] Voice input + amount editor (recovers from ASR errors)
- [x] Surplus Oracle prediction game
- [x] Scoped AI assistant (not a general chat)
- [x] Canary-protected prompt

### Presentation
- [ ] Video <3 min (must record)
- [ ] Devpost form clear

## Pre-submission verification (do 11 Nov)

- [ ] Toggle repo to public
- [ ] Verify LICENSE visible in About
- [ ] Check README renders correctly on GitHub
- [ ] Test all live URLs from incognito
- [ ] Verify video plays without login
- [ ] Re-verify submission-check coverage
