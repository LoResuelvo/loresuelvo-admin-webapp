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

const apiConsumerHistoryProviderSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
});

const apiConsumerHistoryOperationSchema = z.object({
  id: z.string().regex(/^(jr|sp)-[1-9][0-9]*$/),
  url: z.string().regex(/^\/admin\/operations\/(jr|sp)-[1-9][0-9]*$/),
  required_permission: z.literal("read:admin_operations"),
  chat_required_permission: z.literal("read:admin_chat_audit"),
});

const apiConsumerHistoryCommonSchema = z.object({
  id: z.number().int().positive(),
  status: z.string().trim().min(1),
  provider: apiConsumerHistoryProviderSchema,
  occurred_on: z.string().trim().min(1),
  operation: apiConsumerHistoryOperationSchema,
});

const apiConsumerHistoryItemSchema = z.discriminatedUnion("type", [
  apiConsumerHistoryCommonSchema.extend({
    type: z.literal("job_request"),
    status: z.enum(["pending", "accepted"]),
    created_on: z.string().trim().min(1),
  }),
  apiConsumerHistoryCommonSchema.extend({
    type: z.literal("service_proposal"),
    status: z.enum(["pending", "accepted", "rejected"]),
    job_request_id: z.number().int().positive().nullable(),
    created_on: z.string().trim().min(1),
    scheduled_on: z.string().trim().min(1),
    estimated_duration_minutes: z.number().int().positive(),
    booking_payment_deadline: z.string().trim().min(1),
  }),
  apiConsumerHistoryCommonSchema.extend({
    type: z.literal("work_order"),
    status: z.enum(["scheduled", "awaiting_payment", "paid"]),
    job_request_id: z.number().int().positive().nullable(),
    service_proposal_id: z.number().int().positive(),
    accepted_on: z.string().trim().min(1),
    completion_reported_on: z.string().trim().min(1).nullable(),
    balance_paid_on: z.string().trim().min(1).nullable(),
  }),
]);

const apiConsumerHistoryAddressSchema = z.object({
  street: z.string(),
  street_number: z.string(),
  floor: z.string().nullable(),
  unit: z.string().nullable(),
  source: z.literal("current_consumer_profile"),
});

const apiConsumerHistoryZoneSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  enabled: z.boolean(),
  source: z.literal("current_consumer_profile"),
});

export const apiConsumerHistoryResponseSchema = z.object({
  consumer: z.object({
    id: z.number().int().positive(),
    role: z.literal("consumer"),
    name: z.string().trim().min(1),
    surname: z.string().trim().min(1),
    email: z.string().email(),
    profile_photo_url: z.string().nullish(),
    created_on: z.string().trim().min(1),
    address: apiConsumerHistoryAddressSchema.nullable(),
    coverage_zone: apiConsumerHistoryZoneSchema.nullable(),
  }),
  summary: z.object({
    job_requests: z.number().int().nonnegative(),
    service_proposals: z.number().int().nonnegative(),
    work_orders: z.number().int().nonnegative(),
  }),
  page: z.object({
    items: z.array(apiConsumerHistoryItemSchema),
    limit: z.number().int().min(1).max(100),
    next_cursor: z.string().min(1).nullable(),
  }),
}).strict();

export type ApiConsumerHistoryResponse = z.infer<typeof apiConsumerHistoryResponseSchema>;
