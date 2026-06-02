-- Adicionar flag de controle de drip em quiz_sessions
ALTER TABLE quiz_sessions ADD COLUMN IF NOT EXISTS drip_scheduled BOOLEAN DEFAULT FALSE;

-- Tabela de agendamento do drip de 21 dias
CREATE TABLE IF NOT EXISTS quiz_email_drip (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_session_id   UUID        NOT NULL,
  email             TEXT        NOT NULL,
  name              TEXT        NOT NULL DEFAULT '',
  stripe_session_id TEXT        NOT NULL,
  day_number        INT         NOT NULL CHECK (day_number BETWEEN 1 AND 21),
  week_theme        TEXT,
  intention         TEXT,
  challenge         TEXT,
  scheduled_at      TIMESTAMPTZ NOT NULL,
  sent_at           TIMESTAMPTZ,
  status            TEXT        NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (quiz_session_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_drip_pending
  ON quiz_email_drip (scheduled_at, status)
  WHERE status = 'pending';

ALTER TABLE quiz_email_drip ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_drip"
  ON quiz_email_drip FOR ALL TO service_role
  USING (true) WITH CHECK (true);
