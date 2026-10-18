/**
 * Script de Simulação de Webhooks Kiwify
 * Uso:
 *   node scripts/simulate_kiwify_webhook.js approved
 *   node scripts/simulate_kiwify_webhook.js renewed
 *   node scripts/simulate_kiwify_webhook.js refunded
 *   node scripts/simulate_kiwify_webhook.js canceled
 */

const http = require("http");

const eventArg = (process.argv[2] || "approved").toLowerCase();

const mockEvents = {
  approved: {
    event: "order_approved",
    order_id: "kiwify_ord_998877",
    order_status: "paid",
    plan_title: "Plano BPO Micro Pro (Mensal)",
    Customer: {
      full_name: "Marcos Vinicius da Silva",
      email: "marcos@oficinamsilva.com.br",
      CPF: "234.567.890-11",
    },
    Subscription: {
      id: "sub_123456",
      status: "active",
      plan: {
        name: "Plano BPO Micro Pro",
      },
    },
    created_at: new Date().toISOString(),
  },
  renewed: {
    event: "subscription_renewed",
    order_id: "kiwify_ord_998877",
    order_status: "paid",
    Customer: {
      email: "marcos@oficinamsilva.com.br",
    },
    renewed_at: new Date().toISOString(),
  },
  refunded: {
    event: "order_refunded",
    order_id: "kiwify_ord_998877",
    order_status: "refunded",
    Customer: {
      email: "marcos@oficinamsilva.com.br",
    },
    refunded_at: new Date().toISOString(),
  },
  canceled: {
    event: "subscription_canceled",
    order_id: "kiwify_ord_998877",
    Customer: {
      email: "marcos@oficinamsilva.com.br",
    },
    canceled_at: new Date().toISOString(),
  },
};

const payload = mockEvents[eventArg] || mockEvents.approved;
const postData = JSON.stringify(payload);

const options = {
  hostname: "localhost",
  port: process.env.PORT || 8000,
  path: "/webhook/kiwify",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(postData),
    "x-kiwify-signature": "kiwify_secret_token_default",
  },
};

console.log(`📤 Enviando webhook simulado da Kiwify para http://localhost:${options.port}${options.path}`);
console.log(`🎯 Evento: ${payload.event || eventArg}`);

const req = http.request(options, (res) => {
  let resData = "";
  res.on("data", (chunk) => {
    resData += chunk;
  });
  res.on("end", () => {
    console.log(`📥 Resposta HTTP ${res.statusCode}:`);
    try {
      console.log(JSON.stringify(JSON.parse(resData), null, 2));
    } catch (e) {
      console.log(resData);
    }
  });
});

req.on("error", (e) => {
  console.log(`⚠️ Não foi possível conectar ao servidor (ele pode não estar rodando agora): ${e.message}`);
  console.log(`Payload pronto para envio:`);
  console.log(JSON.stringify(payload, null, 2));
});

req.write(postData);
req.end();
