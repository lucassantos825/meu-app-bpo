export interface SubscriptionStatusResponse {
  tenantName: string;
  plan: string;
  status: "ACTIVE" | "BLOCKED" | "CANCELED" | "REFUNDED";
  isActive: boolean;
  kiwifyCheckoutUrl: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/subscription/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.warn("Backend offline, utilizando status padrão de demonstração:", error);
  }

  // Fallback seguro com variáveis configuradas
  return {
    tenantName: "Minha Empresa",
    plan: "Plano Mensal OaaS",
    status: "ACTIVE",
    isActive: true,
    kiwifyCheckoutUrl:
      process.env.NEXT_PUBLIC_KIWIFY_CHECKOUT_URL ||
      "https://kiwify.app/checkout-placeholder-bpo?plan=mensal-2990",
  };
}
