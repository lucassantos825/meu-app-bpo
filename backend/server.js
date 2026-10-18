/**
 * Servidor Backend BPO Financeiro AI
 * Suporta Express ou Fallback nativo HTTP (zero dependências obrigatórias)
 */

const fs = require("fs");
const path = require("path");
const http = require("http");
const { processKiwifyWebhook } = require("./src/routes/kiwify");

const PORT = process.env.PORT || 8000;
const DB_PATH = path.join(__dirname, "data", "database.json");
const UPLOAD_DIR = path.join(__dirname, "storage", "uploads");

// Garante que os diretórios necessários existem
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Helper: Leitura do banco de dados estruturado em JSON
function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("[DB] Erro ao ler database.json:", err);
  }
  return {
    tenants: [],
    bankTransactions: [],
    receipts: [],
    redAlerts: [],
  };
}

// Helper: Salvamento atômico no banco JSON
function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("[DB] Erro ao salvar database.json:", err);
    return false;
  }
}

/**
 * 1. PIPELINE DE IA: EXTRAÇÃO SIMULADA DE COMPROVANTES
 * Recebe o arquivo e extrai dados (Valor, Data, Favorecido, CNPJ/CPF, Categoria, Confiança)
 */
function simulateAiOcrPipeline(originalFileName) {
  const lowerName = (originalFileName || "").toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  // Caso 1: Posto Shell (com divergência intencional para testar Alerta Vermelho)
  if (lowerName.includes("shell") || lowerName.includes("combustivel") || lowerName.includes("posto")) {
    return {
      amount: 158.50, // Comprovante de R$ 158,50 (no extrato o débito foi R$ 165,00)
      date: today,
      recipient: "Posto Shell - Auto Posto Ltda",
      cnpjCpf: "12.345.678/0001-90",
      category: "Fornecedores / Mercadorias",
      paymentMethod: "CARTAO",
      confidence: 0.96,
    };
  }

  // Caso 2: Kalunga (Match 100% Automático)
  if (lowerName.includes("kalunga") || lowerName.includes("papelaria") || lowerName.includes("escritorio")) {
    return {
      amount: 245.90, // Bate 100% com o extrato Nubank
      date: today,
      recipient: "Kalunga Comércio e Indústria Gráfica Ltda",
      cnpjCpf: "43.283.811/0001-50",
      category: "Material de Escritório",
      paymentMethod: "PIX",
      confidence: 0.98,
    };
  }

  // Caso 3: Recibo ilegível / cortado (Dispara Alerta Vermelho por baixa confiança)
  if (lowerName.includes("ilegivel") || lowerName.includes("recibo_sem_cnpj") || lowerName.includes("duvidoso")) {
    return {
      amount: 320.00,
      date: today,
      recipient: "Recibo Sem CNPJ Identificado",
      cnpjCpf: null,
      category: "Outras Despesas Operacionais",
      paymentMethod: "PIX",
      confidence: 0.68, // Menor que 0.90 -> Alerta Vermelho
    };
  }

  // Caso Padrão: Lançamento correspondente de R$ 184,50 (Itaú Auto Posto Ipiranga)
  return {
    amount: 184.50,
    date: today,
    recipient: "Posto Shell - Auto Posto Ipiranga Ltda",
    cnpjCpf: "12.345.678/0001-90",
    category: "Fornecedores / Mercadorias",
    paymentMethod: "CARTAO",
    confidence: 0.98,
  };
}

/**
 * 2. MOTOR DE CONCILIAÇÃO BANCÁRIA & GERAÇÃO DE ALERTA VERMELHO
 * Compara os dados da IA contra os lançamentos do extrato bancário
 */
