import { NextResponse } from "next/server";
import { getSession, getClienteBySlug } from "@/lib/auth";

export const dynamic = "force-dynamic";

const EXCHANGE_RATE = 5.7;

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  if (!session.isAdmin && session.clienteSlug !== params.slug) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const cliente = await getClienteBySlug(params.slug);
  if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });

  const openaiKey = cliente.openai_key;
  if (!openaiKey) {
    return NextResponse.json({ needsAdminKey: true, error: "Chave OpenAI não configurada para este cliente" });
  }

  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(now.getTime() / 1000);

    const costsRes = await fetch(
      `https://api.openai.com/v1/organization/costs?start_time=${startTimestamp}&end_time=${endTimestamp}&limit=100`,
      {
        headers: { Authorization: `Bearer ${openaiKey}`, "OpenAI-Beta": "assistants=v1" },
      }
    );

    if (!costsRes.ok) {
      const errData = await costsRes.json() as { error?: { message?: string; code?: string } };
      const code = errData?.error?.code;
      if (costsRes.status === 403 || code === "insufficient_permissions") {
        return NextResponse.json({ needsAdminKey: true, error: "Chave sem permissão de leitura de uso (api.usage.read)" });
      }
      return NextResponse.json({ error: errData?.error?.message ?? "Erro na API OpenAI", needsAdminKey: false });
    }

    const costsData = await costsRes.json() as {
      data?: Array<{ results: Array<{ amount: { value: number }; start_time: number }> }>;
    };

    const lineItems: Array<{ date: string; amount_usd: number; description: string }> = [];
    const dailyMap: Record<string, number> = {};

    (costsData.data ?? []).forEach((bucket) => {
      (bucket.results ?? []).forEach((r) => {
        const date = new Date(r.start_time * 1000).toISOString().split("T")[0];
        const amount = r.amount?.value ?? 0;
        lineItems.push({ date, amount_usd: amount, description: "API Usage" });
        dailyMap[date] = (dailyMap[date] ?? 0) + 1;
      });
    });

    const totalUSD = lineItems.reduce((s, r) => s + r.amount_usd, 0);
    const dailyCosts = Object.entries(dailyMap).map(([day, count]) => ({ day, count })).sort((a, b) => a.day.localeCompare(b.day));

    return NextResponse.json({
      totalUSD,
      totalBRL: totalUSD * EXCHANGE_RATE,
      dailyCosts,
      lineItems,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
