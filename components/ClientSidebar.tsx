"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brain, LayoutDashboard, MessageSquare, Zap, LogOut, Menu, X, ChevronRight } from "lucide-react";

export function ClientSidebar({ slug, clienteNome }: { slug: string; clienteNome: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const links = [
    { href: `/c/${slug}`, label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: `/c/${slug}/atendimentos`, label: "Atendimentos", icon: MessageSquare },
    { href: `/c/${slug}/consumo`, label: "Consumo IA", icon: Zap },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  };

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md lg:hidden"
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gray-900 transition-transform duration-200 lg:relative lg:translate-x-0 lg:flex-shrink-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
            <Brain size={20} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-white font-semibold text-base leading-tight">CRM Siarom</p>
            <p className="text-gray-400 text-xs truncate">{clienteNome}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Menu</p>
          {links.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? "bg-indigo-600 text-white shadow-md" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
              >
                <Icon size={18} className={active ? "text-white" : "text-gray-500 group-hover:text-gray-300"} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-indigo-300" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-800 px-3 py-4">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-red-900/40 hover:text-red-400 transition-all disabled:opacity-50"
          >
            <LogOut size={18} className="text-gray-500" />
            <span>{loggingOut ? "Saindo..." : "Sair"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
