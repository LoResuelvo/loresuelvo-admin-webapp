import { describe, expect, it, vi } from "vitest";
import type { ReviewListFilter, ReviewModerationItem } from "@/domain/reviews/review-moderation";
import type { ReviewRepository } from "@/ports/reviews/review-repository";
import { getReviewsForModeration } from "./get-reviews-for-moderation";

const review: ReviewModerationItem = {
  id: "101", consumerId: 10, providerId: 20, operationId: "work_order-101", rating: 1,
  visibility: "visible", version: 3, pendingReportCount: 1,
  reportedOn: "2026-09-25T14:00:00Z",
};

function repository(getReviews = vi.fn().mockResolvedValue([review])): ReviewRepository {
  return { getReviews, getReviewById: vi.fn(), moderate: vi.fn() };
}

describe("getReviewsForModeration use case", () => {
  it.each<ReviewListFilter | undefined>(["reported", "hidden", "visible", "all", undefined])(
    "delegates the %s filter to ReviewRepository",
    async (status) => {
      const repo = repository();
      await expect(getReviewsForModeration(repo, "test-token", status)).resolves.toEqual([review]);
      expect(repo.getReviews).toHaveBeenCalledWith("test-token", status);
    },
  );

  it("propagates repository errors", async () => {
    const repo = repository(vi.fn().mockRejectedValue(new Error("Network failure")));
    await expect(getReviewsForModeration(repo, "token")).rejects.toThrow("Network failure");
  });
});
