import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Chat } from "@/types/chat";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();

  // Ranges
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [total, hoje, semana, mes, todos, agendados, comHistorico] =
    await Promise.all([
      supabase.from("chats").select("*", { count: "exact", head: true }),
      supabase
        .from("chats")
        .select("*", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase
        .from("chats")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekStart.toISOString()),
      supabase
        .from("chats")
        .select("*", { count: "exact", head: true })
        .gte("created_at", monthStart),
      supabase
        .from("chats")
        .select("status, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("chats")
        .select("*", { count: "exact", head: true })
        .not("hora_agendamento", "is", null),
      supabase
        .from("chats")
        .select("*", { count: "exact", head: true })
        .not("historico", "is", null),
    ]);

  // Status breakdown
  const statusBreakdown: Record<string, number> = {};
  ((todos.data as Pick<Chat, "status" | "created_at">[]) ?? []).forEach((c) => {
    const s = c.status ?? "Sem status";
    statusBreakdown[s] = (statusBreakdown[s] ?? 0) + 1;
  });

  // Chats por dia (últimos 30 dias)
  const byDay: Record<string, number> = {};
  // Fill all days with 0
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split("T")[0];
    byDay[key] = 0;
  }
  ((todos.data as Pick<Chat, "status" | "created_at">[]) ?? []).forEach((c) => {
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
  });
}
