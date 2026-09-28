import { describe, expect, it } from "vitest";
import { mapClaimListItem, mapClaimsList } from "./claim-mapper";

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
});
