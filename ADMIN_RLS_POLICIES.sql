-- =====================================================
-- POLÍTICAS DE RLS PARA O PAINEL ADMINISTRATIVO
-- Execute este SQL no SQL Editor do Supabase
-- =====================================================

-- 1. Criar tabela de administradores (se não existir)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 2. Inserir seu email como administrador
INSERT INTO admins (email, name, role) 
VALUES ('samucafe01@gmail.com', 'Samuel', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 3. Criar função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM admins WHERE email = user_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar política que permite admins verem todos os profiles
-- Primeiro, remover política existente se houver
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Criar nova política para admins
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT
  USING (
    auth.uid() = id 
    OR 
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

-- 5. Política para admins editarem qualquer profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE
  USING (
    auth.uid() = id 
    OR 
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

-- 6. Política para admins deletarem profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email')
  );

-- 7. Criar tabela de mensagens de suporte
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_email TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, in_progress, resolved
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  admin_response TEXT,
  responded_by TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Criar tabela de analytics de uso
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  pages_visited TEXT[], -- Array de páginas visitadas
  features_used TEXT[], -- Array de funcionalidades usadas
  device_type TEXT, -- mobile, desktop, tablet
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Habilitar RLS nas novas tabelas
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- 10. Políticas para admins
CREATE POLICY "Admins can view all support messages" ON support_messages
  FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can create support messages" ON support_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON user_analytics
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Users can insert own analytics" ON user_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 11. Adicionar colunas de analytics na tabela profiles (se não existirem)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_session_time INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sessions_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS favorite_features TEXT[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS device_type TEXT;

-- =====================================================
-- IMPORTANTE: Após executar este SQL, o painel admin
-- poderá visualizar todos os usuários corretamente.
-- =====================================================


-- =====================================================
-- APÓS DEPLOY DA EDGE FUNCTION, REMOVER POLÍTICA PÚBLICA
-- =====================================================

-- Execute este comando APÓS confirmar que a Edge Function está funcionando:

-- DROP POLICY IF EXISTS "Allow public read for admin" ON profiles;

-- Isso remove a política de leitura pública e mantém apenas o acesso via Edge Function
-- que usa a service_role key de forma segura no servidor.

-- =====================================================
-- VERIFICAR POLÍTICAS EXISTENTES
-- =====================================================

-- Para ver todas as políticas da tabela profiles:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- =====================================================
-- CONFIGURAÇÃO DA EDGE FUNCTION
-- =====================================================

-- No Supabase Dashboard, vá em:
-- Edge Functions > admin-data > Secrets
-- E adicione:
-- ADMIN_SECRET = Espiritualizei@Admin2024

-- A Edge Function usa a SUPABASE_SERVICE_ROLE_KEY que já está disponível
-- automaticamente em todas as Edge Functions.
