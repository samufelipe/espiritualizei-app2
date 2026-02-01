# Auditoria de Tabelas do Supabase - Espiritualizei

## Tabelas OBRIGATÓRIAS (App não funciona sem elas)

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `profiles` | Dados do usuário (nome, email, nível, XP, etc.) | ✅ CRÍTICA |
| `routines` | Rotinas espirituais diárias do usuário | ✅ CRÍTICA |
| `intentions` | Intenções de oração da comunidade | ✅ CRÍTICA |
| `prayer_intercessions` | Registro de quem rezou por quem | ✅ CRÍTICA |

## Tabelas IMPORTANTES (Funcionalidades secundárias)

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `posts` | Postagens da comunidade (Vida em Fraternidade) | ⚠️ IMPORTANTE |
| `post_likes` | Curtidas nas postagens | ⚠️ IMPORTANTE |
| `comments` | Comentários nas postagens | ⚠️ IMPORTANTE |
| `chat_messages` | Mensagens do Social Hub | ⚠️ IMPORTANTE |
| `journal` | Diário espiritual do usuário | ⚠️ IMPORTANTE |
| `notifications` | Notificações internas do app | ⚠️ IMPORTANTE |
| `challenges` | Desafios comunitários salvos | ⚠️ IMPORTANTE |
| `payment_logs` | Histórico de pagamentos | ⚠️ IMPORTANTE |

## Tabelas OPCIONAIS (Sistema de notificações push)

| Tabela | Descrição | Status |
|--------|-----------|--------|
| `push_subscriptions` | Tokens de dispositivos para push | 🔵 OPCIONAL |
| `notification_queue` | Fila de notificações a enviar | 🔵 OPCIONAL |
| `notification_preferences` | Preferências de notificação do usuário | 🔵 OPCIONAL |
| `email_queue` | Fila de e-mails a enviar | 🔵 OPCIONAL |
| `onboarding_leads` | Leads capturados no onboarding | 🔵 OPCIONAL |

## Colunas da tabela `profiles`

### Colunas OBRIGATÓRIAS:
- `id` (uuid, PK)
- `name` (text)
- `phone` (text)
- `spiritual_maturity` (text)
- `spiritual_focus` (text)
- `spiritual_goal` (text)
- `state_of_life` (text)
- `patron_saint` (text)
- `confession_frequency` (text)
- `level` (integer, default 1)
- `current_xp` (integer, default 0)
- `streak_days` (integer, default 0)
- `joined_date` (timestamp)
- `is_premium` (boolean, default false)
- `subscription_status` (text, default 'canceled')

### Colunas OPCIONAIS (já adicionadas):
- `last_routine_update` (timestamp)
- `spiritual_cycle_start` (timestamp)
- `last_confession_at` (timestamp)
- `avatar_url` (text)
- `email` (text)

---

## SQL para criar tabelas faltantes

```sql
-- Tabela de rotinas (se não existir)
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time TEXT,
  duration INTEGER,
  day_of_week TEXT,
  category TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de intenções de oração
CREATE TABLE IF NOT EXISTS intentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  text TEXT NOT NULL,
  category TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de intercessões
CREATE TABLE IF NOT EXISTS prayer_intercessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intention_id UUID REFERENCES intentions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(intention_id, user_id)
);

-- Tabela de postagens
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  user_level INTEGER DEFAULT 1,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'testimony',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de curtidas
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de pagamento
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT DEFAULT 'cakto',
  status TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mensagens do chat
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  user_level INTEGER DEFAULT 1,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'message',
  reactions JSONB DEFAULT '{"heart": 0, "candle": 0, "pray": 0}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de diário
CREATE TABLE IF NOT EXISTS journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabelas opcionais para notificações push
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  endpoint TEXT NOT NULL,
  p256dh TEXT,
  auth TEXT,
  device_info JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT,
  data JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  daily_inspiration BOOLEAN DEFAULT TRUE,
  routine_reminders BOOLEAN DEFAULT TRUE,
  community_challenges BOOLEAN DEFAULT TRUE,
  intercession_alerts BOOLEAN DEFAULT TRUE,
  library_suggestions BOOLEAN DEFAULT TRUE,
  inactivity_reminders BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  template TEXT NOT NULL,
  data JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS onboarding_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  spiritual_goal TEXT,
  primary_struggle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_intentions_user_id ON intentions(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
```

---

## RLS (Row Level Security) - Políticas de Segurança

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_intercessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles (usuário pode ver/editar apenas seu próprio perfil)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para routines
CREATE POLICY "Users can view own routines" ON routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own routines" ON routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own routines" ON routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own routines" ON routines FOR DELETE USING (auth.uid() = user_id);

-- Políticas para intentions (todos podem ver, apenas dono pode editar)
CREATE POLICY "Anyone can view intentions" ON intentions FOR SELECT USING (true);
CREATE POLICY "Users can insert own intentions" ON intentions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own intentions" ON intentions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own intentions" ON intentions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para prayer_intercessions
CREATE POLICY "Anyone can view intercessions" ON prayer_intercessions FOR SELECT USING (true);
CREATE POLICY "Users can insert own intercessions" ON prayer_intercessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own intercessions" ON prayer_intercessions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para posts (todos podem ver, apenas dono pode editar)
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Políticas para post_likes
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON post_likes FOR DELETE USING (auth.uid() = user_id);

