import type { ReviewModerationDetail } from "@/domain/reviews/review-moderation";
import type { ReviewRepository } from "@/ports/reviews/review-repository";

export async function getReviewDetail(
  repository: ReviewRepository,
  token: string,
  id: string,
): Promise<ReviewModerationDetail> {
  return repository.getReviewById(token, id);
}
