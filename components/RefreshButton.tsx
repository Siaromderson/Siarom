"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void>;
  className?: string;
}

export function RefreshButton({ onRefresh, className = "" }: RefreshButtonProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleClick = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={refreshing}
      title="Atualizar dados"
      className={`flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed print:hidden ${className}`}
    >
      <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
      {refreshing ? "Atualizando..." : "Atualizar dados"}
    </button>
  );
}
