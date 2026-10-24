import { describe, expect, it } from "vitest";
import {
  sampleClaimDetailResponse,
  sampleClaimResolutionResponse,
  sampleClaimsListResponse,
} from "../../features/claims/claims_fixtures";
import {
  mapClaimDetails,
  mapClaimResolution,
  mapClaimsList,
  mapResolutionInputToApi,
} from "./claim-mapper";

describe("claim mapper", () => {
  it("maps the paginated API list without inventing unavailable fields", () => {
    expect(mapClaimsList(sampleClaimsListResponse)).toEqual({
      items: [
        {
          id: "101",
          createdAt: "2026-09-24T10:00:00Z",
          operationId: "sp-42",
          claimantType: "consumer",
          claimantId: 1101,
          claimantName: "ana@example.com",
          claimantEmail: "ana@example.com",
          categoryName: "Plomería",
          status: "in_review",
        },
        {
          id: "102",
          createdAt: "2026-09-24T10:00:00Z",
          operationId: "sp-43",
          claimantType: "provider",
          claimantId: 1102,
          claimantName: "martin@example.com",
          claimantEmail: "martin@example.com",
          categoryName: "Electricidad",
          status: "open",
        },
      ],
      page: 1,
      limit: 20,
      total: 2,
    });
  });

  it("maps claim details and keeps absent respondent and urgency unavailable", () => {
    expect(mapClaimDetails(sampleClaimDetailResponse)).toEqual({
      id: "101",
      createdAt: "2026-09-24T10:00:00Z",
      operationId: "sp-42",
      claimantType: "consumer",
      claimantId: sampleClaimDetailResponse.claimant.id,
      claimantName: "ana@example.com",
      claimantEmail: "ana@example.com",
      categoryName: "Plomería",
      status: "in_review",
      claimReason: "non_compliance",
      description: "El prestador se presentó dos horas tarde y exigió un adicional no presupuestado en efectivo.",
      evidencePhotoUrls: [
        "https://example.com/evidence-1.jpg",
        "https://example.com/evidence-2.jpg",
      ],
      resolution: null,
    });
  });

  it("maps participant names, emails, IDs, and parties from list and detail responses", () => {
    const list = mapClaimsList({
      ...sampleClaimsListResponse,
      items: [{ ...sampleClaimsListResponse.items[0], claimant_name: "Ana Martínez" }],
    });
    expect(list.items[0]).toMatchObject({
      claimantId: 1101,
      claimantName: "Ana Martínez",
      claimantEmail: "ana@example.com",
    });

    const detail = mapClaimDetails({
      ...sampleClaimDetailResponse,
      claimant: { ...sampleClaimDetailResponse.claimant, name: "Ana Martínez" },
      respondent: {
        id: 2202,
        party: "provider",
        name: "Martín Gómez",
        email: "martin@example.com",
      },
    });
    expect(detail).toMatchObject({
      claimantId: 1101,
      claimantName: "Ana Martínez",
      claimantEmail: "ana@example.com",
      respondentId: 2202,
      respondentType: "provider",
      respondentName: "Martín Gómez",
      respondentEmail: "martin@example.com",
    });
  });

  it("uses email when participant names are blank and leaves an absent respondent unavailable", () => {
    const list = mapClaimsList({
      ...sampleClaimsListResponse,
      items: [{ ...sampleClaimsListResponse.items[0], claimant_name: "  " }],
    });
    expect(list.items[0].claimantName).toBe("ana@example.com");

    const detail = mapClaimDetails({
      ...sampleClaimDetailResponse,
      claimant: { ...sampleClaimDetailResponse.claimant, name: "  " },
    });
    expect(detail.claimantName).toBe("ana@example.com");
    expect(detail).not.toHaveProperty("respondentId");
    expect(detail).not.toHaveProperty("respondentName");
  });

  it("maps API resolution types and amounts to the existing domain values", () => {
    expect(mapClaimResolution(sampleClaimResolutionResponse)).toEqual({
      resolutionType: "favor_consumer",
      reason: "Incumplimiento de visita pactada sin aviso previo",
      compensationAmountCents: null,
      resolvedAt: "2026-09-28T23:00:00Z",
    });
  });

  it("maps a domain resolution input to the API contract", () => {
    expect(mapResolutionInputToApi({
      resolutionType: "favor_consumer",
      reason: "  Motivo validado  ",
      compensationAmountCents: 5000,
    })).toEqual({
      type: "consumer_favor",
      reasoning: "Motivo validado",
      suggested_compensation: { amount_minor: 5000 },
    });
  });

  it.each([0, -1, Number.MAX_SAFE_INTEGER + 1])(
    "rejects an invalid compensation amount of %s",
    (amount) => {
      expect(() => mapResolutionInputToApi({
        resolutionType: "favor_consumer",
        reason: "Motivo válido",
        compensationAmountCents: amount,
      })).toThrow();
    },
  );

  it("rejects blank or NUL-containing reasoning", () => {
    for (const reason of ["   ", "Motivo\0 inválido"]) {
      expect(() => mapResolutionInputToApi({
        resolutionType: "favor_consumer",
        reason,
      })).toThrow();
    }
  });

  it("accepts a 5,000-code-point reason and rejects longer text", () => {
    const maxReason = "á".repeat(5000);
    expect(mapResolutionInputToApi({ resolutionType: "favor_consumer", reason: maxReason }).reasoning).toBe(maxReason);
    expect(() => mapResolutionInputToApi({
      resolutionType: "favor_consumer",
      reason: `${maxReason}á`,
    })).toThrow();
  });
});
