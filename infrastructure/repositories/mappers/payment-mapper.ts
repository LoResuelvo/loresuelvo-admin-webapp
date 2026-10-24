import type {
  PaymentIntentSummary,
  PaymentListResult,
} from "@/domain/payments/payment";
import {
  apiPaymentItemResponseSchema,
  apiPaymentListResponseSchema,
  type ApiPaymentItemResponse,
  type ApiPaymentListResponse,
} from "@/infrastructure/api/types";

export function mapPaymentItem(raw: unknown): PaymentIntentSummary {
  const parsed: ApiPaymentItemResponse = apiPaymentItemResponseSchema.parse(raw);

  return {
    id: parsed.id,
    serviceProposalId: parsed.service_proposal_id,
    workOrderId: parsed.work_order_id,
    consumerId: parsed.consumer_id,
    providerId: parsed.provider_id,
    consumerName: parsed.consumer_name?.trim() || undefined,
    providerName: parsed.provider_name?.trim() || undefined,
    operationId: parsed.operation_id,
    purpose: parsed.purpose,
    status: parsed.intent_status,
    currency: parsed.currency,
    sellerAmountCents: parsed.seller_amount_cents,
    platformFeeCents: parsed.platform_fee_cents,
    totalAmountCents: parsed.total_amount_cents,
    createdOn: parsed.created_on,
    updatedOn: parsed.updated_on,
    transactions: parsed.transactions.map((transaction) => ({
      id: transaction.id,
      processor: transaction.processor,
      externalPaymentId: transaction.external_payment_id,
      status: transaction.status,
      currency: transaction.currency,
      amountCents: transaction.amount_cents,
      verifiedOn: transaction.verified_on,
      createdOn: transaction.created_on,
      updatedOn: transaction.updated_on,
      processorFeeCents: transaction.processor_fee_cents,
      netSettlementCents: transaction.net_settlement_cents,
    })),
    breakdown: {
      currency: parsed.breakdown.currency,
      serviceTotalCents: parsed.breakdown.service_total_cents,
      depositCents: parsed.breakdown.deposit_cents,
      platformFeeTotalCents: parsed.breakdown.platform_fee_total_cents,
      platformFeeDueNowCents: parsed.breakdown.platform_fee_due_now_cents,
      bookingPaymentDeadline: parsed.breakdown.booking_payment_deadline,
      amountDueNowCents: parsed.breakdown.amount_due_now_cents,
      remainingServiceBalanceCents: parsed.breakdown.remaining_service_balance_cents,
      remainingPlatformFeeCents: parsed.breakdown.remaining_platform_fee_cents,
      remainingAmountDueCents: parsed.breakdown.remaining_amount_due_cents,
    },
    summary: {
      approvedAmounts: parsed.summary.approved_amounts.map((amount) => ({
        currency: amount.currency,
        amountCents: amount.amount_cents,
      })),
      pendingAmount: parsed.summary.pending_amount
        ? {
            currency: parsed.summary.pending_amount.currency,
            amountCents: parsed.summary.pending_amount.amount_cents,
          }
        : null,
      anomalies: parsed.summary.anomalies,
    },
    anomalies: parsed.anomalies,
  };
}

export function mapPaymentList(raw: unknown): PaymentListResult {
  const parsed: ApiPaymentListResponse = apiPaymentListResponseSchema.parse(raw);
  return {
    items: parsed.payments.map(mapPaymentItem),
    page: {
      limit: parsed.page.limit,
      nextCursor: parsed.page.next_cursor,
    },
  };
}
