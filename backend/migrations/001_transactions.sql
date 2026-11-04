-- 001_transactions.sql
-- Anti-Budget journal: every parsed user input becomes one row here.
-- Amount is always positive; `type` distinguishes income vs expense.

CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID,
  raw_text    TEXT NOT NULL,
  amount      NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  type        TEXT NOT NULL CHECK (type IN ('income','expense')),
  category    TEXT NOT NULL DEFAULT 'other',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source      TEXT NOT NULL DEFAULT 'rule' CHECK (source IN ('rule','llm')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category    ON transactions (category);
CREATE INDEX IF NOT EXISTS idx_transactions_type        ON transactions (type);
