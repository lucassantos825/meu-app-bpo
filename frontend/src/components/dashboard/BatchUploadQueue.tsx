"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  FileText,
  FileCheck2,
  ArrowRight,
  Zap,
} from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

export interface BatchItem {
  id: string;
  fileName: string;
  fileSize: string;
  recipient: string;
  amount: number;
  category: string;
  status: "queued" | "ocr" | "reconciling" | "completed" | "divergence";
  progress: number;
  divergenceNotice?: string;
}

interface BatchUploadQueueProps {
  onItemsProcessed: (items: {
    recipient: string;
    amount: number;
    category: string;
    type: "inflow" | "outflow";
    date: string;
    hasDivergence?: boolean;
    divergenceReason?: string;
  }[]) => void;
}

export default function BatchUploadQueue({ onItemsProcessed }: BatchUploadQueueProps) {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simula upload de lote a partir de arquivos selecionados
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = Array.from(files).map((file, idx) => {
      const lowerName = file.name.toLowerCase();
      let recipient = "Fornecedor Comercial Ltda";
      let amount = 145.0 + idx * 75.3;
      let category = "Fornecedores / Mercadorias";
      let divergenceNotice: string | undefined = undefined;

      if (lowerName.includes("posto") || lowerName.includes("shell") || lowerName.includes("combustivel")) {
        recipient = "Posto Shell - Auto Posto Ipiranga";
        amount = 158.5;
        divergenceNotice = "Variação de R$ 6,50 identificada contra débito de R$ 165,00 no extrato.";
      } else if (lowerName.includes("kalunga") || lowerName.includes("papelaria")) {
        recipient = "Kalunga Comércio e Indústria";
        amount = 245.9;
        category = "Material de Escritório";
      } else if (lowerName.includes("aluguel") || lowerName.includes("condominio")) {
        recipient = "Administradora de Bens Central";
        amount = 1850.0;
        category = "Aluguel & Contas de Consumo";
      }

      return {
        id: `batch-${Date.now()}-${idx}`,
        fileName: file.name,
        fileSize: `${(file.size / 1024).toFixed(0)} KB`,
        recipient,
        amount,
        category,
        status: "queued",
        progress: 10,
        divergenceNotice,
      };
    });

    setItems((prev) => [...newItems, ...prev]);
    processQueue(newItems);
  };

  // Simulação de processamento inteligente em lote
  const processQueue = (batchToProcess: BatchItem[]) => {
    setIsProcessing(true);

    batchToProcess.forEach((item, index) => {
      // 1. Fase OCR
      setTimeout(() => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "ocr", progress: 45 } : i
          )
        );
      }, (index + 1) * 800);

      // 2. Fase Conciliação
      setTimeout(() => {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, status: "reconciling", progress: 85 } : i
          )
        );
      }, (index + 1) * 1600);

      // 3. Conclusão
      setTimeout(() => {
        const hasDivergence = !!item.divergenceNotice;
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: hasDivergence ? "divergence" : "completed",
                  progress: 100,
                }
              : i
          )
        );

        // Notifica o dashboard para atualizar caixa
        onItemsProcessed([
          {
            recipient: item.recipient,
            amount: item.amount,
            category: item.category,
            type: "outflow",
            date: new Date().toISOString().split("T")[0],
            hasDivergence,
            divergenceReason: item.divergenceNotice,
          },
        ]);

        if (index === batchToProcess.length - 1) {
          setIsProcessing(false);
        }
      }, (index + 1) * 2400);
    });
  };

  // Ação rápida: simula um lote completo de demonstração
  const handleSimulateBatchDemo = () => {
    const demoBatch: BatchItem[] = [
      {
        id: `demo-${Date.now()}-1`,
        fileName: "pix_kalunga_grafica_nf8892.pdf",
        fileSize: "184 KB",
        recipient: "Kalunga Comércio e Indústria Gráfica",
        amount: 245.9,
        category: "Material de Escritório",
        status: "queued",
        progress: 10,
      },
      {
        id: `demo-${Date.now()}-2`,
        fileName: "comprovante_shell_combustivel.jpg",
        fileSize: "512 KB",
        recipient: "Posto Shell - Auto Posto Ipiranga",
        amount: 158.5,
        category: "Fornecedores / Mercadorias",
        status: "queued",
        progress: 10,
        divergenceNotice: "Débito bancário de R$ 165,00 (Variação de R$ 6,50 formulada pela IA).",
      },
      {
        id: `demo-${Date.now()}-3`,
        fileName: "boleto_pago_aluguel_sala102.pdf",
        fileSize: "320 KB",
        recipient: "Imobiliária Central Patrimonial",
        amount: 1850.0,
        category: "Aluguel & Contas de Consumo",
        status: "queued",
        progress: 10,
      },
      {
        id: `demo-${Date.now()}-4`,
        fileName: "recibo_manutencao_elevador.png",
        fileSize: "410 KB",
        recipient: "Atlas Schindler Manutenção Técnica",
        amount: 430.0,
        category: "Serviços Operacionais",
        status: "queued",
        progress: 10,
      },
    ];

    setItems((prev) => [...demoBatch, ...prev]);
    processQueue(demoBatch);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
      {/* Cabeçalho do Módulo 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Módulo 1: Upload em Lote & Fila de Processamento com IA
              </h3>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-black text-blue-800 uppercase">
                Ilimitado Pro
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Arraste dezenas de comprovantes simultaneamente. A IA executa OCR e conciliação em paralelo.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateBatchDemo}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 px-3.5 py-2 text-xs font-bold text-blue-700 transition-all disabled:opacity-50"
        >
          <Zap className="h-3.5 w-3.5 text-blue-600" />
          <span>Simular Lote de Teste (4 Documentos)</span>
        </button>
      </div>

      {/* Área de Drag & Drop para Múltiplos Arquivos */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/30 p-8 text-center transition-all hover:border-blue-500 hover:bg-blue-50/60 cursor-pointer"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md transition-transform group-hover:scale-110">
          <UploadCloud className="h-6 w-6" />
        </div>

        <h4 className="mt-3 text-sm font-bold text-slate-900">
          Solte múltiplos comprovantes aqui (PDF, Pix, JPG, PNG)
        </h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md">
          Não há limite de documentos no seu Plano Pago. Os arquivos são processados automaticamente em fila de alta velocidade.
        </p>
      </div>

      {/* Fila de Processamento em Lote */}
      {items.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Fila de Documentos em Lote ({items.length})</span>
            {isProcessing && (
              <span className="flex items-center gap-1.5 text-blue-600 animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Agente de IA processando fila...
              </span>
            )}
          </div>

          <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50 max-h-72 overflow-y-auto">
            {items.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.recipient}</p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {item.fileName} • {item.fileSize}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-black text-slate-900">
                    {formatCurrencyBRL(item.amount)}
                  </span>

                  {item.status === "queued" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      Na Fila
                    </span>
                  )}

                  {item.status === "ocr" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                      <Loader2 className="h-3 w-3 animate-spin" /> Extraindo OCR
                    </span>
                  )}

                  {item.status === "reconciling" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                      <Sparkles className="h-3 w-3 animate-spin" /> Conciliando
                    </span>
                  )}

                  {item.status === "completed" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Conciliado 100%
                    </span>
                  )}

                  {item.status === "divergence" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800">
                      <AlertTriangle className="h-3 w-3 text-amber-600" /> Auto-Resolução Criada
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
