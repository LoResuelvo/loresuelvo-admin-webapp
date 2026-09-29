import { describe, expect, it, vi, beforeEach } from "vitest";
import { ReviewError } from "@/domain/reviews/review-error";
import type { ReviewModerationItem } from "@/domain/reviews/review-moderation";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

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
  moderation: {
    moderatedBy: "Admin User",
    moderatedAt: "2026-09-29T12:00:00Z",
    category: "abusive_language",
    reason: "Lenguaje ofensivo",
  },
};

vi.mock("@/infrastructure/repositories/api-review-repository", () => ({
  apiReviewRepository: {
    getReviews: vi.fn(),
    moderate: vi.fn(),
  },
}));

import { apiReviewRepository } from "@/infrastructure/repositories/api-review-repository";
import { moderateReviewAction } from "@/app/(dashboard)/moderacion/actions";

describe("moderateReviewAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns updated review on successful hide moderation", async () => {
    vi.mocked(apiReviewRepository.moderate).mockResolvedValue(mockReview);

    const result = await moderateReviewAction(
      "rev-101",
      "hide",
      "abusive_language",
      "Lenguaje ofensivo",
    );

    expect(result).toEqual({
      success: true,
      data: mockReview,
    });
    expect(apiReviewRepository.moderate).toHaveBeenCalledWith(
      "mock-jwt-token",
      "rev-101",
      "hide",
      "abusive_language",
      "Lenguaje ofensivo",
    );
  });

  it("returns updated review on successful unhide moderation", async () => {
    const visibleReview: ReviewModerationItem = {
      ...mockReview,
      status: "visible",
    };
    vi.mocked(apiReviewRepository.moderate).mockResolvedValue(visibleReview);

    const result = await moderateReviewAction("rev-101", "unhide");

    expect(result).toEqual({
      success: true,
      data: visibleReview,
    });
    expect(apiReviewRepository.moderate).toHaveBeenCalledWith(
      "mock-jwt-token",
      "rev-101",
      "unhide",
      undefined,
      undefined,
    );
  });

  it("handles validation error when hiding without category", async () => {
    const result = await moderateReviewAction("rev-101", "hide");

    expect(result).toEqual({
      success: false,
      error: "Infraction category is required when hiding a review",
    });
    expect(apiReviewRepository.moderate).not.toHaveBeenCalled();
  });

  it("handles forbidden error gracefully", async () => {
    vi.mocked(apiReviewRepository.moderate).mockRejectedValue(
      new ReviewError("forbidden", "Forbidden"),
    );

    const result = await moderateReviewAction("rev-101", "unhide");

    expect(result).toEqual({
      success: false,
      error: "Ocurrió un error al cargar las reseñas para moderación.",
      isForbidden: true,
    });
  });

  it("handles unavailable error gracefully", async () => {
    vi.mocked(apiReviewRepository.moderate).mockRejectedValue(
      new ReviewError("unavailable", "Server error"),
    );

    const result = await moderateReviewAction("rev-101", "unhide");

    expect(result).toEqual({
      success: false,
      error: "Ocurrió un error al cargar las reseñas para moderación.",
    });
  });
});
