-- Multi-tenant foundation: sessions table + session_id on 5 data tables.
-- Backfill all existing rows to admin session (no data loss).
-- Endpoints NOT yet filtering — that's B2/B3. This migration only adds schema.

BEGIN;

-- 1. Sessions table
CREATE TABLE IF NOT EXISTS demo_sessions (
  id            UUID PRIMARY KEY,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Case-insensitive unique name (allows looking up 'Admin' == 'admin')
CREATE UNIQUE INDEX IF NOT EXISTS idx_demo_sessions_name_lower
  ON demo_sessions (LOWER(name));

-- 2. Add session_id nullable columns
ALTER TABLE transactions    ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE goals           ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE surplus_oracles ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE payouts         ADD COLUMN IF NOT EXISTS session_id UUID;
ALTER TABLE surplus_periods ADD COLUMN IF NOT EXISTS session_id UUID;

-- 3. Backfill existing rows to admin session
UPDATE transactions    SET session_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE session_id IS NULL;
UPDATE goals           SET session_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE session_id IS NULL;
UPDATE surplus_oracles SET session_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE session_id IS NULL;
UPDATE payouts         SET session_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE session_id IS NULL;
UPDATE surplus_periods SET session_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE session_id IS NULL;

-- 4. Enforce NOT NULL
ALTER TABLE transactions    ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE goals           ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE surplus_oracles ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE payouts         ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE surplus_periods ALTER COLUMN session_id SET NOT NULL;

-- 5. Swap UNIQUE on surplus_periods: period_month → (session_id, period_month)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'surplus_periods_period_month_key'
      AND conrelid = 'surplus_periods'::regclass
  ) THEN
    ALTER TABLE surplus_periods DROP CONSTRAINT surplus_periods_period_month_key;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'surplus_periods_session_month_key'
      AND conrelid = 'surplus_periods'::regclass
  ) THEN
    ALTER TABLE surplus_periods
      ADD CONSTRAINT surplus_periods_session_month_key
      UNIQUE (session_id, period_month);
  END IF;
END $$;

-- 6. Composite indexes for session-scoped queries
CREATE INDEX IF NOT EXISTS idx_tx_session      ON transactions(session_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_goals_session   ON goals(session_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_oracles_session ON surplus_oracles(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payouts_session ON payouts(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_periods_session ON surplus_periods(session_id, period_month DESC);

COMMIT;
