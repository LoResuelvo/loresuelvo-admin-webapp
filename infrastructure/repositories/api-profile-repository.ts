import "server-only";
import { AccessError } from "@/domain/auth/access-error";
import type { ProfileRepository } from "@/ports/auth/profile-repository";
import { mapProfile } from "./profile-mapper";

export const apiProfileRepository: ProfileRepository = {
  async getProfile(accessToken) {
    const baseUrl = process.env.API_URL;
    if (!baseUrl) throw new AccessError("unavailable");
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/me`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 404) throw new AccessError("notProvisioned");
    if (!response.ok) throw new AccessError(response.status === 401 ? "sessionExpired" : "unavailable");
    return mapProfile(await response.json());
  },
};
