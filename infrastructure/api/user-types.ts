import { z } from "zod";

export const apiProviderDiagnosticCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
});

export const apiProviderDiagnosticCoverageZoneSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  is_active: z.boolean(),
});

export const apiProviderDiagnosticIdentityVerificationSchema = z.object({
  status: z.string().trim().min(1),
  verified_at: z.string().nullish(),
});

export const apiProviderDiagnosticPaymentConnectionSchema = z.object({
  is_connected: z.boolean(),
  account_id: z.string().nullish(),
  can_receive_payments: z.boolean(),
});

export const apiProviderDiagnosticCalendarConnectionSchema = z.object({
  status: z.string().trim().min(1),
});

export const apiProviderDiagnosticRecentOperationSchema = z.object({
  id: z.number().int().positive(),
  category_name: z.string().trim().min(1),
  consumer_name: z.string().trim().min(1),
  status: z.string().trim().min(1),
  created_at: z.string().trim().min(1),
});

export const apiProviderDiagnosticActivitySummarySchema = z.object({
  total_requests: z.number().int().nonnegative(),
  active_orders: z.number().int().nonnegative(),
  completed_orders: z.number().int().nonnegative(),
  average_rating: z.number().nonnegative(),
  reviews_count: z.number().int().nonnegative(),
  recent_operations: z.array(apiProviderDiagnosticRecentOperationSchema),
});

export const apiProviderDiagnosticResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.string().email(),
  phone: z.string().trim().min(1),
  profile_photo_url: z.string().nullish(),
  category: apiProviderDiagnosticCategorySchema,
  coverage_zones: z.array(apiProviderDiagnosticCoverageZoneSchema),
  identity_verification: apiProviderDiagnosticIdentityVerificationSchema,
  payment_connection: apiProviderDiagnosticPaymentConnectionSchema,
  calendar_connection: apiProviderDiagnosticCalendarConnectionSchema,
  activity_summary: apiProviderDiagnosticActivitySummarySchema.nullish(),
});

export type ApiProviderDiagnosticResponse = z.infer<typeof apiProviderDiagnosticResponseSchema>;
