export type PaymentPurpose = "booking_deposit" | "service_balance";

export type PaymentStatus =
  | "requires_checkout"
  | "checkout_ready"
  | "processing"
  | "paid"
  | "rejected"
  | "expired"
  | "cancelled"
  | "refunded"
  | "disputed"
  | "payment_mismatch";

export interface PaymentTransaction {
  id: number;
  processor: string;
  externalPaymentId: string;
  status: string;
  currency: string;
  amountCents: number;
  verifiedOn: string | null;
  createdOn: string;
  updatedOn: string;
  processorFeeCents: number | null;
  netSettlementCents: number | null;
}

export interface PaymentBreakdown {
  currency: string;
  serviceTotalCents: number;
  depositCents: number;
  platformFeeTotalCents: number;
  platformFeeDueNowCents: number;
  bookingPaymentDeadline: string;
  amountDueNowCents: number | null;
  remainingServiceBalanceCents: number | null;
  remainingPlatformFeeCents: number | null;
  remainingAmountDueCents: number | null;
}

export interface PaymentAmount {
  currency: string;
  amountCents: number;
}

export interface PaymentSummary {
  approvedAmounts: PaymentAmount[];
  pendingAmount: PaymentAmount | null;
  anomalies: string[];
}

export interface PaymentIntentSummary {
  id: string;
  serviceProposalId: number;
  workOrderId: number | null;
  consumerId: number;
  providerId: number;
  consumerName?: string;
  providerName?: string;
  operationId?: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  currency: string;
  sellerAmountCents: number;
  platformFeeCents: number;
  totalAmountCents: number;
  createdOn: string;
  updatedOn: string;
  transactions: PaymentTransaction[];
  breakdown: PaymentBreakdown;
  summary: PaymentSummary;
  anomalies: string[];
}

export interface PaymentListResult {
  items: PaymentIntentSummary[];
  page: {
    limit: number;
    nextCursor: string | null;
  };
}

/** Filters accepted by GET /admin/payments. */
export interface PaymentFilters {
  paymentIntentId?: string;
  externalReference?: string;
  externalPaymentId?: string;
  serviceProposalId?: number;
  consumerEmail?: string;
  providerEmail?: string;
  purpose?: PaymentPurpose;
  intentStatus?: PaymentStatus;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  cursor?: string;
}
