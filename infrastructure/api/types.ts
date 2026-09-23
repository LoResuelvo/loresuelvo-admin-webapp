import { z } from "zod";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiStub {
  method: HttpMethod;
  endpoint: string;
  status: number;
  body: unknown;
  delayMs?: number;
}

export const apiProfileSchema = z.object({
  id: z.number().int().positive().max(2147483647),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.email(),
  role: z.enum(["admin", "consumer", "provider"]),
  calendar_connection_status: z.enum(["disconnected", "connected", "action_required"]),
  profile_photo: z.object({ original_name: z.string(), url: z.url() }).nullish(),
});

export type ApiProfile = z.infer<typeof apiProfileSchema>;

export const apiCategoryListItemSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
});

export const apiCategoriesListSchema = z.array(apiCategoryListItemSchema);

export type ApiCategoryListItem = z.infer<typeof apiCategoryListItemSchema>;

export const apiCreateCategoryResponseSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  normalized_name: z.string().trim().min(1).optional(),
});

export type ApiCreateCategoryResponse = z.infer<typeof apiCreateCategoryResponseSchema>;

export const apiConsumerListItemSchema = z.object({
  id: z.number().int().positive(),
  role: z.string().optional().default("consumer"),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.string().email(),
  profile_photo_url: z.string().nullish(),
  created_on: z.string().min(1),
});

export const apiConsumersListSchema = z.array(apiConsumerListItemSchema);

export type ApiConsumerListItem = z.infer<typeof apiConsumerListItemSchema>;

export const apiProviderCoverageZoneSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
});

export const apiProviderCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
});

export const apiVerificationStatusSchema = z.enum([
  "approved",
  "in_review",
  "declined",
  "unverified",
]);

export const apiProviderListItemSchema = z.object({
  id: z.number().int().positive(),
  role: z.string().optional().default("provider"),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.string().email(),
  profile_photo_url: z.string().nullish(),
  created_on: z.string().min(1),
  category: apiProviderCategorySchema,
  coverage_zones: z.array(apiProviderCoverageZoneSchema),
  identity_verification_status: apiVerificationStatusSchema,
  identity_verified_on: z.string().nullish(),
});

export const apiProvidersListSchema = z.array(apiProviderListItemSchema);

export type ApiProviderListItem = z.infer<typeof apiProviderListItemSchema>;
export type ApiProvidersList = z.infer<typeof apiProvidersListSchema>;

export const apiOperationPartySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.string().email(),
});

export type ApiOperationParty = z.infer<typeof apiOperationPartySchema>;

export const apiOperationCategorySchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1),
});

export const apiOperationBottleneckSchema = z.enum([
  "pending_proposal_24h",
  "pending_booking_deposit",
  "scheduled_today",
  "delayed_service",
  "pending_final_payment",
  "stalled",
  "none",
]);

export const apiOperationStatusSchema = z.enum([
  "requested",
  "quoted",
  "in_progress",
  "completed",
  "cancelled",
]);

export const apiOperationResponsibleSchema = z.enum([
  "consumer",
  "provider",
  "platform",
  "none",
]);

export const apiOperationItemSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  job_request_id: z.number().int().positive().optional(),
  jobRequestId: z.number().int().positive().optional(),
  service_proposal_id: z.number().int().positive().optional(),
  serviceProposalId: z.number().int().positive().optional(),
  work_order_id: z.number().int().positive().optional(),
  workOrderId: z.number().int().positive().optional(),
  consumer: apiOperationPartySchema,
  provider: apiOperationPartySchema,
  category: apiOperationCategorySchema,
  status: apiOperationStatusSchema,
  bottleneck: apiOperationBottleneckSchema,
  next_action_by: apiOperationResponsibleSchema.optional(),
  nextActionBy: apiOperationResponsibleSchema.optional(),
  created_at: z.string().optional(),
  createdAt: z.string().optional(),
  updated_at: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type ApiOperationItem = z.infer<typeof apiOperationItemSchema>;

export const apiOperationsResponseSchema = z.union([
  z.array(apiOperationItemSchema),
  z.object({ operations: z.array(apiOperationItemSchema) }),
  z.object({ items: z.array(apiOperationItemSchema) }),
]);

export type ApiOperationsResponse = z.infer<typeof apiOperationsResponseSchema>;
