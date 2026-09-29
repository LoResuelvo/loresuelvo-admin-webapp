import { describe, expect, it, vi, beforeEach } from "vitest";
import { ReviewError } from "@/domain/reviews/review-error";
import type { ReviewModerationItem } from "@/domain/reviews/review-moderation";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

const mockReviewsList: ReviewModerationItem[] = [
  {
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
  },
];

vi.mock("@/infrastructure/repositories/api-review-repository", () => ({
  apiReviewRepository: {
    getReviews: vi.fn(),
  },
}));

import { apiReviewRepository } from "@/infrastructure/repositories/api-review-repository";
import { getReviewsAction } from "@/app/(dashboard)/moderacion/actions";

describe("getReviewsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns reviews on successful repository call", async () => {
    vi.mocked(apiReviewRepository.getReviews).mockResolvedValue(mockReviewsList);

    const result = await getReviewsAction("reported");

    expect(result).toEqual({
      success: true,
      data: mockReviewsList,
    });
    expect(apiReviewRepository.getReviews).toHaveBeenCalledWith("mock-jwt-token", "reported");
  });

  it("handles forbidden error gracefully", async () => {
    vi.mocked(apiReviewRepository.getReviews).mockRejectedValue(
      new ReviewError("forbidden", "Forbidden"),
    );

    const result = await getReviewsAction();

    expect(result).toEqual({
      success: false,
      error: "Ocurrió un error al cargar las reseñas para moderación.",
      isForbidden: true,
    });
  });

  it("handles unavailable error gracefully", async () => {
    vi.mocked(apiReviewRepository.getReviews).mockRejectedValue(
      new ReviewError("unavailable", "Server error"),
    );

    const result = await getReviewsAction();

    expect(result).toEqual({
      success: false,
      error: "Ocurrió un error al cargar las reseñas para moderación.",
    });
  });
});
