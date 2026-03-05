import { NextResponse } from "next/server";
import { adminSupabase } from "@/lib/admin-supabase";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { data, error } = await adminSupabase
    .from("clientes-cursor")
    .select("*, usuarios-cursor(id, email, nome, ativo)")
    .eq("id", params.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const body = await request.json() as Record<string, unknown>;
  const updates: Record<string, unknown> = {};

  const allowed = ["nome", "supabase_url", "supabase_key", "tabela_nome", "openai_key", "ativo"];
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  updates["updated_at"] = new Date().toISOString();

  const { data, error } = await adminSupabase
    .from("clientes-cursor")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, cliente: data });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

  const { error } = await adminSupabase.from("clientes-cursor").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
