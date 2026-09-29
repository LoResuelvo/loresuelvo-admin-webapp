import { describe, expect, it, vi } from "vitest";
import type { Claim } from "@/domain/claims/claim";
import type { ClaimRepository } from "@/ports/claims/claim-repository";
import { getClaims } from "./get-claims";

describe("getClaims use case", () => {
  const mockClaim: Claim = {
    id: "clm-101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: 42,
    claimantType: "consumer",
    claimantName: "Ana Gómez",
    respondentName: "Carlos López",
    categoryName: "Plomería",
    status: "in_review",
    urgency: "high",
  };

  it("delegates to ClaimRepository with token and filters", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn().mockResolvedValue([mockClaim]),
      getClaimById: vi.fn(),
      resolveClaim: vi.fn(),
    };

    const result = await getClaims(repository, "test-token", { status: "in_review" });

    expect(repository.getClaims).toHaveBeenCalledWith("test-token", { status: "in_review" });
    expect(result).toEqual([mockClaim]);
  });

  it("propagates repository errors", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn().mockRejectedValue(new Error("Network failure")),
      getClaimById: vi.fn(),
      resolveClaim: vi.fn(),
    };

    await expect(getClaims(repository, "token")).rejects.toThrow("Network failure");
  });
});
