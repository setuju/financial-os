-- Surplus periods: cascade model, month-to-month rollover
CREATE TABLE IF NOT EXISTS surplus_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_month DATE NOT NULL UNIQUE,
  opening_balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_income NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_expense NUMERIC(15,2) NOT NULL DEFAULT 0,
  horizon_bills NUMERIC(15,2) NOT NULL DEFAULT 0,
  donations NUMERIC(15,2) NOT NULL DEFAULT 0,
  closing_surplus NUMERIC(15,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_surplus_periods_month ON surplus_periods(period_month DESC);

-- Payouts: explicit source period + soft delete
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS source_period DATE;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_payouts_source_period ON payouts(source_period);
CREATE INDEX IF NOT EXISTS idx_payouts_not_deleted ON payouts(created_at DESC) WHERE deleted_at IS NULL;

-- Oracle: achievement timestamp
ALTER TABLE surplus_oracles ADD COLUMN IF NOT EXISTS achieved_at TIMESTAMPTZ;

-- Backfill: existing successful payouts → source_period = month BEFORE created_at (last month model)
UPDATE payouts
SET source_period = DATE_TRUNC('month', created_at - INTERVAL '1 month')::date
WHERE source_period IS NULL AND status = 'success';
