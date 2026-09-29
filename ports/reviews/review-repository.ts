import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";

export interface ReviewRepository {
  getReviews(token: string, status?: ReviewStatus): Promise<ReviewModerationItem[]>;
}
