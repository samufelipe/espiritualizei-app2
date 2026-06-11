-- Pos-compra: rastreio do e-mail instantaneo + idempotencia do webhook.

-- Flag dedicada para o e-mail INSTANTANEO de pos-compra (nao colide com
-- quiz_sessions.email_sent, que pertence ao e-mail "plano pronto") e e segura
-- sob retries do Stripe.
alter table public.quiz_sessions
  add column if not exists purchase_email_sent boolean not null default false;

-- Quando o comprador criou a conta no app (analytics). Nullable.
alter table public.quiz_sessions
  add column if not exists account_created_at timestamptz;

-- Endurece a idempotencia do webhook: retries concorrentes do Stripe nao passam
-- os dois pelo check-then-insert. Indice parcial tolera linhas legadas com NULL.
create unique index if not exists payment_logs_event_id_uniq
  on public.payment_logs (event_id) where event_id is not null;
