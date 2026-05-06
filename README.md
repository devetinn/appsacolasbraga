# Sacolas Braga — Sistema de Gestão de Produção

Aplicativo web mobile-first para digitalização do controle de produção de sacolas personalizadas e automação de pagamentos quinzenais.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Deploy | Vercel + GitHub |

## Configuração Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves do Supabase

# 3. Criar tabelas no Supabase
# Execute o arquivo docs/database/migrations.sql no SQL Editor do Supabase

# 4. Iniciar servidor de desenvolvimento
npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Verificação de código |
| `npm run typecheck` | Verificação de tipos TypeScript |

## Estrutura do Projeto

```
app/
├── login/              # Tela de login (colaborador e admin)
├── colaborador/        # Área do colaborador
│   ├── registrar/      # Formulário de lançamento
│   └── historico/      # Histórico da quinzena
├── admin/              # Área do admin
│   ├── lancamentos/    # Tabela geral de lançamentos
│   ├── quinzena/       # Gestão de quinzenas
│   ├── pagamentos/     # Tela de pagamentos
│   └── configuracoes/  # Valores e colaboradores
└── api/                # API routes

lib/
├── quinzena.ts         # Lógica de cálculo de quinzenas
├── calculos.ts         # Cálculo de pagamentos
├── validacoes.ts       # Validação cruzada pintor-ajudante
└── supabase/           # Clients Supabase (browser + server)
```

## Variáveis de Ambiente

Veja `.env.example` para as variáveis necessárias.
Configure no Vercel em Settings → Environment Variables.
