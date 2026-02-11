-- Tabela de desafios comunitários
CREATE TABLE IF NOT EXISTS community_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_action TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('prayer', 'charity', 'study', 'fasting', 'service')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  xp_reward INTEGER NOT NULL DEFAULT 50,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de participantes dos desafios
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(challenge_id, user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_community_challenges_status ON community_challenges(status);
CREATE INDEX IF NOT EXISTS idx_community_challenges_dates ON community_challenges(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user ON challenge_participants(user_id);

-- RLS Policies
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- Todos podem ver desafios ativos
CREATE POLICY "Desafios ativos são públicos" ON community_challenges
  FOR SELECT USING (status = 'active');

-- Usuários autenticados podem participar
CREATE POLICY "Usuários podem participar de desafios" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem ver suas próprias participações
CREATE POLICY "Usuários veem suas participações" ON challenge_participants
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias participações
CREATE POLICY "Usuários atualizam suas participações" ON challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para adicionar XP (se não existir)
CREATE OR REPLACE FUNCTION add_xp(user_id UUID, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET xp = xp + xp_amount,
      level = FLOOR((xp + xp_amount) / 100) + 1
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
