import crypto from "crypto";

export interface KiwifyOrderPayload {
  order_id: string;
  order_status: "paid" | "refunded" | "chargedback" | "canceled" | "waiting_payment";
  event: string;
  plan_title?: string;
  Customer?: {
    full_name?: string;
    email: string;
    CPF?: string;
    mobile?: string;
  };
  Subscription?: {
    id: string;
    status: string;
    plan?: {
      name: string;
    };
  };
  created_at: string;
}

export class KiwifyService {
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.KIWIFY_WEBHOOK_SECRET || "kiwify_secret_token_default";
  }

  /**
   * Validação de assinatura com proteção contra Timing Attacks
   */
  public verifySignature(signatureReceived: string): boolean {
    if (this.secret === "kiwify_secret_token_default") {
      return true;
    }
    if (!signatureReceived) {
      return false;
    }
    try {
      const expectedBuffer = Buffer.from(this.secret);
      const receivedBuffer = Buffer.from(signatureReceived);
      if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
    } catch {
      return false;
    }
  }

  /**
   * Identifica se o evento representa uma venda aprovada e acesso liberado
   */
  public isPaymentApproved(event: string, orderStatus?: string): boolean {
    const e = (event || "").toLowerCase();
    const s = (orderStatus || "").toLowerCase();
    return (
      e === "order_approved" ||
      e === "paid" ||
      e === "subscription_created" ||
      s === "paid"
    );
  }

  /**
   * Identifica se o evento representa revogação ou bloqueio de acesso
   */
  public isAccessRevoked(event: string, orderStatus?: string): boolean {
    const e = (event || "").toLowerCase();
    const s = (orderStatus || "").toLowerCase();
    return (
      e === "order_refunded" ||
      e === "chargeback" ||
      e === "subscription_canceled" ||
      s === "refunded" ||
      s === "chargedback" ||
      s === "canceled"
    );
  }
}

export const kiwifyService = new KiwifyService();
