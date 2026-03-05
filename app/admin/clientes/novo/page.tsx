"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [showSenha, setShowSenha] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    slug: "",
    supabase_url: "",
    supabase_key: "",
    tabela_nome: "chats",
    openai_key: "",
    usuario_nome: "",
    usuario_email: "",
    usuario_senha: "",
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "nome" && !prev.slug) next.slug = slugify(value);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json() as { ok?: boolean; error?: string };

      if (data.ok) {
        router.push("/admin/clientes");
        router.refresh();
      } else {
        setError(data.error ?? "Erro ao criar cliente");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/clientes" className="text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
          <p className="text-sm text-gray-500 mt-0.5">Preencha os dados para cadastrar um novo cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Informações do cliente</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome da empresa *</label>
              <input type="text" value={form.nome} onChange={set("nome")} required placeholder="Ex: Clínica Neurocol"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Slug (URL) *</label>
              <div className="flex items-center">
                <span className="rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-400">/c/</span>
                <input type="text" value={form.slug} onChange={set("slug")} required placeholder="clinica-neurocol"
                  className="flex-1 rounded-r-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Supabase config */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Configuração do Supabase</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">API URL do Supabase *</label>
            <input type="url" value={form.supabase_url} onChange={set("supabase_url")} required placeholder="https://xxxx.supabase.co"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Service Role Key *</label>
            <div className="relative">
              <input type={showKey ? "text" : "password"} value={form.supabase_key} onChange={set("supabase_key")} required placeholder="eyJ..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
              <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome da tabela</label>
              <input type="text" value={form.tabela_nome} onChange={set("tabela_nome")} placeholder="chats"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
              <p className="text-xs text-gray-400 mt-1">Padrão: chats</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">OpenAI Key (opcional)</label>
              <input type="password" value={form.openai_key} onChange={set("openai_key")} placeholder="sk-..."
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            </div>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 flex items-start gap-2">
            <CheckCircle size={15} className="text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700">A conexão com o Supabase será testada automaticamente antes de salvar.</p>
          </div>
        </div>

        {/* User credentials */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Credenciais de acesso do cliente</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Nome do usuário</label>
              <input type="text" value={form.usuario_nome} onChange={set("usuario_nome")} placeholder="Nome do responsável"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
              <input type="email" value={form.usuario_email} onChange={set("usuario_email")} required placeholder="cliente@empresa.com"
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Senha *</label>
            <div className="relative">
              <input type={showSenha ? "text" : "password"} value={form.usuario_senha} onChange={set("usuario_senha")} required placeholder="Mínimo 6 caracteres" minLength={6}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
              <button type="button" onClick={() => setShowSenha((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showSenha ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">O cliente usará estas credenciais para fazer login</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
            <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/clientes" className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-60">
            {loading ? <><Loader2 size={15} className="animate-spin" />Testando conexão...</> : "Criar cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
