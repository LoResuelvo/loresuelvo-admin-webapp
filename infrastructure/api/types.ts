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
