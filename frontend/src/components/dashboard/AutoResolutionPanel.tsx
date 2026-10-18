"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Check,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Clock,
  TrendingDown,
  Info,
} from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

export interface AutoResolutionAlert {
  id: string;
  title: string;
  docAmount: number;
  bankAmount: number;
  bankName: string;
  difference: number;
  reason: string;
  suggestedAction: string;
  detectedAt: string;
}

interface AutoResolutionPanelProps {
  alerts: AutoResolutionAlert[];
  onResolve: (alertId: string, adjustedAmount: number) => void;
}

export default function AutoResolutionPanel({
  alerts,
  onResolve,
}: AutoResolutionPanelProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const handleApprove = (alert: AutoResolutionAlert) => {
    setResolvingId(alert.id);
    setTimeout(() => {
      onResolve(alert.id, alert.bankAmount);
      setResolvingId(null);
    }, 400);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      {/* Cabeçalho do Módulo 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Módulo 2: Auto-Resolução em 1-Clique para Divergências
              </h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                  alerts.length > 0
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {alerts.length} {alerts.length === 1 ? "divergência" : "divergências"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              A IA diagnostica tarifas bancárias e diferenças de centavos, formulando o ajuste para sua aprovação direta.
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo: Se não houver divergências */}
      {alerts.length === 0 ? (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold">Caixa 100% Conciliado e Equilibrado</p>
            <p className="text-emerald-700 text-[11px]">
              Nenhuma diferença de centavos pendente. O agente autônomo segue monitorando os extratos 24/7.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((al) => (
            <div
              key={al.id}
              className="rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50/50 to-white p-5 shadow-sm space-y-4 relative overflow-hidden"
            >
              {/* Topo do Alerta */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                    <Sparkles className="h-3 w-3 text-amber-600" /> Auto-Resolução Sugerida pela IA
                  </span>
                  <h4 className="mt-1 text-sm font-black text-slate-900">{al.title}</h4>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">{al.detectedAt}</span>
              </div>

              {/* Comparativo Lado a Lado (Documento vs Extrato Bancário) */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-white rounded-xl p-3 border border-slate-200">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Comprovante Lido</span>
                  <p className="text-sm font-bold text-slate-900">{formatCurrencyBRL(al.docAmount)}</p>
                </div>
                <div className="space-y-0.5 border-l border-slate-100 pl-3">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Extrato ({al.bankName})</span>
                  <p className="text-sm font-bold text-rose-600">{formatCurrencyBRL(al.bankAmount)}</p>
                </div>
              </div>

              {/* Diagnóstico da Diferença */}
              <div className="rounded-xl bg-amber-100/60 p-3 text-xs space-y-1 text-amber-950">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <Info className="h-3.5 w-3.5 text-amber-700" />
                    Variação Identificada:
                  </span>
                  <span className="text-amber-900">{formatCurrencyBRL(al.difference)}</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">{al.reason}</p>
              </div>

              {/* Botão de Confirmação em 1-Clique */}
              <button
                type="button"
                disabled={resolvingId === al.id}
                onClick={() => handleApprove(al)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-black text-white shadow-md shadow-blue-500/20 active:scale-98 transition-all disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                <span>
                  {resolvingId === al.id
                    ? "Conciliando com Extrato..."
                    : `Aprovar Auto-Resolução com ${formatCurrencyBRL(al.bankAmount)}`}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
