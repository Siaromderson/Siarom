"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Copy, ExternalLink, Loader2 } from "lucide-react";

interface SetupStatus {
  status: "ready" | "needs_setup";
  tables: Record<string, string>;
  sql: string;
}

export default function SetupPage() {
  const [data, setData] = useState<SetupStatus | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/setup").then((r) => r.json()).then(setData as (d: unknown) => void);
  }, []);

  const copy = () => {
    if (!data) return;
    navigator.clipboard.writeText(data.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Setup do Sistema</h1>
          <p className="text-gray-400 mt-1">Verificação das tabelas do Supabase Admin</p>
        </div>

        {!data ? (
          <div className="flex items-center justify-center gap-2 text-gray-400 py-12">
            <Loader2 size={20} className="animate-spin" />
            Verificando...
          </div>
        ) : (
          <>
            {/* Status */}
            <div className="rounded-2xl border border-gray-800 bg-gray-800/50 p-5 space-y-3">
              <h2 className="text-sm font-semibold text-gray-300">Status das tabelas</h2>
              {Object.entries(data.tables).map(([table, status]) => (
                <div key={table} className="flex items-center gap-3">
                  {status === "OK" ? (
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-red-500 flex-shrink-0" />
                  )}
                  <code className="text-sm text-gray-300">{table}</code>
                  <span className={`text-xs ${status === "OK" ? "text-emerald-400" : "text-red-400"}`}>
                    {status === "OK" ? "Pronta" : "Não encontrada"}
                  </span>
                </div>
              ))}
            </div>

            {data.status === "ready" ? (
              <div className="rounded-2xl border border-emerald-800 bg-emerald-900/30 p-5 text-center">
                <CheckCircle size={24} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-emerald-300 font-semibold">Sistema pronto!</p>
                <p className="text-emerald-400 text-sm mt-1">Todas as tabelas foram criadas.</p>
                <a href="/login" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-colors">
                  Ir para o login
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-800 bg-amber-900/20 p-4">
                  <p className="text-amber-300 text-sm font-medium">Ação necessária</p>
                  <p className="text-amber-400 text-xs mt-1">Execute o SQL abaixo no painel do Supabase para criar as tabelas necessárias.</p>
                  <a
                    href="https://supabase.com/dashboard/project/svppxitnpjgvcgiswmmr/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 underline"
                  >
                    Abrir SQL Editor do Supabase
                    <ExternalLink size={12} />
                  </a>
                </div>

                <div className="rounded-2xl border border-gray-800 bg-gray-800/50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                    <span className="text-xs font-medium text-gray-400">SQL para executar</span>
                    <button
                      onClick={copy}
                      className="flex items-center gap-1.5 rounded-lg bg-gray-700 px-2.5 py-1 text-xs text-gray-300 hover:bg-gray-600 transition-colors"
                    >
                      <Copy size={12} />
                      {copied ? "Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <pre className="p-4 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">{data.sql}</pre>
                </div>

                <p className="text-center text-xs text-gray-500">
                  Após executar o SQL, recarregue esta página para verificar o status.
                </p>
                <div className="text-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="rounded-xl border border-gray-700 px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    Verificar novamente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