function reconcileWithBankStatement(db, extractedData, receiptId) {
  // REGRA A: Confiança da IA insuficiente (< 90%)
  if (extractedData.confidence < 0.90) {
    const alert = {
      id: `alert-${Date.now()}`,
      receiptId: receiptId,
      issueType: "LOW_CONFIDENCE",
      title: "Documento com Baixa Confiança da IA",
      description: `A IA teve apenas ${(extractedData.confidence * 100).toFixed(0)}% de certeza. Foto cortada ou com dados ilegíveis.`,
      amountReceipt: extractedData.amount,
      amountBank: null,
      difference: 0,
      detectedAt: new Date().toISOString(),
      confidenceScore: extractedData.confidence,
    };
    return {
      matchStatus: "RED_ALERT",
      matchedTransactionId: null,
      divergenceReason: alert.description,
      redAlert: alert,
    };
  }

  // Busca no extrato do dia transações não conciliadas
  const transactions = db.bankTransactions || [];
  
  // 1. Procura Match Exato de centavos
  const exactMatch = transactions.find(
    (tx) => !tx.isReconciled && Math.abs(Math.abs(tx.amount) - extractedData.amount) < 0.01
  );

  if (exactMatch) {
    exactMatch.isReconciled = true;
    exactMatch.matchedReceiptId = receiptId;
    return {
      matchStatus: "AUTO_MATCH",
      matchedTransactionId: exactMatch.id,
      divergenceReason: null,
      redAlert: null,
    };
  }

  // 2. Procura Transação Próxima com Divergência de Valor (Alerta Vermelho)
  const divergentTx = transactions.find(
    (tx) => !tx.isReconciled && Math.abs(Math.abs(tx.amount) - extractedData.amount) <= 25.00
  );

  if (divergentTx) {
    const bankAmount = Math.abs(divergentTx.amount);
    const diff = Math.abs(bankAmount - extractedData.amount);
    const description = `Divergência de Valor: Comprovante indica R$ ${extractedData.amount.toFixed(2)}, mas débito no ${divergentTx.bankName} foi de R$ ${bankAmount.toFixed(2)} (Diferença de R$ ${diff.toFixed(2)}).`;

    const alert = {
      id: `alert-${Date.now()}`,
      receiptId: receiptId,
      issueType: "AMOUNT_MISMATCH",
      title: `Divergência de R$ ${diff.toFixed(2)} com o Extrato`,
      description: description,
      amountReceipt: extractedData.amount,
      amountBank: bankAmount,
      difference: diff,
      detectedAt: new Date().toISOString(),
      confidenceScore: extractedData.confidence,
    };

    return {
      matchStatus: "RED_ALERT",
      matchedTransactionId: divergentTx.id,
      divergenceReason: description,
      redAlert: alert,
    };
  }

  // 3. Sem correspondência no extrato bancário
  const noMatchDesc = `Nenhum lançamento bancário de R$ ${extractedData.amount.toFixed(2)} localizado no extrato do dia.`;
  const alert = {
    id: `alert-${Date.now()}`,
    receiptId: receiptId,
    issueType: "MISSING_BANK_ENTRY",
    title: "Comprovante Sem Lançamento no Extrato",
    description: noMatchDesc,
    amountReceipt: extractedData.amount,
    amountBank: null,
    difference: 0,
    detectedAt: new Date().toISOString(),
    confidenceScore: extractedData.confidence,
  };

  return {
    matchStatus: "RED_ALERT",
    matchedTransactionId: null,
    divergenceReason: noMatchDesc,
    redAlert: alert,
  };
}

/**
 * 3. CONTROLADORES DAS ROTAS DA API
 */
function handleUploadReceipt(req, res, uploadedFileName, bankAccountChoice) {
  const db = loadDatabase();
  const receiptId = `rec_${Date.now()}`;
  const fileName = uploadedFileName || `comprovante_${Date.now()}.jpg`;

  // Executa o Pipeline de IA
  const aiExtracted = simulateAiOcrPipeline(fileName);

  // Executa o Motor de Conciliação
  const conciliationResult = reconcileWithBankStatement(db, aiExtracted, receiptId);

  // Estrutura o comprovante para salvar no JSON
  const newReceipt = {
    id: receiptId,
    originalFileName: fileName,
    filePath: `storage/uploads/${fileName}`,
    fileUrl: `/static/uploads/${fileName}`,
    amount: aiExtracted.amount,
    date: aiExtracted.date,
    recipient: aiExtracted.recipient,
    cnpjCpf: aiExtracted.cnpjCpf,
    category: aiExtracted.category,
    bankAccount: bankAccountChoice || "Itaú Unibanco (Conta Principal)",
    paymentMethod: aiExtracted.paymentMethod,
    confidence: aiExtracted.confidence,
    status: conciliationResult.matchStatus,
    divergenceReason: conciliationResult.divergenceReason,
    matchedTransactionId: conciliationResult.matchedTransactionId,
    createdAt: new Date().toISOString(),
  };

  // Persiste no banco de dados
  db.receipts = db.receipts || [];
  db.receipts.unshift(newReceipt);

  if (conciliationResult.redAlert) {
    db.redAlerts = db.redAlerts || [];
    db.redAlerts.unshift(conciliationResult.redAlert);
  }

  saveDatabase(db);

  // Resposta compatível com o Frontend
  const responsePayload = {
    id: newReceipt.id,
    amount: newReceipt.amount,
    date: newReceipt.date,
    recipient: newReceipt.recipient,
    cnpjCpf: newReceipt.cnpjCpf,
    category: newReceipt.category,
    bankAccount: newReceipt.bankAccount,
    confidence: newReceipt.confidence,
    matchStatus: newReceipt.status, // "AUTO_MATCH" ou "RED_ALERT"
    divergenceDetail: newReceipt.divergenceReason,
    fileName: newReceipt.originalFileName,
    fileUrl: newReceipt.fileUrl,
    redAlert: conciliationResult.redAlert,
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(responsePayload));
}

