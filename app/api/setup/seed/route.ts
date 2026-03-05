import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/admin-supabase";
import { getSession, hashPassword } from "@/lib/auth";

/**
 * Cadastra o cliente Neurocol usando as credenciais do .env (Supabase legado).
 * Requer login como admin.
 */
export async function POST() {
  const session = await getSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "Requer login como administrador" }, { status: 403 });
  }

  const neurocolUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const neurocolKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!neurocolUrl || !neurocolKey) {
    return NextResponse.json(
      { error: "Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local" },
      { status: 400 }
    );
  }

  // Verificar se Neurocol já existe
  const { data: existente } = await adminSupabase
    .from("clientes-cursor")
    .select("id")
    .eq("slug", "neurocol")
    .single();

  if (existente) {
    return NextResponse.json({ ok: true, message: "Neurocol já está cadastrada" });
  }

  // Testar conexão com o Supabase da Neurocol
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(neurocolUrl, neurocolKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: testError } = await client.from("chats").select("id").limit(1);
  if (testError) {
    return NextResponse.json(
      { error: `Não foi possível conectar ao Supabase da Neurocol. Verifique a URL e a chave. (${testError.message})` },
      { status: 400 }
    );
  }

  // Inserir cliente Neurocol
  const { data: cliente, error: clienteError } = await adminSupabase
    .from("clientes-cursor")
    .insert({
      nome: "Neurocol",
      slug: "neurocol",
      supabase_url: neurocolUrl,
      supabase_key: neurocolKey,
      tabela_nome: "chats",
      openai_key: process.env.OPENAI_API_KEY || null,
      ativo: true,
    })
    .select()
    .single();

  if (clienteError) {
    return NextResponse.json({ error: `Erro ao cadastrar cliente: ${clienteError.message}` }, { status: 500 });
  }

  // Criar usuário para login como cliente Neurocol
  const email = process.env.NEUROCOL_USER_EMAIL || "admin@neurocol.com";
  const senha = process.env.NEUROCOL_USER_PASSWORD || "Neurocol123";
  const senha_hash = await hashPassword(senha);

  const { error: userError } = await adminSupabase.from("usuarios-cursor").insert({
    cliente_id: (cliente as { id: string }).id,
    email: email.trim().toLowerCase(),
    senha_hash,
    nome: "Neurocol Admin",
  });

  if (userError) {
    await adminSupabase.from("clientes-cursor").delete().eq("id", (cliente as { id: string }).id);
    return NextResponse.json({ error: `Erro ao criar usuário: ${userError.message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Neurocol cadastrada com sucesso",
    cliente: { nome: "Neurocol", slug: "neurocol" },
    loginCliente: { email, senha },
  });
}
