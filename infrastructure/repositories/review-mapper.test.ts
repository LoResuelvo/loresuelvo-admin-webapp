import { describe, expect, it } from "vitest";
import { mapReviewModerationItem, mapReviewsList } from "./review-mapper";
import type { ApiReviewModerationItem } from "@/infrastructure/api/types";

describe("review-mapper", () => {
  const sampleDto: ApiReviewModerationItem = {
    id: "rev-101",
    created_at: "2026-09-25T14:00:00Z",
    operation_id: 101,
    author_name: "Lucía Fernández",
    provider_name: "Roberto Gómez",
    rating: 1,
    comment: "El trabajo fue pésimo y además me insultó al retirarse.",
    status: "reported",
    report_reason: "Lenguaje agraviante y trato ofensivo",
    moderation: null,
  };

  const sampleModeratedDto: ApiReviewModerationItem = {
    id: "rev-102",
    created_at: "2026-09-24T18:30:00Z",
    operation_id: 102,
    author_name: "Esteban Morales",
    provider_name: "Clara Domínguez",
    rating: 2,
    comment: "Publicó mis datos personales.",
    status: "hidden",
    report_reason: "Divulgación de datos personales",
    moderation: {
      moderated_by: "Operador Admin",
      moderated_at: "2026-09-24T19:00:00Z",
      category: "personal_data",
      reason: "Datos privados expuestos",
    },
  };

  it("maps single ApiReviewModerationItem to ReviewModerationItem domain model", () => {
    const domain = mapReviewModerationItem(sampleDto);

    expect(domain.id).toBe("rev-101");
    expect(domain.createdAt).toBe("2026-09-25T14:00:00Z");
    expect(domain.operationId).toBe(101);
    expect(domain.authorName).toBe("Lucía Fernández");
    expect(domain.providerName).toBe("Roberto Gómez");
    expect(domain.rating).toBe(1);
    expect(domain.comment).toBe("El trabajo fue pésimo y además me insultó al retirarse.");
    expect(domain.status).toBe("reported");
    expect(domain.reportReason).toBe("Lenguaje agraviante y trato ofensivo");
    expect(domain.moderation).toBeNull();
  });

  it("maps moderated review item with audit details", () => {
    const domain = mapReviewModerationItem(sampleModeratedDto);

    expect(domain.id).toBe("rev-102");
    expect(domain.status).toBe("hidden");
    expect(domain.moderation).toEqual({
      moderatedBy: "Operador Admin",
      moderatedAt: "2026-09-24T19:00:00Z",
      category: "personal_data",
      reason: "Datos privados expuestos",
    });
  });

  it("maps list of review DTOs", () => {
    const list = mapReviewsList([sampleDto, sampleModeratedDto]);
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe("rev-101");
    expect(list[1].id).toBe("rev-102");
  });

  it("throws error for non-array payload", () => {
    expect(() => mapReviewsList({ invalid: true })).toThrow("Invalid reviews list payload");
  });

  it("throws validation error for invalid DTO structure", () => {
    expect(() => mapReviewModerationItem({ id: "", rating: 10 })).toThrow();
  });
});
