import { describe, it, expect, vi } from "vitest";
import { moderateReview } from "./moderate-review";
import type { ReviewRepository } from "@/ports/reviews/review-repository";
import type { ReviewModerationItem } from "@/domain/reviews/review-moderation";

const mockReview: ReviewModerationItem = {
  id: "rev-101",
  createdAt: "2026-09-25T14:00:00Z",
  operationId: 101,
  authorName: "Lucía Fernández",
  providerName: "Roberto Gómez",
  rating: 1,
  comment: "El trabajo fue pésimo.",
  status: "hidden",
  reportReason: "Lenguaje agraviante",
  moderation: null,
};

describe("moderateReview use case", () => {
  it("throws error when review id is missing", async () => {
    const mockRepo: ReviewRepository = {
      getReviews: vi.fn(),
      moderate: vi.fn(),
    };

    await expect(
      moderateReview(mockRepo, {
        token: "tok",
        id: "",
        action: "hide",
        category: "abusive_language",
      }),
    ).rejects.toThrow("Review ID is required");
  });

  it("throws error when hiding without an infraction category", async () => {
    const mockRepo: ReviewRepository = {
      getReviews: vi.fn(),
      moderate: vi.fn(),
    };

    await expect(
      moderateReview(mockRepo, {
        token: "tok",
        id: "rev-101",
        action: "hide",
      }),
    ).rejects.toThrow("Infraction category is required when hiding a review");
  });

  it("delegates to repository with hide action and valid fields", async () => {
    const mockRepo: ReviewRepository = {
      getReviews: vi.fn(),
      moderate: vi.fn().mockResolvedValue(mockReview),
    };

    const result = await moderateReview(mockRepo, {
      token: "tok-123",
      id: "rev-101",
      action: "hide",
      category: "abusive_language",
      reason: "Lenguaje abusivo comprobado",
    });

    expect(mockRepo.moderate).toHaveBeenCalledWith(
      "tok-123",
      "rev-101",
      "hide",
      "abusive_language",
      "Lenguaje abusivo comprobado",
    );
    expect(result).toBe(mockReview);
  });

  it("delegates to repository with unhide action without requiring category", async () => {
    const unhiddenReview: ReviewModerationItem = {
      ...mockReview,
      status: "visible",
    };
    const mockRepo: ReviewRepository = {
      getReviews: vi.fn(),
      moderate: vi.fn().mockResolvedValue(unhiddenReview),
    };

    const result = await moderateReview(mockRepo, {
      token: "tok-123",
      id: "rev-101",
      action: "unhide",
    });

    expect(mockRepo.moderate).toHaveBeenCalledWith(
      "tok-123",
      "rev-101",
      "unhide",
      undefined,
      undefined,
    );
    expect(result.status).toBe("visible");
  });

  it("propagates repository errors", async () => {
    const mockRepo: ReviewRepository = {
      getReviews: vi.fn(),
      moderate: vi.fn().mockRejectedValue(new Error("Database failure")),
    };

    await expect(
      moderateReview(mockRepo, {
        token: "tok-123",
        id: "rev-101",
        action: "unhide",
      }),
    ).rejects.toThrow("Database failure");
  });
});
