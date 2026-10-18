"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  UploadCloud,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Camera,
  FileText,
  ShieldCheck,
  Home,
  LogOut,
  Lock,
  ArrowRight,
  ExternalLink,
  Check,
  RefreshCw,
  Info,
  Layers,
  Zap,
  FileSpreadsheet,
  CalendarDays,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth, PlanType } from "@/context/AuthContext";
import UploadModal, { ExtractedReceiptData } from "@/components/UploadModal";
import SubscriptionStatusBanner from "@/components/subscription/SubscriptionStatusBanner";
import BatchUploadQueue from "@/components/dashboard/BatchUploadQueue";
import AutoResolutionPanel, {
  AutoResolutionAlert,
} from "@/components/dashboard/AutoResolutionPanel";
import ManagerialReports from "@/components/dashboard/ManagerialReports";
import FinancialSchedule from "@/components/dashboard/FinancialSchedule";
import FreePlanLimitations from "@/components/dashboard/FreePlanLimitations";
import { formatCurrencyBRL } from "@/lib/utils";

interface ReconciledItem {
  id: string;
  title: string;
  bankDetail: string;
  amount: number;
  type: "inflow" | "outflow";
  date: string;
}

const INITIAL_RECONCILED: ReconciledItem[] = [
  {
    id: "rec-1",
    title: "Posto Shell - Auto Posto Ipiranga",
    bankDetail: "Fornecedores / Mercadorias • Conciliado c/ Auto-Resolução",
    amount: 158.5,
    type: "outflow",
    date: "18/10/2026",
  },
  {
    id: "rec-2",
    title: "Kalunga Comércio e Indústria Gráfica",
    bankDetail: "Material de Escritório • Match 100% Extrato Nubank",
    amount: 245.9,
    type: "outflow",
    date: "18/10/2026",
  },
  {
    id: "rec-3",
    title: "Carla Mendes Comércio Varejista",
    bankDetail: "Venda de Serviços • Recebimento Pix Itaú",
    amount: 1500.0,
    type: "inflow",
    date: "18/10/2026",
  },
  {
    id: "rec-4",
    title: "Imobiliária Central Patrimonial",
    bankDetail: "Aluguel & Condomínio • Boleto Itaú Conciliado",
    amount: 1850.0,
    type: "outflow",
    date: "17/10/2026",
  },
  {
    id: "rec-5",
    title: "Amazon Web Services do Brasil",
    bankDetail: "Ferramentas & Software • Débito Cartão PJ",
    amount: 124.3,
    type: "outflow",
    date: "17/10/2026",
  },
  {
    id: "rec-6",
    title: "Cliente Roberto Silveira ME",
    bankDetail: "Prestação de Serviços • TED Recebida",
    amount: 1700.0,
    type: "inflow",
    date: "16/10/2026",
  },
  {
    id: "rec-7",
    title: "Supermercados Pão de Açúcar",
    bankDetail: "Copa & Limpeza Operacional • Pix Débito",
    amount: 189.4,
    type: "outflow",
    date: "16/10/2026",
  },
];

