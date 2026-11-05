-- 002_payouts.sql
-- Tracks ethical surplus distributions to PayPal sandbox accounts.
-- Money is only distributed from valid surplus (yield/cashback), never principal.

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id), -- opsional, jika payout terkait transaksi tertentu
  amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  receiver_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  paypal_batch_id TEXT, -- ID dari PayPal Payouts API
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts (status);
CREATE INDEX IF NOT EXISTS idx_payouts_created_at ON payouts (created_at DESC);
