import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logout } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("siarom-session")?.value;
  if (token) await logout(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("siarom-session");
  return response;
}
