import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClaimError } from "@/domain/claims/claim-error";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

const mockClaimsList = [
  {
    id: "clm-101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: 42,
    claimantType: "consumer" as const,
    claimantName: "Ana Gómez",
    respondentName: "Carlos López",
    categoryName: "Plomería",
    status: "in_review" as const,
    urgency: "high" as const,
  },
];

vi.mock("@/infrastructure/repositories/api-claim-repository", () => ({
  apiClaimRepository: {
    getClaims: vi.fn(),
  },
}));

import { apiClaimRepository } from "@/infrastructure/repositories/api-claim-repository";
import { getClaimsAction } from "@/app/(dashboard)/reclamos/actions";

describe("getClaimsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns claims on successful repository call", async () => {
    vi.mocked(apiClaimRepository.getClaims).mockResolvedValue(mockClaimsList);

    const result = await getClaimsAction({ status: "in_review" });

    expect(result).toEqual({
      success: true,
      data: mockClaimsList,
    });
    expect(apiClaimRepository.getClaims).toHaveBeenCalledWith("mock-jwt-token", {
      status: "in_review",
    });
  });

  it("handles forbidden error gracefully", async () => {
    vi.mocked(apiClaimRepository.getClaims).mockRejectedValue(
      new ClaimError("forbidden", "Forbidden"),
    );

    const result = await getClaimsAction();

    expect(result).toEqual({
      success: false,
      error: "No posees permisos suficientes para gestionar reclamos.",
      isForbidden: true,
    });
  });

  it("handles generic or unavailable error gracefully", async () => {
    vi.mocked(apiClaimRepository.getClaims).mockRejectedValue(
      new ClaimError("unavailable", "Server error"),
    );

    const result = await getClaimsAction();

    expect(result).toEqual({
      success: false,
      error: "Ocurrió un error al obtener el listado de reclamos.",
    });
  });
});
