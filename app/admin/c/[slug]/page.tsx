import { getClienteBySlug } from "@/lib/auth";
import { createClientSupabase } from "@/lib/client-supabase";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart } from "@/components/BarChart";
import { AdminCustosForm } from "@/components/AdminCustosForm";
import { PageRefreshButton } from "@/components/PageRefreshButton";
import Link from "next/link";
import { ArrowLeft, Users, CalendarCheck, Clock, MessageSquare, Activity, Calendar } from "lucide-react";
import type { Chat } from "@/types/chat";

export const dynamic = "force-dynamic";

async function getStats(slug: string) {
  const cliente = await getClienteBySlug(slug);
  if (!cliente) return null;

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

  return {
    total: total.count ?? 0,
    hoje: hoje.count ?? 0,
    semana: semana.count ?? 0,
    mes: mes.count ?? 0,
    statusBreakdown,
    agendados: agendados.count ?? 0,
    comHistorico: comHistorico.count ?? 0,
    porDia,
    recentChats: (recentChats.data ?? []) as Chat[],
    clienteNome: cliente.nome,
  };
}

export default async function AdminClienteDashboard({ params }: { params: { slug: string } }) {
  const stats = await getStats(params.slug);
  if (!stats) return <div className="p-8 text-gray-500">Cliente não encontrado ou erro ao carregar</div>;

  const { total, hoje, semana, mes, statusBreakdown, agendados, comHistorico, porDia, recentChats, clienteNome } = stats;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{clienteNome}</h1>
            <p className="text-sm text-gray-500 mt-0.5">Visualizando como administrador · {params.slug}</p>
          </div>
        </div>
        <PageRefreshButton />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Total de leads" value={total} subtitle="todos os tempos" icon={<Users size={18} />} color="indigo" />
        <StatsCard title="Leads hoje" value={hoje} subtitle="novos hoje" icon={<Clock size={18} />} color="blue" />
        <StatsCard title="Esta semana" value={semana} subtitle="leads na semana" icon={<Calendar size={18} />} color="violet" />
        <StatsCard title="Este mês" value={mes} subtitle="leads no mês" icon={<Activity size={18} />} color="emerald" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatsCard title="Agendamentos" value={agendados} subtitle="com horário marcado" icon={<CalendarCheck size={18} />} color="amber" />
        <StatsCard title="Com histórico" value={comHistorico} subtitle="conversas registradas" icon={<MessageSquare size={18} />} color="rose" />
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Leads por dia (últimos 30 dias)</h2>
        <BarChart data={porDia} />
      </section>

      {Object.keys(statusBreakdown).length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Status dos leads</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(statusBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => (
                <div key={status} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <StatusBadge status={status} />
                  <span className="text-sm font-semibold text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </section>
      )}

      <AdminCustosForm slug={params.slug} />

      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Leads recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Telefone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentChats.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400 text-sm">Nenhum lead encontrado</td></tr>
              ) : (
                recentChats.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{chat.nome ?? "—"}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{chat.telefone ?? "—"}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={chat.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      {new Date(chat.created_at).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
