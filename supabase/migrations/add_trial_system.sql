-- Sistema de Trial de 7 dias
-- Novos usuários: trial definido no registerUser
-- Usuários existentes: backfill baseado em joined_date

-- 1. Usuários recentes (joined <= 7 dias atrás) que ainda não têm status → trial ativo
UPDATE profiles
SET
  subscription_status = 'trial',
  subscription_renewal_at = joined_date + INTERVAL '7 days'
WHERE
  (subscription_status IS NULL OR subscription_status = 'canceled')
  AND is_premium IS NOT TRUE
  AND joined_date >= NOW() - INTERVAL '7 days';

-- 2. Usuários antigos sem status → trial já expirado
UPDATE profiles
SET subscription_status = 'expired'
WHERE
  (subscription_status IS NULL OR subscription_status = 'canceled')
  AND is_premium IS NOT TRUE
  AND joined_date < NOW() - INTERVAL '7 days';

-- Rollback:
-- UPDATE profiles SET subscription_status = 'canceled', subscription_renewal_at = NULL
-- WHERE subscription_status IN ('trial', 'expired') AND is_premium IS NOT TRUE;