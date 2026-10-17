import { describe, it, expect, vi } from "vitest";
import { moderateReview } from "./moderate-review";
import type { ReviewRepository } from "@/ports/reviews/review-repository";
import type { ReviewModerationResult } from "@/domain/reviews/review-moderation";

const result: ReviewModerationResult = {
  id: "101",
  visibility: "hidden",
  version: 4,
  decisionId: 89,
};

const required = {
  token: "tok-123",
  id: "101",
  reason: "  Lenguaje abusivo comprobado  ",
  expectedVersion: 3,
};

function repository(moderate = vi.fn().mockResolvedValue(result)): ReviewRepository {
  return { getReviews: vi.fn(), getReviewById: vi.fn(), moderate };
}

describe("moderateReview use case", () => {
  it("rejects an empty review id", async () => {
    await expect(moderateReview(repository(), { ...required, id: "", action: "unhide" }))
      .rejects.toThrow("Review ID is required");
  });

  it("requires an infraction category when hiding a review", async () => {
    await expect(moderateReview(repository(), { ...required, action: "hide" }))
      .rejects.toThrow("Infraction category is required when hiding a review");
  });

  it("requires a non-empty reason and a current version", async () => {
    await expect(moderateReview(repository(), { ...required, action: "unhide", reason: "  " }))
      .rejects.toThrow("Moderation reason is required");
    await expect(moderateReview(repository(), { ...required, action: "unhide", expectedVersion: 0 }))
      .rejects.toThrow("Review version is required");
  });

  it("delegates the versioned hide command to the repository", async () => {
    const moderate = vi.fn().mockResolvedValue(result);
    const repo = repository(moderate);

    await expect(moderateReview(repo, {
      ...required,
      action: "hide",
      category: "abusive_language",
    })).resolves.toBe(result);

    expect(moderate).toHaveBeenCalledWith("tok-123", "101", {
      action: "hide",
      category: "abusive_language",
      reason: "Lenguaje abusivo comprobado",
      expectedVersion: 3,
      reportId: undefined,
    });
  });

  it("delegates an unhide command without category or report id", async () => {
    const moderate = vi.fn().mockResolvedValue({ ...result, visibility: "visible" });
    const repo = repository(moderate);

    await moderateReview(repo, { ...required, action: "unhide" });

    expect(moderate).toHaveBeenCalledWith("tok-123", "101", {
      action: "unhide",
      category: undefined,
      reason: "Lenguaje abusivo comprobado",
      expectedVersion: 3,
      reportId: undefined,
    });
  });

  it("propagates repository errors", async () => {
    const repo = repository(vi.fn().mockRejectedValue(new Error("Database failure")));
    await expect(moderateReview(repo, { ...required, action: "unhide" }))
      .rejects.toThrow("Database failure");
  });
});
