import { NextResponse } from "next/server";
import { getSession, getClienteBySlug } from "@/lib/auth";
import { createClientSupabase } from "@/lib/client-supabase";
import type { Chat } from "@/types/chat";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.isAdmin && session.clienteSlug !== params.slug) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const cliente = await getClienteBySlug(params.slug);
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

  const supa = createClientSupabase(cliente.supabase_url, cliente.supabase_key);
  const tabela = cliente.tabela_nome;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [total, hoje, semana, mes, allRecent, agendados, comHistorico, recentChats] =
    await Promise.all([
      supa.from(tabela).select("*", { count: "exact", head: true }),
      supa.from(tabela).select("*", { count: "exact", head: true }).gte("created_at", todayStart),
      supa.from(tabela).select("*", { count: "exact", head: true }).gte("created_at", weekStart.toISOString()),
      supa.from(tabela).select("*", { count: "exact", head: true }).gte("created_at", monthStart),
      supa.from(tabela).select("status, created_at").gte("created_at", thirtyDaysAgo.toISOString()),
      supa.from(tabela).select("*", { count: "exact", head: true }).not("hora_agendamento", "is", null),
      supa.from(tabela).select("*", { count: "exact", head: true }).not("historico", "is", null),
      supa.from(tabela).select("*").order("created_at", { ascending: false }).limit(8),
    ]);

  const statusBreakdown: Record<string, number> = {};
  ((allRecent.data ?? []) as Pick<Chat, "status" | "created_at">[]).forEach((c) => {
    const s = c.status ?? "Sem status";
    statusBreakdown[s] = (statusBreakdown[s] ?? 0) + 1;
  });

  const byDay: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    byDay[d.toISOString().split("T")[0]] = 0;
  }
  ((allRecent.data ?? []) as Pick<Chat, "status" | "created_at">[]).forEach((c) => {
    const day = c.created_at.split("T")[0];
    if (byDay[day] !== undefined) byDay[day]++;
  });
  const porDia = Object.entries(byDay).map(([day, count]) => ({ day, count }));

  return NextResponse.json({
    total: total.count ?? 0,
    hoje: hoje.count ?? 0,
    semana: semana.count ?? 0,
    mes: mes.count ?? 0,
    statusBreakdown,
    agendados: agendados.count ?? 0,
    comHistorico: comHistorico.count ?? 0,
    porDia,
    recentChats: recentChats.data ?? [],
  });
}
