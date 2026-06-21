-- Habilita a auto-correção de função pelo colaborador em lançamentos travados.
--
-- Contexto: a auditoria de função marca o par como 'divergente' quando os dois
-- colaboradores anotam a mesma função (deve ser um pintor + um ajudante). Para
-- permitir que o próprio colaborador corrija a função e o par seja re-auditado,
-- o RLS precisa autorizar o UPDATE de linhas 'divergente' (antes só 'pendente').
--
-- A restrição de "só a função pode mudar" é aplicada na camada de API
-- (app/api/producao/[id]/route.ts); aqui o RLS apenas libera a linha.

DROP POLICY IF EXISTS "production_entries: colaborador atualiza proprio pendente" ON public.production_entries;

CREATE POLICY "production_entries: colaborador atualiza proprio editavel"
  ON public.production_entries FOR UPDATE TO authenticated
  USING (
    (auth.uid() = colaborador_id AND status IN ('pendente', 'divergente'))
    OR (auth.uid() = parceiro_id AND status IN ('pendente', 'divergente'))
  )
  WITH CHECK (
    auth.uid() = colaborador_id OR auth.uid() = parceiro_id
  );
