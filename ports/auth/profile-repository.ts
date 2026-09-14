import type { Profile } from "@/domain/auth/admin-profile";

export interface ProfileRepository {
  getProfile(accessToken: string): Promise<Profile>;
}
