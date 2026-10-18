"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Camera,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Lock,
  Clock,
  Check,
  Star,
  Play,
  Laptop,
  EyeOff,
  Bot,
  BellRing,
} from "lucide-react";

// Variável de ambiente exposta para o checkout da Kiwify
const KIWIFY_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ||
  "https://kiwify.app/checkout-placeholder-bpo?plan=mensal-2990";

// Benefícios do modelo Micro-OaaS 100% Autônomo
const OAAS_BENEFITS = [
  {
    icon: Bot,
    title: "Operação 100% Autônoma (OaaS)",
    description:
      "Esqueça softwares complexos que você precisa operar. Nossos Agentes de IA executam toda a rotina financeira de ponta a ponta sem exigir que você perca tempo com parametrizações manuais.",
    badge: "Micro-OaaS Puro",
  },
  {
    icon: EyeOff,
    title: "Privacidade Total: Zero Olhos Humanos",
    description:
      "Seus comprovantes, faturas e extratos bancários são lidos e processados diretamente pela IA em ambiente criptografado. Nenhum operador humano visualiza suas informações confidenciais.",
    badge: "Sigilo Bancário Absoluto",
  },
  {
    icon: Camera,
    title: "Leitura Instantânea com IA Multimodal",
    description:
      "Tire foto pelo celular de cupons térmicos, recibos, boletos ou envie capturas de Pix. A IA extrai valores, datas, CNPJ e categoriza as contas em menos de 2 segundos.",
    badge: "Visão Computacional 24/7",
  },
  {
    icon: Zap,
    title: "Conciliação Bancária em Tempo Real",
    description:
      "O agente autônomo cruza cada comprovante diretamente com as entradas e saídas do seu extrato bancário, atualizando o saldo do seu caixa instantaneamente.",
    badge: "92%+ Conciliado sem Toque",
  },
  {
    icon: BellRing,
    title: "Auto-Resolução e Confirmação do Cliente",
    description:
      "Se houver divergência de centavos ou taxa bancária, o sistema não depende de filas de suporte interno. Uma notificação inteligente surge na sua tela para você aprovar o ajuste em 1 clique.",
    badge: "1-Clique no Painel",
  },
  {
    icon: BarChart3,
    title: "Fechamento Mensal e Pacote Contábil",
    description:
      "No final do mês, seu DRE e fluxo de caixa já estão fechados. O sistema gera um pacote contábil completo e estruturado pronto para envio ao seu contador.",
    badge: "Contabilidade em Dia",
  },
];

// Perguntas frequentes do FAQ
const FAQ_ITEMS = [
  {
    q: "O que é Micro-OaaS (Operation-as-a-Service)?",
    a: "Diferente de um SaaS tradicional onde você compra uma ferramenta e ainda precisa trabalhar nela, o Micro-OaaS entrega a própria operação financeira executada de forma 100% autônoma por Agentes de Inteligência Artificial.",
  },
  {
    q: "Existe alguma pessoa olhando meus comprovantes ou extratos?",
    a: "Não! Esse é um dos maiores pilares da nossa tecnologia. Os comprovantes são processados e conciliados exclusivamente por modelos de IA criptografados ponta a ponta. Zero operadores humanos, garantindo sigilo bancário total para a sua empresa.",
  },
  {
    q: "O que acontece quando há divergência entre o comprovante e o extrato?",
    a: "O agente autônomo executa um diagnóstico inteligente (identifica tarifas bancárias, descontos ou pequenas variações) e envia uma notificação inteligente direto no seu painel. Você confirma ou ajusta a sugestão com 1 único clique, sem intermediários nem filas de espera.",
  },
  {
    q: "Como recebo meu acesso após assinar pela Kiwify?",
    a: "A ativação é 100% automática e imediata. Logo após a aprovação do pagamento na Kiwify (Pix ou Cartão), o sistema provisiona o seu ambiente seguro e envia seus dados de acesso ao seu e-mail em menos de 60 segundos.",
  },
  {
    q: "Como funciona o Plano Mensal de R$ 29,90?",
    a: "É uma assinatura mensal acessível e sem surpresas. Dá direito à operação autônoma completa, scanner por câmera, conciliação com IA, fechamento contábil e garantia incondicional de 7 dias com cancelamento em 1 clique pela Kiwify.",
  },
];

