import { createClient } from "@supabase/supabase-js";

const ADMIN_URL = process.env.ADMIN_SUPABASE_URL!;
const ADMIN_KEY = process.env.ADMIN_SUPABASE_KEY!;

export const adminSupabase = createClient(ADMIN_URL, ADMIN_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export interface Cliente {
  id: string;
  nome: string;
  slug: string;
  supabase_url: string;
  supabase_key: string;
  tabela_nome: string;
  openai_key: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  cliente_id: string;
  email: string;
  senha_hash: string;
  nome: string;
  ativo: boolean;
  created_at: string;
}

export interface Session {
  id: string;
  usuario_id: string | null;
  cliente_id: string | null;
  token: string;
  expires_at: string;
  created_at: string;
  is_admin: boolean;
}
