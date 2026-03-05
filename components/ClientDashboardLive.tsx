"use client";

import { useEffect, useState, useCallback } from "react";
import { StatsCard } from "@/components/StatsCard";
import { StatusBadge } from "@/components/StatusBadge";
import { BarChart } from "@/components/BarChart";
import { PrintButton } from "@/components/PrintButton";
import { RefreshButton } from "@/components/RefreshButton";
import { Users, CalendarCheck, Clock, MessageSquare, Activity, Calendar, Loader2 } from "lucide-react";
import type { Chat } from "@/types/chat";

interface Stats {
  total: number;
  hoje: number;
  semana: number;
  mes: number;
  statusBreakdown: Record<string, number>;
  agendados: number;
  comHistorico: number;
  porDia: Array<{ day: string; count: number }>;
  recentChats: Chat[];
}

export function ClientDashboardLive({ slug }: { slug: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`/api/c/${slug}/stats`);
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        Carregando dashboard...
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8 text-gray-500">Erro ao carregar dados</div>;
  }

  const { total, hoje, semana, mes, statusBreakdown, agendados, comHistorico, porDia, recentChats } = stats;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
          <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Atualização automática a cada 5s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={fetchStats} />
          <PrintButton />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Total de leads" value={total} subtitle="todos os tempos" icon={<Users size={18} />} color="indigo" />
        <StatsCard title="Leads hoje" value={hoje} subtitle="novos hoje" icon={<Clock size={18} />} color="blue" />
        <StatsCard title="Esta semana" value={semana} subtitle="leads na semana" icon={<Calendar size={18} />} color="violet" />
        <StatsCard title="Este mês" value={mes} subtitle="leads no mês" icon={<Activity size={18} />} color="emerald" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        <StatsCard title="Agendamentos" value={agendados} subtitle="com horário marcado" icon={<CalendarCheck size={18} />} color="amber" />
        <StatsCard title="Com histórico" value={comHistorico} subtitle="conversas registradas" icon={<MessageSquare size={18} />} color="rose" />
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Leads por dia (últimos 30 dias)</h2>
        <BarChart data={porDia} />
      </section>

      {Object.keys(statusBreakdown).length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Status dos leads (últimos 30 dias)</h2>
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
