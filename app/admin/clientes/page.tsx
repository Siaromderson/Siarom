import { getAllClientes } from "@/lib/auth";
import Link from "next/link";
import { Plus, Building2, ArrowLeft } from "lucide-react";
import type { Cliente } from "@/lib/admin-supabase";
import { ClienteActions } from "@/components/ClienteActions";
import { SeedNeurocolButton } from "@/components/SeedNeurocolButton";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await getAllClientes();

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""} cadastrado{clientes.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <Link
          href="/admin/clientes/novo"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Novo cliente
        </Link>
      </div>

      {clientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-gray-400">
          <Building2 size={48} className="text-gray-200" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-500">Nenhum cliente cadastrado</p>
            <p className="text-sm mt-1">Cadastre a Neurocol ou adicione um novo cliente</p>
          </div>
          <div className="flex flex-col items-center gap-4">
            <SeedNeurocolButton />
            <span className="text-xs text-gray-400">ou</span>
            <Link href="/admin/clientes/novo" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors">
              <Plus size={15} />
              Cadastrar cliente manualmente
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {clientes.map((c: Cliente) => (
            <div key={c.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-lg font-bold">
                  {c.nome.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{c.nome}</h3>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${c.ativo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.ativo ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {c.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span className="text-xs text-gray-500">
                      URL: <code className="bg-gray-100 px-1 rounded text-gray-700">/c/{c.slug}</code>
                    </span>
                    <span className="text-xs text-gray-500">
                      Tabela: <code className="bg-gray-100 px-1 rounded text-gray-700">{c.tabela_nome}</code>
                    </span>
                    <span className="text-xs text-gray-500">
                      Criado: {new Date(c.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate max-w-sm">{c.supabase_url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/admin/c/${c.slug}`}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Ver dashboard
                </Link>
                <Link
                  href={`/admin/clientes/${c.id}`}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  Editar
                </Link>
                <ClienteActions clienteId={c.id} clienteNome={c.nome} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
