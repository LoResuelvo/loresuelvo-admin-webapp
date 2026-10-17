import { z } from "zod";

const positiveId = z.number().int().positive();
const nonNegativeAmount = z.number().int().nonnegative();
const nullableAmount = nonNegativeAmount.nullable();
const timestamp = z.string().datetime({ offset: true });

export const apiPaymentPurposeSchema = z.enum(["booking_deposit", "service_balance"]);

export const apiPaymentIntentStatusSchema = z.enum([
  "requires_checkout",
  "checkout_ready",
  "processing",
  "paid",
  "rejected",
  "expired",
  "cancelled",
  "refunded",
  "disputed",
  "payment_mismatch",
]);

export const apiPaymentTransactionSchema = z.object({
  id: positiveId,
  processor: z.string(),
  external_payment_id: z.string(),
  status: z.string(),
  currency: z.string(),
  amount_cents: nonNegativeAmount,
  verified_on: timestamp.nullable(),
  created_on: timestamp,
  updated_on: timestamp,
  processor_fee_cents: nullableAmount,
  net_settlement_cents: nullableAmount,
});

export const apiPaymentBreakdownSchema = z.object({
  currency: z.string(),
  service_total_cents: nonNegativeAmount,
  deposit_cents: nonNegativeAmount,
  platform_fee_total_cents: nonNegativeAmount,
  platform_fee_due_now_cents: nonNegativeAmount,
  booking_payment_deadline: timestamp,
  amount_due_now_cents: nullableAmount,
  remaining_service_balance_cents: nullableAmount,
  remaining_platform_fee_cents: nullableAmount,
  remaining_amount_due_cents: nullableAmount,
});

const apiPaymentAmountSchema = z.object({
  currency: z.string(),
  amount_cents: nonNegativeAmount,
});

export const apiPaymentItemResponseSchema = z.object({
  id: z.string().uuid(),
  service_proposal_id: positiveId,
  work_order_id: positiveId.nullable(),
  consumer_id: positiveId,
  provider_id: positiveId,
  purpose: apiPaymentPurposeSchema,
  intent_status: apiPaymentIntentStatusSchema,
  currency: z.string(),
  seller_amount_cents: nonNegativeAmount,
  platform_fee_cents: nonNegativeAmount,
  total_amount_cents: nonNegativeAmount,
  created_on: timestamp,
  updated_on: timestamp,
  transactions: z.array(apiPaymentTransactionSchema),
  breakdown: apiPaymentBreakdownSchema,
  summary: z.object({
    approved_amounts: z.array(apiPaymentAmountSchema),
    pending_amount: apiPaymentAmountSchema.nullable(),
    anomalies: z.array(z.string()),
  }),
  anomalies: z.array(z.string()),
});

export type ApiPaymentItemResponse = z.infer<typeof apiPaymentItemResponseSchema>;

export const apiPaymentListResponseSchema = z.object({
  payments: z.array(apiPaymentItemResponseSchema),
  page: z.object({
    limit: z.number().int().positive(),
    next_cursor: z.string().nullable(),
  }),
});

export type ApiPaymentListResponse = z.infer<typeof apiPaymentListResponseSchema>;
