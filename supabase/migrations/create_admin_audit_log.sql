-- Admin audit log: tracks all destructive or sensitive admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action      text        NOT NULL,
  target_id   text,
  details     jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Only service_role (Edge Functions) can insert; no public access
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_only" ON admin_audit_log
  USING (false)
  WITH CHECK (false);

-- Fast lookups by action type and time
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx     ON admin_audit_log (action);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log (created_at DESC);