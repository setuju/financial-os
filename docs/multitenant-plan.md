# Multi-Tenant Migration Plan

**Status**: Proposal — awaiting user approval
**Author**: Jack (draft by AI agent)
**Date**: 2026-11-10
**Backup reference**: `~/saturumah-backups/LATEST.txt` + git tag `pre-multitenant-2026-11-10`

---

## Objective

Convert Financial OS from shared-demo to multi-tenant demo:

- **Admin** (`admin` / `financial-os`) → seeded baseline (Jul-Nov 2026, 115 tx, 3 goals, 2 oracles)
- **New user** → signs up with name → receives 5-char password → **empty session**, starts fresh
- **Isolation** → every query filters by `session_id`
- **Reset** → admin can wipe own data; users can request reset of own session

**Not in scope**: real auth (email verification, password reset, OAuth), production security.

---

## Design decisions

### Session model

```sql
CREATE TABLE demo_sessions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,  -- bcrypt
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

- **Admin**: hardcoded UUID `00000000-0000-0000-0000-000000000001`, name `admin`, password `financial-os` (bcrypt hashed)
- **User**: UUID random, name + generated 5-char password (A-Z minus O/I/L, 2-9)
- **Password is shown once** — user must copy it. No email, no reset (matches "no PII" promise)

### Session propagation

- Frontend sets `fos_session_id=<uuid>` cookie (HttpOnly, SameSite=Lax, 7d expiry, Secure in prod)
- Middleware reads cookie → forwards `X-Session-Id` header to backend
- Backend routes extract `req.headers['x-session-id']` → validate against `demo_sessions`
- Every query: `WHERE session_id = $1`

### Data column addition

```sql
ALTER TABLE transactions    ADD COLUMN session_id UUID NOT NULL;
ALTER TABLE goals           ADD COLUMN session_id UUID NOT NULL;
ALTER TABLE surplus_oracles ADD COLUMN session_id UUID NOT NULL;
ALTER TABLE payouts         ADD COLUMN session_id UUID NOT NULL;
ALTER TABLE surplus_periods ADD COLUMN session_id UUID NOT NULL;

-- Swap unique
ALTER TABLE surplus_periods DROP CONSTRAINT surplus_periods_period_month_key;
ALTER TABLE surplus_periods ADD CONSTRAINT surplus_periods_session_month_key
  UNIQUE (session_id, period_month);
```

Backfill all existing rows to admin UUID.

---

## Bubble breakdown

### Bubble 1: Migration 007 + demo_sessions table + admin bootstrap

**Files:**
- NEW `backend/migrations/007_multitenant.sql`
- NEW `backend/src/repositories/demo-sessions.ts`
- EDIT `backend/src/server.ts` — `ensureAdminSession(app.pg)` on startup
- ADD `bcryptjs` + `@types/bcryptjs` to backend deps

**Gate:**
- Migration applies without error
- Admin row inserted
- All existing data has `session_id = admin UUID`
- Backend starts clean
- **Zero route changes** — endpoints continue returning all data (ignore session_id yet)

**Rollback if fail:** `psql < backup.sql` or `git checkout pre-multitenant-2026-11-10`

**Time:** 15 min

### Bubble 2: Repo functions accept sessionId

**Files (14 functions):**
- `goals.ts`: `listGoals`, `createGoal`
- `payouts.ts`: `createPayout`, `listPayouts`, `softDeletePayout`
- `reports.ts`: `getSummary`
- `surplus-periods.ts`: `recomputeSurplusPeriod`, `ensureSurplusPeriods`, `getSurplusPeriod`, `cascadeFrom`, `computeMonthMetrics` (private)
- `surplus.ts`: `calculateSurplus`, `createPrediction`, `getLatestPrediction`, `listPredictions`, `updatePrediction`, `deletePrediction`, `markPredictionAchieved`
- `transactions.ts`: `insertTransaction`, `listTransactions`, `updateTransaction`

**Pattern:**
```typescript
// Before
export async function listGoals(pool: pg.Pool): Promise<GoalRow[]>

