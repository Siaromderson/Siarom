"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";

export function ClienteActions({ clienteId, clienteNome }: { clienteId: string; clienteNome: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir o cliente "${clienteNome}"? Esta ação não pode ser desfeita.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/clientes/${clienteId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json() as { error?: string };
        alert(data.error ?? "Erro ao excluir cliente");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1.5 disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
      Excluir
    </button>
  );
}
