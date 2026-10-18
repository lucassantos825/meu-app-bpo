import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import UpgradeModal from "@/components/subscription/UpgradeModal";

export const metadata: Metadata = {
  title: "AutoCaixa OaaS AI - Operação Financeira Autônoma",
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
        <AuthProvider>
          {children}
          <UpgradeModal />
        </AuthProvider>
      </body>
    </html>
  );
}
