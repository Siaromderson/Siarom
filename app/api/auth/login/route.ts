import { NextResponse } from "next/server";
import { loginAdmin, loginCliente, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json() as { email: string; password: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  // Try admin login first
  try {
    const adminToken = await loginAdmin(email, password);
    if (adminToken) {
      const response = NextResponse.json({ ok: true, role: "admin", redirect: "/admin" });
      const cookie = setSessionCookie(adminToken);
      response.cookies.set(cookie);
      return response;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // Try client login
  const clientResult = await loginCliente(email, password);
  if (clientResult) {
    const response = NextResponse.json({
      ok: true,
      role: "cliente",
      redirect: `/c/${clientResult.slug}`,
    });
    const cookie = setSessionCookie(clientResult.token);
    response.cookies.set(cookie);
    return response;
  }

  return NextResponse.json({ error: "Email ou senha incorretos" }, { status: 401 });
}
