"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  Camera,
  Sparkles,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Search,
} from "lucide-react";
import Link from "next/link";
import UploadModal, { ExtractedReceiptData } from "@/components/UploadModal";
import { useAuth } from "@/context/AuthContext";
import { formatCurrencyBRL } from "@/lib/utils";

interface UploadedReceiptHistory {
  id: string;
  name: string;
  date: string;
  amount: number;
  category: string;
  bankAccount: string;
  status: "CONCILIADO" | "ALERTA" | "PROCESSANDO";
  confidence: number;
}

export default function ComprovantesPage() {
  const { user, incrementQuota, openUpgradeModal } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"upload" | "camera">("upload");
  const [searchQuery, setSearchQuery] = useState("");

  const [receipts, setReceipts] = useState<UploadedReceiptHistory[]>([
    {
      id: "rec-kalunga",
      name: "Kalunga Comércio e Indústria Gráfica Ltda",
      date: "18/10/2026",
      amount: 245.9,
      category: "Material de Escritório",
      bankAccount: "Nubank PJ",
      status: "CONCILIADO",
      confidence: 0.98,
    },
    {
      id: "rec-shell",
      name: "Posto Shell - Auto Posto Ipiranga",
      date: "18/10/2026",
      amount: 158.5,
      category: "Fornecedores / Mercadorias",
      bankAccount: "Itaú Unibanco",
      status: "CONCILIADO",
      confidence: 0.96,
    },
    {
      id: "rec-aluguel",
      name: "Imobiliária Central Administradora",
      date: "17/10/2026",
      amount: 1850.0,
      category: "Aluguel & Contas de Consumo",
      bankAccount: "Itaú Unibanco",
      status: "CONCILIADO",
      confidence: 0.97,
    },
  ]);

  const handleOpenScanner = (mode: "upload" | "camera") => {
    if (user?.plan === "FREE" && (user.quotaUsed || 0) >= (user.quotaLimit || 3)) {
      openUpgradeModal("Você atingiu o limite mensal do Plano Free. Assine o Plano Pago OaaS para envios ilimitados.");
      return;
    }
    setModalMode(mode);
    setIsModalOpen(true);
  };

  const handleNewReceipt = (data: ExtractedReceiptData) => {
    if (user?.plan === "FREE") {
      incrementQuota();
    }
    const newEntry: UploadedReceiptHistory = {
      id: data.id || `rec-${Date.now()}`,
      name: data.recipient,
      date: data.date.split("-").reverse().join("/"),
      amount: data.amount,
      category: data.category,
      bankAccount: data.bankAccount,
      status: data.confidence >= 0.9 ? "CONCILIADO" : "ALERTA",
      confidence: data.confidence,
    };
    setReceipts((prev) => [newEntry, ...prev]);
  };

  const filteredReceipts = receipts.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.amount.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
              title="Voltar ao Painel"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  Upload & Scanner de Comprovantes
                </h1>
                {user?.plan === "PAID_OAAS" ? (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-black text-blue-800 uppercase">
                    Ilimitado Pro
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 uppercase">
                    Plano Free ({user?.quotaUsed || 0}/3)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Leitura Inteligente com OCR e IA Multimodal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenScanner("camera")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all"
            >
              <Camera className="h-4 w-4 text-blue-600" />
              Escanear Câmera
            </button>
            <button
              onClick={() => handleOpenScanner("upload")}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
            >
              <UploadCloud className="h-4 w-4" />
              Novo Upload
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Banner de Ação Rápida */}
        <section className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white shadow-xl shadow-blue-700/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                Leitura Instantânea de Pix, Boletos e Cupons Térmicos
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Envie seus recibos e faturas em segundos
              </h2>
              <p className="text-xs sm:text-sm text-blue-100">
                A IA lê o favorecido, CNPJ, valor total e cruza diretamente com o extrato bancário.
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleOpenScanner("upload")}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-blue-700 shadow-md hover:bg-blue-50 active:scale-95 transition-all"
              >
                <UploadCloud className="h-4 w-4" />
                Carregar Arquivo
              </button>
              <button
                type="button"
                onClick={() => handleOpenScanner("camera")}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500/30 border border-white/20 px-4 py-3 text-xs font-semibold text-white hover:bg-blue-500/40 transition-all"
              >
                <Camera className="h-4 w-4" />
                Câmera Celular
              </button>
            </div>
          </div>
        </section>

        {/* Tabela de Comprovantes Recentes */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Comprovantes Processados Recentemente
              </h3>
              <p className="text-xs text-slate-500">Histórico de leituras e status de conciliação</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar favorecido ou valor..."
                  className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredReceipts.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Nenhum comprovante encontrado
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Faça o upload do seu primeiro documento ou tire uma foto com a câmera do celular para a IA começar a operar.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleOpenScanner("upload")}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition-all"
                  >
                    <UploadCloud className="h-4 w-4" />
                    Enviar Comprovante
                  </button>
                </div>
              </div>
            ) : (
              filteredReceipts.map((rec) => (
                <div
                  key={rec.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rec.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {rec.category} • {rec.bankAccount} • {rec.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        {formatCurrencyBRL(rec.amount)}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Confiança: {(rec.confidence * 100).toFixed(0)}%
                      </p>
                    </div>

                    {rec.status === "CONCILIADO" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" />
                        100% IA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                        <AlertTriangle className="h-3 w-3" />
                        Revisão
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Modal de Scanner e Upload */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialMode={modalMode}
        onSuccessAdd={handleNewReceipt}
      />
    </div>
  );
}
