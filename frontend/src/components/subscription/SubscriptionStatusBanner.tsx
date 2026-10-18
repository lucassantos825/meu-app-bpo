"use client";

import React, { useState } from "react";
import { ShieldAlert, CheckCircle, ExternalLink, RefreshCw } from "lucide-react";

export interface SubscriptionInfo {
  tenantName: string;
  plan: string;
  status: "ACTIVE" | "BLOCKED" | "CANCELED" | "REFUNDED";
  isActive: boolean;
  kiwifyCheckoutUrl: string;
}

interface SubscriptionStatusBannerProps {
  subscription?: SubscriptionInfo;
}

export default function SubscriptionStatusBanner({
  subscription = {
    tenantName: "Oficina Mecânica & Peças Silva Ltda",
    plan: "Plano BPO Micro Pro",
    status: "ACTIVE",
    isActive: true,
    kiwifyCheckoutUrl: "https://kiwify.app/checkout-placeholder-bpo",
  },
}: SubscriptionStatusBannerProps) {
  const [sub, setSub] = useState<SubscriptionInfo>(subscription);

  // Se a assinatura foi cancelada ou reembolsada na Kiwify -> Bloqueio de Acesso
  if (!sub.isActive || sub.status !== "ACTIVE") {
    return (
      <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-6 text-red-950 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-600 p-3 text-white shadow-sm shadow-red-500/30">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-red-950">
                  Acesso Suspenso • Assinatura Kiwify Inativa
                </h3>
                <span className="rounded-full bg-red-200 px-2.5 py-0.5 text-xs font-black text-red-800 uppercase">
                  {sub.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-red-800 max-w-xl">
                O processamento automático de conciliação e OCR por IA está pausado para sua empresa.
                Renove seu plano na Kiwify para restabelecer o acesso imediatamente sem perda de dados.
              </p>
            </div>
          </div>

          <a
            href={sub.kiwifyCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-red-600/25 hover:bg-red-700 transition-all active:scale-95"
          >
            <span>Reativar na Kiwify</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  // Assinatura Ativa (Badge sutil informativo)
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-900 px-4 py-2 text-white text-xs">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-slate-200">{sub.plan}</span>
        <span className="text-slate-400">• {sub.tenantName}</span>
      </div>

      <div className="flex items-center gap-2 text-slate-300 font-medium">
        <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
        <span>Kiwify Ativa</span>
      </div>
    </div>
  );
}
