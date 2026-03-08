"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, DollarSign, Trash2 } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import { BarChart } from "@/components/BarChart";

const REAL_TO_USD = 5.7;

interface CustoEntry {
  id: string;
  data: string;
  descricao: string;
  valor_usd: number;
  created_at?: string;
}

export function AdminCustosForm({ slug }: { slug: string }) {
  const [custos, setCustos] = useState<CustoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ data: new Date().toISOString().split("T")[0], descricao: "", valor_usd: "" });

  const fetchCustos = useCallback(async () => {
    try {
      const res = await fetch(`/api/c/${slug}/custos`);
      const data = await res.json() as { custos?: CustoEntry[] };
      setCustos((data.custos ?? []).map((c: CustoEntry) => ({
        ...c,
        data: typeof c.data === "string" ? c.data.split("T")[0] : c.data,
      })));
    } catch {
      setCustos([]);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchCustos();
    const interval = setInterval(fetchCustos, 5000);
    return () => clearInterval(interval);
  }, [fetchCustos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valor = parseFloat(form.valor_usd);
    if (isNaN(valor) || valor <= 0) {
      setError("Informe um valor válido");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/custos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, data: form.data, descricao: form.descricao, valor_usd: valor }),
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ data: new Date().toISOString().split("T")[0], descricao: "", valor_usd: "" });
        setShowForm(false);
        await fetchCustos();
      } else {
        setError(data.error ?? "Erro ao salvar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este custo?")) return;
    try {
      const res = await fetch(`/api/admin/custos?id=${id}`, { method: "DELETE" });
      if (res.ok) await fetchCustos();
      else {
        const data = await res.json();
        alert(data.error ?? "Erro ao excluir");
      }
    } catch {
      alert("Erro de conexão");
    }
  };

  const totalUSD = custos.reduce((a, c) => a + Number(c.valor_usd), 0);
  const totalBRL = totalUSD * REAL_TO_USD;

  const manualMonthlyData = custos.reduce<Record<string, number>>((acc, e) => {
    const month = e.data.substring(0, 7);
    acc[month] = (acc[month] ?? 0) + Number(e.valor_usd);
    return acc;
  }, {});
  const manualChartData = Object.entries(manualMonthlyData)
    .map(([month, count]) => ({ day: month, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex justify-center gap-2 text-gray-400">
        <Loader2 size={18} className="animate-spin" />
        Carregando custos...
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-600" />
            Custos de IA
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Controle os gastos com IA do cliente. O cliente visualiza em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-500">Total USD</p>
            <p className="text-lg font-bold text-gray-900">${totalUSD.toFixed(2)}</p>
            <p className="text-xs text-gray-500">R$ {totalBRL.toFixed(2)}</p>
          </div>
          <RefreshButton onRefresh={fetchCustos} />
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} />
            Inserir custo
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm((p) => ({ ...p, data: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Descrição</label>
              <input
                type="text"
                value={form.descricao}
                onChange={(e) => setForm((p) => ({ ...p, descricao: e.target.value }))}
                placeholder="Ex: GPT-4o, API calls..."
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Valor (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor_usd}
                onChange={(e) => setForm((p) => ({ ...p, valor_usd: e.target.value }))}
                placeholder="0.00"
                className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                required
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(null); }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs text-white font-medium hover:bg-indigo-700 disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : null}
              Salvar
            </button>
          </div>
        </form>
      )}

      {manualChartData.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Custos por mês</p>
          <BarChart data={manualChartData} valueLabel="USD" xFormat="month" />
        </div>
      )}

      {custos.length === 0 ? (
        <p className="text-center py-6 text-gray-400 text-sm">Nenhum custo cadastrado. Insira o primeiro.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-400 uppercase">Descrição</th>
                <th className="py-2 px-3 text-right text-xs font-semibold text-gray-400 uppercase">USD</th>
                <th className="py-2 px-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {custos.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-600">{new Date(c.data + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                  <td className="py-2 px-3 text-gray-700">{c.descricao || "—"}</td>
                  <td className="py-2 px-3 text-right font-medium text-gray-900">${Number(c.valor_usd).toFixed(2)}</td>
                  <td className="py-2 px-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
