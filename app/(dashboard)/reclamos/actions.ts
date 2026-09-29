"use server";

import type {
  Claim,
  ClaimDetails,
  ClaimFilters,
  ClaimResolution,
  ResolutionInput,
} from "@/domain/claims/claim";
import { ClaimError } from "@/domain/claims/claim-error";
import { getClaims } from "@/application/claims/get-claims";
import { getClaimDetails } from "@/application/claims/get-claim-details";
import { resolveClaim } from "@/application/claims/resolve-claim";
import { apiClaimRepository } from "@/infrastructure/repositories/api-claim-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetClaimsResult =
  | { success: true; data: Claim[] }
  | { success: false; error: string; isForbidden?: boolean };

export type GetClaimDetailsResult =
  | { success: true; data: ClaimDetails }
  | { success: false; error: string; isForbidden?: boolean; isNotFound?: boolean };

export type ResolveClaimResult =
  | { success: true; data: ClaimResolution }
  | { success: false; error: string; isForbidden?: boolean; isNotFound?: boolean };

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

export async function getClaimDetailsAction(
  id: string,
): Promise<GetClaimDetailsResult> {
  const copy = translations.claims;
  try {
    const token = await resolveAuthToken();
    const claim = await getClaimDetails(apiClaimRepository, token, id);
    return { success: true, data: claim };
  } catch (error: unknown) {
    if (error instanceof ClaimError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: copy.forbidden,
          isForbidden: true,
        };
      }
      if (error.code === "notFound") {
        return {
          success: false,
          error: copy.detail.notFound,
          isNotFound: true,
        };
      }
      return {
        success: false,
        error: copy.detail.error,
      };
    }
    const message = error instanceof Error ? error.message : copy.detail.error;
    return { success: false, error: message };
  }
}

export async function resolveClaimAction(
  id: string,
  data: ResolutionInput,
): Promise<ResolveClaimResult> {
  const copy = translations.claims;
  try {
    const token = await resolveAuthToken();
    const resolution = await resolveClaim(apiClaimRepository, token, id, data);
    return { success: true, data: resolution };
  } catch (error: unknown) {
    if (error instanceof ClaimError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: copy.forbidden,
          isForbidden: true,
        };
      }
      if (error.code === "notFound") {
        return {
          success: false,
          error: copy.detail.notFound,
          isNotFound: true,
        };
      }
      return {
        success: false,
        error: copy.detail.error,
      };
    }
    const message = error instanceof Error ? error.message : copy.detail.error;
    return { success: false, error: message };
  }
}
