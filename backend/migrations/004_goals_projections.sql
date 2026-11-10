-- ┌──────────────────────────────────────────────────────────────────────┐
-- │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
-- │  ──────────────────────────────────────────────────────────────────   │
-- │  File      : backend/migrations/004_goals_projections.sql           │
-- │  Purpose   : DB migration: 004_goals_projections                    │
-- │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
-- │  GitHub    : https://github.com/setuju                            │
-- │  Website   : https://saturumah.net                              │
-- │  Created   : 10-11-2026                                             │
-- │  License   : MIT                                                  │
-- └──────────────────────────────────────────────────────────────────────┘
--
-- @author    Jack <Jack[at]SatuRumah[dot]Net>
-- @created   10-11-2026
-- @package   financial-os/backend
-- @license   MIT

-- 004_goals_projections.sql
-- Adds goals table (for Bryntum Gantt) and is_projection flag on transactions
-- (for future-dated forecast rows that should NOT be counted as realized surplus).

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  monthly_saving NUMERIC(15,2) NOT NULL CHECK (monthly_saving >= 0),
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  loan_term_months INTEGER NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_projection BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_transactions_is_projection ON transactions(is_projection);
CREATE INDEX IF NOT EXISTS idx_goals_start_date         ON goals(start_date);
