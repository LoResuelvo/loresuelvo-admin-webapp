import type {
  ReviewModerationItem,
  ModerationAudit,
} from "@/domain/reviews/review-moderation";
import {
  apiReviewModerationItemSchema,
  type ApiReviewModerationItem,
} from "@/infrastructure/api/types";

export function mapReviewModerationItem(raw: unknown): ReviewModerationItem {
  const parsed: ApiReviewModerationItem = apiReviewModerationItemSchema.parse(raw);
  let moderation: ModerationAudit | null = null;
  if (parsed.moderation) {
    moderation = {
      moderatedBy: parsed.moderation.moderated_by,
      moderatedAt: parsed.moderation.moderated_at,
      category: parsed.moderation.category,
      reason: parsed.moderation.reason,
    };
  }
  return {
    id: parsed.id,
    createdAt: parsed.created_at,
    operationId: parsed.operation_id,
    authorName: parsed.author_name,
    providerName: parsed.provider_name,
    rating: parsed.rating,
    comment: parsed.comment,
    status: parsed.status,
    reportReason: parsed.report_reason ?? null,
    moderation,
  };
}

export function mapReviewsList(raw: unknown): ReviewModerationItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("Invalid reviews list payload: expected an array");
  }
  return raw.map(mapReviewModerationItem);
}
