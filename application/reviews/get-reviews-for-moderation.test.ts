import { describe, expect, it, vi } from "vitest";
import type { ReviewModerationItem } from "@/domain/reviews/review-moderation";
import type { ReviewRepository } from "@/ports/reviews/review-repository";
import { getReviewsForModeration } from "./get-reviews-for-moderation";

describe("getReviewsForModeration use case", () => {
  const mockReview: ReviewModerationItem = {
    id: "rev-101",
    createdAt: "2026-09-25T14:00:00Z",
    operationId: 101,
    authorName: "Lucía Fernández",
    providerName: "Roberto Gómez",
    rating: 1,
    comment: "El trabajo fue pésimo.",
    status: "reported",
    reportReason: "Lenguaje agraviante",
    moderation: null,
  };

  it("delegates to ReviewRepository with token and status", async () => {
    const repository: ReviewRepository = {
      getReviews: vi.fn().mockResolvedValue([mockReview]),
      moderate: vi.fn(),
    };

    const result = await getReviewsForModeration(repository, "test-token", "reported");

    expect(repository.getReviews).toHaveBeenCalledWith("test-token", "reported");
    expect(result).toEqual([mockReview]);
  });

  it("propagates repository errors", async () => {
    const repository: ReviewRepository = {
      getReviews: vi.fn().mockRejectedValue(new Error("Network failure")),
      moderate: vi.fn(),
    };

    await expect(getReviewsForModeration(repository, "token")).rejects.toThrow("Network failure");
  });
});
