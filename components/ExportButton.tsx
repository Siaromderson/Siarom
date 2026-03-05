"use client";

import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    setLoading(true);
    setTimeout(() => {
      window.print();
      setLoading(false);
    }, 300);
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70"
    >
      {loading ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />}
      Exportar PDF
    </button>
  );
}
