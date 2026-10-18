"use client";

import React from "react";
import {
  Lock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  FileSpreadsheet,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const KIWIFY_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ||
  "https://kiwify.app/checkout-placeholder-bpo?plan=mensal-2990";

interface FreePlanLimitationsProps {
  quotaUsed: number;
  quotaLimit: number;
}

export default function FreePlanLimitations({
  quotaUsed,
  quotaLimit = 3,
}: FreePlanLimitationsProps) {
  const { openUpgradeModal, switchPlan } = useAuth();
  const percentage = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  return (
    <div className="space-y-4">
      {/* 1. Barra de Cota do Plano Free */}
      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs">
              <Lock className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Plano Free: Cota de Demonstração Mensal
              </h4>
              <p className="text-xs text-slate-600">
                Você utilizou <strong>{quotaUsed}</strong> de <strong>{quotaLimit}</strong> comprovantes permitidos este mês.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openUpgradeModal("Aumente sua cota para envios ilimitados no Plano Pago.")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Desbloquear Ilimitado (R$ 29,90)</span>
          </button>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="space-y-1">
          <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                quotaUsed >= quotaLimit ? "bg-rose-500" : "bg-blue-600"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>{quotaUsed} utilizados</span>
            <span>{Math.max(0, quotaLimit - quotaUsed)} restantes</span>
          </div>
        </div>
      </div>

      {/* 2. Banner de Bloqueio dos Módulos Avançados */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-lg space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
              <Lock className="h-3.5 w-3.5 text-blue-400" />
              Recursos Avançados Bloqueados no Plano Free
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              Tenha sua operação financeira 100% autônoma por apenas R$ 29,90/mês
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              O Plano Free é limitado a 3 comprovantes manuais e extrato de 5 linhas. Assine o Plano Pago OaaS para liberar:
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <a
              href={KIWIFY_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
            >
              <span>Assinar Plano Mensal na Kiwify</span>
              <ExternalLink className="h-4 w-4" />
            </a>

            <button
              type="button"
              onClick={() => switchPlan("PAID_OAAS")}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Alternar para Visão do Plano Pago</span>
            </button>
          </div>
        </div>

        {/* Grid de Recursos Bloqueados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 opacity-80">
            <div className="flex items-center gap-2 text-blue-300 font-bold">
              <Layers className="h-4 w-4" />
              <span>Upload em Lote</span>
            </div>
            <p className="text-[11px] text-slate-400">Arraste múltiplos arquivos simultâneos com fila paralela.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 opacity-80">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <Zap className="h-4 w-4" />
              <span>Auto-Resolução 1-Clique</span>
            </div>
            <p className="text-[11px] text-slate-400">Resolução instantânea de divergências e tarifas bancárias.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 opacity-80">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <FileSpreadsheet className="h-4 w-4" />
              <span>DRE & Pacote Contábil</span>
            </div>
            <p className="text-[11px] text-slate-400">Exportação em 1 toque do fechamento contábil .zip/CSV.</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1 opacity-80">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CalendarDays className="h-4 w-4" />
              <span>Agenda Financeira</span>
            </div>
            <p className="text-[11px] text-slate-400">Contas a pagar/receber com alertas de vencimento diário.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