function handleGetReceipts(res) {
  const db = loadDatabase();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(db.receipts || []));
}

function handleGetAlerts(res) {
  const db = loadDatabase();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(db.redAlerts || []));
}

function handleGetSummary(res) {
  const db = loadDatabase();
  const receipts = db.receipts || [];
  const autoReconciled = receipts.filter((r) => r.status === "AUTO_MATCH").length;
  const redAlertsCount = (db.redAlerts || []).length;
  const rate = receipts.length > 0 ? autoReconciled / receipts.length : 0.92;

  const summary = {
    currentBalance: 14850.20,
    inflowToday: 3200.00,
    outflowToday: 1150.00,
    automationRate: Number(rate.toFixed(2)),
    activeAlertsCount: redAlertsCount,
    reconciledCount: autoReconciled,
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(summary));
}

function handleGetBankTransactions(res) {
  const db = loadDatabase();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(db.bankTransactions || []));
}

function handleResolveAlert(req, res, body) {
  const db = loadDatabase();
  const { receiptId, action, selectedTransactionId, correctedAmount } = body;

  const receipt = (db.receipts || []).find((r) => r.id === receiptId);
  if (receipt) {
    if (action === "MATCH_TRANSACTION" && selectedTransactionId) {
      const tx = (db.bankTransactions || []).find((t) => t.id === selectedTransactionId);
      if (tx) {
        tx.isReconciled = true;
        tx.matchedReceiptId = receipt.id;
        receipt.matchedTransactionId = tx.id;
        receipt.status = "MANUALLY_RECONCILED";
        receipt.divergenceReason = null;
      }
    } else if (action === "UPDATE_AMOUNT" && correctedAmount) {
      receipt.amount = correctedAmount;
      receipt.status = "MANUALLY_RECONCILED";
      receipt.divergenceReason = null;
    } else if (action === "DISCARD") {
      receipt.status = "DISCARDED";
    }

    // Remove dos alertas ativos
    db.redAlerts = (db.redAlerts || []).filter((a) => a.receiptId !== receiptId);
    saveDatabase(db);
  }

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ success: true, receiptId, newStatus: receipt ? receipt.status : null }));
}

/**
 * 4. FASE 4: INTEGRAÇÃO KIWIFY WEBHOOK
 * Validação de Token, Idempotência e Gestão do Ciclo de Vida da Assinatura
 */
const KIWIFY_SECRET_TOKEN = process.env.KIWIFY_WEBHOOK_SECRET || "kiwify_secret_token_default";

