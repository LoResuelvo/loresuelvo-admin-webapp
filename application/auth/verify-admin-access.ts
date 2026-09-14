import { isAdministrator, type AdminProfile } from "@/domain/auth/admin-profile";
import { AccessError } from "@/domain/auth/access-error";
import type { AuthSession } from "@/ports/auth/auth-session";
import type { ProfileRepository } from "@/ports/auth/profile-repository";

export async function verifyAdminAccess(session: AuthSession, profiles: ProfileRepository): Promise<AdminProfile> {
  const accessToken = await session.getAccessToken();
  const profile = await profiles.getProfile(accessToken);
  if (!isAdministrator(profile)) throw new AccessError("forbidden");
  return profile;
}
