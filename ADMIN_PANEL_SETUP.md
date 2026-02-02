# Configuração do Painel Administrativo - Espiritualizei

## 1. Tabela de Administradores

Execute este SQL no Supabase para criar a tabela de administradores:

```sql
-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Inserir administradores iniciais
INSERT INTO admins (email, name, role) VALUES 
  ('samufelipe@gmail.com', 'Samuel Felipe', 'super_admin'),
  ('admin@espiritualizei.com', 'Admin Espiritualizei', 'admin'),
  ('espiritualizeiapp@gmail.com', 'Espiritualizei App', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Habilitar RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem ver a tabela de admins
CREATE POLICY "Admins can view admins" ON admins
  FOR SELECT USING (auth.email() IN (SELECT email FROM admins));
```

## 2. Tabela de Logs de Atividade Admin

```sql
-- Criar tabela de logs de atividade administrativa
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Política: apenas admins podem ver logs
CREATE POLICY "Admins can view logs" ON admin_activity_logs
  FOR SELECT USING (auth.email() IN (SELECT email FROM admins));

-- Política: apenas admins podem inserir logs
CREATE POLICY "Admins can insert logs" ON admin_activity_logs
  FOR INSERT WITH CHECK (auth.email() IN (SELECT email FROM admins));
```

## 3. Colunas Adicionais na Tabela Profiles (se não existirem)

```sql
-- Adicionar colunas para gestão administrativa
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspended_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_usage_minutes INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_ended_at TIMESTAMP WITH TIME ZONE;
```

## 4. View para Dashboard de Métricas

```sql
-- Criar view para métricas do dashboard admin
CREATE OR REPLACE VIEW admin_dashboard_metrics AS
SELECT
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_premium = true) as premium_users,
  COUNT(*) FILTER (WHERE is_premium = false OR is_premium IS NULL) as free_users,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_users_week,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month,
  COUNT(*) FILTER (WHERE last_active_at >= NOW() - INTERVAL '24 hours') as active_today,
  COUNT(*) FILTER (WHERE last_active_at >= NOW() - INTERVAL '7 days') as active_week,
  COUNT(*) FILTER (WHERE is_suspended = true) as suspended_users
FROM profiles;
```

## 5. Função para Atualizar Último Acesso

```sql
-- Função para atualizar último acesso do usuário
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente
DROP TRIGGER IF EXISTS update_user_last_active ON profiles;
CREATE TRIGGER update_user_last_active
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();
```

## Acesso ao Painel

Após executar os SQLs acima, acesse o painel em:

**URL:** `https://espiritualizei.com/admin`

**Credenciais:**
- Email: `samufelipe@gmail.com`
- Senha: `Espiritualizei@Admin2024`

> ⚠️ **IMPORTANTE:** Altere a senha no código (`AdminLogin.tsx`) antes de ir para produção!
