-- Tabela para persistir dados do quiz antes/após pagamento
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL,
  name             TEXT,
  quiz_data        JSONB       NOT NULL,
  plan_data        JSONB,
  stripe_session_id TEXT,
  email_sent       BOOLEAN     DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quiz_sessions_email  ON quiz_sessions(email);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_stripe ON quiz_sessions(stripe_session_id);

ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_quiz"  ON quiz_sessions FOR INSERT TO anon         WITH CHECK (true);
CREATE POLICY "anon_select_quiz"  ON quiz_sessions FOR SELECT TO anon         USING (true);
CREATE POLICY "service_all_quiz"  ON quiz_sessions FOR ALL    TO service_role USING (true) WITH CHECK (true);