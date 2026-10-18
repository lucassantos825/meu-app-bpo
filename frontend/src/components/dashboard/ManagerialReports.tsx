"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Calendar,
  CheckCircle2,
  FileCheck,
  FileArchive,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

interface ManagerialReportsProps {
  grossRevenue?: number;
  operationalCosts?: number;
  fixedExpenses?: number;
  taxes?: number;
}

export default function ManagerialReports({
  grossRevenue = 28450.0,
  operationalCosts = 8240.0,
  fixedExpenses = 4320.0,
  taxes = 1707.0, // ~6% Simples Nacional
}: ManagerialReportsProps) {
  const [activeTab, setActiveTab] = useState<"dre" | "cashflow">("dre");
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Cálculos do DRE
  const netRevenue = grossRevenue - taxes;
  const grossProfit = netRevenue - operationalCosts;
  const netIncome = grossProfit - fixedExpenses;
  const profitMargin = ((netIncome / grossRevenue) * 100).toFixed(1);

  // Geração e Download Funcional do Pacote Contábil
  const handleExportAccountingPackage = () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    setTimeout(() => {
      // Criação de dados tabulares estruturados para o contador
      const csvContent =
        "data:text/csv;charset=utf-8," +
        encodeURIComponent(
          `DEMONSTRACAO DO RESULTADO DO EXERCICIO (DRE) - AUTOCAIXA OAAS\n` +
            `Periodo: Outubro/2026\n` +
            `Conta;Descricao;Valor (R$)\n` +
            `1.0;Receita Bruta Total;${grossRevenue.toFixed(2)}\n` +
            `1.1;(-) Impostos e DAS Simples Nacional;-${taxes.toFixed(2)}\n` +
            `2.0;(=) Receita Operacional Liquida;${netRevenue.toFixed(2)}\n` +
            `2.1;(-) Custos de Mercadorias e Fornecedores;-${operationalCosts.toFixed(2)}\n` +
            `3.0;(=) Lucro Bruto Operacional;${grossProfit.toFixed(2)}\n` +
            `3.1;(-) Despesas Fixas e Administrativas;-${fixedExpenses.toFixed(2)}\n` +
            `4.0;(=) LUCRO LIQUIDO DO PERIODO;${netIncome.toFixed(2)}\n\n` +
            `RELACAO DE COMPROVANTES CONCILIADOS\n` +
            `Data;Favorecido;Categoria;Valor (R$);Status\n` +
            `18/10/2026;Kalunga Grafica;Material Escritorio;245.90;Conciliado 100%\n` +
            `18/10/2026;Posto Shell Ipiranga;Fornecedores;158.50;Conciliado c/ Auto-Resolucao\n` +
            `18/10/2026;Imobiliaria Central;Aluguel & Contas;1850.00;Conciliado 100%\n`
        );

      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute(
        "download",
        `Pacote_Contabil_AutoCaixa_Outubro_2026.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 900);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      {/* Topo do Módulo 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Módulo 3: Relatórios Gerenciais & Pacote Contábil
              </h3>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-black text-indigo-800 uppercase">
                Fechamento Fiscal
              </span>
            </div>
            <p className="text-xs text-slate-500">
              DRE dinâmico, fluxo de caixa e exportação direta do pacote pronto para o seu contador.
            </p>
          </div>
        </div>

        {/* Botão de Exportação de Pacote Contábil */}
        <button
          type="button"
          onClick={handleExportAccountingPackage}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50"
        >
          {isExporting ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              <span>Gerando Pacote Contábil...</span>
            </>
          ) : (
            <>
              <FileArchive className="h-4 w-4" />
              <span>Exportar Pacote Contábil (.zip / CSV)</span>
            </>
          )}
        </button>
      </div>

      {downloadSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            Pacote contábil exportado com sucesso! Arquivo formatado com DRE, conciliações e plano de contas.
          </span>
        </div>
      )}

      {/* Navegação entre DRE e Fluxo de Caixa */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("dre")}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "dre"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          DRE Dinâmico do Mês
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("cashflow")}
          className={`py-2 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === "cashflow"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Demonstrativo de Fluxo de Caixa
        </button>
      </div>

      {/* ABA 1: DRE DINÂMICO */}
      {activeTab === "dre" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Receita Bruta Total</span>
              <p className="text-lg font-black text-slate-900">{formatCurrencyBRL(grossRevenue)}</p>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3" /> Faturamento apurado
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Lucro Bruto</span>
              <p className="text-lg font-black text-indigo-700">{formatCurrencyBRL(grossProfit)}</p>
              <span className="text-[10px] text-slate-500">Após deduções e mercadorias</span>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-1">
              <span className="text-[11px] font-semibold text-emerald-800">Lucro Líquido Real</span>
              <p className="text-lg font-black text-emerald-700">{formatCurrencyBRL(netIncome)}</p>
              <span className="text-[10px] text-emerald-700 font-bold">
                Margem Líquida: {profitMargin}%
              </span>
            </div>
          </div>

          {/* Tabela Estruturada do DRE */}
          <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-slate-100 p-2.5 font-bold text-slate-700 grid grid-cols-2">
              <span>Conta / Estrutura Contábil</span>
              <span className="text-right">Valor Consolidado</span>
            </div>
            <div className="divide-y divide-slate-100 p-1">
              <div className="p-2 flex justify-between font-bold text-slate-900">
                <span>(+) Receita Bruta de Vendas e Serviços</span>
                <span className="text-emerald-700">{formatCurrencyBRL(grossRevenue)}</span>
              </div>
              <div className="p-2 flex justify-between text-slate-600">
                <span className="pl-3">(-) Deduções e DAS Simples Nacional</span>
                <span className="text-rose-600">- {formatCurrencyBRL(taxes)}</span>
              </div>
              <div className="p-2 flex justify-between font-bold text-slate-800 bg-slate-50/60">
                <span>(=) Receita Operacional Líquida</span>
                <span>{formatCurrencyBRL(netRevenue)}</span>
              </div>
              <div className="p-2 flex justify-between text-slate-600">
                <span className="pl-3">(-) Custos Operacionais / Fornecedores</span>
                <span className="text-rose-600">- {formatCurrencyBRL(operationalCosts)}</span>
              </div>
              <div className="p-2 flex justify-between font-bold text-slate-800 bg-slate-50/60">
                <span>(=) Lucro Bruto</span>
                <span>{formatCurrencyBRL(grossProfit)}</span>
              </div>
              <div className="p-2 flex justify-between text-slate-600">
                <span className="pl-3">(-) Despesas Fixas, Aluguel e Pró-labore</span>
                <span className="text-rose-600">- {formatCurrencyBRL(fixedExpenses)}</span>
              </div>
              <div className="p-2.5 flex justify-between font-black text-sm bg-emerald-100/60 text-emerald-950 rounded-lg">
                <span>(=) RESULTADO LÍQUIDO DO EXERCÍCIO</span>
                <span className="text-emerald-700">{formatCurrencyBRL(netIncome)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: DEMONSTRATIVO DE FLUXO DE CAIXA */}
      {activeTab === "cashflow" && (
        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/40">
            <h4 className="font-bold text-slate-800">Ciclo Operacional & Liquidez</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Saldo de Abertura</span>
                <p className="text-base font-bold text-slate-800">R$ 14.850,20</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Entradas Conciliadas</span>
                <p className="text-base font-bold text-emerald-600">+ R$ 3.200,00</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Saídas Conciliadas</span>
                <p className="text-base font-bold text-rose-600">- R$ 1.150,00</p>
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              O fluxo de caixa fecha diariamente no piloto automático conforme cada comprovante é lido pela IA.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
