import type { AdminAccess } from "@/domain/auth/admin-access";
import { isAdministrator } from "@/domain/auth/admin-profile";
import { ROUTES } from "@/lib/routes";
import { z } from "zod";

const identitySchema = z.object({ id: z.number().int().positive(), firstName: z.string(), lastName: z.string(), email: z.email(), role: z.literal("admin") });
const authenticationSchema = z.object({ status: z.enum(["unauthenticated", "sessionExpired"]) });
const accessSchema = z.object({ status: z.literal("ready"), profile: identitySchema });

export async function queryAdminAccess(signal: AbortSignal): Promise<AdminAccess> {
  const response = await fetch(ROUTES.adminAccess, { cache: "no-store", credentials: "same-origin", signal });
  if (response.status === 401) {
    const result = authenticationSchema.safeParse(await response.json());
    return result.success ? result.data : { status: "unavailable" };
  }
  if (response.status === 404) {
    const result = z.object({ status: z.literal("notProvisioned") }).safeParse(await response.json());
    return result.success ? result.data : { status: "unavailable" };
  }
  if (response.status === 403) {
    const result = z.object({ status: z.literal("forbidden") }).safeParse(await response.json());
    return result.success ? result.data : { status: "unavailable" };
  }
  if (!response.ok) return { status: "unavailable" };
  const result = accessSchema.safeParse(await response.json());
  if (!result.success || !isAdministrator(result.data.profile)) return { status: "unavailable" };
  return result.data;
}
