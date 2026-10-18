const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DB_PATH = path.join(__dirname, "..", "..", "data", "database.json");

function readDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
    }
  } catch (error) {
    console.error("[KiwifyRoute] Erro ao ler database.json:", error);
  }
  return { tenants: [], users: [], bankTransactions: [], receipts: [], redAlerts: [] };
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("[KiwifyRoute] Erro ao salvar database.json:", error);
    return false;
  }
}

function generateDashboardAccessToken(tenantId, email) {
  const secret = process.env.JWT_SECRET || "bpo_financeiro_dashboard_secret_key";
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      tenantId,
      email,
      role: "OWNER",
      scope: ["dashboard:access", "receipts:upload", "conciliation:view"],
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 dias de validade
      iat: Math.floor(Date.now() / 1000),
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

function processKiwifyWebhook(payload, signatureHeader) {
  const expectedSecret = process.env.KIWIFY_WEBHOOK_SECRET || "kiwify_secret_token_default";

  // 1. Validação do Token de Segurança
  if (
    expectedSecret !== "kiwify_secret_token_default" &&
    signatureHeader &&
    signatureHeader !== expectedSecret
  ) {
    return {
      statusCode: 401,
      response: {
        received: false,
        status: "error",
        message: "Assinatura ou token de webhook Kiwify inválido.",
      },
    };
  }

  const event = (payload.event || payload.order_status || "order_approved").toLowerCase();
  const orderId = String(
    payload.order_id || payload.id || `kiwify_${Date.now()}`
  );

  const customer = payload.Customer || payload.customer || { email: "cliente@microempresa.com.br" };
  const customerEmail = (customer.email || "").toLowerCase().trim();
  const customerName = customer.full_name || customer.name || "Microempresa Cliente";
  const customerCpfCnpj = customer.CPF || customer.cnpj || customer.cpf || "00.000.000/0001-00";
  const planName =
    payload.plan_title ||
    (payload.Subscription && payload.Subscription.plan && payload.Subscription.plan.name) ||
    "Plano BPO Micro Pro - Mensal";

  const db = readDatabase();
  db.tenants = db.tenants || [];
  db.users = db.users || [];

  // 2. Eventos de Sucesso: Pedido Aprovado / Assinatura Criada ("order_approved", "paid", "subscription_created")
  if (["order_approved", "paid", "subscription_created"].includes(event)) {
    let tenant = db.tenants.find(
      (t) => t.kiwifyOrderId === orderId || (t.email && t.email.toLowerCase() === customerEmail)
    );

    let accessToken = "";

    if (tenant) {
      // Idempotência: Se já existe, reativa a assinatura e renova o token
      tenant.subscriptionStatus = "ACTIVE";
      tenant.isActive = true;
      tenant.updatedAt = new Date().toISOString();
      accessToken = generateDashboardAccessToken(tenant.id, customerEmail);
      tenant.lastAccessToken = accessToken;
    } else {
      // Criação automática do Tenant (Empresa do Microempresário)
      const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      accessToken = generateDashboardAccessToken(tenantId, customerEmail);

      // Simulação de credenciais de primeiro acesso
      const initialTemporaryPassword = `BPO@${Math.floor(100000 + Math.random() * 900000)}`;

      tenant = {
        id: tenantId,
        name: `Empresa de ${customerName}`,
        cnpj: customerCpfCnpj,
        email: customerEmail,
        kiwifyOrderId: orderId,
        plan: planName,
        status: "ACTIVE",
        subscriptionStatus: "ACTIVE",
        isActive: true,
        monthlyQuota: "UNLIMITED",
        lastAccessToken: accessToken,
        initialCredentials: {
          email: customerEmail,
          temporaryPassword: initialTemporaryPassword,
          mustResetPassword: true,
          firstAccessUrl: `http://localhost:3000?token=${accessToken}`,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.tenants.push(tenant);

      // Adiciona o usuário administrador do Tenant
      db.users.push({
        id: `user_${Date.now()}`,
        tenantId: tenant.id,
        email: customerEmail,
        fullName: customerName,
        role: "OWNER",
        isActive: true,
        createdAt: new Date().toISOString(),
      });
    }

    writeDatabase(db);

    return {
      statusCode: 200,
      response: {
        received: true,
        status: "success",
        message: "Pagamento aprovado na Kiwify! Cliente cadastrado e token de acesso liberado.",
        orderId,
        customerEmail,
        tenantId: tenant.id,
        accessToken: accessToken,
        dashboardRedirectUrl: `http://localhost:3000?token=${accessToken}`,
      },
    };
  }

  // 3. Evento: Cancelamento ou Reembolso ("order_refunded", "chargeback", "subscription_canceled")
  if (["order_refunded", "chargeback", "subscription_canceled"].includes(event)) {
    const tenant = db.tenants.find(
      (t) => t.kiwifyOrderId === orderId || (t.email && t.email.toLowerCase() === customerEmail)
    );

    if (tenant) {
      tenant.subscriptionStatus = event === "order_refunded" ? "REFUNDED" : "CANCELED";
      tenant.isActive = false;
      tenant.blockedAt = new Date().toISOString();
      writeDatabase(db);
    }

    return {
      statusCode: 200,
      response: {
        received: true,
        status: "success",
        message: `Assinatura do cliente suspensa devido ao evento '${event}'.`,
        orderId,
        customerEmail,
        tenantId: tenant ? tenant.id : null,
      },
    };
  }

  // 4. Outros Eventos
  return {
    statusCode: 200,
    response: {
      received: true,
      status: "ignored",
      message: `Evento '${event}' registrado sem alterações no tenant.`,
      orderId,
    },
  };
}

module.exports = {
  processKiwifyWebhook,
  generateDashboardAccessToken,
};
