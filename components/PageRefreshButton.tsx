"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export function PageRefreshButton() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const handleClick = async () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <button
      onClick={handleClick}
      disabled={refreshing}
      title="Atualizar dados da tabela"
      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
      {refreshing ? "Atualizando..." : "Atualizar dados"}
    </button>
  );
}