function handleKiwifyWebhook(req, res, payload, signatureHeader) {
  // 1. Validação de Segurança do Token/Assinatura
  if (KIWIFY_SECRET_TOKEN !== "kiwify_secret_token_default" && signatureHeader !== KIWIFY_SECRET_TOKEN) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Assinatura ou token Kiwify inválido." }));
    return;
  }

  const db = loadDatabase();
  const event = payload.event || payload.order_status || "order_approved";
  const orderId = String(payload.order_id || payload.id || (payload.order && payload.order.id) || `order_${Date.now()}`);
  const customer = payload.Customer || payload.customer || {};
  const customerEmail = (customer.email || "cliente@microempresa.com.br").toLowerCase().trim();
  const customerName = customer.full_name || customer.name || "Microempresa Cliente";
  const customerDoc = customer.CPF || customer.cnpj || customer.cpf || "00.000.000/0001-00";
  const planTitle = payload.plan_title || (payload.Subscription && payload.Subscription.plan && payload.Subscription.plan.name) || "Plano BPO Micro Pro";

  db.tenants = db.tenants || [];
  let tenant = db.tenants.find((t) => t.kiwifyOrderId === orderId || t.email === customerEmail);

  let message = "";
  let actionTaken = "";

  // EVENTO 1: Pedido Aprovado / Assinatura Criada (order_approved, subscription_created, paid)
  if (["order_approved", "subscription_created", "paid"].includes(event)) {
    if (tenant) {
      // Idempotência: Se já existe, reativa sem duplicar registros
      tenant.subscriptionStatus = "ACTIVE";
      tenant.isActive = true;
      tenant.updatedAt = new Date().toISOString();
      actionTaken = "TENANT_REACTIVATED";
      message = "Assinatura existente reativada com sucesso (idempotente).";
    } else {
      // Criação de novo Tenant (Organização do microempresário)
      tenant = {
        id: `tenant_${Date.now()}`,
        name: `Empresa de ${customerName}`,
        cnpj: customerDoc,
        email: customerEmail,
        kiwifyOrderId: orderId,
        plan: planTitle,
        subscriptionStatus: "ACTIVE",
        isActive: true,
        monthlyQuota: "UNLIMITED",
        createdAt: new Date().toISOString(),
      };
      db.tenants.push(tenant);
      actionTaken = "TENANT_CREATED";
      message = `Novo Tenant provisionado para ${customerName} (${customerEmail}).`;
    }
  }
  // EVENTO 2: Renovação de Assinatura (subscription_renewed)
  else if (["subscription_renewed"].includes(event)) {
    if (tenant) {
      tenant.subscriptionStatus = "ACTIVE";
      tenant.isActive = true;
      tenant.lastRenewalAt = new Date().toISOString();
      actionTaken = "SUBSCRIPTION_RENEWED";
      message = "Ciclo de faturamento renovado com sucesso.";
    } else {
      actionTaken = "TENANT_NOT_FOUND";
      message = "Tenant não localizado para renovação de assinatura.";
    }
  }
  // EVENTO 3: Cancelamento, Reembolso ou Chargeback (order_refunded, chargeback, subscription_canceled)
  else if (["order_refunded", "chargeback", "subscription_canceled"].includes(event)) {
    if (tenant) {
      const statusMap = {
        order_refunded: "REFUNDED",
        chargeback: "BLOCKED",
        subscription_canceled: "CANCELED",
      };
      tenant.subscriptionStatus = statusMap[event] || "BLOCKED";
      tenant.isActive = false;
      tenant.blockedAt = new Date().toISOString();
      actionTaken = "TENANT_BLOCKED";
      message = `Acesso bloqueado imediatamente devido ao evento Kiwify: ${event}.`;
    } else {
      actionTaken = "TENANT_NOT_FOUND";
      message = "Tenant não localizado para aplicar bloqueio.";
    }
  } else {
    actionTaken = "EVENT_IGNORED";
    message = `Evento ${event} recebido sem regras específicas.`;
  }

  saveDatabase(db);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    received: true,
    processed: true,
    event: event,
    action: actionTaken,
    message: message,
    tenantId: tenant ? tenant.id : null,
    subscriptionStatus: tenant ? tenant.subscriptionStatus : null,
  }));
}

function handleGetSubscriptionStatus(res) {
  const db = loadDatabase();
  const currentTenant = (db.tenants && db.tenants[0]) || {
    name: "Microempresa Demonstração",
    plan: "Plano BPO Micro Pro",
    subscriptionStatus: "ACTIVE",
    isActive: true,
  };

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    tenantName: currentTenant.name,
    plan: currentTenant.plan,
    status: currentTenant.subscriptionStatus, // ACTIVE, BLOCKED, CANCELED, REFUNDED
    isActive: currentTenant.isActive !== false,
    kiwifyCheckoutUrl: "https://kiwify.app/checkout-placeholder-bpo",
  }));
}

/**
 * 4. INICIALIZAÇÃO DO SERVIDOR HTTP COM SUPORTE A CORS
 */
