-- Tracks sazonais gerados por IA — fonte de verdade para o conteúdo da Biblioteca
-- Leitura pública (anon), escrita apenas via service_role (Edge Function ai-proxy)

CREATE TABLE IF NOT EXISTS knowledge_seasonal_items (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id      TEXT        NOT NULL,
  track_title   TEXT        NOT NULL,
  season        TEXT        NOT NULL CHECK (season IN ('easter','lent','advent','christmas','ordinary')),
  year          INT         NOT NULL,
  item_order    INT         NOT NULL DEFAULT 0,
  item_id       TEXT        NOT NULL,
  title         TEXT        NOT NULL,
  description   TEXT        NOT NULL,
  content       TEXT        NOT NULL,
  category      TEXT        NOT NULL CHECK (category IN ('doctrine','prayer','mass')),
  duration      TEXT        NOT NULL DEFAULT '10 min',
  icon_name     TEXT        NOT NULL DEFAULT 'BookOpen',
  video_title   TEXT,
  video_url     TEXT,
  video_channel TEXT,
  music_title   TEXT,
  music_url     TEXT,
  music_artist  TEXT,
  is_active     BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (track_id, item_id)
);

COMMENT ON TABLE knowledge_seasonal_items IS
  'Itens de formação espiritual gerados por IA, organizados por tempo litúrgico e ano.';

COMMENT ON COLUMN knowledge_seasonal_items.track_id IS
  'Identificador do track — ex: track-easter-2026';

COMMENT ON COLUMN knowledge_seasonal_items.icon_name IS
  'Nome do ícone lucide-react (string) — mapeado para componente no frontend';

-- Índice para a query mais comum: buscar itens ativos por season + year
CREATE INDEX IF NOT EXISTS idx_knowledge_seasonal_season_year
  ON knowledge_seasonal_items (season, year, is_active, item_order);

-- RLS: SELECT público (is_active = true)
-- INSERT/UPDATE/DELETE: service_role bypassa RLS — sem política necessária para escrita admin
ALTER TABLE knowledge_seasonal_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public select active items"
  ON knowledge_seasonal_items
  FOR SELECT
  USING (is_active = TRUE);