-- =============================================
-- Sacolas Braga — Migration Inicial
-- =============================================

-- Perfil dos colaboradores (complemento ao auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL CHECK (funcao IN ('pintor', 'ajudante', 'admin')),
  pix_key TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quinzenas de pagamento
CREATE TABLE public.pay_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_pagamento DATE NOT NULL,
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada')),
  fechado_por UUID REFERENCES public.users(id),
  fechado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de valores por função (com histórico)
CREATE TABLE public.payment_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao TEXT NOT NULL CHECK (funcao IN ('pintor', 'ajudante')),
  valor_unitario NUMERIC(10, 4) NOT NULL,
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE, -- NULL = vigente
  criado_por UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lançamentos de produção diária
CREATE TABLE public.production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quinzena_id UUID REFERENCES public.pay_periods(id),
  colaborador_id UUID REFERENCES public.users(id),
  parceiro_id UUID REFERENCES public.users(id),
  data_producao DATE NOT NULL,
  marca TEXT NOT NULL,
  tamanho TEXT NOT NULL,
  cores INT NOT NULL DEFAULT 1,
  quantidade INT NOT NULL CHECK (quantidade > 0),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'divergente')),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pagamentos calculados ao fechar quinzena
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quinzena_id UUID REFERENCES public.pay_periods(id),
  colaborador_id UUID REFERENCES public.users(id),
  total_unidades INT NOT NULL,
  valor_unitario NUMERIC(10, 4) NOT NULL,
  valor_total NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  pago_em TIMESTAMPTZ,
  pago_por UUID REFERENCES public.users(id),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Log de auditoria
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES public.users(id),
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_entries_quinzena    ON public.production_entries(quinzena_id);
CREATE INDEX idx_entries_colaborador ON public.production_entries(colaborador_id);
CREATE INDEX idx_entries_parceiro    ON public.production_entries(parceiro_id);
CREATE INDEX idx_entries_data        ON public.production_entries(data_producao);
CREATE INDEX idx_entries_status      ON public.production_entries(status);
CREATE INDEX idx_payouts_quinzena    ON public.payouts(quinzena_id);
CREATE INDEX idx_payouts_colaborador ON public.payouts(colaborador_id);

-- =============================================
-- FUNÇÃO AUXILIAR: is_admin()
-- Security definer: executa com privilégios do dono,
-- evitando recursão nas políticas RLS que verificam a
-- própria tabela users.
-- =============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND funcao = 'admin' AND ativo = TRUE
  );
$$;

-- Apenas usuários autenticados podem chamar is_admin()
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pay_periods       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_rates     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs        ENABLE ROW LEVEL SECURITY;

-- ── users ──────────────────────────────────────────────────────
CREATE POLICY "users: usuario ve proprio perfil"
  ON public.users FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "users: admin acesso total"
  ON public.users FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── pay_periods ────────────────────────────────────────────────
CREATE POLICY "pay_periods: autenticados leem"
  ON public.pay_periods FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "pay_periods: admin escreve"
  ON public.pay_periods FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── payment_rates ──────────────────────────────────────────────
CREATE POLICY "payment_rates: autenticados leem"
  ON public.payment_rates FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "payment_rates: admin escreve"
  ON public.payment_rates FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── production_entries ─────────────────────────────────────────
-- Colaborador vê seus registros e os do parceiro (para conferência)
CREATE POLICY "production_entries: colaborador le"
  ON public.production_entries FOR SELECT TO authenticated
  USING (auth.uid() = colaborador_id OR auth.uid() = parceiro_id);

CREATE POLICY "production_entries: colaborador insere para si"
  ON public.production_entries FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = colaborador_id);

CREATE POLICY "production_entries: admin acesso total"
  ON public.production_entries FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── payouts ────────────────────────────────────────────────────
CREATE POLICY "payouts: admin acesso total"
  ON public.payouts FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── audit_logs ─────────────────────────────────────────────────
CREATE POLICY "audit_logs: admin acesso total"
  ON public.audit_logs FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================
-- GRANTS — expor tabelas na Data API
-- =============================================
GRANT SELECT                    ON public.users              TO authenticated;
GRANT SELECT                    ON public.pay_periods        TO authenticated;
GRANT SELECT                    ON public.payment_rates      TO authenticated;
GRANT SELECT, INSERT, UPDATE    ON public.production_entries TO authenticated;
GRANT SELECT                    ON public.payouts            TO authenticated;
-- payouts INSERT/UPDATE e audit_logs gerenciados pelo service_role nas API routes

-- =============================================
-- TRIGGER: sincronizar updated_at em production_entries
-- =============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_production_entries_updated_at
  BEFORE UPDATE ON public.production_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
