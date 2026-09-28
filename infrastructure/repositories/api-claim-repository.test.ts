import { afterEach, describe, expect, it, vi } from "vitest";
import { ClaimError } from "@/domain/claims/claim-error";
import { apiClaimRepository } from "./api-claim-repository";

describe("apiClaimRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleListResponse = [
    {
      id: "clm-101",
      created_at: "2026-09-24T10:00:00Z",
      operation_id: 42,
      claimant_type: "consumer",
      claimant_name: "Ana Gómez",
      respondent_name: "Carlos López",
      category_name: "Plomería",
      status: "in_review",
      urgency: "high",
    },
  ];

  it("calls /admin/claims with auth bearer token and parses list", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleListResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiClaimRepository.getClaims("my-token", {
      status: "in_review",
      q: "Gómez",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/claims?status=in_review&q=G%C3%B3mez",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("clm-101");
  });

  it("throws error when API_URL is missing", async () => {
    vi.stubEnv("API_URL", "");
    await expect(apiClaimRepository.getClaims("token")).rejects.toThrow("API_URL is not configured");
  });

  it("throws ClaimError('forbidden') on 403 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

    await expect(apiClaimRepository.getClaims("token")).rejects.toThrow(ClaimError);
  });

  it("throws ClaimError('unavailable') on 500 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server error", { status: 500 })));

    await expect(apiClaimRepository.getClaims("token")).rejects.toThrow(ClaimError);
  });
});