-- Políticas para comments
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Políticas para notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para payment_logs
CREATE POLICY "Users can view own payment logs" ON payment_logs FOR SELECT USING (auth.uid() = user_id);

-- Políticas para chat_messages (todos podem ver e enviar)
CREATE POLICY "Anyone can view chat messages" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chat messages" ON chat_messages FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para journal
CREATE POLICY "Users can view own journal" ON journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own journal" ON journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own journal" ON journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own journal" ON journal FOR DELETE USING (auth.uid() = user_id);
```


---

## 🔐 POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)

### IMPORTANTE: Habilitar RLS em TODAS as tabelas

O RLS (Row Level Security) é **ESSENCIAL** para proteger os dados dos usuários. Sem ele, qualquer pessoa com a chave anon pode acessar TODOS os dados.

### SQL para habilitar RLS e criar políticas:

```sql
-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_intercessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA TABELA PROFILES
-- =====================================================

-- Usuário pode ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Usuário pode atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permitir inserção durante registro (service role)
CREATE POLICY "Enable insert for authenticated users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- 3. POLÍTICAS PARA TABELA ROUTINES
-- =====================================================

-- Usuário pode ver apenas suas próprias rotinas
CREATE POLICY "Users can view own routines" ON routines
  FOR SELECT USING (auth.uid() = user_id);

-- Usuário pode criar suas próprias rotinas
CREATE POLICY "Users can insert own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar suas próprias rotinas
CREATE POLICY "Users can update own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuário pode deletar suas próprias rotinas
CREATE POLICY "Users can delete own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. POLÍTICAS PARA TABELA INTENTIONS (Intenções de Oração)
-- =====================================================

-- Todos os usuários autenticados podem ver intenções (comunidade)
CREATE POLICY "Authenticated users can view intentions" ON intentions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuário pode criar suas próprias intenções
CREATE POLICY "Users can insert own intentions" ON intentions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário pode deletar suas próprias intenções
CREATE POLICY "Users can delete own intentions" ON intentions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. POLÍTICAS PARA TABELA PRAYER_INTERCESSIONS
-- =====================================================

-- Todos podem ver intercessões (para contagem)
CREATE POLICY "Anyone can view intercessions" ON prayer_intercessions
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuário pode registrar suas intercessões
CREATE POLICY "Users can insert own intercessions" ON prayer_intercessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário pode remover suas intercessões
CREATE POLICY "Users can delete own intercessions" ON prayer_intercessions
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 6. POLÍTICAS PARA TABELA POSTS (Comunidade)
-- =====================================================

-- Todos os usuários autenticados podem ver posts
CREATE POLICY "Authenticated users can view posts" ON posts
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuário pode criar seus próprios posts
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário pode deletar seus próprios posts
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 7. POLÍTICAS PARA TABELA JOURNAL (Diário Pessoal)
-- =====================================================

-- Usuário pode ver apenas seu próprio diário (PRIVADO)
CREATE POLICY "Users can view own journal" ON journal
  FOR SELECT USING (auth.uid() = user_id);

-- Usuário pode criar entradas no seu diário
CREATE POLICY "Users can insert own journal entries" ON journal
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuário pode atualizar seu diário
CREATE POLICY "Users can update own journal" ON journal
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuário pode deletar entradas do seu diário
CREATE POLICY "Users can delete own journal entries" ON journal
  FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 8. POLÍTICAS PARA TABELA PAYMENT_LOGS (Apenas Admin)
-- =====================================================

-- Apenas service role pode acessar logs de pagamento
-- (Nenhuma política para usuários normais = acesso negado)
-- O webhook usa service_role_key que bypassa RLS

-- =====================================================
-- 9. POLÍTICAS PARA TABELA NOTIFICATIONS
-- =====================================================

-- Usuário pode ver apenas suas próprias notificações
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Sistema pode criar notificações (via service role)
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Usuário pode marcar suas notificações como lidas
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 🛡️ BOAS PRÁTICAS DE SEGURANÇA IMPLEMENTADAS

### No Código:
1. ✅ Senhas nunca são armazenadas em texto plano (Supabase Auth cuida disso)
2. ✅ Tokens de sessão têm expiração (30 dias)
3. ✅ E-mails são normalizados (lowercase, trim)
4. ✅ Dados sensíveis não são expostos em logs
5. ✅ Webhook valida assinatura da Cakto
6. ✅ Proteção contra eventos duplicados de pagamento

### No Supabase:
1. ⚠️ **EXECUTE O SQL ACIMA** para habilitar RLS
2. ⚠️ Nunca exponha a `service_role_key` no frontend
3. ⚠️ Use apenas `anon_key` no código do cliente
4. ⚠️ Configure variáveis de ambiente na Vercel

### Na Cakto:
1. ⚠️ Configure o webhook URL corretamente
2. ⚠️ Guarde o `CAKTO_CLIENT_SECRET` nas variáveis do Supabase

---

## 📊 ÍNDICES DE PERFORMANCE

```sql
-- Índices para melhorar performance de queries frequentes
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_day_of_week ON routines(day_of_week);
CREATE INDEX IF NOT EXISTS idx_intentions_created_at ON intentions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_intentions_user_id ON intentions(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prayer_intercessions_intention ON prayer_intercessions(intention_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_event_id ON payment_logs(event_id);
```
