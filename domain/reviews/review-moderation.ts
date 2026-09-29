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
