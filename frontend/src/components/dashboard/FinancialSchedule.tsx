"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Plus,
  Calendar,
  Wallet,
  Check,
  Building,
} from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

export interface ScheduleItem {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  type: "PAYABLE" | "RECEIVABLE";
  status: "DUE_TODAY" | "UPCOMING" | "OVERDUE" | "PAID";
  category: string;
  bankAccount: string;
}

const INITIAL_SCHEDULE: ScheduleItem[] = [
  {
    id: "sch-1",
    title: "Aluguel Comercial - Galpão Principal",
    dueDate: "Hoje",
    amount: 1850.0,
    type: "PAYABLE",
    status: "DUE_TODAY",
    category: "Aluguel & Contas",
    bankAccount: "Itaú Unibanco",
  },
  {
    id: "sch-2",
    title: "Enel Distribuição - Energia Elétrica",
    dueDate: "Hoje",
    amount: 384.2,
    type: "PAYABLE",
    status: "DUE_TODAY",
    category: "Contas de Consumo",
    bankAccount: "Itaú Unibanco",
  },
  {
    id: "sch-3",
    title: "Fornecedor Metalúrgica Aço Forte",
    dueDate: "Amanhã",
    amount: 1420.0,
    type: "PAYABLE",
    status: "UPCOMING",
    category: "Fornecedores",
    bankAccount: "Nubank PJ",
  },
  {
    id: "sch-4",
    title: "Recebimento Contrato Mensal - Cliente Alpha",
    dueDate: "Em 2 dias",
    amount: 3500.0,
    type: "RECEIVABLE",
    status: "UPCOMING",
    category: "Receita de Serviços",
    bankAccount: "Itaú Unibanco",
  },
  {
    id: "sch-5",
    title: "DAS - Simples Nacional Guia 10/2026",
    dueDate: "20/10/2026",
    amount: 940.5,
    type: "PAYABLE",
    status: "UPCOMING",
    category: "Impostos",
    bankAccount: "Itaú Unibanco",
  },
];

export default function FinancialSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>(INITIAL_SCHEDULE);

  const dueTodayTotal = items
    .filter((i) => i.status === "DUE_TODAY" && i.type === "PAYABLE")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentEstimatedBalance = 14850.2;
  const projectedBalanceAfterToday = currentEstimatedBalance - dueTodayTotal;

  const handleMarkAsPaid = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "PAID" } : i))
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      {/* Topo do Módulo 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-500/25">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Módulo 4: Agenda Financeira & Contas a Pagar/Receber
              </h3>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[10px] font-black text-sky-800 uppercase">
                Previsibilidade
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Controle de vencimentos e projeção de saldo bancário pós-liquidações do dia.
            </p>
          </div>
        </div>

        {/* Resumo Rápido de Previsão */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">
              Projeção de Saldo pós-pagamentos
            </span>
            <span className="font-black text-slate-900">
              {formatCurrencyBRL(projectedBalanceAfterToday)}
            </span>
          </div>
        </div>
      </div>

      {/* Alerta de Contas Vencendo Hoje */}
      {dueTodayTotal > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 rounded-full bg-amber-500 animate-ping shrink-0" />
            <div>
              <p className="font-extrabold text-sm">
                Atenção: {formatCurrencyBRL(dueTodayTotal)} a pagar com vencimento para HOJE
              </p>
              <p className="text-amber-800 text-[11px]">
                Liquide os boletos para evitar multas por atraso. Ao pagar, a IA concilia no extrato automaticamente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Contas da Agenda */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
              item.status === "DUE_TODAY" ? "bg-amber-50/40" : "hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${
                  item.type === "RECEIVABLE"
                    ? "bg-emerald-100 text-emerald-700"
                    : item.status === "DUE_TODAY"
                    ? "bg-amber-500 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {item.type === "RECEIVABLE" ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500">
                  {item.category} • {item.bankAccount}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
              <div className="text-left sm:text-right">
                <span
                  className={`font-black ${
                    item.type === "RECEIVABLE" ? "text-emerald-600" : "text-slate-900"
                  }`}
                >
                  {item.type === "RECEIVABLE" ? "+ " : "- "}
                  {formatCurrencyBRL(item.amount)}
                </span>
                <p className="text-[10px] text-slate-400">Vencimento: {item.dueDate}</p>
              </div>

              {/* Badges de Status */}
              {item.status === "DUE_TODAY" && (
                <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black text-white">
                  Vence Hoje
                </span>
              )}
              {item.status === "UPCOMING" && (
                <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                  A Vencer
                </span>
              )}
              {item.status === "PAID" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                  <Check className="h-3 w-3" /> Liquidado
                </span>
              )}

              {item.status !== "PAID" && item.type === "PAYABLE" && (
                <button
                  type="button"
                  onClick={() => handleMarkAsPaid(item.id)}
                  className="rounded-lg border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors"
                >
                  Confirmar Pago
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
