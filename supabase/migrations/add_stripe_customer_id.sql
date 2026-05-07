-- Adiciona stripe_customer_id para vincular renovações e cancelamentos futuros
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
  ON profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Rollback:
-- DROP INDEX IF EXISTS profiles_stripe_customer_id_idx;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_customer_id;