import { z } from "zod";
import type { Profile } from "@/domain/auth/admin-profile";
import { AccessError } from "@/domain/auth/access-error";
import type { ApiProfile } from "@/infrastructure/api/types";

const profileSchema = z.object({
  id: z.number().int().positive().max(2147483647),
  name: z.string().trim().min(1),
  surname: z.string().trim().min(1),
  email: z.email(),
  role: z.enum(["admin", "consumer", "provider"]),
});

export function mapProfile(value: unknown): Profile {
  const parsed = profileSchema.safeParse(value);
  if (!parsed.success) throw new AccessError("unavailable");
  const profile: Pick<ApiProfile, "id" | "name" | "surname" | "email" | "role"> = parsed.data;
  return { id: profile.id, firstName: profile.name, lastName: profile.surname, email: profile.email, role: profile.role };
}
