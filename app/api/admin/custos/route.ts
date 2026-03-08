import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/admin-supabase";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** POST: Admin insere custo de IA para um cliente */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await request.json() as { slug: string; data: string; descricao: string; valor_usd: number };
  const { slug, data, descricao, valor_usd } = body;

  if (!slug || !data || valor_usd === undefined) {
    return NextResponse.json({ error: "Campos obrigatórios: slug, data, valor_usd" }, { status: 400 });
  }

  const valor = Number(valor_usd);
  if (isNaN(valor) || valor < 0) {
    return NextResponse.json({ error: "valor_usd inválido" }, { status: 400 });
  }

  const { data: cliente, error: clienteErr } = await adminSupabase
    .from("clientes-cursor")
    .select("id")
    .eq("slug", slug)
    .single();

  if (clienteErr || !cliente) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
  }

  const { data: custo, error } = await adminSupabase
    .from("custos-ia-cursor")
    .insert({
      cliente_id: (cliente as { id: string }).id,
      data: data.split("T")[0],
      descricao: (descricao ?? "").trim(),
      valor_usd: valor,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, custo });
}

/** DELETE: Admin exclui um custo de IA pelo id */
export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const { error } = await adminSupabase
    .from("custos-ia-cursor")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
