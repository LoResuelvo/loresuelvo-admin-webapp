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
