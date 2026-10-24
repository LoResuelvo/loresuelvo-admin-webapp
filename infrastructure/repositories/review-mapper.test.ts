import { describe, expect, it } from "vitest";
import {
  mapReviewModerationDetail,
  mapReviewModerationItem,
  mapReviewModerationResult,
  mapReviewsList,
} from "./review-mapper";

const summaryDto = {
  work_order_id: 101,
  consumer_id: 10,
  consumer_name: "Ana Pérez",
  provider_id: 20,
  provider_name: "José García",
  operation_id: "work_order-101",
  rating: 1,
  visibility: "visible",
  version: 3,
  pending_report_count: 1,
  reported_on: "2026-09-25T14:00:00Z",
};

describe("review-mapper", () => {
  it("maps actual API summary identifiers and independent visibility/report fields", () => {
    expect(mapReviewModerationItem(summaryDto)).toEqual({
      id: "101",
      consumerId: 10,
      consumerName: "Ana Pérez",
      providerId: 20,
      providerName: "José García",
      operationId: "work_order-101",
      rating: 1,
      visibility: "visible",
      version: 3,
      pendingReportCount: 1,
      reportedOn: "2026-09-25T14:00:00Z",
    });
  });

  it("preserves pending reports on a hidden review", () => {
    const hidden = mapReviewModerationItem({ ...summaryDto, visibility: "hidden" });
    expect(hidden.visibility).toBe("hidden");
    expect(hidden.pendingReportCount).toBe(1);
  });

  it("accepts legacy summaries and normalizes blank names", () => {
    const legacySummaryDto = {
      work_order_id: summaryDto.work_order_id,
      consumer_id: summaryDto.consumer_id,
      provider_id: summaryDto.provider_id,
      operation_id: summaryDto.operation_id,
      rating: summaryDto.rating,
      visibility: summaryDto.visibility,
      version: summaryDto.version,
      pending_report_count: summaryDto.pending_report_count,
      reported_on: summaryDto.reported_on,
    };

    expect(mapReviewModerationItem(legacySummaryDto)).toMatchObject({
      consumerId: 10,
      consumerName: undefined,
      providerId: 20,
      providerName: undefined,
    });
    expect(mapReviewModerationItem({ ...summaryDto, consumer_name: "  ", provider_name: "\t" })).toMatchObject({
      consumerName: undefined,
      providerName: undefined,
    });
  });

  it("maps paginated list payloads", () => {
    expect(mapReviewsList({ items: [summaryDto], page: 1, limit: 20, total: 1 })).toMatchObject([{
      consumerName: "Ana Pérez",
      providerName: "José García",
    }]);
  });

  it("maps detail report and moderation history", () => {
    const detail = mapReviewModerationDetail({
      review: summaryDto,
      description: "Comentario visible en el detalle.",
      report: {
        id: 501,
        category: "abusive_language",
        explanation: "Reporte recibido",
        status: "pending",
        created_on: "2026-09-25T14:00:00Z",
      },
      decisions: {
        items: [{
          id: 88,
          work_order_id: 101,
          operator_id: 4,
          action: "hide",
          category: "abusive_language",
          reason: "Motivo de la decisión",
          report_id: 501,
          previous_hide_id: null,
          created_on: "2026-09-26T14:00:00Z",
        }],
        page: 1,
        limit: 20,
        total: 1,
        has_more: false,
      },
    });

    expect(detail.review.id).toBe("101");
    expect(detail.review).toMatchObject({ consumerName: "Ana Pérez", providerName: "José García" });
    expect(detail.description).toBe("Comentario visible en el detalle.");
    expect(detail.report?.explanation).toBe("Reporte recibido");
    expect(detail.decisions.items[0]).toMatchObject({ operatorId: 4, reportId: 501, reason: "Motivo de la decisión" });
  });

  it("maps moderation results independently from list DTOs", () => {
    expect(mapReviewModerationResult({
      work_order_id: 101,
      visibility: "hidden",
      version: 4,
      decision_id: 89,
    })).toEqual({ id: "101", visibility: "hidden", version: 4, decisionId: 89 });
  });

  it("rejects unpaginated or structurally invalid API payloads", () => {
    expect(() => mapReviewsList([summaryDto])).toThrow("Invalid reviews page data");
    expect(() => mapReviewModerationItem({ work_order_id: -1 })).toThrow("Invalid review summary data");
  });
});
