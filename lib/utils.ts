import type { ChatMessage } from "@/types/chat";

export function formatPhone(telefone: string | null): string {
  if (!telefone) return "-";
  const num = telefone.split("@")[0];
  const local = num.startsWith("55") ? num.slice(2) : num;
  if (local.length === 11) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  } else if (local.length === 10) {
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }
  return local;
}

export function formatDate(
  dateStr: string | null,
  withTime = false
): string {
  if (!dateStr) return "-";
  try {
    const fmt: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    };
    if (withTime) {
      fmt.hour = "2-digit";
      fmt.minute = "2-digit";
    }
    return new Intl.DateTimeFormat("pt-BR", fmt).format(new Date(dateStr));
  } catch {
    return "-";
  }
}

export function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMin / 60);
    const diffD = Math.floor(diffH / 24);

    if (diffMin < 1) return "agora";
    if (diffMin < 60) return `há ${diffMin}min`;
    if (diffH < 24) return `há ${diffH}h`;
    if (diffD === 1) return "ontem";
    if (diffD < 7) return `há ${diffD} dias`;
    return formatDate(dateStr);
  } catch {
    return "-";
  }
}

export function parseHistorico(historico: string | null): ChatMessage[] {
  if (!historico) return [];

  const messages: ChatMessage[] = [];
  const lines = historico.split("\n");

  let currentRole: "user" | "assistant" | null = null;
  let currentLines: string[] = [];

  const push = () => {
    if (currentRole && currentLines.length > 0) {
      const content = currentLines.join("\n").trim();
      if (content) messages.push({ role: currentRole, content });
    }
  };

  for (const line of lines) {
    if (line.startsWith("Lead:")) {
      push();
      currentRole = "user";
      currentLines = [line.replace(/^Lead:\s*/, "")];
    } else if (line.startsWith("Agente IA:")) {
      push();
      currentRole = "assistant";
      currentLines = [line.replace(/^Agente IA:\s*/, "")];
    } else {
      currentLines.push(line);
    }
  }
  push();

  return messages;
}

export function getStatusStyle(status: string | null): string {
  if (!status) return "bg-gray-100 text-gray-500 border-gray-200";
  const s = status.toUpperCase();
  if (s === "I.A") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (s.includes("SECRET")) return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("AGENDADO") || s.includes("CONSULTA"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("CANCELADO") || s.includes("DESIST"))
    return "bg-red-50 text-red-700 border-red-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

export function getStatusDot(status: string | null): string {
  if (!status) return "bg-gray-400";
  const s = status.toUpperCase();
  if (s === "I.A") return "bg-indigo-500";
  if (s.includes("SECRET")) return "bg-amber-500";
  if (s.includes("AGENDADO") || s.includes("CONSULTA")) return "bg-emerald-500";
  if (s.includes("CANCELADO")) return "bg-red-500";
  return "bg-gray-400";
}

export function initials(nome: string | null): string {
  if (!nome) return "?";
  return nome
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
