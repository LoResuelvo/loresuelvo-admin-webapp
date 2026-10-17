import type { PaymentIntentSummary, PaymentListResult } from "./types";

export const paymentFixture = (
  overrides: Partial<PaymentIntentSummary> = {},
): PaymentIntentSummary => ({
  id: "0f8fad5b-d9cb-469f-a165-70867728950e",
  serviceProposalId: 101,
  workOrderId: null,
  consumerId: 1,
  providerId: 2,
  purpose: "booking_deposit",
  status: "paid",
  currency: "ARS",
  sellerAmountCents: 1_700_000,
  platformFeeCents: 300_000,
  totalAmountCents: 2_000_000,
  createdOn: "2026-09-20T10:00:00Z",
  updatedOn: "2026-09-20T10:05:00Z",
  transactions: [
    {
      id: 42,
      processor: "mercado_pago",
      externalPaymentId: "pay_1001",
      status: "approved",
      currency: "ARS",
      amountCents: 2_000_000,
      verifiedOn: "2026-09-20T10:05:00Z",
      createdOn: "2026-09-20T10:00:00Z",
      updatedOn: "2026-09-20T10:05:00Z",
      processorFeeCents: null,
      netSettlementCents: null,
    },
  ],
  breakdown: {
    currency: "ARS",
    serviceTotalCents: 2_000_000,
    depositCents: 500_000,
    platformFeeTotalCents: 300_000,
    platformFeeDueNowCents: 75_000,
    bookingPaymentDeadline: "2026-09-21T10:00:00Z",
    amountDueNowCents: 575_000,
    remainingServiceBalanceCents: 1_500_000,
    remainingPlatformFeeCents: 225_000,
    remainingAmountDueCents: 1_725_000,
  },
  summary: {
    approvedAmounts: [{ currency: "ARS", amountCents: 2_000_000 }],
    pendingAmount: null,
    anomalies: [],
  },
  anomalies: [],
  ...overrides,
});

export const multiplePaymentFixtures: PaymentIntentSummary[] = [
  paymentFixture(),
  paymentFixture({
    id: "d9428888-122b-11e1-b85c-61cd3cbb3210",
    serviceProposalId: 102,
    workOrderId: 201,
    consumerId: 3,
    providerId: 4,
    purpose: "service_balance",
    totalAmountCents: 5_000_000,
    sellerAmountCents: 4_250_000,
    platformFeeCents: 750_000,
    status: "paid",
    transactions: [],
  }),
  paymentFixture({
    id: "e88f9b4f-a6c3-4f06-bc8a-710c628e2a45",
    serviceProposalId: 103,
    consumerId: 5,
    providerId: 6,
    status: "processing",
    summary: {
      approvedAmounts: [],
      pendingAmount: { currency: "ARS", amountCents: 3_500_000 },
      anomalies: [],
    },
  }),
];

export function paymentListFixture(
  items: PaymentIntentSummary[] = [paymentFixture()],
  nextCursor: string | null = null,
): PaymentListResult {
  return { items, page: { limit: 20, nextCursor } };
}
