-- ┌────────────────────────────────────────────────────────────────────┐
-- │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
-- ├────────────────────────────────────────────────────────────────────┤
-- │  File      : backend/migrations/011_advisor_advice.sql
-- │  Purpose   : Store AI Advisor responses for persistence
-- │  Author    : Jack — Jack[at]SatuRumah[dot]Net
-- │  Created   : 12-11-2026
-- │  License   : MIT
-- └────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS advisor_advice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  persona TEXT NOT NULL CHECK (persona IN ('financial', 'cashier', 'sikitong')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_advisor_session ON advisor_advice (session_id, persona, created_at DESC);
