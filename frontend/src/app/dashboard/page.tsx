"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Sparkles,
  ArrowUpRight,
  Camera,
  FileText,
  ShieldCheck,
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import UploadModal, { ExtractedReceiptData } from "@/components/UploadModal";
import SubscriptionStatusBanner from "@/components/subscription/SubscriptionStatusBanner";
import { formatCurrencyBRL } from "@/lib/utils";

interface ReconciledItem {
  id: string;
  title: string;
  bankDetail: string;
  amount: number;
  type: "inflow" | "outflow";
}

export default function DashboardPage() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "camera">("file");

  // Estado dinâmico do caixa
  const [balance, setBalance] = useState(14850.2);
  const [outflowToday, setOutflowToday] = useState(1150.0);
  const [inflowToday, setInflowToday] = useState(3200.0);

  // Lista dinâmica de conciliados
  const [reconciledItems, setReconciledItems] = useState<ReconciledItem[]>([
    {
      id: "1",
      title: "Pagamento Fornecedor Silva & Filhos",
      bankDetail: "Boleto Itaú • Match 100% com Extrato Bancário",
      amount: 840.0,
      type: "outflow",
    },
    {
      id: "2",
      title: "Recebimento Pix Cliente Carla Mendes",
      bankDetail: "Serviço de Consultoria • Match 100% com Nubank",
      amount: 1500.0,
      type: "inflow",
    },
  ]);

  const handleOpenUpload = (mode: "file" | "camera") => {
    setUploadMode(mode);
    setIsUploadOpen(true);
  };

  const handleReceiptAdded = (extracted: ExtractedReceiptData) => {
    // Atualiza saldo e saídas
    setBalance((prev) => prev - extracted.amount);
    setOutflowToday((prev) => prev + extracted.amount);

    // Adiciona ao topo da lista de conciliados
    const newItem: ReconciledItem = {
      id: Date.now().toString(),
      title: extracted.recipient,
      bankDetail: `${extracted.category} • Match 100% com Extrato Bancário`,
      amount: extracted.amount,
      type: "outflow",
    };
    setReconciledItems((prev) => [newItem, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Superior */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  AutoCaixa AI
                </h1>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                  Dashboard
                </span>
              </div>
              <p className="text-xs text-slate-500">BPO Financeiro Autônomo • Microempresa Pro</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center gap-1.5"
              title="Voltar para a Página Inicial"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Página Inicial</span>
            </Link>

            <Link
              href="/comprovantes"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-blue-600" />
              <span>Scanner & Comprovantes</span>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              IA Ativa (92% Automático)
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Banner de Assinatura Kiwify / Status do Plano */}
        <SubscriptionStatusBanner />

        {/* BANNER / BOTÃO PRINCIPAL DE UPLOAD */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-blue-200" />
                Leitura Instantânea com IA Multimodal
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Suba comprovantes e deixe o robô conciliar o caixa.
              </h2>
              <p className="text-sm text-blue-100">
                Tire foto pelo celular ou envie notas fiscais, cupons, boletos e Pix. Você só
                precisa intervir se houver divergência.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleOpenUpload("file")}
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-base font-bold text-blue-700 shadow-lg shadow-black/10 transition-all hover:bg-blue-50 active:scale-95"
              >
                <UploadCloud className="h-6 w-6 text-blue-600 transition-transform group-hover:-translate-y-0.5" />
                <span>Upload de Comprovante</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenUpload("camera")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500/30 border border-white/20 px-4 py-4 text-sm font-semibold text-white transition-all hover:bg-blue-500/40"
              >
                <Camera className="h-5 w-5" />
                <span>Escanear Câmera</span>
              </button>
            </div>
          </div>
        </section>

        {/* 1. RESUMO DO CAIXA DO DIA */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Resumo do Caixa do Dia
            </h3>
            <span className="text-xs text-slate-400">Atualizado agora</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Saldo Atual */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Saldo Atual Conciliado</span>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {formatCurrencyBRL(balance)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>+8.4% em relação ao mês anterior</span>
              </div>
            </div>

            {/* Entradas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Entradas de Hoje</span>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-600">
                + {formatCurrencyBRL(inflowToday)}
              </p>
              <p className="mt-2 text-xs text-slate-400">4 recebimentos identificados</p>
            </div>

            {/* Saídas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-medium">Saídas / Pagamentos Hoje</span>
                <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-rose-600">
                - {formatCurrencyBRL(outflowToday)}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {reconciledItems.length} lançamentos contabilizados
              </p>
            </div>
          </div>
        </section>

        {/* 2. ÁREA DE DESTAQUE: AUTO-RESOLUÇÃO E CONFIRMAÇÃO DO CLIENTE */}
        <section className="rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Auto-Resolução: Confirmação Rápida do Cliente
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white">
                    2 confirmações pendentes
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  A IA diagnosticou divergências no extrato e preparou os ajustes. Confirme diretamente na sua tela em 1 clique (sem intermediários humanos).
                </p>
              </div>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
            >
              Confirmar Ajustes Sugeridos (2)
            </button>
          </div>

          {/* Cards de Alerta */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Alerta 1 */}
            <div className="rounded-xl border border-red-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-800">
                    Divergência de Valor
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-slate-900">
                    Posto Shell Auto Posto Ltda
                  </h4>
                  <p className="text-xs text-slate-500">Comprovante: R$ 158,50 • Extrato: R$ 165,00</p>
                </div>
                <span className="text-xs font-bold text-red-600">Diferença: R$ 6,50</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">Detectado hoje às 08:42</span>
                <button
                  type="button"
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition-colors"
                >
                  Comparar Lado a Lado
                </button>
              </div>
            </div>

            {/* Alerta 2 */}
            <div className="rounded-xl border border-amber-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    Documento com Baixa Confiança (68%)
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-slate-900">
                    Recibo Sem CNPJ Identificado
                  </h4>
                  <p className="text-xs text-slate-500">Valor provável: R$ 320,00 • Imagem cortada</p>
                </div>
                <span className="text-xs font-bold text-amber-600">Requer Confirmação</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400">Detectado ontem às 17:15</span>
                <button
                  type="button"
                  className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Digitar Dados Manualmente
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FEED DE ÚLTIMOS CONCILIADOS COM SUCESSO PELA IA */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Conciliados Automaticamente com Sucesso
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {reconciledItems.length} lançamentos processados
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {reconciledItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.bankDetail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      item.type === "inflow" ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {item.type === "inflow" ? "+ " : "- "}
                    {formatCurrencyBRL(item.amount)}
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    Conciliado por IA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Modal Interativo de Upload & Scanner com Câmera */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        initialMode={uploadMode === "camera" ? "camera" : "upload"}
        onSuccessAdd={handleReceiptAdded}
      />
    </div>
  );
}
