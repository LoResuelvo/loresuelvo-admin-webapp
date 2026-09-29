import { describe, expect, it } from "vitest";
import type { ResolutionInput } from "@/domain/claims/claim";
import {
  mapClaimListItem,
  mapClaimsList,
  mapClaimDetails,
  mapClaimResolution,
  mapResolutionInputToApi,
} from "./claim-mapper";

describe("claim-mapper", () => {
  const validDto = {
    id: "clm-101",
    created_at: "2026-09-24T10:00:00Z",
    operation_id: 42,
    claimant_type: "consumer",
    claimant_name: "Ana Gómez",
    respondent_name: "Carlos López",
    category_name: "Plomería",
    status: "in_review",
    urgency: "high",
  };

  it("maps valid DTO item to domain Claim model", () => {
    const claim = mapClaimListItem(validDto);

    expect(claim).toEqual({
      id: "clm-101",
      createdAt: "2026-09-24T10:00:00Z",
      operationId: 42,
      claimantType: "consumer",
      claimantName: "Ana Gómez",
      respondentName: "Carlos López",
      categoryName: "Plomería",
      status: "in_review",
      urgency: "high",
    });
  });

  it("throws error when mapping invalid item", () => {
    expect(() => mapClaimListItem(null)).toThrow("Invalid claim data");
    expect(() => mapClaimListItem({})).toThrow("Invalid claim data");
    expect(() => mapClaimListItem({ ...validDto, status: "unknown_status" })).toThrow(
      "Invalid claim data",
    );
    expect(() => mapClaimListItem({ ...validDto, urgency: "extreme" })).toThrow(
      "Invalid claim data",
    );
    expect(() => mapClaimListItem({ ...validDto, claimant_type: "bot" })).toThrow(
      "Invalid claim data",
    );
  });

  it("maps valid list of DTO items to domain Claim array", () => {
    const validList = [
      validDto,
      {
        id: "clm-102",
        created_at: "2026-09-22T14:30:00Z",
        operation_id: 43,
        claimant_type: "provider",
        claimant_name: "Martín Pérez",
        respondent_name: "Laura López",
        category_name: "Electricidad",
        status: "open",
        urgency: "medium",
      },
    ];

    const result = mapClaimsList(validList);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("clm-101");
    expect(result[0].claimantType).toBe("consumer");
    expect(result[1].id).toBe("clm-102");
    expect(result[1].claimantType).toBe("provider");
  });

  it("throws error when mapping invalid list", () => {
    expect(() => mapClaimsList(null)).toThrow("Invalid claims list data");
    expect(() => mapClaimsList("not-an-array")).toThrow("Invalid claims list data");
    expect(() => mapClaimsList([{ id: "invalid" }])).toThrow("Invalid claims list data");
  });

  describe("mapClaimDetails", () => {
    const validDetailDto = {
      ...validDto,
      claim_reason: "Incumplimiento de horario y cobro indebido",
      description: "El prestador se presentó tarde.",
      evidence_photo_urls: [
        "https://example.com/p1.jpg",
        "https://example.com/p2.jpg",
      ],
      resolution: null,
    };

    it("maps valid DTO item to domain ClaimDetails without resolution", () => {
      const result = mapClaimDetails(validDetailDto);

      expect(result).toEqual({
        id: "clm-101",
        createdAt: "2026-09-24T10:00:00Z",
        operationId: 42,
        claimantType: "consumer",
        claimantName: "Ana Gómez",
        respondentName: "Carlos López",
        categoryName: "Plomería",
        status: "in_review",
        urgency: "high",
        claimReason: "Incumplimiento de horario y cobro indebido",
        description: "El prestador se presentó tarde.",
        evidencePhotoUrls: [
          "https://example.com/p1.jpg",
          "https://example.com/p2.jpg",
        ],
        resolution: null,
      });
    });

    it("maps valid DTO item to domain ClaimDetails with resolution", () => {
      const withResolutionDto = {
        ...validDetailDto,
        status: "resolved",
        resolution: {
          resolution_type: "favor_consumer",
          reason: "Reembolso total acordado",
          compensation_amount_cents: 5000,
          resolved_by: "Admin",
          resolved_at: "2026-09-25T12:00:00Z",
        },
      };

      const result = mapClaimDetails(withResolutionDto);

      expect(result.resolution).toEqual({
        resolutionType: "favor_consumer",
        reason: "Reembolso total acordado",
        compensationAmountCents: 5000,
        resolvedBy: "Admin",
        resolvedAt: "2026-09-25T12:00:00Z",
      });
    });

    it("throws error when mapping invalid detail DTO", () => {
      expect(() => mapClaimDetails(null)).toThrow("Invalid claim detail data");
      expect(() => mapClaimDetails({})).toThrow("Invalid claim detail data");
      expect(() =>
        mapClaimDetails({ ...validDetailDto, evidence_photo_urls: "not-an-array" }),
      ).toThrow("Invalid claim detail data");
      expect(() =>
        mapClaimDetails({ ...validDetailDto, claim_reason: 123 }),
      ).toThrow("Invalid claim detail data");
    });
  });

  describe("mapClaimResolution", () => {
    it("maps raw resolution object to ClaimResolution domain model", () => {
      const raw = {
        resolution_type: "favor_consumer",
        reason: "Fallo favorable",
        compensation_amount_cents: 10000,
        resolved_by: "Admin",
        resolved_at: "2026-09-28T10:00:00Z",
      };
      const result = mapClaimResolution(raw);
      expect(result).toEqual({
        resolutionType: "favor_consumer",
        reason: "Fallo favorable",
        compensationAmountCents: 10000,
        resolvedBy: "Admin",
        resolvedAt: "2026-09-28T10:00:00Z",
      });
    });

    it("throws error when resolution payload is invalid", () => {
      expect(() => mapClaimResolution(null)).toThrow("Invalid claim resolution data");
      expect(() => mapClaimResolution({})).toThrow("Invalid claim resolution data");
    });
  });

  describe("mapResolutionInputToApi", () => {
    it("maps domain ResolutionInput to ApiResolutionInput", () => {
      const input: ResolutionInput = {
        resolutionType: "favor_consumer",
        reason: "  Incumplimiento verificado  ",
        compensationAmountCents: 5000,
      };
      const result = mapResolutionInputToApi(input);
      expect(result).toEqual({
        resolution_type: "favor_consumer",
        reason: "Incumplimiento verificado",
        compensation_amount_cents: 5000,
      });
    });

    it("throws error when reason is empty", () => {
      expect(() =>
        mapResolutionInputToApi({
          resolutionType: "favor_consumer",
          reason: "   ",
        }),
      ).toThrow("El motivo de resolución es obligatorio");
    });
  });
});

