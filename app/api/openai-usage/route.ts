import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OPENAI_KEY = process.env.OPENAI_API_KEY ?? "";

async function fetchBRLRate(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { next: { revalidate: 3600 } }
    );
    const data = await res.json() as { rates: Record<string, number> };
    return data.rates?.BRL ?? 5.7;
  } catch {
    return 5.7;
  }
}

export async function GET() {
  if (!OPENAI_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada no .env.local" },
      { status: 400 }
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

  const headers = {
    Authorization: `Bearer ${OPENAI_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    const [usageRes, costsRes, brlRate] = await Promise.all([
      fetch(
        `https://api.openai.com/v1/organization/usage/completions?start_time=${thirtyDaysAgo}&bucket_width=1d&limit=30`,
        { headers }
      ),
      fetch(
        `https://api.openai.com/v1/organization/costs?start_time=${thirtyDaysAgo}&bucket_width=1d&limit=30`,
        { headers }
      ),
      fetchBRLRate(),
    ]);

    if (usageRes.status === 403 || usageRes.status === 401) {
      let detail = "Permissão negada.";
      try {
        const body = await usageRes.json() as { error?: { message?: string } };
        detail = body?.error?.message ?? detail;
      } catch { /* ignore */ }

      return NextResponse.json(
        { error: detail, needsAdminKey: true },
        { status: 403 }
      );
    }

    const usageData = usageRes.ok ? await usageRes.json() : { data: [] };
    const costsData = costsRes.ok ? await costsRes.json() : { data: [] };

    // Aggregate usage
    type UsageBucket = {
      start_time: number;
      result: Array<{ input_tokens?: number; output_tokens?: number; num_model_requests?: number }>;
    };
    type CostBucket = {
      start_time: number;
      result: Array<{ amount?: { value?: number } }>;
    };

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalRequests = 0;

    (usageData.data as UsageBucket[])?.forEach((bucket) => {
      bucket.result?.forEach((r) => {
        totalInputTokens += r.input_tokens ?? 0;
        totalOutputTokens += r.output_tokens ?? 0;
        totalRequests += r.num_model_requests ?? 0;
      });
    });

    let totalCostUSD = 0;
    const costsByDay: Array<{ day: string; usd: number; brl: number }> = [];

    (costsData.data as CostBucket[])?.forEach((bucket) => {
      let dayTotal = 0;
      bucket.result?.forEach((r) => {
        dayTotal += r.amount?.value ?? 0;
      });
      totalCostUSD += dayTotal;
      const day = new Date(bucket.start_time * 1000).toISOString().split("T")[0];
      costsByDay.push({ day, usd: dayTotal, brl: dayTotal * brlRate });
    });

    return NextResponse.json({
      totalInputTokens,
      totalOutputTokens,
      totalTokens: totalInputTokens + totalOutputTokens,
      totalRequests,
      totalCostUSD,
      totalCostBRL: totalCostUSD * brlRate,
      brlRate,
      costsByDay: costsByDay.sort((a, b) => a.day.localeCompare(b.day)),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
