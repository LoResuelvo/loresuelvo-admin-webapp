"use server";

import type { Claim, ClaimFilters } from "@/domain/claims/claim";
import { ClaimError } from "@/domain/claims/claim-error";
import { getClaims } from "@/application/claims/get-claims";
import { apiClaimRepository } from "@/infrastructure/repositories/api-claim-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetClaimsResult =
  | { success: true; data: Claim[] }
  | { success: false; error: string; isForbidden?: boolean };

async function resolveAuthToken(): Promise<string> {
  try {
    return await authSession.getAccessToken();
  } catch {
    if (process.env.APP_ENV === "production") {
      throw new Error("unauthenticated");
    }
    return "mock-token";
  }
}

export async function getClaimsAction(
  filters?: ClaimFilters,
): Promise<GetClaimsResult> {
  try {
    const token = await resolveAuthToken();
    const claims = await getClaims(apiClaimRepository, token, filters);
    return { success: true, data: claims };
  } catch (error: unknown) {
    if (error instanceof ClaimError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: translations.claims.forbidden,
          isForbidden: true,
        };
      }
      return {
        success: false,
        error: translations.claims.error,
      };
    }
    const message = error instanceof Error ? error.message : translations.claims.error;
    return { success: false, error: message };
  }
}
