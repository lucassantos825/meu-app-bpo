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

  // Fallback padrão se o servidor estiver temporariamente desligado
  return {
    tenantName: "Oficina Mecânica & Peças Silva Ltda",
    plan: "Plano BPO Micro Pro",
    status: "ACTIVE",
    isActive: true,
    kiwifyCheckoutUrl: "https://kiwify.app/checkout-placeholder-bpo",
  };
}
