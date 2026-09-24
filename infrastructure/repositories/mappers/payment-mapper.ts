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
    externalPaymentId: parsed.external_payment_id ?? null,
    externalReference: parsed.external_reference ?? null,
    purpose: parsed.purpose,
    status: parsed.status,
    serviceProposalId: parsed.service_proposal_id ?? null,
    workOrderId: parsed.work_order_id ?? null,
    consumer: {
      id: parsed.consumer.id,
      name: parsed.consumer.name,
      email: parsed.consumer.email,
    },
    provider: {
      id: parsed.provider.id,
      name: parsed.provider.name,
      email: parsed.provider.email,
    },
    breakdown: {
      serviceAmountCents: parsed.service_amount_cents,
      sellerAmountCents: parsed.seller_amount_cents,
      platformFeeCents: parsed.platform_fee_cents,
      totalAmountCents: parsed.total_amount_cents,
      currency: parsed.currency,
    },
    createdAt: parsed.created_at,
    verifiedAt: parsed.verified_at ?? null,
  };
}

export function mapPaymentList(raw: unknown): PaymentListResult {
  if (Array.isArray(raw)) {
    const items = raw.map(mapPaymentItem);
    return {
      items,
      total: items.length,
      page: 1,
      limit: items.length || 10,
      totalPages: 1,
    };
  }

  const parsed: ApiPaymentListResponse = apiPaymentListResponseSchema.parse(raw);
  return {
    items: parsed.items.map(mapPaymentItem),
    total: parsed.pagination.total,
    page: parsed.pagination.page,
    limit: parsed.pagination.limit,
    totalPages: parsed.pagination.total_pages,
  };
}
