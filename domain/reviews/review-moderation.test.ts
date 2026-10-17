import { expect, it } from "vitest";
import {
  applyModerationResult,
  matchesReviewFilter,
  updateModeratedReviews,
  type ReviewModerationItem,
} from "./review-moderation";

const review: ReviewModerationItem = {
  id: "101",
  consumerId: 10,
  providerId: 20,
  operationId: "operation-101",
  rating: 1,
  visibility: "visible",
  version: 3,
  pendingReportCount: 1,
  reportedOn: "2026-09-25T14:00:00Z",
};

it("matches the API filters independently by visibility and pending reports", () => {
  expect(matchesReviewFilter(review, "visible")).toBe(true);
  expect(matchesReviewFilter(review, "reported")).toBe(true);
  expect(matchesReviewFilter(review, "hidden")).toBe(false);
  expect(matchesReviewFilter({ ...review, visibility: "hidden" }, "reported")).toBe(true);
  expect(matchesReviewFilter({ ...review, visibility: "hidden" }, "hidden")).toBe(true);
  expect(matchesReviewFilter({ ...review, pendingReportCount: 0 }, "reported")).toBe(false);
  expect(matchesReviewFilter(review, "all")).toBe(true);
  expect(matchesReviewFilter(review)).toBe(true);
});

it("applies a confirmed hide while preserving independent list fields", () => {
  expect(applyModerationResult(review, {
    id: "101",
    visibility: "hidden",
    version: 4,
    decisionId: 89,
  })).toEqual({ ...review, visibility: "hidden", version: 4, pendingReportCount: 0 });
});

it("updates a confirmed row and retains membership in the API filter", () => {
  const other = { ...review, id: "102", pendingReportCount: 0 };
  const hidden = applyModerationResult(review, {
    id: "101", visibility: "hidden", version: 4, decisionId: 89,
  });
  expect(updateModeratedReviews([review, other], hidden, "reported")).toEqual([]);
  expect(review.visibility).toBe("visible");
  expect(review.pendingReportCount).toBe(1);
});

it("adds a newly eligible confirmed result without duplicates", () => {
  const hidden = { ...review, visibility: "hidden" as const, pendingReportCount: 0 };
  expect(updateModeratedReviews([], hidden, "hidden")).toEqual([hidden]);
  expect(updateModeratedReviews([hidden], hidden, "hidden")).toEqual([hidden]);
});
