import { expect, it } from "vitest";
import { updateModeratedReviews, type ReviewModerationItem } from "./review-moderation";
const review: ReviewModerationItem = { id: "r1", createdAt: "2026-01-01", operationId: 1, authorName: "Ana", providerName: "Luis", rating: 1, comment: "Comentario", status: "reported" };
it("preserves unrelated rows and removes a result outside the active filter", () => {
 const other = { ...review, id: "r2" };
 expect(updateModeratedReviews([review, other], { ...review, status: "hidden" }, "reported")).toEqual([other]);
 expect(review.status).toBe("reported");
});
it("adds a newly eligible confirmed result without duplicates", () => {
 const hidden = { ...review, status: "hidden" as const };
 expect(updateModeratedReviews([], hidden, "hidden")).toEqual([hidden]);
 expect(updateModeratedReviews([hidden], hidden, "hidden")).toEqual([hidden]);
});
