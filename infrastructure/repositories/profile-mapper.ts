import type { Profile } from "@/domain/auth/admin-profile";
import { AccessError } from "@/domain/auth/access-error";
import { apiProfileSchema } from "@/infrastructure/api/types";

export function mapProfile(value: unknown): Profile {
  const parsed = apiProfileSchema.safeParse(value);
  if (!parsed.success) throw new AccessError("unavailable");
  const profile = parsed.data;
  return { id: profile.id, firstName: profile.name, lastName: profile.surname, email: profile.email, role: profile.role };
}
