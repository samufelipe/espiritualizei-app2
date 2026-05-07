-- Corrige FK constraints de NO ACTION para CASCADE/SET NULL
-- Problema: admin não conseguia deletar usuários devido a FK violations
-- nas tabelas filhas que referenciam profiles(id)

ALTER TABLE journal_entries
  DROP CONSTRAINT journal_entries_user_id_fkey,
  ADD CONSTRAINT journal_entries_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE notifications
  DROP CONSTRAINT notifications_user_id_fkey,
  ADD CONSTRAINT notifications_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- actor_id: SET NULL — notificacao fica, mas referencia ao autor some
ALTER TABLE notifications
  DROP CONSTRAINT notifications_actor_id_fkey,
  ADD CONSTRAINT notifications_actor_id_fkey
    FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE payment_logs
  DROP CONSTRAINT payment_logs_user_id_fkey,
  ADD CONSTRAINT payment_logs_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE prayer_intentions
  DROP CONSTRAINT prayer_intentions_user_id_fkey,
  ADD CONSTRAINT prayer_intentions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE prayer_interactions
  DROP CONSTRAINT prayer_interactions_user_id_fkey,
  ADD CONSTRAINT prayer_interactions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE user_routines
  DROP CONSTRAINT user_routines_user_id_fkey,
  ADD CONSTRAINT user_routines_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Rollback:
-- ALTER TABLE journal_entries   DROP CONSTRAINT journal_entries_user_id_fkey,   ADD CONSTRAINT journal_entries_user_id_fkey   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE NO ACTION;
-- ALTER TABLE notifications     DROP CONSTRAINT notifications_user_id_fkey,     ADD CONSTRAINT notifications_user_id_fkey     FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE NO ACTION;
-- ALTER TABLE notifications     DROP CONSTRAINT notifications_actor_id_fkey,    ADD CONSTRAINT notifications_actor_id_fkey    FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE NO ACTION;
-- ALTER TABLE payment_logs      DROP CONSTRAINT payment_logs_user_id_fkey,      ADD CONSTRAINT payment_logs_user_id_fkey      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE NO ACTION;
-- ALTER TABLE prayer_intentions  DROP CONSTRAINT prayer_intentions_user_id_fkey, ADD CONSTRAINT prayer_intentions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE NO ACTION;
-- ALTER TABLE prayer_interactions DROP CONSTRAINT prayer_interactions_user_id_fkey, ADD CONSTRAINT prayer_interactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE NO ACTION;
-- ALTER TABLE user_routines     DROP CONSTRAINT user_routines_user_id_fkey,     ADD CONSTRAINT user_routines_user_id_fkey     FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE NO ACTION;