-- Execute este SQL se você já rodou o SETUP.sql antes e precisa apenas da tabela de custos.
-- Projeto: https://supabase.com/dashboard/project/svppxitnpjgvcgiswmmr/sql/new

CREATE TABLE IF NOT EXISTS "custos-ia-cursor" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES "clientes-cursor"(id) ON DELETE CASCADE,
  data date NOT NULL,
  descricao text NOT NULL DEFAULT '',
  valor_usd numeric(12,4) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "custos-ia-cursor" DISABLE ROW LEVEL SECURITY;
