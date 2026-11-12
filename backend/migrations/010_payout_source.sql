BEGIN;
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_source_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_source_check CHECK (source IN ('rule', 'llm', 'manual_edit', 'payout'));
COMMIT;
