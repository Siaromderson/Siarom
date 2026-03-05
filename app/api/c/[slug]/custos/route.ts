import { NextResponse } from "next/server";
import { getSession, getClienteBySlug } from "@/lib/auth";
import { adminSupabase } from "@/lib/admin-supabase";

export const dynamic = "force-dynamic";

/** GET: Retorna os custos manuais de IA do cliente (somente leitura para cliente) */
export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.isAdmin && session.clienteSlug !== params.slug) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const cliente = await getClienteBySlug(params.slug);
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

  const { data, error } = await adminSupabase
    .from("custos-ia-cursor")
    .select("id, data, descricao, valor_usd, created_at")
    .eq("cliente_id", cliente.id)
    .order("data", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ custos: data ?? [] });
}