const server = http.createServer((req, res) => {
  // Cabeçalhos CORS para permitir conexão com Next.js em localhost:3000
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PATCH, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-kiwify-signature");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ROTA: Health Check
  if (pathname === "/" || pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ app: "BPO Financeiro AI Backend", status: "online", port: PORT }));
    return;
  }

  // ROTA: Upload de Comprovante & Pipeline de IA
  if (pathname === "/api/v1/receipts/upload" && req.method === "POST") {
    const contentType = req.headers["content-type"] || "";
    
    // Suporte tanto para multipart quanto para payload simulado em JSON
    if (contentType.includes("application/json")) {
      let bodyData = "";
      req.on("data", (chunk) => { bodyData += chunk; });
      req.on("end", () => {
        try {
          const parsed = JSON.parse(bodyData || "{}");
          handleUploadReceipt(req, res, parsed.fileName, parsed.bankAccount);
        } catch (e) {
          handleUploadReceipt(req, res, "comprovante_upload.jpg", "Itaú Unibanco");
        }
      });
    } else {
      // Leitura de stream de upload de arquivo
      let bufferChunks = [];
      req.on("data", (chunk) => { bufferChunks.push(chunk); });
      req.on("end", () => {
        const fullBuffer = Buffer.concat(bufferChunks);
        const fileNameHeader = req.headers["x-filename"] || "comprovante_scanner.jpg";
        const savedFilePath = path.join(UPLOAD_DIR, `${Date.now()}_${fileNameHeader}`);
        try {
          fs.writeFileSync(savedFilePath, fullBuffer);
        } catch (err) {}
        handleUploadReceipt(req, res, fileNameHeader, "Itaú Unibanco (Conta Principal)");
      });
    }
    return;
  }

  // ROTA: Listar comprovantes
  if (pathname === "/api/v1/receipts" && req.method === "GET") {
    handleGetReceipts(res);
    return;
  }

  // ROTA: Alertas Vermelhos
  if (pathname === "/api/v1/conciliation/alerts" && req.method === "GET") {
    handleGetAlerts(res);
    return;
  }

  // ROTA: Resumo do Caixa
  if (pathname === "/api/v1/conciliation/summary" && req.method === "GET") {
    handleGetSummary(res);
    return;
  }

  // ROTA: Extrato bancário fictício
  if (pathname === "/api/v1/bank-transactions" && req.method === "GET") {
    handleGetBankTransactions(res);
    return;
  }

  // ROTA: Resolução de Exceção Lado a Lado
  if (pathname === "/api/v1/conciliation/resolve" && req.method === "POST") {
    let bodyData = "";
    req.on("data", (chunk) => { bodyData += chunk; });
    req.on("end", () => {
      try {
        const body = JSON.parse(bodyData || "{}");
        handleResolveAlert(req, res, body);
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }
  // ROTA: Status da Assinatura Kiwify (Multi-tenancy)
  if (pathname === "/api/v1/subscription/status" && req.method === "GET") {
    handleGetSubscriptionStatus(res);
    return;
  }

  // ROTA: Webhooks oficiais da Kiwify (/webhook/kiwify, /api/webhook/kiwify e /api/webhooks/kiwify)
  if (
    (pathname === "/webhook/kiwify" ||
      pathname === "/api/webhook/kiwify" ||
      pathname === "/api/webhooks/kiwify") &&
    req.method === "POST"
  ) {
    let bodyData = "";
    req.on("data", (chunk) => {
      bodyData += chunk;
    });
    req.on("end", () => {
      try {
        const payload = JSON.parse(bodyData || "{}");
        const signatureHeader =
          req.headers["x-kiwify-signature"] || url.searchParams.get("signature") || "";

        // Processa via rota dedicada
        const result = processKiwifyWebhook(payload, signatureHeader);

        res.writeHead(result.statusCode, { "Content-Type": "application/json" });
        res.end(JSON.stringify(result.response));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload JSON inválido" }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Rota não encontrada", path: pathname }));
});

// Inicialização sem bloqueio
server.listen(PORT, () => {
  console.log(`🚀 [Backend] Servidor BPO Financeiro rodando em http://localhost:${PORT}`);
  console.log(`📂 [Database] Persistência estruturada em: ${DB_PATH}`);
});

module.exports = server;
