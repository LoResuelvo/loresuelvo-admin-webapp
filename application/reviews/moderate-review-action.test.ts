import { describe, expect, it, vi, beforeEach } from "vitest";
import { ReviewError } from "@/domain/reviews/review-error";
import type { ReviewModerationCommand, ReviewModerationResult } from "@/domain/reviews/review-moderation";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: { getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token") },
}));

vi.mock("@/infrastructure/repositories/api-review-repository", () => ({
  apiReviewRepository: { getReviews: vi.fn(), getReviewById: vi.fn(), moderate: vi.fn() },
}));

import { apiReviewRepository } from "@/infrastructure/repositories/api-review-repository";
import { moderateReviewAction } from "@/app/(dashboard)/moderacion/actions";

const result: ReviewModerationResult = {
  id: "101",
  visibility: "hidden",
  version: 4,
  decisionId: 89,
};

describe("moderateReviewAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns the API moderation result and passes the versioned command", async () => {
    const command: ReviewModerationCommand = {
      action: "hide",
      category: "abusive_language",
      expectedVersion: 3,
      reportId: 501,
    };
    vi.mocked(apiReviewRepository.moderate).mockResolvedValue(result);

    await expect(moderateReviewAction("101", command)).resolves.toEqual({ success: true, data: result });
    expect(apiReviewRepository.moderate).toHaveBeenCalledWith("mock-jwt-token", "101", command);
  });

  it("returns validation errors without calling the repository", async () => {
    const command: ReviewModerationCommand = {
      action: "hide",
      expectedVersion: 3,
    };

    await expect(moderateReviewAction("101", command)).resolves.toEqual({
      success: false,
      error: "Infraction category is required when hiding a review",
    });
    expect(apiReviewRepository.moderate).not.toHaveBeenCalled();
  });

  it("surfaces a version conflict as a user-readable error", async () => {
    vi.mocked(apiReviewRepository.moderate).mockRejectedValue(new ReviewError("conflict", "Version conflict"));

    const result = await moderateReviewAction("101", {
      action: "unhide",
      expectedVersion: 4,
    });

    expect(result).toEqual({ success: false, error: expect.stringContaining("cambió") });
  });

  it("marks forbidden moderation as restricted access", async () => {
    vi.mocked(apiReviewRepository.moderate).mockRejectedValue(new ReviewError("forbidden", "Forbidden"));

    const result = await moderateReviewAction("101", {
      action: "unhide",
      expectedVersion: 4,
    });

    expect(result).toMatchObject({ success: false, isForbidden: true });
  });

  it("maps unavailable API errors to the moderation message", async () => {
    vi.mocked(apiReviewRepository.moderate).mockRejectedValue(new ReviewError("unavailable", "Server error"));

    const result = await moderateReviewAction("101", {
      action: "unhide",
      expectedVersion: 4,
    });

    expect(result).toEqual({ success: false, error: "Ocurrió un error al cargar las reseñas para moderación." });
  });
});
