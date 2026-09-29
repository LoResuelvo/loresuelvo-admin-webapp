import { describe, expect, it, vi } from "vitest";
import type { ClaimRepository } from "@/ports/claims/claim-repository";
import type { ClaimResolution, ResolutionInput } from "@/domain/claims/claim";
import { resolveClaim } from "./resolve-claim";

describe("resolveClaim use case", () => {
  const mockResolution: ClaimResolution = {
    resolutionType: "favor_consumer",
    reason: "Incumplimiento de visita pactada sin aviso previo",
    compensationAmountCents: null,
    resolvedBy: "Operador LoResuelvo",
    resolvedAt: "2026-09-28T23:00:00Z",
  };

  const mockInput: ResolutionInput = {
    resolutionType: "favor_consumer",
    reason: "Incumplimiento de visita pactada sin aviso previo",
    compensationAmountCents: null,
  };

  it("delegates to ClaimRepository with token, id and input", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn(),
      getClaimById: vi.fn(),
      resolveClaim: vi.fn().mockResolvedValue(mockResolution),
    };

    const result = await resolveClaim(repository, "test-token", "clm-101", mockInput);

    expect(repository.resolveClaim).toHaveBeenCalledWith("test-token", "clm-101", mockInput);
    expect(result).toEqual(mockResolution);
  });

  it("propagates repository errors", async () => {
    const repository: ClaimRepository = {
      getClaims: vi.fn(),
      getClaimById: vi.fn(),
      resolveClaim: vi.fn().mockRejectedValue(new Error("Resolution failed")),
    };

    await expect(resolveClaim(repository, "token", "clm-101", mockInput)).rejects.toThrow(
      "Resolution failed",
    );
  });
});