// After
export async function listGoals(pool: pg.Pool, sessionId: string): Promise<GoalRow[]>
// + WHERE session_id = $1
```

**Gate:**
- `tsc --noEmit` clean
- Existing routes still work (routes call with `ADMIN_UUID` temporarily)
- Admin data intact

**Rollback:** git revert this commit

**Time:** 25 min

### Bubble 3: Routes extract session

**Files (25 routes across 7 files):**
- Extract `sessionId` from `req.headers['x-session-id']`
- Validate against `demo_sessions`
- Return 401 if missing/invalid
- Pass to repo functions

**Helper pattern:**
```typescript
async function requireSession(req, reply): Promise<string | null> {
  const sid = req.headers['x-session-id'];
  if (typeof sid !== 'string') { reply.code(401).send({error:'no_session'}); return null; }
  const session = await verifySession(fastify.pg, sid);
  if (!session) { reply.code(401).send({error:'invalid_session'}); return null; }
  return session.id;
}
```

**Gate:**
- curl `-H "X-Session-Id: <admin>"` → 200 same data
- curl without header → 401
- Frontend broken temporarily (expected, fixed in B5)

**Rollback:** git revert this commit

**Time:** 20 min

### Bubble 4: Seed refactor + admin reset scoped

**Files:**
- EDIT `backend/src/scripts/seed-demo.ts` — `runSeed(pool, sessionId)` param
- TRUNCATE → `DELETE WHERE session_id = $1`
- INSERT includes `session_id` column
- NEW `backend/src/routes/admin.ts` — `POST /admin/reset` (requires admin session)
- NEW `POST /admin/sessions` — public signup (name → password + session_id)

**Gate:**
- `runSeed(pool, ADMIN_UUID)` → admin data restored
- `runSeed(pool, <new UUID>)` → new user empty (no seed for them; runSeed is admin-only)
- `POST /admin/sessions` with name `judge` → 201 + password shown
- `POST /admin/reset` with admin header → wipes admin only

**Rollback:** git revert + `psql < backup.sql`

**Time:** 15 min

### Bubble 5: Frontend signup + login

**Files:**
- EDIT `frontend/app/login/LoginForm.tsx` — name + password fields
- NEW `frontend/app/signup/SignupForm.tsx` — name field → shows generated password
- EDIT `frontend/middleware.ts` — cookie `fos_session_id` (not `fos_auth=ok`)
- EDIT `frontend/app/api/proxy/[...path]/route.ts` — forward `X-Session-Id` header
- EDIT `frontend/app/api/login/route.ts` — validate against backend `/admin/login`
- EDIT `frontend/components/layout/NavBar.tsx` — show "Hi, {name}"
- EDIT `frontend/app/reset/ResetButton.tsx` — call `/admin/reset` with session header

**Gate:**
- Signup `judge` → shows password `KX7FQ` → user copies
- Login `judge` / `KX7FQ` → empty dashboard, 0 tx
- Logout → back to landing
- Login as `admin` / `financial-os` → seeded data

**Rollback:** git revert frontend commit (Vercel auto-redeploy)

**Time:** 20 min

### Bubble 6: E2E isolation test

**Scenarios:**
1. Signup 2 users → both see empty
2. User A adds 3 tx → user B still sees 0
3. Admin logs in → sees 115 tx (not user A's 3)
4. Admin resets → user A's 3 tx untouched
5. User A resets own → only A's data gone
6. Simulate stale cookie → 401 → redirect login

**Gate:** All 6 pass

**Rollback:** already tested in staging; if fail, revert B5

**Time:** 15 min

---

## Rollback strategy

At any bubble failure:

```bash
# DB
psql "$DATABASE_URL" < ~/saturumah-backups/neon-*.sql

# Code
git fetch origin tag pre-multitenant-2026-11-10
git checkout pre-multitenant-2026-11-10
git push origin pre-multitenant-2026-11-10:main --force
```

**Fallback mode**: reset-button-only (`/reset` shared wipe) — already implemented in commit c80156a.

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Forgotten WHERE session_id → data leak | 🔴 | Systematic grep + E2E B6 test |
| `payouts.transaction_id` FK cascade delete fails | 🟡 | Test admin reset deletes payouts first |
| Seed TRUNCATE wipes all users | 🔴 | Change to `DELETE WHERE session_id = $1` |
| Pool teardown crash on Neon | 🟡 | Use `pg.Client` (not Pool) for scripts |
| URL leaked in chat | 🟢 | Rotate `neondb_owner` password post-submit |
| `tsc` fail on Vercel (unused var) | 🟡 | Local `tsc --noEmit` gate strict |
| Demo broken mid-migration | 🔴 | Backup + tag; fallback mode documented |

---

## Timeline

| Bubble | Time | Cumulative |
|---|---|---|
| B1 (migration) | 15 min | 0:15 |
| B2 (repos) | 25 min | 0:40 |
| B3 (routes) | 20 min | 1:00 |
| B4 (seed + admin) | 15 min | 1:15 |
| B5 (frontend) | 20 min | 1:35 |
| B6 (e2e) | 15 min | 1:50 |
| Buffer + redeploys | 25 min | **2:15** |

Plus Render deploys (4× × 3 min = 12 min) + Vercel redeploys (3× × 1 min = 3 min) = **~2:30 realistic**.

**Absolute hard cap: 4.5 hours.** Any stuck bubble >30 min → abort + fallback.

---

## Post-submission (deferred)

- Rotate `neondb_owner` password (was leaked in chat)
- Add "reset my data" button (user-facing, not just admin)
- Second admin account
- Data export (JSON download per session)
- Session cleanup cron (delete inactive >30 days)

---

## Approval gate

**Product Owner approval required before B1 starts.**

Checklist:
- [ ] Design accepted (admin + user model, 5-char password, no email)
- [ ] Timeline accepted (2.5h realistic, 4.5h cap)
- [ ] Rollback plan accepted (backup + tag + fallback mode)
- [ ] Risk register reviewed
- [ ] Post-submission tasks acknowledged

Once approved → B1 starts.
