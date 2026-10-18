"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  Mail,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Zap,
  Lock,
  Bot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const KIWIFY_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ||
  "https://kiwify.app/checkout-placeholder-bpo?plan=mensal-2990";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const errorParam = searchParams.get("error");

  const { loginAsSubscriber, loginAsFreeDemo, isAuthenticated } = useAuth();

  const [emailInput, setEmailInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [simulatedStatus, setSimulatedStatus] = useState<
    "idle" | "subscriber_found" | "demo_access" | "inactive"
  >("idle");

  // Se já autenticado, redireciona
  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectTarget);
    }
  }, [isAuthenticated, redirectTarget, router]);

  useEffect(() => {
    if (errorParam === "subscription_inactive") {
      setErrorMessage(
        "Sua assinatura Kiwify está inativa ou pausada. Renove seu plano para restabelecer o acesso total."
      );
    }
  }, [errorParam]);

  // Simulação dinâmica ao digitar e-mail
  const handleEmailChange = (val: string) => {
    setEmailInput(val);
    setErrorMessage("");

    if (val.includes("@")) {
      setCheckingSubscription(true);
      setTimeout(() => {
        setCheckingSubscription(false);
        if (
          val.toLowerCase().includes("pro") ||
          val.toLowerCase().includes("assinante") ||
          val.toLowerCase().includes("silva")
        ) {
          setSimulatedStatus("subscriber_found");
        } else {
          setSimulatedStatus("demo_access");
        }
      }, 350);
    } else {
      setSimulatedStatus("idle");
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!emailInput || !emailInput.includes("@")) {
      setErrorMessage("Por favor, informe um endereço de e-mail válido.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (simulatedStatus === "subscriber_found") {
        loginAsSubscriber(emailInput, "Minha Empresa (Assinante OaaS)");
      } else {
        loginAsFreeDemo(emailInput);
      }
      setIsLoading(false);
      router.push(redirectTarget);
    }, 500);
  };

  const handleQuickPaidLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsSubscriber("assinante.pro@empresa.com.br", "Oficina Silva Peças Ltda");
      setIsLoading(false);
      router.push(redirectTarget);
    }, 300);
  };

  const handleQuickFreeLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsFreeDemo("visitante.demo@exemplo.com.br");
      setIsLoading(false);
      router.push(redirectTarget);
    }, 300);
  };

  return (
    <div className="w-full max-w-md space-y-7">
      {/* Topo / Logo */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-3 group mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Bot className="h-6 w-6" />
          </div>
          <div className="text-left">
            <span className="text-xl font-black text-white tracking-tight">AutoCaixa AI</span>
            <span className="block text-[11px] text-blue-400 font-semibold uppercase tracking-wider">
              Micro-OaaS Autônomo
            </span>
          </div>
        </Link>
        <h1 className="text-2xl font-black text-white">Acesse o seu Painel</h1>
        <p className="text-xs text-slate-400">
          Entre com seu e-mail cadastrado na Kiwify ou explore a demonstração gratuita.
        </p>
      </div>

      {/* Mensagem de Erro / Alerta de Assinatura */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-200 flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Aviso de Assinatura</p>
            <p>{errorMessage}</p>
            <a
              href={KIWIFY_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-rose-300 underline hover:text-white pt-1"
            >
              Reativar Assinatura na Kiwify <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}

      {/* Card do Formulário de Acesso */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-bold text-slate-300">
              E-mail do Responsável:
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                value={emailInput}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="seu.email@empresa.com.br"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Feedback de Status em tempo real */}
            {checkingSubscription && (
              <p className="text-[11px] text-blue-400 flex items-center gap-1.5 pt-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Verificando status na Kiwify...
              </p>
            )}

            {!checkingSubscription && simulatedStatus === "subscriber_found" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-[11px] text-emerald-300 flex items-center gap-2 mt-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>Assinatura Kiwify Ativa:</strong> Plano Pago OaaS (Uploads ilimitados e relatórios completos).
                </span>
              </div>
            )}

            {!checkingSubscription && simulatedStatus === "demo_access" && (
              <div className="rounded-xl border border-blue-500/30 bg-blue-950/40 px-3 py-2 text-[11px] text-blue-300 flex items-center gap-2 mt-1">
                <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
                <span>
                  Acesso como <strong>Plano Free</strong> (até 3 uploads mensais e extrato resumido).
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/30 transition-all active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Autenticando...</span>
              </>
            ) : (
              <>
                <span>Entrar com este E-mail</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Divisor */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="absolute bg-slate-900 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Acesso Rápido para Avaliação
          </span>
        </div>

        {/* Botoes de Acesso Rapido (Free vs Pago) */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleQuickPaidLogin}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-between rounded-xl border border-blue-500/40 bg-blue-950/30 hover:bg-blue-950/50 p-3 text-left transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-500/20">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                  Acessar como Assinante Pro (Plano Pago OaaS)
                </p>
                <p className="text-[10px] text-slate-400">
                  R$ 29,90/mês • Uploads em lote, DRE e auto-resolução
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>

          <button
            type="button"
            onClick={handleQuickFreeLogin}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 p-3 text-left transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-300 font-black text-xs">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                  Acessar Demonstração (Plano Free)
                </p>
                <p className="text-[10px] text-slate-500">
                  Limite de 3 uploads/mês e extrato de 5 linhas
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </button>
        </div>

        {/* Chamada para Assinar na Kiwify */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-center space-y-1.5">
          <p className="text-xs text-slate-400">Ainda não assinou o plano completo?</p>
          <a
            href={KIWIFY_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Assinar Plano Mensal por R$ 29,90</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-300 transition-colors">
          ← Voltar para a Página Inicial
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12 text-slate-100 selection:bg-blue-600 selection:text-white">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="text-xs font-bold">Carregando formulário de acesso...</span>
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
