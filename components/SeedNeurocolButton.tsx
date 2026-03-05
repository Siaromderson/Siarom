"use client";

import { useState } from "react";
import { Loader2, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function SeedNeurocolButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup/seed", { method: "POST" });
      const data = await res.json();

      if (res.ok) {
        router.refresh();
      } else {
        setError(data.error ?? "Erro ao cadastrar");
      }
    } catch {
      setError("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handleSeed}
        disabled={loading}
        className="flex items-center gap-2 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 px-5 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 hover:border-indigo-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Cadastrando...
          </>
        ) : (
          <>
            <Building2 size={18} />
            Cadastrar Neurocol automaticamente
          </>
        )}
      </button>
      {error && (
        <p className="text-sm text-red-600 max-w-md text-center">{error}</p>
      )}
      <p className="text-xs text-gray-500 max-w-sm text-center">
        Usa as credenciais do Supabase já configuradas no .env.local (NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY)
      </p>
    </div>
  );
}
