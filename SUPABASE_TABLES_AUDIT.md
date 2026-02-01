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
