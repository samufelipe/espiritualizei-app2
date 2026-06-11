-- Fecha o vetor de vandalismo no chat global: a policy
-- "Anyone can update chat reactions" USING(true) TO public deixava QUALQUER um
-- (ate deslogado, com a anon key publica do front) reescrever qualquer campo de
-- qualquer mensagem (texto, nome, etc).
--
-- Depois: update so de usuario autenticado e, por grant de coluna, apenas a
-- coluna reactions. Reagir continua funcionando; ninguem reescreve texto/nome
-- de mensagens alheias. SELECT e INSERT ficam inalterados.

drop policy if exists "Anyone can update chat reactions" on public.chat_messages;

create policy "Authenticated can update chat reactions" on public.chat_messages
  for update to authenticated using (true) with check (true);

revoke update on public.chat_messages from anon, authenticated;
grant update (reactions) on public.chat_messages to authenticated;
