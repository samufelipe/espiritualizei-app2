-- Tabela para registrar conclusões diárias de rotinas
CREATE TABLE IF NOT EXISTS routine_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_item_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date DATE DEFAULT CURRENT_DATE,
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Um usuário só pode completar uma rotina uma vez por dia
  UNIQUE(user_id, routine_item_id, completion_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_routine_completions_user_date 
  ON routine_completions(user_id, completion_date);

CREATE INDEX IF NOT EXISTS idx_routine_completions_item 
  ON routine_completions(routine_item_id);

-- RLS (Row Level Security)
ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas suas próprias conclusões
CREATE POLICY "Users can view own completions"
  ON routine_completions FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuários podem inserir suas próprias conclusões
CREATE POLICY "Users can insert own completions"
  ON routine_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar suas próprias conclusões
CREATE POLICY "Users can delete own completions"
  ON routine_completions FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários
COMMENT ON TABLE routine_completions IS 'Registra conclusões diárias de itens de rotina por usuário';
COMMENT ON COLUMN routine_completions.completion_date IS 'Data da conclusão (sem hora) para controle diário';
COMMENT ON COLUMN routine_completions.xp_earned IS 'XP ganho nesta conclusão específica';
