import { z } from "zod";

const diagnosticProviderSchema = z.object({
  id: z.number().int().positive(), name: z.string(), surname: z.string(), email: z.email(),
  profile_photo_url: z.string().nullish(),
  category: z.object({ id: z.number().int().positive(), name: z.string() }),
  coverage_zones: z.array(z.object({ id: z.number().int().positive(), name: z.string(), enabled: z.boolean() })),
  identity_verification_status: z.string(), identity_verified_on: z.string().nullable(),
});

export const apiProviderDiagnosticResponseSchema = z.object({
  provider: diagnosticProviderSchema,
  checks: z.array(z.object({ control: z.string(), result: z.enum(["pass", "warning", "unknown"]), reason_code: z.string(), evidence_on: z.string().nullable() })),
  payment: z.object({ state: z.enum(["connected", "disconnected"]), token_expires_on: z.string().nullable() }),
  calendar: z.object({ calendar_connection_status: z.string(), order_sync: z.array(z.object({ work_order_id: z.number().int().positive(), synced_on: z.string().nullable() })) }),
  activity: z.array(z.object({ type: z.enum(["job_request", "service_proposal", "work_order"]), id: z.number().int().positive(), status: z.string(), occurred_on: z.string() })),
  reviews: z.array(z.object({ work_order_id: z.number().int().positive(), rating: z.number(), description: z.string() })),
  reputation: z.object({ count: z.number().int().nonnegative(), average: z.number().nonnegative() }),
  navigation: z.object({ operations_url: z.string(), required_permission: z.literal("read:admin_operations") }),
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
