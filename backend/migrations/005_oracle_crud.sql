-- ┌────────────────────────────────────────────────────────────────────┐
-- │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
-- ├────────────────────────────────────────────────────────────────────┤
-- │  File      : backend/migrations/005_oracle_crud.sql
-- │  Purpose   : DB migration: 005_oracle_crud
-- │  Author    : Jack — Jack[at]SatuRumah[dot]Net
-- │  GitHub    : https://github.com/setuju
-- │  Website   : https://saturumah.net
-- │  Created   : 10-11-2026
-- │  License   : MIT
-- └────────────────────────────────────────────────────────────────────┘
--
-- @author    Jack <Jack[at]SatuRumah[dot]Net>
-- @created   10-11-2026
-- @package   financial-os/backend
-- @license   MIT

--
-- @author    Jack <Jack[at]SatuRumah[dot]Net>
-- @created   10-11-2026
-- @package   financial-os/backend
-- @license   MIT

ALTER TABLE surplus_oracles
  ADD COLUMN IF NOT EXISTS period VARCHAR(50) DEFAULT 'next_week',
  ADD COLUMN IF NOT EXISTS reason TEXT;
