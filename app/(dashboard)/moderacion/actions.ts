"use server";

import type {
  InfractionCategory,
  ReviewModerationItem,
  ReviewStatus,
} from "@/domain/reviews/review-moderation";
import { ReviewError } from "@/domain/reviews/review-error";
import { getReviewsForModeration } from "@/application/reviews/get-reviews-for-moderation";
import { moderateReview } from "@/application/reviews/moderate-review";
import { apiReviewRepository } from "@/infrastructure/repositories/api-review-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetReviewsResult =
  | { success: true; data: ReviewModerationItem[] }
  | { success: false; error: string; isForbidden?: boolean };

export type ModerateReviewResult =
  | { success: true; data: ReviewModerationItem }
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

function handleReviewError(error: unknown, defaultMessage: string): { success: false; error: string; isForbidden?: boolean } {
  if (error instanceof ReviewError) {
    if (error.code === "forbidden") {
      return {
        success: false,
        error: defaultMessage,
        isForbidden: true,
      };
    }
    return {
      success: false,
      error: defaultMessage,
    };
  }
  const message = error instanceof Error ? error.message : defaultMessage;
  return { success: false, error: message };
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
    return handleReviewError(error, copy.error);
  }
}

export async function moderateReviewAction(
  id: string,
  action: "hide" | "unhide",
  category?: InfractionCategory,
  reason?: string,
): Promise<ModerateReviewResult> {
  const copy = translations.moderation;
  try {
    const token = await resolveAuthToken();
    const review = await moderateReview(apiReviewRepository, {
      token,
      id,
      action,
      category,
      reason,
    });
    return { success: true, data: review };
  } catch (error: unknown) {
    return handleReviewError(error, copy.error);
  }
}
