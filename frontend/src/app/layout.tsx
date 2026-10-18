import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPO Financeiro AI - Gestão Autônoma",
  description: "BPO financeiro e auxiliar administrativo automatizado para microempresas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
