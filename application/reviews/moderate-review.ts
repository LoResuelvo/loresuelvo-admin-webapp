import type { InfractionCategory, ReviewModerationItem } from "@/domain/reviews/review-moderation";
import type { ReviewRepository } from "@/ports/reviews/review-repository";

export interface ModerateReviewParams {
  token: string;
  id: string;
  action: "hide" | "unhide";
  category?: InfractionCategory;
  reason?: string;
}

export async function moderateReview(
  repository: ReviewRepository,
  params: ModerateReviewParams,
): Promise<ReviewModerationItem> {
  if (!params.id) {
    throw new Error("Review ID is required");
  }
  if (params.action === "hide" && !params.category) {
    throw new Error("Infraction category is required when hiding a review");
  }
  return repository.moderate(
    params.token,
    params.id,
    params.action,
    params.category,
    params.reason,
  );
}
