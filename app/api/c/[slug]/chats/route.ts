import { NextResponse } from "next/server";
import { getSession, getClienteBySlug } from "@/lib/auth";
import { createClientSupabase } from "@/lib/client-supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.isAdmin && session.clienteSlug !== params.slug) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const cliente = await getClienteBySlug(params.slug);
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

  const supa = createClientSupabase(cliente.supabase_url, cliente.supabase_key);
  const tabela = cliente.tabela_nome;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "100");
  const offset = (page - 1) * limit;

  let query = supa.from(tabela).select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) query = query.or(`nome.ilike.%${search}%,telefone.ilike.%${search}%`);
  if (status) query = query.eq("status", status);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data, count, page, limit });
}
