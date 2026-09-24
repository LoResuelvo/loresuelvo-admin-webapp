export type PaymentPurpose = "deposit" | "balance";

export type PaymentStatus = "approved" | "pending" | "rejected" | "cancelled";

export interface PaymentParty {
  id: number;
  name: string;
  email: string;
}

export interface FinancialBreakdown {
  serviceAmountCents: number;
  sellerAmountCents: number;
  platformFeeCents: number;
  totalAmountCents: number;
  currency: string;
}

export interface PaymentIntentSummary {
  id: number;
  externalPaymentId?: string | null;
  externalReference?: string | null;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  serviceProposalId?: number | null;
  workOrderId?: number | null;
  consumer: PaymentParty;
  provider: PaymentParty;
  breakdown: FinancialBreakdown;
  createdAt: string;
  verifiedAt?: string | null;
}

export interface PaymentListResult {
  items: PaymentIntentSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentFilters {
  query?: string;
  purpose?: PaymentPurpose;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}
