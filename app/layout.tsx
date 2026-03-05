import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Siarom – Relatórios IA",
  description: "Dashboard de relatórios de atendimentos com IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}
