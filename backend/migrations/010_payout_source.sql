-- ┌────────────────────────────────────────────────────────────────────┐
-- │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
-- ├────────────────────────────────────────────────────────────────────┤
-- │  File      : backend/migrations/010_payout_source.sql
-- │  Purpose   : Allow 'payout' source for synthetic donation transactions
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

BEGIN;
-- Drop constraint lama
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_source_check;
-- Tambahkan constraint baru dengan 'payout'
ALTER TABLE transactions ADD CONSTRAINT transactions_source_check CHECK (source IN ('rule', 'llm', 'manual_edit', 'payout'));
COMMIT;
