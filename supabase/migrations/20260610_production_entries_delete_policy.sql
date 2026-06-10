-- Corrige bug: colaborador exclui um lançamento e ele "volta" depois.
--
-- Causa raiz: a tabela production_entries só tinha GRANT SELECT/INSERT/UPDATE
-- para authenticated, e a única policy de RLS que cobre DELETE é
-- "production_entries: admin acesso total" (FOR ALL, exige is_admin()).
-- Para um colaborador comum, o DELETE não tem nenhuma policy que permita -> 0
-- linhas afetadas, sem erro. A API responde sucesso, a UI remove o item da
-- lista local, mas a linha continua no banco e reaparece ao recarregar.

GRANT DELETE ON public.production_entries TO authenticated;

DROP POLICY IF EXISTS "production_entries: colaborador exclui proprio pendente" ON public.production_entries;

CREATE POLICY "production_entries: colaborador exclui proprio pendente"
  ON public.production_entries FOR DELETE TO authenticated
  USING (auth.uid() = colaborador_id AND status = 'pendente');
