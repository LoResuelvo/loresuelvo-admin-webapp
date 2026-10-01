export type ReviewStatus = "visible" | "hidden" | "reported";
export type InfractionCategory = "abusive_language" | "personal_data" | "spam" | "off_topic";

export type ModerationAudit = Readonly<{
  moderatedBy: string;
  moderatedAt: string;
  category: InfractionCategory;
  reason: string;
}>;

export type ReviewModerationItem = Readonly<{
  id: string;
  createdAt: string;
  operationId: number;
  authorName: string;
  providerName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  reportReason?: string | null;
  moderation?: ModerationAudit | null;
}>;

/** Apply a confirmed moderation result and retain only the active filter's members. */
export function updateModeratedReviews(
  reviews: readonly ReviewModerationItem[],
  updated: ReviewModerationItem,
  status?: ReviewStatus,
): ReviewModerationItem[] {
  const next = reviews.some((review) => review.id === updated.id)
    ? reviews.map((review) => review.id === updated.id ? updated : review)
    : [...reviews, updated];
  return next.filter((review) => !status || review.status === status);
}
