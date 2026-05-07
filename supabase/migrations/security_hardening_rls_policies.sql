-- ============================================================
-- SECURITY HARDENING — Espiritualizei RLS Policies
-- Data: 2026-05-07
-- Problema: várias tabelas com RLS desabilitado ou policies
--           "ALL qual: true" que expõem dados de todos os usuários.
-- ============================================================

-- ============================================================
-- 1. PROFILES
--    Problema: RLS desabilitado + policy ALL qual:true
--    Fix: habilitar RLS + 3 policies limpas e específicas
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remover todas as policies conflitantes/perigosas
DROP POLICY IF EXISTS "Allow anon read all profiles"               ON profiles;
DROP POLICY IF EXISTS "Public profiles access"                     ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone"   ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile"              ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile"         ON profiles;
DROP POLICY IF EXISTS "Users can update own profile"              ON profiles;
DROP POLICY IF EXISTS "Users can view own profile"                ON profiles;
DROP POLICY IF EXISTS "Usuários podem ler seus próprios perfis"   ON profiles;

-- SELECT: autenticados veem todos os perfis (leaderboard, avatares, comunidade)
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: cada usuário insere apenas o seu próprio perfil
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- UPDATE: cada usuário atualiza apenas o seu próprio perfil
--         USING garante que só pode tocar na própria linha
--         WITH CHECK garante que não pode trocar o id para outro usuário
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- DELETE: bloqueado no cliente (service_role bypassa RLS via Edge Functions)

-- ============================================================
-- 2. JOURNAL_ENTRIES (diário espiritual — dado sensível)
--    Problema: "Public journal access (ALL) qual:true"
--              permitia ler/editar o diário de qualquer usuário
--    Fix: remover a policy perigosa; manter as políticas corretas
-- ============================================================

DROP POLICY IF EXISTS "Public journal access" ON journal_entries;
-- "Users manage own journal" e "Usuários gerenciam seu próprio diário" permanecem

-- ============================================================
-- 3. NOTIFICATIONS (dado pessoal)
--    Problema: "Public notifications access (ALL) qual:true"
--    Fix: remover + adicionar UPDATE e DELETE próprios
-- ============================================================

DROP POLICY IF EXISTS "Public notifications access" ON notifications;

-- Marcar notificação como lida
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Dispensar/apagar notificação
CREATE POLICY "notifications_delete_own"
  ON notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. PAYMENT_LOGS (dado financeiro — altamente sensível)
--    Problema: "Allow service role full access (ALL) qual:true"
--              expunha histórico de pagamentos de TODOS os usuários
--    Fix: usuário vê apenas seus próprios logs;
--         INSERT/UPDATE/DELETE reservado ao service_role (Edge Functions)
-- ============================================================

DROP POLICY IF EXISTS "Allow service role full access" ON payment_logs;

CREATE POLICY "payment_logs_select_own"
  ON payment_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. PRAYER_INTENTIONS (funcionalidade de comunidade)
--    Problema: "Public intentions access (ALL) qual:true"
--    Fix: remover ALL perigosa; SELECT público permanece (correto para comunidade);
--         adicionar DELETE para o dono
-- ============================================================

DROP POLICY IF EXISTS "Public intentions access" ON prayer_intentions;
-- "Anyone can view intentions", "Users can insert intentions",
-- "Users can update own intentions" permanecem

CREATE POLICY "prayer_intentions_delete_own"
  ON prayer_intentions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 6. PRAYER_INTERACTIONS (reações de comunidade)
--    Problema: duas policies "ALL qual:true" sem restrição
--    Fix: reconstruir com políticas granulares
-- ============================================================

DROP POLICY IF EXISTS "Public interactions"        ON prayer_interactions;
DROP POLICY IF EXISTS "Public interactions access" ON prayer_interactions;

-- Qualquer autenticado pode ver quem está orando (funcionalidade de comunidade)
CREATE POLICY "prayer_interactions_select_all"
  ON prayer_interactions FOR SELECT
  TO authenticated
  USING (true);

-- Apenas o próprio usuário adiciona seu voto de oração
CREATE POLICY "prayer_interactions_insert_own"
  ON prayer_interactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Apenas o próprio usuário pode remover seu voto
CREATE POLICY "prayer_interactions_delete_own"
  ON prayer_interactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. USER_ROUTINES (rotinas privadas do usuário)
--    Problema: "Public routines access (ALL) qual:true"
--    Fix: remover; as demais policies específicas por user_id permanecem
-- ============================================================

DROP POLICY IF EXISTS "Public routines access" ON user_routines;
-- "Users can delete/insert/manage/update/view own routines" permanecem

-- ============================================================
-- Rollback (ordem reversa):
--
-- DROP POLICY IF EXISTS "profiles_select_authenticated"    ON profiles;
-- DROP POLICY IF EXISTS "profiles_insert_own"              ON profiles;
-- DROP POLICY IF EXISTS "profiles_update_own"              ON profiles;
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
--
-- DROP POLICY IF EXISTS "notifications_update_own"         ON notifications;
-- DROP POLICY IF EXISTS "notifications_delete_own"         ON notifications;
--
-- DROP POLICY IF EXISTS "payment_logs_select_own"          ON payment_logs;
--
-- DROP POLICY IF EXISTS "prayer_intentions_delete_own"     ON prayer_intentions;
--
-- DROP POLICY IF EXISTS "prayer_interactions_select_all"   ON prayer_interactions;
-- DROP POLICY IF EXISTS "prayer_interactions_insert_own"   ON prayer_interactions;
-- DROP POLICY IF EXISTS "prayer_interactions_delete_own"   ON prayer_interactions;
-- ============================================================