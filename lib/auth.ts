import { cookies } from "next/headers";
import { adminSupabase } from "./admin-supabase";
import type { Session, Cliente, Usuario } from "./admin-supabase";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const COOKIE_NAME = "siarom-session";
const SESSION_DAYS = 7;

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "morais2730@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Siarom2730";

export interface AuthUser {
  isAdmin: boolean;
  clienteId: string | null;
  clienteSlug: string | null;
  nome: string;
  email: string;
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const { data: session } = await adminSupabase
    .from("sessions-cursor")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (!session) return null;
  const s = session as Session;

  if (s.is_admin) {
    return { isAdmin: true, clienteId: null, clienteSlug: null, nome: "Admin", email: ADMIN_EMAIL };
  }

  if (!s.usuario_id) return null;

  const { data: usuario } = await adminSupabase
    .from("usuarios-cursor")
    .select("*, clientes-cursor(slug, nome)")
    .eq("id", s.usuario_id)
    .single();

  if (!usuario) return null;
  const u = usuario as Usuario & { "clientes-cursor": { slug: string; nome: string } | null };
  const cliente = u["clientes-cursor"];

  return {
    isAdmin: false,
    clienteId: s.cliente_id,
    clienteSlug: cliente?.slug ?? null,
    nome: u.nome,
    email: u.email,
  };
}

export async function loginAdmin(email: string, password: string): Promise<string | null> {
  const e = (email ?? "").trim().toLowerCase();
  const p = (password ?? "").trim();
  const adminEmail = (ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPass = (ADMIN_PASSWORD ?? "").trim();
  if (!adminEmail || !adminPass) return null;
  if (e !== adminEmail || p !== adminPass) return null;
  return createAdminSession();
}

async function createAdminSession(): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  const { error } = await adminSupabase.from("sessions-cursor").insert({
    token,
    expires_at: expiresAt.toISOString(),
    is_admin: true,
  });

  if (error) throw new Error(`Falha ao criar sessão: ${error.message}`);

  return token;
}

export async function loginCliente(email: string, password: string): Promise<{ token: string; slug: string } | null> {
  const { data: usuario } = await adminSupabase
    .from("usuarios-cursor")
    .select("*, clientes-cursor(slug, ativo)")
    .eq("email", email)
    .eq("ativo", true)
    .single();

  if (!usuario) return null;
  const u = usuario as Usuario & { "clientes-cursor": { slug: string; ativo: boolean } | null };

  const senhaOk = await bcrypt.compare(password, u.senha_hash);
  if (!senhaOk) return null;

  const cliente = u["clientes-cursor"];
  if (!cliente?.ativo) return null;

  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await adminSupabase.from("sessions-cursor").insert({
    token,
    expires_at: expiresAt.toISOString(),
    is_admin: false,
    usuario_id: u.id,
    cliente_id: u.cliente_id,
  });

  return { token, slug: cliente.slug };
}

export async function logout(token: string) {
  await adminSupabase.from("sessions-cursor").delete().eq("token", token);
}

export function setSessionCookie(token: string): { name: string; value: string; httpOnly: boolean; path: string; maxAge: number; sameSite: "lax"; secure: boolean } {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  };
}

export function getSessionTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [key, val] = pair.trim().split("=");
    if (key === COOKIE_NAME) return val;
  }
  return null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function getClienteBySlug(slug: string): Promise<Cliente | null> {
  const { data } = await adminSupabase
    .from("clientes-cursor")
    .select("*")
    .eq("slug", slug)
    .eq("ativo", true)
    .single();
  return (data as Cliente) ?? null;
}

export async function getAllClientes(): Promise<Cliente[]> {
  const { data } = await adminSupabase
    .from("clientes-cursor")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Cliente[]) ?? [];
}
