import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClaimError } from "@/domain/claims/claim-error";
import type { ClaimPage } from "@/domain/claims/claim";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

const mockClaimsList: ClaimPage = {
  items: [{
    id: "101",
    createdAt: "2026-09-24T10:00:00Z",
    operationId: "sp-42",
    claimantType: "consumer",
    claimantName: "ana@example.com",
    categoryName: "Plomería",
    status: "in_review",
  }],
  page: 1,
  limit: 20,
  total: 1,
};

vi.mock("@/infrastructure/repositories/api-claim-repository", () => ({
  apiClaimRepository: {
    getClaims: vi.fn(),
    getClaimById: vi.fn(),
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

    const filters = { status: "in_review" as const, q: "ana", page: 1, limit: 20 };
    const result = await getClaimsAction(filters);

    expect(result).toEqual({
      success: true,
      data: mockClaimsList,
    });
    expect(apiClaimRepository.getClaims).toHaveBeenCalledWith("mock-jwt-token", {
      ...filters,
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
