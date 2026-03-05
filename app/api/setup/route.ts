import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/admin-supabase";

export async function GET() {
  // Check which tables exist
  const results: Record<string, string> = {};
  for (const table of ["clientes-cursor", "usuarios-cursor", "sessions-cursor", "custos-ia-cursor"]) {
    const { error } = await adminSupabase.from(table).select("id").limit(1);
    results[table] = error ? `MISSING: ${error.message}` : "OK";
  }

  const allOk = Object.values(results).every((v) => v === "OK");

  const sql = `-- Execute no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/svppxitnpjgvcgiswmmr/sql/new

CREATE TABLE IF NOT EXISTS "clientes-cursor" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  slug text UNIQUE NOT NULL,
  supabase_url text NOT NULL,
  supabase_key text NOT NULL,
  tabela_nome text NOT NULL DEFAULT 'chats',
  openai_key text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "usuarios-cursor" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES "clientes-cursor"(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "sessions-cursor" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES "usuarios-cursor"(id) ON DELETE CASCADE,
  cliente_id uuid REFERENCES "clientes-cursor"(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_admin boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS "custos-ia-cursor" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES "clientes-cursor"(id) ON DELETE CASCADE,
  data date NOT NULL,
  descricao text NOT NULL DEFAULT '',
  valor_usd numeric(12,4) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE "clientes-cursor" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "usuarios-cursor" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "sessions-cursor" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "custos-ia-cursor" DISABLE ROW LEVEL SECURITY;`;

  return NextResponse.json({ status: allOk ? "ready" : "needs_setup", tables: results, sql });
}
