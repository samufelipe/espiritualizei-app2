-- Persiste rotineType e bestMoment do onboarding no perfil do usuário
-- Necessário para que a revisão mensal regenere a rotina com dados reais

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS routine_type text
    CHECK (routine_type IN ('chaotic', 'structured', 'flexible', 'overwhelmed')),
  ADD COLUMN IF NOT EXISTS best_moment text
    CHECK (best_moment IN ('morning', 'commute', 'breaks', 'night', 'random'));

-- Rollback:
-- ALTER TABLE profiles DROP COLUMN IF EXISTS routine_type;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS best_moment;