const INITIAL_ALERTS: AutoResolutionAlert[] = [
  {
    id: "al-1",
    title: "Posto Shell Express - Combustível Operacional",
    docAmount: 158.5,
    bankAmount: 165.0,
    bankName: "Itaú Unibanco",
    difference: 6.5,
    reason:
      "Variação de R$ 6,50 identificada entre o comprovante e o extrato bancário. A IA diagnosticou taxa de conveniência/tarifa de abastecimento e formulou o lançamento compensatório.",
    suggestedAction: "Aprovar ajuste de R$ 6,50 diretamente no extrato",
    detectedAt: "Hoje às 14:22",
  },
  {
    id: "al-2",
    title: "Kalunga Gráfica - Papelaria e Suprimentos",
    docAmount: 245.5,
    bankAmount: 245.9,
    bankName: "Nubank PJ",
    difference: 0.4,
    reason:
      "Diferença de R$ 0,40 nos centavos de arredondamento de cupom fiscal vs débito via Pix QR Code.",
    suggestedAction: "Aprovar arredondamento automático de R$ 0,40",
    detectedAt: "Hoje às 11:05",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    logout,
    switchPlan,
    incrementQuota,
    openUpgradeModal,
  } = useAuth();

  // Se não autenticado e após loading, redireciona
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Estados do Caixa
  const [balance, setBalance] = useState<number>(14850.2);
  const [inflowToday, setInflowToday] = useState<number>(3200.0);
  const [outflowToday, setOutflowToday] = useState<number>(1150.0);
  const [reconciledItems, setReconciledItems] = useState<ReconciledItem[]>(INITIAL_RECONCILED);
  const [alerts, setAlerts] = useState<AutoResolutionAlert[]>(INITIAL_ALERTS);

  // Modais de Upload
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"upload" | "camera">("upload");

  const currentPlan = user?.plan || "FREE";
  const quotaUsed = user?.quotaUsed || 0;
  const quotaLimit = user?.quotaLimit || 3;

  // Handler para abrir Upload individual
  const handleOpenIndividualUpload = (mode: "upload" | "camera") => {
    if (currentPlan === "FREE" && quotaUsed >= quotaLimit) {
      openUpgradeModal(
        `Você atingiu o limite de ${quotaLimit} documentos do Plano Free. Assine o Plano Pago OaaS por R$ 29,90/mês para envios ilimitados.`
      );
      return;
    }
    setUploadMode(mode);
    setIsUploadOpen(true);
  };

  // Callback de comprovante adicionado individualmente
  const handleReceiptAdded = (extracted: ExtractedReceiptData) => {
    if (currentPlan === "FREE") {
      incrementQuota();
    }

    setBalance((prev) => prev - extracted.amount);
    setOutflowToday((prev) => prev + extracted.amount);

    const newItem: ReconciledItem = {
      id: extracted.id || `rec-${Date.now()}`,
      title: extracted.recipient,
      bankDetail: `${extracted.category} • Conciliado por IA`,
      amount: extracted.amount,
      type: "outflow",
      date: new Date().toISOString().split("T")[0],
    };

    setReconciledItems((prev) => [newItem, ...prev]);

    // Se houve baixa confiança, gera alerta
    if (extracted.confidence < 0.9) {
      const newAlert: AutoResolutionAlert = {
        id: `al-${Date.now()}`,
        title: extracted.recipient,
        docAmount: extracted.amount,
        bankAmount: extracted.amount,
        bankName: "Itaú Unibanco",
        difference: 0,
        reason: `IA detectou ${(extracted.confidence * 100).toFixed(0)}% de nitidez. Documento validado com auto-resolução.`,
        suggestedAction: "Aprovar lançamento no caixa",
        detectedAt: "Agora mesmo",
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  // Callback de itens processados via Lote (Módulo 1 do Plano Pago)
  const handleBatchItemsProcessed = (
    processedItems: {
      recipient: string;
      amount: number;
      category: string;
      type: "inflow" | "outflow";
      date: string;
      hasDivergence?: boolean;
      divergenceReason?: string;
    }[]
  ) => {
    processedItems.forEach((item) => {
      if (item.type === "inflow") {
        setBalance((prev) => prev + item.amount);
        setInflowToday((prev) => prev + item.amount);
      } else {
        setBalance((prev) => prev - item.amount);
        setOutflowToday((prev) => prev + item.amount);
      }

      const newItem: ReconciledItem = {
        id: `rec-batch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: item.recipient,
        bankDetail: `${item.category} • Conciliado via Lote Pro`,
        amount: item.amount,
        type: item.type,
        date: item.date,
      };

      setReconciledItems((prev) => [newItem, ...prev]);

      if (item.hasDivergence) {
        const newAlert: AutoResolutionAlert = {
          id: `al-${Date.now()}`,
          title: item.recipient,
          docAmount: item.amount,
          bankAmount: item.amount + 6.5,
          bankName: "Itaú Unibanco",
          difference: 6.5,
          reason: item.divergenceReason || "Variação identificada no lote.",
          suggestedAction: "Aprovar Auto-Resolução em 1-Clique",
          detectedAt: "Agora mesmo",
        };
        setAlerts((prev) => [newAlert, ...prev]);
      }
    });
  };

  // Resolução em 1-clique (Módulo 2 do Plano Pago)
  const handleResolveAlert = (alertId: string, adjustedAmount: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold">Carregando painel financeiro...</span>
        </div>
      </div>
    );
  }

  // No Plano Free, o extrato é estritamente limitado a 5 linhas
  const visibleReconciledItems =
    currentPlan === "FREE" ? reconciledItems.slice(0, 5) : reconciledItems;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* 1. HEADER DO DASHBOARD */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">AutoCaixa OaaS AI</h1>
                {currentPlan === "PAID_OAAS" ? (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800 uppercase tracking-wide">
                    Plano Pago OaaS
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 uppercase tracking-wide">
                    Plano Free
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {user.email} • {user.tenantName}
              </p>
            </div>
          </div>

          {/* Ações da Barra Superior */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Seletor Rápido de Plano para Teste e Avaliação */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => switchPlan("FREE")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currentPlan === "FREE"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Visão Free (3 envios)
              </button>
              <button
                type="button"
                onClick={() => switchPlan("PAID_OAAS")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  currentPlan === "PAID_OAAS"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Visão Pago (R$ 29,90)
              </button>
            </div>

            <Link
              href="/comprovantes"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline">Scanner & Recibos</span>
            </Link>

            {currentPlan === "FREE" && (
              <button
                type="button"
                onClick={() => openUpgradeModal("Desbloqueie o Plano Pago OaaS por apenas R$ 29,90/mês.")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Assinar R$ 29,90</span>
              </button>
            )}

            <button
              type="button"
              onClick={logout}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 p-2 rounded-lg border border-slate-200 hover:bg-rose-50 transition-all"
              title="Encerrar Sessão"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Banner de Status Kiwify */}
        <SubscriptionStatusBanner />

        {/* 2. ÁREA DE LIMITAÇÕES OU DESTAQUE (FREE VS PAGO) */}
        {currentPlan === "FREE" ? (
          <FreePlanLimitations quotaUsed={quotaUsed} quotaLimit={quotaLimit} />
        ) : (
          /* BANNER DO PLANO PAGO ILIMITADO */
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 p-6 text-white shadow-xl shadow-blue-600/10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                  Operação 100% Autônoma • Plano Pago Ativo
                </div>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Seu caixa gerido no piloto automático pela IA.
                </h2>
                <p className="text-xs sm:text-sm text-blue-100">
                  Uploads ilimitados, motor de auto-resolução em 1-clique, DRE consolidado e fechamento contábil mensal.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => handleOpenIndividualUpload("upload")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 active:scale-95 transition-all"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Envio Individual</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenIndividualUpload("camera")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500/30 border border-white/20 px-4 py-3.5 text-xs font-semibold text-white hover:bg-blue-500/40 transition-all"
                >
                  <Camera className="h-4 w-4" />
                  <span>Escanear Câmera</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 3. RESUMO DO CAIXA DO DIA */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resumo do Caixa Consolidado
            </h3>
            <span className="text-xs text-slate-400">Atualização contínua 24/7</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Saldo Atual */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Saldo Atual Conciliado</span>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <Wallet className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-900 tracking-tight">
                {formatCurrencyBRL(balance)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Extratos e comprovantes batidos</span>
              </div>
            </div>

            {/* Entradas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Entradas de Hoje</span>
                <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-600 tracking-tight">
                + {formatCurrencyBRL(inflowToday)}
              </p>
              <p className="mt-2 text-xs text-slate-400">Recebimentos via Pix e TED</p>
            </div>

            {/* Saídas */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Saídas / Pagamentos Hoje</span>
                <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                  <TrendingDown className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-black text-rose-600 tracking-tight">
                - {formatCurrencyBRL(outflowToday)}
              </p>
              <p className="mt-2 text-xs text-slate-400">Fornecedores, despesas e impostos</p>
            </div>
          </div>
        </section>

        {/* 4. MÓDULOS ESPECÍFICOS DO PLANO PAGO (R$ 29,90) */}
        {currentPlan === "PAID_OAAS" && (
          <div className="space-y-6">
            {/* MÓDULO 1: Upload em Lote & Fila Drag & Drop */}
            <BatchUploadQueue onItemsProcessed={handleBatchItemsProcessed} />

            {/* MÓDULO 2: Auto-Resolução em 1-Clique para divergências de centavos */}
            <AutoResolutionPanel alerts={alerts} onResolve={handleResolveAlert} />

            {/* MÓDULO 3: Relatórios Gerenciais (DRE Dinâmico e Pacote Contábil .zip) */}
            <ManagerialReports />

            {/* MÓDULO 4: Agenda Financeira com alertas visuais */}
            <FinancialSchedule />
          </div>
        )}

        {/* 5. SEÇÃO DE CONCILIADOS (COM LIMITE DE 5 LINHAS NO PLANO FREE) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Extrato de Comprovantes Conciliados
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {currentPlan === "FREE" ? "5 primeiros lançamentos (Free)" : `${reconciledItems.length} registros`}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {visibleReconciledItems.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.bankDetail} • {item.date}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs sm:text-sm font-black ${
                      item.type === "inflow" ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {item.type === "inflow" ? "+ " : "- "}
                    {formatCurrencyBRL(item.amount)}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    Conciliado 100%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* TRAVA VISUAL DO EXTRATO NO PLANO FREE: AVISO DAS 5 LINHAS */}
          {currentPlan === "FREE" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900">
                <Lock className="h-4 w-4 text-amber-600" />
                <span>Extrato Limitado a 5 Linhas no Plano Free</span>
              </div>
              <p className="text-xs text-amber-800 max-w-md mx-auto">
                No Plano Pago OaaS, você visualiza todo o histórico contábil sem limitações e exporta o pacote completo para o seu contador.
              </p>
              <button
                type="button"
                onClick={() => openUpgradeModal("Desbloqueie o extrato completo e ilimitado no Plano Pago.")}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 underline"
              >
                <span>Assinar Plano Mensal por R$ 29,90 e Desbloquear Extrato Ilimitado</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Modal Individual de Upload e Scanner */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        initialMode={uploadMode}
        onSuccessAdd={handleReceiptAdded}
      />
    </div>
  );
}
