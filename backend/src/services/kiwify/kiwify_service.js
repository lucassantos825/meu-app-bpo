const crypto = require("crypto");

class KiwifyService {
  constructor(secret) {
    this.secret = secret || process.env.KIWIFY_WEBHOOK_SECRET || "kiwify_secret_token_default";
  }

  verifySignature(signatureReceived) {
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

  isPaymentApproved(event, orderStatus) {
    const e = (event || "").toLowerCase();
    const s = (orderStatus || "").toLowerCase();
    return (
      e === "order_approved" ||
      e === "paid" ||
      e === "subscription_created" ||
      s === "paid"
    );
  }

  isAccessRevoked(event, orderStatus) {
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

const kiwifyService = new KiwifyService();

module.exports = {
  KiwifyService,
  kiwifyService,
};
