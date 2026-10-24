import type {
  ReviewModerationDetail,
  ReviewModerationItem,
  ReviewModerationResult,
} from "@/domain/reviews/review-moderation";
import {
  apiReviewDetailSchema,
  apiReviewModerationResultSchema,
  apiReviewSummarySchema,
  apiReviewsPageSchema,
} from "@/infrastructure/api/types";

function normalizeName(name: string | undefined): string | undefined {
  const trimmedName = name?.trim();
  return trimmedName || undefined;
}

export function mapReviewModerationItem(raw: unknown): ReviewModerationItem {
  const parsed = apiReviewSummarySchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid review summary data");
  }
  const review = parsed.data;
  return {
    id: String(review.work_order_id),
    consumerId: review.consumer_id,
    consumerName: normalizeName(review.consumer_name),
    providerId: review.provider_id,
    providerName: normalizeName(review.provider_name),
    operationId: review.operation_id,
    rating: review.rating,
    visibility: review.visibility,
    version: review.version,
    pendingReportCount: review.pending_report_count,
    reportedOn: review.reported_on,
  };
}

export function mapReviewsList(raw: unknown): ReviewModerationItem[] {
  const parsed = apiReviewsPageSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid reviews page data");
  }
  return parsed.data.items.map(mapReviewModerationItem);
}

export function mapReviewModerationDetail(raw: unknown): ReviewModerationDetail {
  const parsed = apiReviewDetailSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid review detail data");
  }
  const data = parsed.data;
  return {
    review: mapReviewModerationItem(data.review),
    description: data.description,
    report: data.report ? {
      id: data.report.id,
      category: data.report.category,
      explanation: data.report.explanation,
      status: data.report.status,
      createdOn: data.report.created_on,
    } : null,
    decisions: {
      items: data.decisions.items.map((decision) => ({
        id: decision.id,
        operatorId: decision.operator_id,
        action: decision.action,
        category: decision.category,
        reason: decision.reason,
        reportId: decision.report_id,
        previousHideId: decision.previous_hide_id,
        createdOn: decision.created_on,
      })),
      page: data.decisions.page,
      limit: data.decisions.limit,
      total: data.decisions.total,
      hasMore: data.decisions.has_more,
    },
  };
}

export function mapReviewModerationResult(raw: unknown): ReviewModerationResult {
  const parsed = apiReviewModerationResultSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid review moderation result");
  }
  return {
    id: String(parsed.data.work_order_id),
    visibility: parsed.data.visibility,
    version: parsed.data.version,
    decisionId: parsed.data.decision_id,
  };
}
