import type { ReviewListFilter, ReviewModerationItem } from "@/domain/reviews/review-moderation";
import type { ReviewRepository } from "@/ports/reviews/review-repository";

export async function getReviewsForModeration(
  repository: ReviewRepository,
  token: string,
  status?: ReviewListFilter,
): Promise<ReviewModerationItem[]> {
  return repository.getReviews(token, status);
}
