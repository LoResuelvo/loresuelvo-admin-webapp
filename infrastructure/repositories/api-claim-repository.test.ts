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

  describe("getClaimById", () => {
    const sampleDetailResponse = {
      ...sampleListResponse[0],
      claim_reason: "Incumplimiento de horario y cobro indebido",
      description: "El prestador se presentó tarde.",
      evidence_photo_urls: [
        "https://example.com/p1.jpg",
        "https://example.com/p2.jpg",
      ],
      resolution: null,
    };

    it("calls /admin/claims/:id with bearer token and parses detail", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleDetailResponse)));
      vi.stubGlobal("fetch", fetcher);

      const result = await apiClaimRepository.getClaimById("my-token", "clm-101");

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.com/admin/claims/clm-101",
        expect.objectContaining({
          cache: "no-store",
          headers: {
            Authorization: "Bearer my-token",
            Accept: "application/json",
          },
        }),
      );
      expect(result.id).toBe("clm-101");
      expect(result.claimReason).toBe("Incumplimiento de horario y cobro indebido");
      expect(result.evidencePhotoUrls).toHaveLength(2);
    });

    it("throws ClaimError('notFound') on 404 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Not found", { status: 404 })));

      await expect(apiClaimRepository.getClaimById("token", "clm-999")).rejects.toThrow(
        expect.objectContaining({ code: "notFound" }),
      );
    });

    it("throws ClaimError('forbidden') on 403 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

      await expect(apiClaimRepository.getClaimById("token", "clm-101")).rejects.toThrow(
        expect.objectContaining({ code: "forbidden" }),
      );
    });

    it("throws ClaimError('unavailable') on 500 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server error", { status: 500 })));

      await expect(apiClaimRepository.getClaimById("token", "clm-101")).rejects.toThrow(
        expect.objectContaining({ code: "unavailable" }),
      );
    });
  });

  describe("resolveClaim", () => {
    const sampleResolutionResponse = {
      resolution_type: "favor_consumer",
      reason: "Incumplimiento de visita",
      compensation_amount_cents: 5000,
      resolved_by: "Admin",
      resolved_at: "2026-09-28T22:00:00Z",
    };

    it("calls POST /admin/claims/:id/resolution with payload and parses resolution", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleResolutionResponse)));
      vi.stubGlobal("fetch", fetcher);

      const result = await apiClaimRepository.resolveClaim("my-token", "clm-101", {
        resolutionType: "favor_consumer",
        reason: "Incumplimiento de visita",
        compensationAmountCents: 5000,
      });

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.com/admin/claims/clm-101/resolution",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer my-token",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            resolution_type: "favor_consumer",
            reason: "Incumplimiento de visita",
            compensation_amount_cents: 5000,
          }),
        }),
      );
      expect(result.resolutionType).toBe("favor_consumer");
      expect(result.reason).toBe("Incumplimiento de visita");
      expect(result.compensationAmountCents).toBe(5000);
    });

    it("throws ClaimError('forbidden') on 403 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

      await expect(
        apiClaimRepository.resolveClaim("token", "clm-101", {
          resolutionType: "favor_consumer",
          reason: "Motivo",
        }),
      ).rejects.toThrow(expect.objectContaining({ code: "forbidden" }));
    });

    it("throws ClaimError('notFound') on 404 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Not found", { status: 404 })));

      await expect(
        apiClaimRepository.resolveClaim("token", "clm-999", {
          resolutionType: "favor_consumer",
          reason: "Motivo",
        }),
      ).rejects.toThrow(expect.objectContaining({ code: "notFound" }));
    });

    it("throws ClaimError('unavailable') on 500 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server error", { status: 500 })));

      await expect(
        apiClaimRepository.resolveClaim("token", "clm-101", {
          resolutionType: "favor_consumer",
          reason: "Motivo",
        }),
      ).rejects.toThrow(expect.objectContaining({ code: "unavailable" }));
    });
  });
});

