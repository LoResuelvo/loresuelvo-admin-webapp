export type ReviewStatus = "visible" | "hidden";
export type ReviewListFilter = ReviewStatus | "reported" | "all";
export type InfractionCategory = "abusive_language" | "personal_data" | "spam_advertising" | "unrelated_content";

export type ReviewModerationItem = Readonly<{
  id: string;
  consumerId: number;
  consumerName?: string;
  providerId: number;
  providerName?: string;
  operationId: string;
  rating: number;
  visibility: "visible" | "hidden";
  version: number;
  pendingReportCount: number;
  reportedOn: string | null;
}>;

export type ReviewReport = Readonly<{
  id: number;
  category: string;
  explanation: string;
  status: string;
  createdOn: string;
}>;

export type ReviewDecision = Readonly<{
  id: number;
  operatorId: number;
  action: string;
  category: string | null;
  reason: string;
  reportId: number | null;
  previousHideId: number | null;
  createdOn: string;
}>;

export type ReviewModerationDetail = Readonly<{
  review: ReviewModerationItem;
  description: string;
  report: ReviewReport | null;
  decisions: Readonly<{
    items: ReviewDecision[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  }>;
}>;

export type ReviewModerationCommand = Readonly<{
  action: "hide" | "unhide";
  expectedVersion: number;
  category?: InfractionCategory;
  reportId?: number;
}>;

export type ReviewModerationResult = Readonly<{
  id: string;
  visibility: "visible" | "hidden";
  version: number;
  decisionId: number;
}>;

export function matchesReviewFilter(
  review: Pick<ReviewModerationItem, "visibility" | "pendingReportCount">,
  filter?: ReviewListFilter,
): boolean {
  if (!filter || filter === "all") return true;
  if (filter === "reported") return review.pendingReportCount > 0;
  return review.visibility === filter;
}

export function applyModerationResult(
  review: ReviewModerationItem,
  result: ReviewModerationResult,
): ReviewModerationItem {
  return {
    ...review,
    visibility: result.visibility,
    version: result.version,
    // A successful hide upholds the pending report supplied with the command.
    pendingReportCount: result.visibility === "hidden" ? 0 : review.pendingReportCount,
  };
}

/** Apply a confirmed moderation result and retain only the active filter's members. */
export function updateModeratedReviews(
  reviews: readonly ReviewModerationItem[],
  updated: ReviewModerationItem,
  filter?: ReviewListFilter,
): ReviewModerationItem[] {
  const next = reviews.some((review) => review.id === updated.id)
    ? reviews.map((review) => review.id === updated.id ? updated : review)
    : [...reviews, updated];
  return next.filter((review) => matchesReviewFilter(review, filter));
}
