import { getAllClientes } from "@/lib/auth";
import Link from "next/link";
import { Users, UserCheck, Plus, ArrowRight, Building2, Activity } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import type { Cliente } from "@/lib/admin-supabase";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const clientes = await getAllClientes();
  const ativos = clientes.filter((c) => c.ativo).length;

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie todos os clientes do sistema</p>
        </div>
        <Link
          href="/admin/clientes/novo"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Novo cliente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatsCard
          title="Total de clientes"
          value={clientes.length}
          subtitle="cadastrados"
          icon={<Users size={18} />}
          color="indigo"
        />
        <StatsCard
          title="Clientes ativos"
          value={ativos}
          subtitle="com acesso liberado"
          icon={<UserCheck size={18} />}
          color="emerald"
        />
        <StatsCard
          title="Inativos"
          value={clientes.length - ativos}
          subtitle="acesso suspenso"
          icon={<Activity size={18} />}
          color="amber"
        />
      </div>

      {/* Client list */}
      <section className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Clientes cadastrados</h2>
          <Link href="/admin/clientes" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Gerenciar <ArrowRight size={12} />
          </Link>
        </div>

        {clientes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-gray-400">
            <Building2 size={40} className="text-gray-200" />
            <div className="text-center">
              <p className="font-medium text-gray-500">Nenhum cliente cadastrado</p>
              <p className="text-sm mt-1">Clique em "Novo cliente" para começar</p>
            </div>
            <Link
              href="/admin/clientes/novo"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus size={15} />
              Cadastrar primeiro cliente
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Slug / URL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Tabela</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Criado em</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {clientes.map((c: Cliente) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-sm font-bold">
                          {c.nome.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{c.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">/c/{c.slug}</code>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{c.supabase_url}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{c.tabela_nome}</code>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.ativo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.ativo ? "bg-emerald-500" : "bg-gray-400"}`} />
                        {c.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">
                      {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 invisible group-hover:visible">
                        <Link
                          href={`/admin/c/${c.slug}`}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Ver dashboard
                        </Link>
                        <span className="text-gray-300">|</span>
                        <Link
                          href={`/admin/clientes/${c.id}`}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium"
                        >
                          Editar
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
