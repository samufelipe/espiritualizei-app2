-- Tabela de e-mails de recuperacao de carrinho abandonado
CREATE TABLE IF NOT EXISTS quiz_recovery_emails (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_session_id  UUID        NOT NULL,
  email            TEXT        NOT NULL,
  name             TEXT        NOT NULL DEFAULT '',
  challenge        TEXT,
  sequence_step    INT         NOT NULL CHECK (sequence_step BETWEEN 1 AND 3),
  scheduled_at     TIMESTAMPTZ NOT NULL,
  sent_at          TIMESTAMPTZ,
  status           TEXT        NOT NULL DEFAULT 'pending',
  cancelled_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (quiz_session_id, sequence_step)
);

CREATE INDEX IF NOT EXISTS idx_recovery_pending
  ON quiz_recovery_emails (scheduled_at, status)
  WHERE status = 'pending';

ALTER TABLE quiz_recovery_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_all_recovery"
  ON quiz_recovery_emails FOR ALL TO service_role
  USING (true) WITH CHECK (true);
