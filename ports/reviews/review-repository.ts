import type {
  InfractionCategory,
  ReviewModerationItem,
  ReviewStatus,
} from "@/domain/reviews/review-moderation";

export interface ReviewRepository {
  getReviews(token: string, status?: ReviewStatus): Promise<ReviewModerationItem[]>;
  moderate(
    token: string,
    id: string,
    action: "hide" | "unhide",
    category?: InfractionCategory,
    reason?: string,
  ): Promise<ReviewModerationItem>;
}

