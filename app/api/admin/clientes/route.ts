import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/admin-supabase";
import { getSession, hashPassword } from "@/lib/auth";
import { createClientSupabase } from "@/lib/client-supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { data: clientes, error } = await adminSupabase
    .from("clientes-cursor")
    .select("id, nome, slug, tabela_nome, ativo, created_at, updated_at, supabase_url")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(clientes ?? []);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await request.json() as {
    nome: string;
    slug: string;
    supabase_url: string;
    supabase_key: string;
    tabela_nome?: string;
    openai_key?: string;
    usuario_nome: string;
    usuario_email: string;
    usuario_senha: string;
  };

  const { nome, slug, supabase_url, supabase_key, tabela_nome = "chats", openai_key, usuario_nome, usuario_email, usuario_senha } = body;

  if (!nome || !slug || !supabase_url || !supabase_key || !usuario_email || !usuario_senha) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }

  // Test connection
  try {
    const clientSupa = createClientSupabase(supabase_url, supabase_key);
    const { error: testError } = await clientSupa.from(tabela_nome).select("id").limit(1);
    if (testError) {
      return NextResponse.json({ error: `Erro ao conectar ao Supabase do cliente: ${testError.message}` }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Não foi possível conectar ao Supabase do cliente" }, { status: 400 });
  }

  // Create client
  const { data: cliente, error: clienteError } = await adminSupabase
    .from("clientes-cursor")
    .insert({ nome, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"), supabase_url, supabase_key, tabela_nome, openai_key: openai_key || null })
    .select()
    .single();

  if (clienteError) return NextResponse.json({ error: clienteError.message }, { status: 500 });

  // Create user
  const senha_hash = await hashPassword(usuario_senha);
  const { error: userError } = await adminSupabase.from("usuarios-cursor").insert({
    cliente_id: (cliente as { id: string }).id,
    email: usuario_email,
    senha_hash,
    nome: usuario_nome || nome,
  });

  if (userError) {
    // Rollback client
    await adminSupabase.from("clientes-cursor").delete().eq("id", (cliente as { id: string }).id);
    return NextResponse.json({ error: userError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, cliente });
}
