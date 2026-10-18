export type ConciliationStatus =
  | "PENDING_AI"
  | "AUTO_RECONCILED"
  | "RED_ALERT"
  | "MANUALLY_RECONCILED"
  | "DISCARDED";

export interface Receipt {
  id: string;
  fileUrl: string;
  originalFileName: string;
  uploadedAt: string;
  extractedAmount?: number;
  extractedDate?: string;
  extractedRecipient?: string;
  extractedCnpjCpf?: string;
  aiConfidenceScore: number;
  status: ConciliationStatus;
  divergenceReason?: string;
}

export interface BankTransaction {
  id: string;
  bankName: string;
  date: string;
  description: string;
  amount: number; // Positivo para crédito, negativo para débito
  isReconciled: boolean;
}

export interface RedAlertIssue {
  id: string;
  receiptId: string;
  issueType: "AMOUNT_MISMATCH" | "LOW_CONFIDENCE" | "MISSING_BANK_ENTRY" | "DUPLICATE";
  title: string;
  description: string;
  amountReceipt: number;
  amountBank?: number;
  difference?: number;
  detectedAt: string;
  confidenceScore: number;
}

export interface CashSummary {
  currentBalance: number;
  inflowToday: number;
  outflowToday: number;
  automationRate: number; // Ex.: 0.92 (92%)
  activeAlertsCount: number;
}