export default function SalesLandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. BARRA DE TOPO - ANÚNCIO KIWIFY */}
      <div className="relative z-40 bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 px-4 py-2.5 text-center text-xs font-semibold text-white shadow-sm sm:text-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-black uppercase tracking-wider backdrop-blur-sm">
            Micro-OaaS Autônomo
          </span>
          <span>
            ⚡ <strong>Plano Mensal por apenas R$ 29,90</strong> • Operação 24/7 sem intermediários humanos + 7 dias de garantia Kiwify!
          </span>
          <a
            href={KIWIFY_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 font-bold underline hover:text-blue-100 transition-colors"
          >
            Assinar Agora <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>

      {/* 2. NAVBAR INSTITUCIONAL */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Logo da Marca */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">
                  AutoCaixa
                </span>
                <span className="rounded-md bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                  OaaS AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Operação Financeira 100% Autônoma</p>
            </div>
          </Link>

          {/* Menu de Navegação */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#beneficios" className="hover:text-blue-400 transition-colors">
              Benefícios OaaS
            </a>
            <a href="#como-funciona" className="hover:text-blue-400 transition-colors">
              Como Funciona
            </a>
            <a href="#privacidade" className="hover:text-blue-400 transition-colors">
              Privacidade Total
            </a>
            <a href="#precos" className="hover:text-blue-400 transition-colors">
              Preço
            </a>
            <a href="#faq" className="hover:text-blue-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Ações da Barra */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 border border-slate-700/70 transition-all flex items-center gap-1.5"
            >
              <Laptop className="h-3.5 w-3.5 text-blue-400" />
              <span>Acessar Painel</span>
            </Link>

            <a
              href="#precos"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-extrabold text-white shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
            >
              <span>Assinar por R$ 29,90</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION - HEADLINE OaaS 100% AUTÔNOMO */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Badge de Posicionamento OaaS */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-950/60 px-3.5 py-1.5 text-xs font-semibold text-blue-300 backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <span>Micro-OaaS: Operation-as-a-Service com IA</span>
            </div>

            {/* Headline Principal OaaS */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Sua Operação Financeira{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                100% Autônoma
              </span>{" "}
              gerida por Inteligência Artificial.
            </h1>

            {/* Subtítulo Destacando Ausência de Intervenção Humana e Operação 24/7 */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Elimine o trabalho braçal e a necessidade de equipes operacionais. Nossos agentes de IA
              processam recibos, conciliam extratos bancários 24 horas por dia e mantêm seu caixa
              fechado com <strong>privacidade absoluta e sem olhos humanos nos seus dados</strong>.
            </p>

            {/* Botões de Ação do Hero */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <a
                href={KIWIFY_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/25 hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition-all"
              >
                <span>Assinar Agora por R$ 29,90/mês</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 px-6 py-4 text-sm font-bold text-slate-200 hover:text-white transition-all backdrop-blur-sm"
              >
                <Play className="h-4 w-4 text-blue-400 fill-blue-400" />
                <span>Ver Demonstração do Painel</span>
              </Link>
            </div>

            {/* Selos de Confiança OaaS */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-slate-200 font-bold">4.9/5</span>
                <span className="text-slate-400 font-normal">(+350 empresas ativas)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <EyeOff className="h-4 w-4 text-emerald-400" />
                <span>Zero Olhos Humanos (Privacidade 100%)</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Operação Contínua 24/7/365</span>
              </div>
            </div>
          </div>

          {/* MOCKUP VISUAL DO PRODUTO OaaS */}
          <div className="mt-14 rounded-3xl border border-slate-800 bg-slate-950/70 p-4 sm:p-6 shadow-2xl shadow-blue-950/40 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-5 px-1">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-medium text-slate-400 hidden sm:inline">
                  AutoCaixa OaaS Engine • Processamento Autônomo e Criptografado
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-800/60">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Agente de IA Ativo 24/7
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Saldo Consolidado */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Caixa Consolidado do Dia
                  </span>
                  <Wallet className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-white">R$ 14.850,20</div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Atualizado de forma autônoma pela IA</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                  <span>Entradas: + R$ 3.200,00</span>
                  <span>Saídas: - R$ 1.150,00</span>
                </div>
              </div>

              {/* Card 2: Conciliado com Sucesso */}
              <div className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5 space-y-3">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Conciliado Autonomamente
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">
                    Match 100%
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Fornecedor Silva Peças Ltda</h4>
                  <p className="text-xs text-slate-400">Boleto Itaú • Pago via Pix QR Code</p>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-slate-400">Tempo de IA: 0.8s</span>
                  <span className="text-sm font-black text-rose-400">- R$ 840,00</span>
                </div>
              </div>

              {/* Card 3: Auto-Resolução com Confirmação do Próprio Cliente */}
              <div className="rounded-2xl border border-blue-900/60 bg-blue-950/30 p-5 space-y-3">
                <div className="flex items-center justify-between text-blue-400">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <BellRing className="h-4 w-4" /> Auto-Resolução Inteligente
                  </span>
                  <span className="text-[10px] font-bold bg-blue-500/20 px-2 py-0.5 rounded text-blue-300">
                    1-Clique
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Posto Shell Express</h4>
                  <p className="text-xs text-blue-200">
                    Doc: R$ 158,50 • Extrato: R$ 165,00 (Variação de R$ 6,50)
                  </p>
                </div>
                <div className="text-[11px] text-slate-300">
                  A IA diagnosticou a tarifa e preparou o ajuste para sua aprovação direta.
                </div>
                <Link
                  href="/dashboard"
                  className="block text-center rounded-lg bg-blue-600 hover:bg-blue-500 py-1.5 text-xs font-bold text-white transition-colors"
                >
                  Confirmar no Painel em 1 Clique
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRIVACIDADE TOTAL & SEGURANÇA 24/7 */}
      <section id="privacidade" className="border-y border-slate-800/80 bg-slate-950/60 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                <EyeOff className="h-4 w-4" />
                Sigilo Absoluto e LGPD
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Seus dados financeiros não passam por mãos humanas.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                No BPO tradicional, estagiários e assistentes manuais abrem seus comprovantes bancários,
                veem seus saldos e têm acesso aos seus fornecedores. No AutoCaixa OaaS, o fluxo é
                100% blindado:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                <Lock className="h-6 w-6 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Criptografia de Ponta a Ponta</h3>
                <p className="text-xs text-slate-400">
                  Documentos criptografados durante o trânsito e armazenamento seguro.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                <Bot className="h-6 w-6 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Agente de IA Exclusivo</h3>
                <p className="text-xs text-slate-400">
                  Processamento direto via modelo multimodal sem intervenção de equipes humanas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                <Clock className="h-6 w-6 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Disponibilidade 24/7</h3>
                <p className="text-xs text-slate-400">
                  Envie comprovantes à meia-noite ou no domingo: a conciliação roda imediatamente.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-2">
                <BellRing className="h-6 w-6 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Confirmação Privada do Cliente</h3>
                <p className="text-xs text-slate-400">
                  Qualquer ajuste é respondido diretamente por você no seu painel protegido.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEÇÃO DE BENEFÍCIOS DO MODELO OaaS */}
      <section id="beneficios" className="py-20 lg:py-28 bg-slate-950 border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Vantagens do Micro-OaaS
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              A operação contábil e de caixa resolvida sem esforço
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Substitua custos operacionais pesados por agentes autônomos rápidos, precisos e infalíveis.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OAAS_BENEFITS.map((b, idx) => {
              const Icon = b.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 hover:border-slate-700 hover:bg-slate-900 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-blue-300 border border-slate-700">
                      {b.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {b.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. COMO FUNCIONA (FLUXO 100% AUTÔNOMO) */}
      <section id="como-funciona" className="py-20 lg:py-24 border-b border-slate-800 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Zero Burocracia
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Como o agente autônomo opera para você
            </h3>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400 font-black">
                1
              </span>
              <h4 className="text-base font-bold text-white">Envio Instantâneo</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tire foto do cupom pelo celular ou anexe o PDF do boleto/Pix. A IA inicia a leitura
                imediatamente.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 font-black">
                2
              </span>
              <h4 className="text-base font-bold text-white">Cruzamento e Auto-Resolução</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                O modelo cruza os dados com o extrato bancário. Se houver divergência, ele formula a
                sugestão e pede sua confirmação em 1 toque.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 space-y-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/20 text-emerald-400 font-black">
                3
              </span>
              <h4 className="text-base font-bold text-white">Relatório Pronto para o Contador</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Caixa conciliado, DRE consolidado e pacote mensal pronto para exportação com sigilo total.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SEÇÃO DE PREÇOS COM DESTAQUE PARA O PLANO MENSAL - R$ 29,90 */}
      <section id="precos" className="py-20 lg:py-28 bg-slate-950 relative">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-3 py-1 text-xs font-bold text-blue-300 border border-blue-500/30">
              <Sparkles className="h-3.5 w-3.5" />
              Oferta Especial de Lançamento
            </div>
            <h3 className="text-3xl sm:text-5xl font-black text-white">
              Investimento Mínimo, Retorno Imediato
            </h3>
            <p className="text-sm sm:text-base text-slate-300">
              Tenha sua operação de BPO Financeiro 100% autônoma por um valor menor que um cafezinho por dia.
            </p>
          </div>

          {/* CARD DESTACADO: PLANO MENSAL - R$ 29,90 */}
          <div className="mt-14 max-w-xl mx-auto">
            <div className="relative rounded-3xl border-2 border-blue-500 bg-gradient-to-b from-blue-950/50 via-slate-900 to-slate-950 p-7 sm:p-10 shadow-2xl shadow-blue-500/20 space-y-8">
              {/* Badge Superior */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                Plano Mais Recomendado
              </div>

              <div className="text-center space-y-3 pt-2">
                <h4 className="text-2xl font-black text-white">Plano Mensal</h4>
                <p className="text-xs sm:text-sm text-blue-200">
                  Operação autônoma de conciliação e caixa para MEIs e Microempresas.
                </p>

                {/* Preço Chamativo R$ 29,90 */}
                <div className="pt-2 flex items-baseline justify-center gap-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase">R$</span>
                  <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                    29,90
                  </span>
                  <span className="text-sm font-semibold text-slate-300">/ mês</span>
                </div>
                <p className="text-xs text-emerald-400 font-bold">
                  Menos de R$ 1,00 por dia para ter seu caixa gerido por IA 24/7
                </p>
              </div>

              {/* Lista de Recursos Inclusos */}
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-200 border-y border-slate-800/80 py-6">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0" />
                  <span><strong>Operação 100% Autônoma</strong> com Agente de Inteligência Artificial</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0" />
                  <span><strong>Privacidade Total:</strong> zero operadores humanos acessando seus dados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0" />
                  <span><strong>Leitura Ilimitada de Comprovantes</strong> (Pix, Cupons, Boletos, Faturas)</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0" />
                  <span><strong>Conciliação Bancária em Tempo Real</strong> com extratos</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0" />
                  <span><strong>Auto-Resolução Inteligente</strong> com confirmação em 1 toque na tela</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0" />
                  <span><strong>Exportação de Pacote Contábil</strong> e DRE para o contador</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-blue-400 shrink-0" />
                  <span>Sem carência, sem fidelidade e cancelamento direto na Kiwify</span>
                </li>
              </ul>

              {/* BOTÃO DE CTA OFICIAL: ASSINAR AGORA */}
              <div className="space-y-3">
                <a
                  href={KIWIFY_CHECKOUT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 py-4 text-base font-black text-white shadow-xl shadow-blue-600/30 active:scale-98 transition-all"
                >
                  <span>Assinar Agora</span>
                  <ArrowRight className="h-5 w-5" />
                </a>

                <p className="text-center text-[11px] text-slate-400">
                  🔒 Checkout seguro processado pela <strong>Kiwify</strong> com Pix ou Cartão.
                </p>
              </div>

              {/* Caixa de Garantia 7 Dias */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <ShieldCheck className="h-4 w-4" />
                  Garantia Incondicional de 7 Dias Kiwify
                </div>
                <p className="text-[11px] text-slate-300">
                  Teste o AutoCaixa OaaS com risco zero. Se não gostar, você solicita 100% do seu dinheiro
                  de volta diretamente pela Kiwify em 1 clique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ (PERGUNTAS FREQUENTES COM ACCORDION) */}
      <section id="faq" className="py-20 lg:py-24 border-t border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Esclarecimentos
            </h2>
            <h3 className="text-2xl sm:text-4xl font-black text-white">
              Perguntas Frequentes
            </h3>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-blue-300 transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-blue-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 animate-in fade-in duration-200">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. CTA FINAL INSTITUCIONAL */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Sua operação financeira funcionando no piloto automático hoje mesmo.
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Zero equipes manuais, zero planilhas e 100% de privacidade para o seu negócio.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={KIWIFY_CHECKOUT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              <span>Assinar Agora por R$ 29,90</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 text-sm font-bold text-slate-200 hover:text-white transition-all"
            >
              <span>Acessar Painel / Login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. RODAPÉ INSTITUCIONAL */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-black text-xs">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-bold text-white">AutoCaixa OaaS AI</span>
            <span className="text-slate-500">|</span>
            <span>Micro-OaaS: Operação Financeira 100% Autônoma</span>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} AutoCaixa OaaS • Pagamentos e assinaturas processados via Kiwify.
          </p>
        </div>
      </footer>
    </div>
  );
}
