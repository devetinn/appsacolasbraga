-- Adiciona colunas turno e funcao em production_entries
-- (aplicadas anteriormente em produção via SQL editor, sem migration correspondente)

ALTER TABLE public.production_entries
  ADD COLUMN IF NOT EXISTS turno  TEXT NOT NULL DEFAULT 'unico' CHECK (turno IN ('unico', 'manha', 'tarde')),
  ADD COLUMN IF NOT EXISTS funcao TEXT NOT NULL DEFAULT 'pintor' CHECK (funcao IN ('pintor', 'ajudante'));
