"use client";

import { parseHistorico, formatDate, formatPhone } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import type { Chat } from "@/types/chat";
import { Bot, User, Phone, Calendar, Hash, Clock } from "lucide-react";

interface ChatViewerProps {
  chat: Chat;
  onClose?: () => void;
}

export function ChatViewer({ chat, onClose }: ChatViewerProps) {
  const messages = parseHistorico(chat.historico);

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex-shrink-0 border-b border-gray-100 bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold flex-shrink-0">
              {(chat.nome ?? "?")
                .trim()
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((w: string) => w[0].toUpperCase())
                .join("")}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-base">{chat.nome ?? "Sem nome"}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone size={11} /> {formatPhone(chat.telefone)}
                </span>
                {chat.status && <StatusBadge status={chat.status} size="sm" />}
              </div>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-3 flex flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={12} className="text-gray-400" />
            <span>Entrada: {formatDate(chat.created_at, true)}</span>
          </div>
          {chat.ultima_interacao && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock size={12} className="text-gray-400" />
              <span>Última: {formatDate(chat.ultima_interacao, true)}</span>
            </div>
          )}
          {chat.followup && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Hash size={12} className="text-gray-400" />
              <span>Follow-up: {chat.followup}</span>
            </div>
          )}
          {chat.hora_agendamento && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
              <Calendar size={12} />
              <span>Agendado: {formatDate(chat.hora_agendamento, true)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-3 bg-gray-50/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot size={22} className="text-gray-300" />
            </div>
            <p className="text-sm">Nenhum histórico de conversa</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-end gap-2 ${msg.role === "assistant" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-white text-xs ${
                  msg.role === "assistant" ? "bg-indigo-600" : "bg-gray-500"
                }`}
              >
                {msg.role === "assistant" ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Bubble */}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === "assistant"
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Read-only footer */}
      <div className="flex-shrink-0 border-t border-gray-100 bg-white px-5 py-3">
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5">
          <Bot size={15} className="text-gray-300" />
          <span className="text-xs text-gray-400 italic">
            Visualização somente leitura — {messages.length} mensagen{messages.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
