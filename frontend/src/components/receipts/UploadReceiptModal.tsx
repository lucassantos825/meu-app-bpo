"use client";

import React, { useState, useRef } from "react";
import {
  X,
  UploadCloud,
  Camera,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building,
  Calendar,
  DollarSign,
  Tag,
} from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "file" | "camera";
  onSuccessAdd?: (extracted: ExtractedResult) => void;
}

export interface ExtractedResult {
  amount: number;
  date: string;
  recipient: string;
  cnpjCpf: string;
  category: string;
  confidence: number;
  matchStatus: "AUTO_MATCH" | "DIVERGENCE";
  fileName: string;
}

export default function UploadReceiptModal({
  isOpen,
  onClose,
  initialMode = "file",
  onSuccessAdd,
}: UploadReceiptModalProps) {
  const [step, setStep] = useState<"idle" | "analyzing" | "extracted" | "done">("idle");
  const [analysisPhase, setAnalysisPhase] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Dados extraídos pela IA (editáveis pelo usuário)
  const [extractedData, setExtractedData] = useState<ExtractedResult>({
    amount: 245.9,
    date: "2026-10-18",
    recipient: "Kalunga Comércio e Indústria Gráfica Ltda",
    cnpjCpf: "43.283.811/0001-50",
    category: "Material de Escritório / Operacional",
    confidence: 0.97,
    matchStatus: "AUTO_MATCH",
    fileName: "",
  });

  if (!isOpen) return null;

  const handleFileSelected = (file: File) => {
    setFileName(file.name);
    setFilePreview(URL.createObjectURL(file));
    simulateAiProcessing(file.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const simulateAiProcessing = (uploadedName: string) => {
    setStep("analyzing");
    setAnalysisPhase("Lendo documento com OCR e IA Multimodal...");

    setTimeout(() => {
      setAnalysisPhase("Extraindo valor, data, favorecido e chave Pix/Boleto...");
    }, 1000);

    setTimeout(() => {
      setAnalysisPhase("Cruzando com extrato bancário do dia...");
    }, 2000);

    setTimeout(() => {
      setExtractedData({
        amount: 245.9,
        date: new Date().toISOString().split("T")[0],
        recipient: "Kalunga Comércio e Indústria Gráfica Ltda",
        cnpjCpf: "43.283.811/0001-50",
        category: "Material de Escritório / Operacional",
        confidence: 0.97,
        matchStatus: "AUTO_MATCH",
        fileName: uploadedName,
      });
      setStep("extracted");
    }, 3000);
  };

  const handleConfirm = () => {
    setStep("done");
    if (onSuccessAdd) {
      onSuccessAdd(extractedData);
    }
    setTimeout(() => {
      handleReset();
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    setStep("idle");
    setFilePreview(null);
    setFileName("");
    setAnalysisPhase("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Topo do Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Upload & Scanner de Comprovante
              </h3>
              <p className="text-xs text-slate-500">
                Processamento automático com IA e conciliação bancária
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6">
          {/* ESTADO 1: IDLE (UPLOAD / DRAG & DROP / CÂMERA) */}
          {step === "idle" && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-all hover:border-blue-500 hover:bg-blue-50/30 cursor-pointer"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleInputChange}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleInputChange}
                />

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-transform group-hover:scale-110">
                  <UploadCloud className="h-7 w-7" />
                </div>
                <h4 className="mt-4 text-sm font-bold text-slate-900">
                  Arraste seu comprovante aqui ou clique para selecionar
                </h4>
                <p className="mt-1 text-xs text-slate-500">
                  Suporta comprovantes Pix, boletos pagos, recibos e notas fiscais (PDF, JPG, PNG)
                </p>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-slate-200"></div>
                <span className="absolute bg-white px-3 text-xs font-medium text-slate-400">
                  OU TIRE UMA FOTO DIRETO NO CELULAR
                </span>
              </div>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-98"
              >
                <Camera className="h-5 w-5 text-blue-600" />
                <span>Abrir Câmera e Escanear</span>
              </button>
            </div>
          )}

          {/* ESTADO 2: ANALYZING (PROCESSAMENTO COM IA) */}
          {step === "analyzing" && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="relative">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  A IA está analisando seu comprovante
                </h4>
                <p className="text-xs text-blue-600 font-medium animate-pulse">
                  {analysisPhase}
                </p>
              </div>

              {fileName && (
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600">
                  <FileText className="h-3.5 w-3.5" />
                  <span className="font-mono">{fileName}</span>
                </div>
              )}
            </div>
          )}

          {/* ESTADO 3: EXTRACTED (REVISÃO DOS DADOS EXTRAÍDOS) */}
          {step === "extracted" && (
            <div className="space-y-4">
              {/* Badge de Confiança e Match */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold">Match Automático Confirmado (97% de Certeza)</p>
                    <p className="text-[11px] text-emerald-700">
                      Lançamento idêntico de R$ 245,90 localizado no extrato Itaú de hoje.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                  Sem Erros
                </span>
              </div>

              {/* Formulário com Dados Extraídos para Validação/Ajuste */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs">
                <div>
                  <label className="flex items-center gap-1 font-semibold text-slate-600 mb-1">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Valor Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={extractedData.amount}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1 font-semibold text-slate-600 mb-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Data do Pagamento
                    </label>
                    <input
                      type="date"
                      value={extractedData.date}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, date: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1 font-semibold text-slate-600 mb-1">
                      <Tag className="h-3.5 w-3.5 text-slate-400" /> Categoria Sugerida
                    </label>
                    <input
                      type="text"
                      value={extractedData.category}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, category: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-1 font-semibold text-slate-600 mb-1">
                    <Building className="h-3.5 w-3.5 text-slate-400" /> Favorecido / Beneficiário
                  </label>
                  <input
                    type="text"
                    value={extractedData.recipient}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, recipient: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Subir Outro
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-98 transition-all"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmar e Conciliar no Caixa
                </button>
              </div>
            </div>
          )}

          {/* ESTADO 4: DONE (CONCLUÍDO COM SUCESSO) */}
          {step === "done" && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Comprovante Conciliado com Sucesso!
              </h4>
              <p className="text-xs text-slate-500">
                O caixa e o extrato bancário foram atualizados automaticamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
