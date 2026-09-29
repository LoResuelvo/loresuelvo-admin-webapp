"use server";

import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";
import { ReviewError } from "@/domain/reviews/review-error";
import { getReviewsForModeration } from "@/application/reviews/get-reviews-for-moderation";
import { apiReviewRepository } from "@/infrastructure/repositories/api-review-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetReviewsResult =
  | { success: true; data: ReviewModerationItem[] }
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

export async function getReviewsAction(
  status?: ReviewStatus,
): Promise<GetReviewsResult> {
  const copy = translations.moderation;
  try {
    const token = await resolveAuthToken();
    const reviews = await getReviewsForModeration(apiReviewRepository, token, status);
    return { success: true, data: reviews };
  } catch (error: unknown) {
    if (error instanceof ReviewError) {
      if (error.code === "forbidden") {
        return {
          success: false,
          error: copy.error,
          isForbidden: true,
        };
      }
      return {
        success: false,
        error: copy.error,
      };
    }
    const message = error instanceof Error ? error.message : copy.error;
    return { success: false, error: message };
  }
}
