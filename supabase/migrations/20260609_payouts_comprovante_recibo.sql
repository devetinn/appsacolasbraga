-- =============================================
-- Migration: comprovante, recibo e bucket de storage
-- =============================================

-- 1. Novas colunas em payouts
ALTER TABLE public.payouts
  ADD COLUMN IF NOT EXISTS comprovante_url TEXT,
  ADD COLUMN IF NOT EXISTS recibo_url      TEXT,
  ADD COLUMN IF NOT EXISTS numero_recibo   INTEGER GENERATED ALWAYS AS IDENTITY;

-- 2. Grant UPDATE em payouts para autenticados (admin via RLS)
GRANT UPDATE ON public.payouts TO authenticated;

-- 3. Bucket de armazenamento para comprovantes e recibos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documentos-pagamentos',
  'documentos-pagamentos',
  false,
  5242880,
  ARRAY['image/jpeg','image/png','image/webp','application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- 4. RLS para Storage (apenas admin)
CREATE POLICY "storage: admin upload documentos-pagamentos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documentos-pagamentos' AND public.is_admin());

CREATE POLICY "storage: admin seleciona documentos-pagamentos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documentos-pagamentos' AND public.is_admin());

CREATE POLICY "storage: admin atualiza documentos-pagamentos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documentos-pagamentos' AND public.is_admin());

CREATE POLICY "storage: admin deleta documentos-pagamentos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documentos-pagamentos' AND public.is_admin());
