import type {
  ReviewListFilter,
  ReviewModerationCommand,
  ReviewModerationDetail,
  ReviewModerationItem,
  ReviewModerationResult,
} from "@/domain/reviews/review-moderation";

export interface ReviewRepository {
  getReviews(token: string, status?: ReviewListFilter): Promise<ReviewModerationItem[]>;
  getReviewById(token: string, id: string): Promise<ReviewModerationDetail>;
  moderate(
    token: string,
    id: string,
    command: ReviewModerationCommand,
  ): Promise<ReviewModerationResult>;
}

