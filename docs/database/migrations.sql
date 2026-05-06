-- =============================================
-- Sacolas Braga — Migrations SQL
-- Execute no Supabase SQL Editor
-- =============================================

-- Colaboradores
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL CHECK (funcao IN ('pintor', 'ajudante', 'admin')),
  pin TEXT,           -- hash bcrypt, apenas colaboradores
  senha_hash TEXT,    -- apenas admin
  pix_key TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quinzenas
CREATE TABLE pay_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  data_pagamento DATE NOT NULL,
  status TEXT DEFAULT 'aberta' CHECK (status IN ('aberta', 'fechada')),
  fechado_por UUID REFERENCES users(id),
  fechado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Valores por função (histórico de tabelas de preço)
CREATE TABLE payment_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  funcao TEXT NOT NULL CHECK (funcao IN ('pintor', 'ajudante')),
  valor_unitario NUMERIC(10, 4) NOT NULL,
  vigencia_inicio DATE NOT NULL,
  vigencia_fim DATE,  -- NULL = vigente
  criado_por UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registros de produção
CREATE TABLE production_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quinzena_id UUID REFERENCES pay_periods(id),
  colaborador_id UUID REFERENCES users(id),
  parceiro_id UUID REFERENCES users(id),
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
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quinzena_id UUID REFERENCES pay_periods(id),
  colaborador_id UUID REFERENCES users(id),
  total_unidades INT NOT NULL,
  valor_unitario NUMERIC(10, 4) NOT NULL,
  valor_total NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago')),
  pago_em TIMESTAMPTZ,
  pago_por UUID REFERENCES users(id),
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES users(id),
  acao TEXT NOT NULL,
  tabela TEXT,
  registro_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_entries_quinzena ON production_entries(quinzena_id);
CREATE INDEX idx_entries_colaborador ON production_entries(colaborador_id);
CREATE INDEX idx_entries_parceiro ON production_entries(parceiro_id);
CREATE INDEX idx_entries_data ON production_entries(data_producao);
CREATE INDEX idx_entries_status ON production_entries(status);
CREATE INDEX idx_payouts_quinzena ON payouts(quinzena_id);
CREATE INDEX idx_payouts_colaborador ON payouts(colaborador_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
ALTER TABLE production_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Colaborador vê apenas seus próprios registros
CREATE POLICY "colaborador_ve_seus_registros"
  ON production_entries FOR SELECT
  USING (auth.uid() = colaborador_id);

-- Colaborador insere apenas para si mesmo
CREATE POLICY "colaborador_insere_para_si"
  ON production_entries FOR INSERT
  WITH CHECK (auth.uid() = colaborador_id);

-- Admin tem acesso total
CREATE POLICY "admin_acesso_total_entries"
  ON production_entries FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND funcao = 'admin'
  ));

CREATE POLICY "admin_acesso_total_payouts"
  ON payouts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND funcao = 'admin'
  ));

CREATE POLICY "admin_acesso_total_users"
  ON users FOR ALL
  USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND funcao = 'admin'
  ));

-- Usuário vê seu próprio perfil
CREATE POLICY "usuario_ve_proprio_perfil"
  ON users FOR SELECT
  USING (auth.uid() = id);
