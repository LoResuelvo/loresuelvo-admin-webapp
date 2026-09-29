import { describe, expect, it, vi } from "vitest";
import type { ClaimDetails } from "@/domain/claims/claim";
import type { ClaimRepository } from "@/ports/claims/claim-repository";
import { getClaimDetails } from "./get-claim-details";

describe("getClaimDetails use case", () => {
  const mockClaimDetails: ClaimDetails = {
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
    evidencePhotoUrls: ["https://example.com/p1.jpg"],
    resolution: null,
  };

  it("delegates to ClaimRepository with token and id", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn(),
      getClaimById: vi.fn().mockResolvedValue(mockClaimDetails),
    };

    const result = await getClaimDetails(repository, "test-token", "clm-101");

    expect(repository.getClaimById).toHaveBeenCalledWith("test-token", "clm-101");
    expect(result).toEqual(mockClaimDetails);
  });

  it("propagates repository errors", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn(),
      getClaimById: vi.fn().mockRejectedValue(new Error("Network failure")),
    };

    await expect(getClaimDetails(repository, "token", "clm-101")).rejects.toThrow("Network failure");
  });
});
