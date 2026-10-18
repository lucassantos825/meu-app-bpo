"use client";

import React from "react";
import {
  X,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  FileSpreadsheet,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const KIWIFY_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ||
  "https://kiwify.app/checkout-placeholder-bpo?plan=mensal-2990";

export default function UpgradeModal() {
  const { isUpgradeModalOpen, closeUpgradeModal, upgradeReason, upgradeToPaid } = useAuth();

  if (!isUpgradeModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 text-white">
        {/* Faixa Superior de Destaque */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              Desbloqueio de Recursos Pro
            </span>
          </div>
          <button
            onClick={closeUpgradeModal}
            className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6">
          {/* Headline & Motivo */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 mb-1">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Migre para o Plano Pago OaaS
            </h3>
            <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed max-w-sm mx-auto">
              {upgradeReason || "Remova as travas do Plano Free e tenha sua operação 100% autônoma."}
            </p>

            {/* Preço de Destaque */}
            <div className="pt-2 flex items-baseline justify-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase">R$</span>
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">29,90</span>
              <span className="text-xs font-semibold text-slate-300">/ mês</span>
            </div>
            <p className="text-[11px] text-emerald-400 font-bold">
              Menos de R$ 1,00 por dia • Cancele quando quiser na Kiwify
            </p>
          </div>

          {/* Comparativo de Recursos Desbloqueados */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5 text-xs">
            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Layers className="h-3.5 w-3.5" />
              </div>
              <span>
                <strong>Upload Ilimitado em Lote:</strong> arraste dezenas de comprovantes de uma só vez
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span>
                <strong>Auto-Resolução 1-Clique:</strong> aprovação rápida de divergências de centavos
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </div>
              <span>
                <strong>Relatórios & Pacote Contábil:</strong> DRE dinâmico e exportação em .zip/CSV
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <CalendarDays className="h-3.5 w-3.5" />
              </div>
              <span>
                <strong>Agenda Financeira:</strong> alertas de vencimento de contas a pagar e receber
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-slate-200">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <span>
                <strong>Privacidade Total:</strong> zero operadores humanos acessando seus dados
              </span>
            </div>
          </div>

          {/* Ações: Checkout Kiwify e Simulação Imediata */}
          <div className="space-y-2.5">
            <a
              href={KIWIFY_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-3.5 text-xs font-black text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 active:scale-98 transition-all"
            >
              <span>Assinar Agora na Kiwify (R$ 29,90)</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={upgradeToPaid}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Simular Liberação Imediata do Plano Pago (Teste)</span>
            </button>
          </div>

          {/* Garantia */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Garantia incondicional de 7 dias pela Kiwify. Risco zero.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
