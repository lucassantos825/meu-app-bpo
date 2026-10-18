"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  UploadCloud,
  Camera,
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Building,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FlipHorizontal,
  Eye,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { formatCurrencyBRL } from "@/lib/utils";

export interface ExtractedReceiptData {
  id?: string;
  amount: number;
  date: string;
  recipient: string;
  cnpjCpf: string;
  category: string;
  bankAccount: string;
  confidence: number;
  matchStatus: "AUTO_MATCH" | "RED_ALERT";
  divergenceDetail?: string;
  fileName: string;
  filePreviewUrl?: string;
}

export interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "upload" | "camera";
  onSuccessAdd?: (extracted: ExtractedReceiptData) => void;
}

const CATEGORIES_OPTIONS = [
  "Fornecedores / Mercadorias",
  "Pessoal / Pró-labore",
  "Aluguel & Contas de Consumo",
  "Ferramentas & Software",
  "Simples Nacional / DAS",
  "Taxas de Cartão & Bancárias",
  "Outras Despesas Operacionais",
];

const BANK_ACCOUNTS = [
  "Itaú Unibanco (Conta Principal)",
  "Nubank PJ",
  "Banco Inter",
  "Caixa Econômica Federal",
];

export default function UploadModal({
  isOpen,
  onClose,
  initialMode = "upload",
  onSuccessAdd,
}: UploadModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "camera">(initialMode);
  const [step, setStep] = useState<"input" | "scanning" | "review" | "success">("input");
  
  // Pipeline de status de escaneamento em tempo real
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanStatusMessage, setScanStatusMessage] = useState("");
  
  // Imagem e Arquivo
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement>(null);

  // Câmera WebRTC ao vivo
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<"environment" | "user">("environment");
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Dados extraídos pela IA
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData>({
    amount: 184.5,
    date: new Date().toISOString().split("T")[0],
    recipient: "Posto Shell - Auto Posto Ipiranga Ltda",
    cnpjCpf: "12.345.678/0001-90",
    category: "Fornecedores / Mercadorias",
    bankAccount: "Itaú Unibanco (Conta Principal)",
    confidence: 0.98,
    matchStatus: "AUTO_MATCH",
    fileName: "",
  });

  // Gerenciamento da câmera ao vivo
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen && activeTab === "camera" && step === "input") {
      setCameraError(null);
      navigator.mediaDevices?.getUserMedia({
        video: { facingMode: cameraFacingMode },
        audio: false,
      })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
      })
      .catch((err) => {
        console.warn("Câmera ao vivo indisponível ou permissão negada:", err);
        setCameraError("Permissão de câmera não concedida. Você pode usar a captura nativa do celular.");
        setIsCameraActive(false);
      });
    } else {
      stopCameraStream();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, activeTab, cameraFacingMode, step]);

  const stopCameraStream = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  if (!isOpen) return null;

  // Captura foto da câmera WebRTC
  const captureLiveCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
      setFilePreview(dataUrl);
      const generatedName = `scanner_camera_${Date.now()}.jpg`;
      setFileName(generatedName);
      stopCameraStream();
      startAiScanPipeline(generatedName, dataUrl);
    }
  };

  // Seleção de arquivo por input ou drag & drop
  const handleFileChosen = (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setFilePreview(previewUrl);
    stopCameraStream();
    startAiScanPipeline(file.name, previewUrl);
  };

  const handleNativeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChosen(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChosen(e.dataTransfer.files[0]);
    }
  };

  // Pipeline de Simulação de IA (Vision + OCR + Conciliação)
  const startAiScanPipeline = (uploadName: string, previewUrl?: string) => {
    setStep("scanning");
    setScanStepIndex(1);
    setScanStatusMessage("1/4: Processando imagem com OCR Multimodal...");

    setTimeout(() => {
      setScanStepIndex(2);
      setScanStatusMessage("2/4: Extraindo Valor, Data, Favorecido e CNPJ/CPF...");
    }, 900);

    setTimeout(() => {
      setScanStepIndex(3);
      setScanStatusMessage("3/4: Consultando extrato bancário (janela D-1 a D+2)...");
    }, 1800);

    setTimeout(() => {
      setScanStepIndex(4);
      setScanStatusMessage("4/4: Transação localizada! Confiança: 98% (Match 100%).");
    }, 2600);

    setTimeout(() => {
      setExtractedData({
        id: `rec_${Date.now()}`,
        amount: 184.5,
        date: new Date().toISOString().split("T")[0],
        recipient: "Posto Shell - Auto Posto Ipiranga Ltda",
        cnpjCpf: "12.345.678/0001-90",
        category: "Fornecedores / Mercadorias",
        bankAccount: "Itaú Unibanco (Conta Principal)",
        confidence: 0.98,
        matchStatus: "AUTO_MATCH",
        fileName: uploadName,
        filePreviewUrl: previewUrl,
      });
      setStep("review");
    }, 3400);
  };

  const handleConfirmReconciliation = () => {
    setStep("success");
    if (onSuccessAdd) {
      onSuccessAdd(extractedData);
    }
    setTimeout(() => {
      handleReset();
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    stopCameraStream();
    setStep("input");
    setFilePreview(null);
    setFileName("");
    setScanStepIndex(0);
    setScanStatusMessage("");
    setCameraError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-slate-200">
        
        {/* CABEÇALHO DO SCANNER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Upload & Scanner com IA
                </h3>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700 uppercase tracking-wide">
                  Mobile First
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Extração automática com OCR Multimodal e conciliação bancária direta
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* CORPO DO MODAL */}
        <div className="p-6">

          {/* ESTADO 1: ENTRADA (UPLOAD OU CÂMERA AO VIVO) */}
          {step === "input" && (
            <div className="space-y-4">
              {/* Seletor de Modo (Arquivo vs Câmera) */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    stopCameraStream();
                    setActiveTab("upload");
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "upload"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UploadCloud className="h-4 w-4" />
                  Arquivo ou PDF
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("camera")}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === "camera"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  Câmera ao Vivo
                </button>
              </div>

              {/* ABA 1: UPLOAD DE ARQUIVO */}
              {activeTab === "upload" && (
                <div className="space-y-4">
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-8 sm:p-10 text-center transition-all hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,application/pdf"
                      className="hidden"
                      onChange={handleNativeInputChange}
                    />

                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-inner transition-transform group-hover:scale-110">
                      <UploadCloud className="h-8 w-8" />
                    </div>

                    <h4 className="mt-4 text-sm font-bold text-slate-900">
                      Arraste ou selecione o comprovante
                    </h4>
                    <p className="mt-1.5 text-xs text-slate-500 max-w-sm">
                      Compatível com comprovantes Pix, boletos bancários, recibos e cupons fiscais (PDF, JPG ou PNG).
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:underline">
                      <FileText className="h-3.5 w-3.5" /> Procurar arquivo no dispositivo
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Tamanho máximo: 15MB</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle className="h-3.5 w-3.5" /> Criptografia de ponta a ponta
                    </span>
                  </div>
                </div>
              )}

              {/* ABA 2: CÂMERA AO VIVO / SCANNER */}
              {activeTab === "camera" && (
                <div className="space-y-4">
                  {cameraError ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center space-y-4">
                      <AlertTriangle className="h-10 w-10 text-amber-600 mx-auto" />
                      <div>
                        <h4 className="text-sm font-bold text-amber-950">
                          Câmera Web direta indisponível
                        </h4>
                        <p className="text-xs text-amber-800 mt-1 max-w-sm mx-auto">
                          {cameraError}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => nativeCameraInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-amber-700 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        Abrir Câmera Nativa do Aparelho
                      </button>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-2xl bg-black aspect-video flex items-center justify-center shadow-lg">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-full w-full object-cover"
                      />

                      {/* Efeito Visual de Scanner (Mira Laser) */}
                      <div className="pointer-events-none absolute inset-6 rounded-xl border-2 border-dashed border-blue-400/70">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-pulse"></div>
                      </div>

                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1 text-[11px] font-semibold text-white flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                        Posicione o comprovante na moldura
                      </div>

                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCameraFacingMode((prev) =>
                              prev === "environment" ? "user" : "environment"
                            )
                          }
                          className="rounded-lg bg-black/60 p-2 text-white hover:bg-black/80 backdrop-blur-md transition-colors"
                          title="Inverter Câmera"
                        >
                          <FlipHorizontal className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Botão de Disparo / Captura */}
                      <div className="absolute bottom-4 inset-x-0 flex justify-center">
                        <button
                          type="button"
                          onClick={captureLiveCameraSnapshot}
                          className="group flex h-16 w-16 items-center justify-center rounded-full bg-white p-1 shadow-2xl transition-transform active:scale-90"
                        >
                          <div className="h-full w-full rounded-full border-4 border-blue-600 bg-white transition-all group-hover:scale-95"></div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Input Nativo de Câmera (Fallback Mobile) */}
                  <input
                    ref={nativeCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleNativeInputChange}
                  />
                </div>
              )}
            </div>
          )}

          {/* ESTADO 2: SCANNING (PROCESSAMENTO MULTIMODAL IA EM TEMPO REAL) */}
          {step === "scanning" && (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                  <Sparkles className="h-4 w-4" />
                </div>
              </div>

              <div className="space-y-2 max-w-md">
                <h4 className="text-base font-bold text-slate-900">
                  Escaneando e Cruzando Dados
                </h4>
                <p className="text-xs font-semibold text-blue-600">
                  {scanStatusMessage}
                </p>
                {/* Barra de Progresso Visual */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-3">
                  <div
                    className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${(scanStepIndex / 4) * 100}%` }}
                  ></div>
                </div>
              </div>

              {fileName && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-1.5 text-xs text-slate-600 font-mono">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
          )}

          {/* ESTADO 3: REVIEW (CONFERÊNCIA DOS DADOS EXTRAÍDOS PELA IA) */}
          {step === "review" && (
            <div className="space-y-5">
              {/* Badge de Confiança / Status de Match */}
              {extractedData.confidence >= 0.9 ? (
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-emerald-900">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold flex items-center gap-1.5">
                        Match Automático Confirmado ({(extractedData.confidence * 100).toFixed(0)}% de Certeza)
                      </p>
                      <p className="text-[11px] text-emerald-700">
                        Lançamento idêntico identificado no extrato bancário de hoje.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black text-white">
                    100% IA
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-amber-900">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold">Revisão Humana Recomendada</p>
                      <p className="text-[11px] text-amber-800">
                        Confiança abaixo de 90%. Confira os campos abaixo antes de salvar.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-black text-white">
                    Alerta
                  </span>
                </div>
              )}

              {/* Formulário Dividido com Dados Identificados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Coluna 1: Miniatura da Imagem / Arquivo */}
                <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  {filePreview ? (
                    <div className="relative w-full max-h-48 overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <img
                        src={filePreview}
                        alt="Preview do Comprovante"
                        className="w-full h-44 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <FileText className="h-12 w-12 text-slate-300 mb-2" />
                      <span className="text-xs font-mono">{fileName}</span>
                    </div>
                  )}
                  <span className="mt-2 text-[11px] text-slate-500 font-medium">
                    Documento original arquivado no storage seguro
                  </span>
                </div>

                {/* Coluna 2: Campos Extraídos e Editáveis */}
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Valor Pago (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={extractedData.amount}
                      onChange={(e) =>
                        setExtractedData({
                          ...extractedData,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-black text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> Data
                      </label>
                      <input
                        type="date"
                        value={extractedData.date}
                        onChange={(e) =>
                          setExtractedData({ ...extractedData, date: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                        <CreditCard className="h-3.5 w-3.5 text-slate-400" /> Conta
                      </label>
                      <select
                        value={extractedData.bankAccount}
                        onChange={(e) =>
                          setExtractedData({ ...extractedData, bankAccount: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none truncate"
                      >
                        {BANK_ACCOUNTS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      <Building className="h-3.5 w-3.5 text-slate-400" /> Favorecido / Razão Social
                    </label>
                    <input
                      type="text"
                      value={extractedData.recipient}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, recipient: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1">
                      <Tag className="h-3.5 w-3.5 text-slate-400" /> Categoria Sugerida
                    </label>
                    <select
                      value={extractedData.category}
                      onChange={(e) =>
                        setExtractedData({ ...extractedData, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    >
                      {CATEGORIES_OPTIONS.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Escanear Outro
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReconciliation}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-98 transition-all"
                >
                  <CheckCircle className="h-4 w-4" />
                  Confirmar e Conciliar no Caixa
                </button>
              </div>
            </div>
          )}

          {/* ESTADO 4: SUCESSO */}
          {step === "success" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-in zoom-in">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                Comprovante Conciliado!
              </h4>
              <p className="text-xs text-slate-500 max-w-xs">
                O saldo bancário e o lançamento contábil foram atualizados em tempo real.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
