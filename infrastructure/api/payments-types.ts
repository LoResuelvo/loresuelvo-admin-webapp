import { z } from "zod";

export const apiPaymentItemResponseSchema = z.object({
  id: z.number().int().positive(),
  external_payment_id: z.string().nullish(),
  external_reference: z.string().nullish(),
  purpose: z.enum(["deposit", "balance"]),
  status: z.enum(["approved", "pending", "rejected", "cancelled"]),
  service_proposal_id: z.number().int().positive().nullish(),
  work_order_id: z.number().int().positive().nullish(),
  consumer: z.object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1),
    email: z.string().email(),
  }),
  provider: z.object({
    id: z.number().int().positive(),
    name: z.string().trim().min(1),
    email: z.string().email(),
  }),
  currency: z.string().default("ARS"),
  service_amount_cents: z.number().int().nonnegative(),
  seller_amount_cents: z.number().int().nonnegative(),
  platform_fee_cents: z.number().int().nonnegative(),
  total_amount_cents: z.number().int().nonnegative(),
  created_at: z.string().min(1),
  verified_at: z.string().nullish(),
});

export type ApiPaymentItemResponse = z.infer<typeof apiPaymentItemResponseSchema>;

export const apiPaymentListResponseSchema = z.object({
  items: z.array(apiPaymentItemResponseSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    total_pages: z.number().int().nonnegative(),
  }),
});

export type ApiPaymentListResponse = z.infer<typeof apiPaymentListResponseSchema>;
