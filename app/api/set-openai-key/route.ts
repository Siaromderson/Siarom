import { NextResponse } from "next/server";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

export async function POST(request: Request) {
  const { key } = await request.json() as { key: string };

  if (!key || !key.startsWith("sk-")) {
    return NextResponse.json({ error: "Chave inválida" }, { status: 400 });
  }

  try {
    const envPath = join(process.cwd(), ".env.local");
    let content = "";
    try {
      content = readFileSync(envPath, "utf-8");
    } catch { /* file might not exist */ }

    if (content.includes("OPENAI_API_KEY=")) {
      content = content.replace(/^OPENAI_API_KEY=.*$/m, `OPENAI_API_KEY=${key}`);
    } else {
      content += `\nOPENAI_API_KEY=${key}\n`;
    }

    writeFileSync(envPath, content, "utf-8");

    return NextResponse.json({ ok: true, message: "Chave salva. Reinicie o servidor para aplicar." });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao salvar" },
      { status: 500 }
    );
  }
}
