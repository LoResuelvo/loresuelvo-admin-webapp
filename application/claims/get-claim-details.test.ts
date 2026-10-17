import { describe, expect, it, vi } from "vitest";
import type { ClaimDetails } from "@/domain/claims/claim";
import type { ClaimRepository } from "@/ports/claims/claim-repository";
import { getClaimDetails } from "./get-claim-details";

describe("getClaimDetails use case", () => {
  const mockClaimDetails: ClaimDetails = {
    id: "101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: "sp-42",
    claimantType: "consumer",
    claimantName: "ana@example.com",
    categoryName: "Plomería",
    status: "in_review",
    claimReason: "non_compliance",
    description: "El prestador se presentó tarde.",
    evidencePhotoUrls: ["https://example.com/p1.jpg"],
    resolution: null,
  };

  it("delegates to ClaimRepository with token and id", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn(),
      getClaimById: vi.fn().mockResolvedValue(mockClaimDetails),
      resolveClaim: vi.fn(),
    };

    const result = await getClaimDetails(repository, "test-token", "101");

    expect(repository.getClaimById).toHaveBeenCalledWith("test-token", "101");
    expect(result).toEqual(mockClaimDetails);
  });

  it("propagates repository errors", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn(),
      getClaimById: vi.fn().mockRejectedValue(new Error("Network failure")),
      resolveClaim: vi.fn(),
    };

    await expect(getClaimDetails(repository, "token", "101")).rejects.toThrow("Network failure");
  });
});
