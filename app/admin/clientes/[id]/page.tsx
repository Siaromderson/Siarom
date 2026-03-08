"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Loader2, Save, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface ClienteData {
  id: string;
  nome: string;
  slug: string;
  supabase_url: string;
  supabase_key: string;
  tabela_nome: string;
  openai_key: string | null;
  ativo: boolean;
}

export default function EditarClientePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState<ClienteData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/clientes/${id}`)
      .then((r) => r.json())
      .then((data: Record<string, unknown>) => {
        // Extrair apenas campos do cliente (excluir usuarios-cursor e objetos aninhados)
        const cliente: ClienteData = {
          id: data.id as string,
          nome: data.nome as string,
          slug: data.slug as string,
          supabase_url: data.supabase_url as string,
          supabase_key: data.supabase_key as string,
          tabela_nome: (data.tabela_nome as string) ?? "chats",
          openai_key: (data.openai_key as string | null) ?? null,
          ativo: (data.ativo as boolean) ?? true,
        };
        setForm(cliente);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => prev ? { ...prev, [field]: e.target.value } : prev);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);

    // Enviar apenas campos permitidos (nunca enviar senhas ou dados sensíveis extras)
    const payload = {
      nome: form.nome,
      supabase_url: form.supabase_url,
      supabase_key: form.supabase_key,
      tabela_nome: form.tabela_nome,
      openai_key: form.openai_key,
      ativo: form.ativo,
    };

    try {
      const res = await fetch(`/api/admin/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
        router.refresh();
      } else {
        setError(data.error ?? "Erro ao salvar");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-2 text-gray-400">
        <Loader2 size={20} className="animate-spin" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (!form) return <div className="p-8 text-gray-500">Cliente não encontrado</div>;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clientes" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-sm text-gray-500 mt-0.5">{form.nome}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informações</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome</label>
              <input type="text" value={form.nome} onChange={set("nome")} required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">URL do cliente</label>
              <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden">
                <span className="bg-gray-50 px-3 py-2 text-xs text-gray-400 border-r border-gray-200">/c/</span>
                <input type="text" value={form.slug} disabled className="flex-1 px-3 py-2 text-sm text-gray-400 bg-gray-50 cursor-not-allowed" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => setForm((p) => p ? { ...p, ativo: e.target.checked } : p)} className="rounded border-gray-300" />
            <label htmlFor="ativo" className="text-sm text-gray-700">Cliente ativo (pode fazer login)</label>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Supabase</h2>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">API URL</label>
            <input type="url" value={form.supabase_url} onChange={set("supabase_url")} required
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Service Role Key</label>
            <div className="relative">
              <input type={showKey ? "text" : "password"} value={form.supabase_key} onChange={set("supabase_key")} required
                className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
              <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome da tabela</label>
              <input type="text" value={form.tabela_nome} onChange={set("tabela_nome")}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">OpenAI Key (opcional)</label>
              <input type="password" value={form.openai_key ?? ""} onChange={set("openai_key")} placeholder="sk-..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            </div>
          </div>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Salvo com sucesso!</div>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/clientes" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancelar</Link>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
