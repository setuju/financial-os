-- ┌────────────────────────────────────────────────────────────────────┐
-- │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
-- ├────────────────────────────────────────────────────────────────────┤
-- │  File      : backend/migrations/009_dynamic_categories.sql
-- │  Purpose   : Create dynamic categories table for AI fallback
-- │  Author    : Jack — Jack[at]SatuRumah[dot]Net
-- │  GitHub    : https://github.com/setuju
-- │  Website   : https://saturumah.net
-- │  Created   : 12-11-2026
-- │  License   : MIT
-- └────────────────────────────────────────────────────────────────────┘
--
-- @author    Jack <Jack[at]SatuRumah[dot]Net>
-- @created   12-11-2026
-- @package   financial-os/backend
-- @license   MIT

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default (English only)
INSERT INTO categories (name, type) VALUES
  ('food', 'expense'), ('groceries', 'expense'), ('transport', 'expense'),
  ('utilities', 'expense'), ('shopping', 'expense'), ('health', 'expense'),
  ('entertainment', 'expense'), ('subscription', 'expense'),
  ('gift', 'expense'), ('pocket_money', 'income'), ('freelance', 'income'), 
  ('bonus', 'income'), ('salary', 'income'), ('investment', 'income'), ('other', 'expense')
ON CONFLICT (name) DO NOTHING;
