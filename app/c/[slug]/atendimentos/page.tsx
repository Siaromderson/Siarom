"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ChatViewer } from "@/components/ChatViewer";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, Filter, MessageSquare, Loader2 } from "lucide-react";
import { RefreshButton } from "@/components/RefreshButton";
import type { Chat } from "@/types/chat";

export default function AtendimentosPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Chat | null>(null);
  const [statuses, setStatuses] = useState<string[]>([]);

  const fetchChats = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/c/${slug}/chats?${params}`);
    const data = await res.json() as { data?: Chat[] };
    const list = data.data ?? [];
    setChats(list);
    const uniqueStatuses = [...new Set(list.map((c) => c.status).filter(Boolean))] as string[];
    if (uniqueStatuses.length > 0) setStatuses(uniqueStatuses);
    setLoading(false);
  }, [slug, search, statusFilter]);

  useEffect(() => {
    void fetchChats();
  }, [fetchChats]);

  // Atualização em tempo real a cada 5s
  useEffect(() => {
    const interval = setInterval(() => void fetchChats(), 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* List */}
      <div className="flex w-80 flex-shrink-0 flex-col border-r border-gray-100 bg-white lg:w-96">
        <div className="space-y-2 border-b border-gray-100 p-4">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-lg font-bold text-gray-900">Atendimentos</h1>
            <RefreshButton onRefresh={fetchChats} className="!px-3 !py-1.5 !text-xs" />
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            />
          </div>
          {statuses.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter size={13} className="text-gray-400" />
              <button
                onClick={() => setStatusFilter("")}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${!statusFilter ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              >
                Todos
              </button>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${statusFilter === s ? "bg-indigo-600 text-white border-indigo-600" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" />
              <span className="text-sm">Carregando...</span>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-gray-400">
              <MessageSquare size={28} className="text-gray-200" />
              <span className="text-sm">Nenhum atendimento encontrado</span>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelected(chat)}
                className={`w-full text-left p-4 transition-colors hover:bg-gray-50/80 ${selected?.id === chat.id ? "bg-indigo-50 border-l-2 border-indigo-500" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{chat.nome ?? "Sem nome"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{chat.telefone ?? "—"}</p>
                  </div>
                  <StatusBadge status={chat.status} />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  {new Date(chat.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-gray-100 px-4 py-2.5">
          <p className="text-xs text-gray-400">{chats.length} atendimento{chats.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <ChatViewer chat={selected} onClose={() => setSelected(null)} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <MessageSquare size={48} className="text-gray-200" />
            <div className="text-center">
              <p className="font-medium text-gray-500">Selecione um atendimento</p>
              <p className="text-sm mt-1">Clique em um item da lista para ver o histórico</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
