"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Zap,
  FileDown,
  Brain,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/atendimentos", label: "Atendimentos", icon: MessageSquare },
  { href: "/consumo", label: "Consumo IA", icon: Zap },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900 text-white shadow-md lg:hidden no-print"
        onClick={() => setMobileOpen((v) => !v)}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          no-print fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-gray-900
          transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:flex-shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-md">
            <Brain size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-base leading-tight">CRM Siarom</p>
            <p className="text-gray-400 text-xs">Relatórios IA</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Menu
          </p>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`
                  group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/30"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <Icon
                  size={18}
                  className={active ? "text-white" : "text-gray-500 group-hover:text-gray-300"}
                />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-indigo-300" />}
              </Link>
            );
          })}
        </nav>

        {/* Export button */}
        <div className="border-t border-gray-800 px-3 py-4">
          <Link
            href="/dashboard?print=1"
            onClick={() => {
              setMobileOpen(false);
              setTimeout(() => window.print(), 300);
            }}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all w-full"
          >
            <FileDown size={18} className="text-gray-500" />
            <span>Exportar Relatório</span>
          </Link>

          {/* Footer */}
          <div className="mt-4 px-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-500">Supabase conectado</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
