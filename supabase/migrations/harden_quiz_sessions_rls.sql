-- Endurecimento de seguranca da tabela quiz_sessions.
--
-- Antes: anon_select_quiz USING(true) deixava qualquer portador da anon key
-- ler e-mail, nome, respostas e plano de TODOS os compradores; anon_insert_quiz
-- permitia injetar leads falsos (vetor de spam de e-mails de recuperacao).
--
-- Depois: leitura por e-mail so autenticada (a propria linha) e toda leitura
-- por id/stripe_session_id passa pela edge function get-quiz-session (service
-- role). Insercao legitima via save-quiz-session (service role).

-- Leitura autenticada da propria sessao (aba "Meus Materiais").
create policy quiz_select_own_email on public.quiz_sessions
  for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Remove a leitura anonima ampla (vazamento de PII).
drop policy if exists anon_select_quiz on public.quiz_sessions;

-- Remove a insercao anonima aberta (vetor de spam).
drop policy if exists anon_insert_quiz on public.quiz_sessions;
