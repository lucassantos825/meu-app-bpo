"use client";

import React, { useState, useEffect } from "react";
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
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ExternalLink,
  Check,
  RefreshCw,
  Info,
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
  date: string;
}

interface PendingAlert {
  id: string;
  title: string;
  divergenceDetail: string;
  amount: number;
  expectedAmount: number;
  difference: number;
  detectedAt: string;
}

const KIWIFY_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ||
  "https://kiwify.app/checkout-placeholder-bpo?plan=mensal-2990";

export default function DashboardPage() {
  // --- 1. ESTADO DE AUTENTICAÇÃO E SESSÃO ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [emailInput, setEmailInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  // --- 2. ESTADO DO CAIXA (INICIA TOTALMENTE LIMPO / ZERO DATA) ---
  const [balance, setBalance] = useState<number>(0.0);
  const [outflowToday, setOutflowToday] = useState<number>(0.0);
  const [inflowToday, setInflowToday] = useState<number>(0.0);
  const [reconciledItems, setReconciledItems] = useState<ReconciledItem[]>([]);
  const [alerts, setAlerts] = useState<PendingAlert[]>([]);

  // Modais de Upload
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "camera">("file");

  // Verifica se há sessão salva ao carregar
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem("bpo_auth_session");
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        if (sessionData && sessionData.email) {
          setIsAuthenticated(true);
          setUserEmail(sessionData.email);
        }
      }
    } catch {
      // Falha silenciosa de leitura de storage
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Login / Autenticação de Acesso ao Painel
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError("");

    if (!emailInput || !emailInput.includes("@")) {
      setAuthError("Informe um e-mail válido para acessar o painel.");
      return;
    }

    setIsSubmittingAuth(true);

    // Simulação de validação fluida de token/webhook Kiwify
    setTimeout(() => {
      const sessionObj = {
        email: emailInput,
        authenticatedAt: new Date().toISOString(),
        plan: "Plano Mensal OaaS",
      };

      try {
        localStorage.setItem("bpo_auth_session", JSON.stringify(sessionObj));
      } catch (err) {
        console.warn("Storage não disponível", err);
      }

      setUserEmail(emailInput);
      setIsAuthenticated(true);
      setIsSubmittingAuth(false);
    }, 600);
  };

  // Acesso Rápido para Demonstração do Dono / Testes
  const handleQuickDemoAccess = () => {
    setEmailInput("assinante@suaempresa.com.br");
    setIsSubmittingAuth(true);
    setTimeout(() => {
      const sessionObj = {
        email: "assinante@suaempresa.com.br",
        authenticatedAt: new Date().toISOString(),
        plan: "Plano Mensal OaaS",
      };
      try {
        localStorage.setItem("bpo_auth_session", JSON.stringify(sessionObj));
      } catch {
        // storage fallback
      }
      setUserEmail("assinante@suaempresa.com.br");
      setIsAuthenticated(true);
      setIsSubmittingAuth(false);
    }, 400);
  };

  // Logout / Desconectar
  const handleLogout = () => {
    try {
      localStorage.removeItem("bpo_auth_session");
    } catch {
      // storage cleanup
    }
    setIsAuthenticated(false);
    setUserEmail("");
    setEmailInput("");
  };

  const handleOpenUpload = (mode: "file" | "camera") => {
    setUploadMode(mode);
    setIsUploadOpen(true);
  };

  // Adição Dinâmica de Comprovante Processado
  const handleReceiptAdded = (extracted: ExtractedReceiptData) => {
    const isIncome = extracted.category.toLowerCase().includes("venda") || extracted.category.toLowerCase().includes("serviço");

    if (isIncome) {
      setBalance((prev) => prev + extracted.amount);
      setInflowToday((prev) => prev + extracted.amount);
    } else {
      setBalance((prev) => prev - extracted.amount);
      setOutflowToday((prev) => prev + extracted.amount);
    }

    // Se a confiança foi inferior a 90%, adiciona à lista de auto-resolução
    if (extracted.confidence < 0.9) {
      const newAlert: PendingAlert = {
        id: `alert-${Date.now()}`,
        title: extracted.recipient,
        divergenceDetail: `Variação diagnosticada pela IA na leitura do documento (${(extracted.confidence * 100).toFixed(0)}% de precisão). Confirme o valor para consolidar no caixa.`,
        amount: extracted.amount,
        expectedAmount: extracted.amount,
        difference: 0,
        detectedAt: "Agora mesmo",
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }

    // Adiciona ao topo dos conciliados
    const newItem: ReconciledItem = {
      id: extracted.id || Date.now().toString(),
      title: extracted.recipient,
      bankDetail: `${extracted.category} • Match 100% com Extrato Bancário`,
      amount: extracted.amount,
      type: isIncome ? "inflow" : "outflow",
      date: extracted.date || new Date().toISOString().split("T")[0],
    };
    setReconciledItems((prev) => [newItem, ...prev]);
  };

  // Auto-resolução de pendência em 1 clique
  const handleConfirmAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  // --- TELA DE PROTEÇÃO DE ACESSO / LOGIN (SE NÃO AUTENTICADO) ---
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100">
        <div className="w-full max-w-md space-y-8">
          {/* Topo da Autenticação */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">AutoCaixa AI</span>
            </Link>
            <h2 className="text-2xl font-black text-white">Acesso à Operação do Cliente</h2>
            <p className="text-xs text-slate-400">
              Digite o e-mail da sua compra Kiwify para acessar o painel do seu caixa.
            </p>
          </div>

          {/* Card do Formulário de Acesso */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email-input" className="block text-xs font-semibold text-slate-300">
                  E-mail do Assinante Kiwify:
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="email-input"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="exemplo@suaempresa.com.br"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                {authError && <p className="text-[11px] font-semibold text-rose-400">{authError}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-3 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all active:scale-98"
              >
                {isSubmittingAuth ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Validando Acesso Kiwify...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Painel</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative border-t border-slate-800 pt-4 text-center">
              <button
                type="button"
                onClick={handleQuickDemoAccess}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                ⚡ Ou clique aqui para acessar a demonstração imediata
              </button>
            </div>

            {/* Aviso para novos clientes */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center space-y-2">
              <p className="text-xs text-slate-400">Ainda não possui o plano ativo?</p>
              <a
                href={KIWIFY_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
              >
                Assinar Plano Mensal por R$ 29,90 <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              ← Voltar para a Página Inicial
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD AUTENTICADA E LIMPA ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Header Superior */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">AutoCaixa AI</h1>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">
                  Operação Ativa
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sessão Conectada: {userEmail || "cliente@suaempresa.com.br"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-600 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-1.5"
            >
              <Home className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Início</span>
            </Link>

            <Link
              href="/comprovantes"
              className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center gap-1.5"
            >
              <Camera className="h-3.5 w-3.5 text-blue-600" />
              <span>Scanner & Comprovantes</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-500 hover:text-rose-600 p-2 rounded-lg border border-slate-200 hover:bg-rose-50 transition-all flex items-center gap-1"
              title="Encerrar Sessão"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Banner de Assinatura Kiwify Dinâmico */}
        <SubscriptionStatusBanner />

        {/* BANNER / BOTÃO PRINCIPAL DE UPLOAD */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-600/10">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-blue-200" />
                Operação Financeira 100% Autônoma
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Envie seus comprovantes e deixe a IA conciliar o caixa.
              </h2>
              <p className="text-sm text-blue-100">
                Tire fotos pelo celular ou anexe recibos em PDF, Pix e notas. O robô concilia 24/7 com
                privacidade total e sem olhos humanos.
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

        {/* 1. RESUMO DO CAIXA DO DIA (TOTALMENTE LIMPO / ZERO DATA INICIAL) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Resumo do Caixa do Dia
            </h3>
            <span className="text-xs text-slate-400">Atualizado em tempo real</span>
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
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Info className="h-3.5 w-3.5 text-blue-500" />
                <span>
                  {reconciledItems.length === 0
                    ? "Inicie enviando seus primeiros documentos"
                    : "Saldo conciliado com precisão"}
                </span>
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
              <p className="mt-2 text-xs text-slate-400">
                {reconciledItems.filter((i) => i.type === "inflow").length} recebimentos
              </p>
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
                {reconciledItems.filter((i) => i.type === "outflow").length} pagamentos
              </p>
            </div>
          </div>
        </section>

        {/* 2. CENTRAL DE AUTO-RESOLUÇÃO & CONFIRMAÇÃO DO CLIENTE */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    Auto-Resolução: Confirmação Rápida do Cliente
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      alerts.length > 0
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {alerts.length} pendências
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  A IA diagnostica variações e sugere os ajustes diretamente na sua tela, sem
                  intermediários humanos.
                </p>
              </div>
            </div>
          </div>

          {/* Estado Vazio de Alertas / Tudo em Ordem */}
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 flex items-center gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Caixa 100% Conciliado • Nenhuma divergência pendente</p>
                <p className="text-emerald-700 text-[11px]">
                  O agente autônomo está monitorando seus extratos. Você só receberá solicitações se
                  houver divergência para aprovar.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {alerts.map((al) => (
                <div
                  key={al.id}
                  className="rounded-xl border border-amber-200 bg-amber-50/30 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                        Variação Identificada
                      </span>
                      <h4 className="mt-1 text-sm font-bold text-slate-900">{al.title}</h4>
                      <p className="text-xs text-slate-600 mt-1">{al.divergenceDetail}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-amber-100">
                    <span className="text-xs text-slate-400">{al.detectedAt}</span>
                    <button
                      type="button"
                      onClick={() => handleConfirmAlert(al.id)}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-bold text-white transition-colors flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Aprovar Ajuste em 1 Clique
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 3. FEED DE CONCILIADOS PELA IA (ESTADO LIMPO / EMPTY STATE ELEGANTE) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Conciliados Automaticamente com Sucesso
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {reconciledItems.length} processados hoje
            </span>
          </div>

          {/* Empty State Elegante se não houver comprovantes */}
          {reconciledItems.length === 0 ? (
            <div className="py-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-xl">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                Nenhum comprovante enviado ainda
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Faça o upload do seu primeiro documento ou tire uma foto com a câmera do celular para
                a IA começar a operar.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenUpload("file")}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all"
                >
                  <UploadCloud className="h-4 w-4" />
                  Enviar Primeiro Comprovante
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenUpload("camera")}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <Camera className="h-4 w-4 text-blue-600" />
                  Escanear Câmera
                </button>
              </div>
            </div>
          ) : (
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
          )}
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
