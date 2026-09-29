import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClaimError } from "@/domain/claims/claim-error";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

const mockClaimDetails = {
  id: "clm-101",
  createdAt: "2026-09-24T10:00:00Z",
  operationId: 42,
  claimantType: "consumer" as const,
  claimantName: "Ana Gómez",
  respondentName: "Carlos López",
  categoryName: "Plomería",
  status: "in_review" as const,
  urgency: "high" as const,
  claimReason: "Incumplimiento de horario y cobro indebido",
  description: "El prestador se presentó tarde.",
  evidencePhotoUrls: ["https://example.com/p1.jpg"],
  resolution: null,
};

vi.mock("@/infrastructure/repositories/api-claim-repository", () => ({
  apiClaimRepository: {
    getClaims: vi.fn(),
    getClaimById: vi.fn(),
  },
}));

import { apiClaimRepository } from "@/infrastructure/repositories/api-claim-repository";
import { getClaimDetailsAction } from "@/app/(dashboard)/reclamos/actions";

describe("getClaimDetailsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns claim details on successful repository call", async () => {
    vi.mocked(apiClaimRepository.getClaimById).mockResolvedValue(mockClaimDetails);

    const result = await getClaimDetailsAction("clm-101");

    expect(result).toEqual({
      success: true,
      data: mockClaimDetails,
    });
    expect(apiClaimRepository.getClaimById).toHaveBeenCalledWith(
      "mock-jwt-token",
      "clm-101",
    );
  });

  it("handles forbidden error gracefully", async () => {
    vi.mocked(apiClaimRepository.getClaimById).mockRejectedValue(
      new ClaimError("forbidden", "Forbidden"),
    );

    const result = await getClaimDetailsAction("clm-101");

    expect(result).toEqual({
      success: false,
      error: "No posees permisos suficientes para gestionar reclamos.",
      isForbidden: true,
    });
  });

  it("handles not found error gracefully", async () => {
    vi.mocked(apiClaimRepository.getClaimById).mockRejectedValue(
      new ClaimError("notFound", "Not found"),
    );

    const result = await getClaimDetailsAction("clm-999");

    expect(result).toEqual({
      success: false,
      error: "No se encontró el reclamo solicitado.",
      isNotFound: true,
    });
  });

  it("handles generic error gracefully", async () => {
    vi.mocked(apiClaimRepository.getClaimById).mockRejectedValue(
      new Error("Unexpected failure"),
    );

    const result = await getClaimDetailsAction("clm-101");

    expect(result).toEqual({
      success: false,
      error: "Unexpected failure",
    });
  });
});
