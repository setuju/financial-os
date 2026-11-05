-- 003_surplus_oracle.sql
CREATE TABLE IF NOT EXISTS surplus_oracles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  predicted_amount NUMERIC(15,2) NOT NULL CHECK (predicted_amount >= 0),
  actual_amount NUMERIC(15,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
