"use server";

import type {
  ReviewListFilter,
  ReviewModerationCommand,
  ReviewModerationDetail,
  ReviewModerationItem,
  ReviewModerationResult,
} from "@/domain/reviews/review-moderation";
import { ReviewError } from "@/domain/reviews/review-error";
import { getReviewsForModeration } from "@/application/reviews/get-reviews-for-moderation";
import { moderateReview } from "@/application/reviews/moderate-review";
import { getReviewDetail } from "@/application/reviews/get-review-detail";
import { apiReviewRepository } from "@/infrastructure/repositories/api-review-repository";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

export type GetReviewsResult =
  | { success: true; data: ReviewModerationItem[] }
  | { success: false; error: string; isForbidden?: boolean };

export type ModerateReviewResult =
  | { success: true; data: ReviewModerationResult }
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
    if (error.code === "conflict") {
      return { success: false, error: translations.moderation.conflict };
    }
    if (error.code === "invalid") {
      return { success: false, error: translations.moderation.invalidModeration };
    }
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
  status?: ReviewListFilter,
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

export type GetReviewDetailResult =
  | { success: true; data: ReviewModerationDetail }
  | { success: false; error: string; isForbidden?: boolean; isNotFound?: boolean };

export async function getReviewDetailAction(id: string): Promise<GetReviewDetailResult> {
  const copy = translations.moderation;
  try {
    const token = await resolveAuthToken();
    const detail = await getReviewDetail(apiReviewRepository, token, id);
    return { success: true, data: detail };
  } catch (error: unknown) {
    if (error instanceof ReviewError) {
      if (error.code === "forbidden") return { success: false, error: copy.forbidden, isForbidden: true };
      if (error.code === "notFound") return { success: false, error: copy.detail.notFound, isNotFound: true };
      return { success: false, error: copy.error };
    }
    return { success: false, error: error instanceof Error ? error.message : copy.error };
  }
}

export async function moderateReviewAction(
  id: string,
  command: ReviewModerationCommand,
): Promise<ModerateReviewResult> {
  const copy = translations.moderation;
  try {
    const token = await resolveAuthToken();
    const review = await moderateReview(apiReviewRepository, {
      token,
      id,
      ...command,
    });
    return { success: true, data: review };
  } catch (error: unknown) {
    return handleReviewError(error, copy.error);
  }
}
