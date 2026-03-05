import { getClienteBySlug, getSession } from "@/lib/auth";
import { ClientSidebar } from "@/components/ClientSidebar";
import { redirect } from "next/navigation";

export default async function ClienteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!session.isAdmin && session.clienteSlug !== params.slug) redirect("/login");

  const cliente = await getClienteBySlug(params.slug);
  if (!cliente) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <ClientSidebar slug={params.slug} clienteNome={cliente.nome} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
