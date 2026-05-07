-- Adiciona campos do Profile refactor v2
-- bio: biografia exibida no perfil e na comunidade
-- subscription_renewal_at: data de renovação da assinatura
-- activity_history: histórico de atividade diária para o grid de consistência (49 dias)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS subscription_renewal_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activity_history JSONB DEFAULT '[]'::jsonb;

-- Garantir que o activity_history seja sempre um array JSON válido
ALTER TABLE profiles
  ADD CONSTRAINT IF NOT EXISTS activity_history_is_array
    CHECK (activity_history IS NULL OR jsonb_typeof(activity_history) = 'array');

-- Índice para consultas por data de renovação (útil para jobs de cobrança)
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_renewal_at
  ON profiles (subscription_renewal_at)
  WHERE subscription_renewal_at IS NOT NULL;

-- Rollback:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS bio;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_renewal_at;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS activity_history;
-- DROP INDEX IF EXISTS idx_profiles_subscription_renewal_at;