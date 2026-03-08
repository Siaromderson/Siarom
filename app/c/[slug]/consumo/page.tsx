"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, DollarSign, TrendingUp, Zap } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { BarChart } from "@/components/BarChart";
import { StatsCard } from "@/components/StatsCard";

interface CustoEntry {
  id: string;
  data: string;
  descricao: string;
  valor_usd: number;
}

interface OpenAIData {
  totalUSD: number;
  totalBRL: number;
  dailyCosts: Array<{ day: string; count: number }>;
  lineItems: Array<{ date: string; amount_usd: number; description: string }>;
  needsAdminKey?: boolean;
  error?: string;
}

const REAL_TO_USD = 5.7;

export default function ConsumoPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<OpenAIData | null>(null);
  const [custos, setCustos] = useState<CustoEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [openaiRes, custosRes] = await Promise.all([
      fetch(`/api/c/${slug}/openai`),
      fetch(`/api/c/${slug}/custos`),
    ]);
    const openaiData = (await openaiRes.json()) as OpenAIData;
    const custosData = (await custosRes.json()) as { custos?: CustoEntry[] };
    setData(openaiData);
    setCustos((custosData.custos ?? []).map((c) => ({
      ...c,
      data: typeof c.data === "string" ? c.data.split("T")[0] : c.data,
    })));
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const manualTotalUSD = custos.reduce((a, e) => a + Number(e.valor_usd), 0);
  const manualTotalBRL = manualTotalUSD * REAL_TO_USD;

  const apiTotalUSD = data?.totalUSD ?? 0;
  const apiTotalBRL = data?.totalBRL ?? apiTotalUSD * REAL_TO_USD;
  const totalUSD = apiTotalUSD + manualTotalUSD;
  const totalBRL = apiTotalBRL + manualTotalBRL;

  const manualDailyData = custos.reduce<Record<string, number>>((acc, e) => {
    acc[e.data] = (acc[e.data] ?? 0) + Number(e.valor_usd);
    return acc;
  }, {});
  const manualChartData = Object.entries(manualDailyData).map(([day, count]) => ({ day, count }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span>Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consumo de IA</h1>
          <p className="text-sm text-gray-500 mt-0.5">Visualize os gastos com IA em tempo real</p>
        </div>
        <RefreshButton onRefresh={fetchData} />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsCard title="Total USD" value={`$${totalUSD.toFixed(2)}`} subtitle="gasto total" icon={<DollarSign size={18} />} color="emerald" />
        <StatsCard title="Total BRL" value={`R$${totalBRL.toFixed(2)}`} subtitle={`câmbio ~R$${REAL_TO_USD}`} icon={<TrendingUp size={18} />} color="blue" />
        <StatsCard title="Lançamentos" value={custos.length} subtitle="custos cadastrados" icon={<Zap size={18} />} color="violet" />
      </div>

      {data && !data.error && !data.needsAdminKey && data.lineItems?.length > 0 && (
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Dados OpenAI (via API)</h2>
          <BarChart data={data.dailyCosts ?? []} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-400 uppercase">Descrição</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-gray-400 uppercase">Valor USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.lineItems.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-sm text-gray-600">{item.date}</td>
                    <td className="py-2.5 px-3 text-sm text-gray-700">{item.description}</td>
                    <td className="py-2.5 px-3 text-sm text-right font-medium text-gray-900">${item.amount_usd.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Custos cadastrados</h2>
          <p className="text-xs text-gray-500 mt-0.5">Inseridos pelo administrador · Atualização automática a cada 5s</p>
        </div>

        {manualChartData.length > 0 && <BarChart data={manualChartData} valueLabel="USD" />}

        {custos.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nenhum custo cadastrado. Entre em contato com o administrador.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
                  <th className="py-2 px-3 text-left text-xs font-semibold text-gray-400 uppercase">Descrição</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-gray-400 uppercase">USD</th>
                  <th className="py-2 px-3 text-right text-xs font-semibold text-gray-400 uppercase">BRL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {custos.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-3 text-sm text-gray-600">{new Date(entry.data + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                    <td className="py-2.5 px-3 text-sm text-gray-700">{entry.descricao || "—"}</td>
                    <td className="py-2.5 px-3 text-sm text-right font-medium text-gray-900">${Number(entry.valor_usd).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-sm text-right text-gray-600">R${(Number(entry.valor_usd) * REAL_TO_USD).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td colSpan={2} className="px-3 py-2.5 text-sm font-semibold text-gray-700">Total</td>
                  <td className="px-3 py-2.5 text-sm text-right font-bold text-gray-900">${manualTotalUSD.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-sm text-right font-bold text-gray-900">R${manualTotalBRL.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
