import type {
  InfractionCategory,
  ReviewModerationCommand,
  ReviewModerationResult,
} from "@/domain/reviews/review-moderation";
import type { ReviewRepository } from "@/ports/reviews/review-repository";

export interface ModerateReviewParams {
  token: string;
  id: string;
  action: ReviewModerationCommand["action"];
  category?: InfractionCategory;
  expectedVersion: number;
  reportId?: number;
}

export async function moderateReview(
  repository: ReviewRepository,
  params: ModerateReviewParams,
): Promise<ReviewModerationResult> {
  if (!params.id) {
    throw new Error("Review ID is required");
  }
  if (params.action === "hide" && !params.category) {
    throw new Error("Infraction category is required when hiding a review");
  }
  if (params.expectedVersion <= 0) {
    throw new Error("Review version is required");
  }
  return repository.moderate(params.token, params.id, {
    action: params.action,
    category: params.category,
    expectedVersion: params.expectedVersion,
    reportId: params.reportId,
  });
}
