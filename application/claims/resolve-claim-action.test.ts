import { describe, expect, it, vi, beforeEach } from "vitest";
import { ClaimError } from "@/domain/claims/claim-error";
import type { ClaimResolution, ResolutionInput } from "@/domain/claims/claim";

vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: {
    getAccessToken: vi.fn().mockResolvedValue("mock-jwt-token"),
  },
}));

const mockResolution: ClaimResolution = {
  resolutionType: "favor_consumer",
  reason: "Incumplimiento de visita",
  compensationAmountCents: 5000,
  resolvedBy: "Admin",
  resolvedAt: "2026-09-28T23:00:00Z",
};

const mockInput: ResolutionInput = {
  resolutionType: "favor_consumer",
  reason: "Incumplimiento de visita",
  compensationAmountCents: 5000,
};

vi.mock("@/infrastructure/repositories/api-claim-repository", () => ({
  apiClaimRepository: {
    getClaims: vi.fn(),
    getClaimById: vi.fn(),
    resolveClaim: vi.fn(),
  },
}));

import { apiClaimRepository } from "@/infrastructure/repositories/api-claim-repository";
import { resolveClaimAction } from "@/app/(dashboard)/reclamos/actions";

describe("resolveClaimAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns resolution on successful repository call", async () => {
    vi.mocked(apiClaimRepository.resolveClaim).mockResolvedValue(mockResolution);

    const result = await resolveClaimAction("clm-101", mockInput);

    expect(result).toEqual({
      success: true,
      data: mockResolution,
    });
    expect(apiClaimRepository.resolveClaim).toHaveBeenCalledWith(
      "mock-jwt-token",
      "clm-101",
      mockInput,
    );
  });

  it("handles forbidden error gracefully", async () => {
    vi.mocked(apiClaimRepository.resolveClaim).mockRejectedValue(
      new ClaimError("forbidden", "Forbidden"),
    );

    const result = await resolveClaimAction("clm-101", mockInput);

    expect(result).toEqual({
      success: false,
      error: "No posees permisos suficientes para gestionar reclamos.",
      isForbidden: true,
    });
  });

  it("handles not found error gracefully", async () => {
    vi.mocked(apiClaimRepository.resolveClaim).mockRejectedValue(
      new ClaimError("notFound", "Not found"),
    );

    const result = await resolveClaimAction("clm-999", mockInput);

    expect(result).toEqual({
      success: false,
      error: "No se encontró el reclamo solicitado.",
      isNotFound: true,
    });
  });

  it("handles generic error gracefully", async () => {
    vi.mocked(apiClaimRepository.resolveClaim).mockRejectedValue(
      new Error("Unexpected failure"),
    );

    const result = await resolveClaimAction("clm-101", mockInput);

    expect(result).toEqual({
      success: false,
      error: "Unexpected failure",
    });
  });
});
