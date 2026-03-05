export interface Chat {
  id: number;
  created_at: string;
  nome: string | null;
  telefone: string | null;
  status: string | null;
  followup: string | null;
  ultima_interacao: string | null;
  "id-contato-kommo": string | null;
  "id-lead-kommo": string | null;
  hora_agendamento: string | null;
  historico: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DashboardStats {
  total: number;
  hoje: number;
  semana: number;
  mes: number;
  statusBreakdown: Record<string, number>;
  agendados: number;
  comHistorico: number;
  porDia: Array<{ day: string; count: number }>;
}
