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

export * from "./categories-types";


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

export * from "./operations-types";
export * from "./payments-types";


