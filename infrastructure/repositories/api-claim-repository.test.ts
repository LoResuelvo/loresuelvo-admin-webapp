import { afterEach, describe, expect, it, vi } from "vitest";
import {
  sampleClaimDetailOpenResponse,
  sampleClaimDetailResponse,
  sampleClaimResolutionResponse,
  sampleClaimsListResponse,
} from "../../features/claims/claims_fixtures";
import { ClaimError } from "@/domain/claims/claim-error";
import { apiClaimRepository } from "./api-claim-repository";

describe("apiClaimRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("requests the paginated list with auth, filters, and API pagination metadata", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const listResponse = { ...sampleClaimsListResponse, page: 2, total: 41 };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(listResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiClaimRepository.getClaims("my-token", {
      status: "in_review",
      q: "Gómez",
      page: 2,
      limit: 20,
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/claims?status=in_review&q=G%C3%B3mez&page=2&limit=20",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result).toEqual({
      items: expect.arrayContaining([
        expect.objectContaining({ id: "101", operationId: "sp-42", claimantName: "ana@example.com" }),
      ]),
      page: 2,
      limit: 20,
      total: 41,
    });
  });

  it("fails with a safe configuration error when API_URL is missing", async () => {
    vi.stubEnv("API_URL", "");

    await expect(apiClaimRepository.getClaims("token")).rejects.toThrow("API is not configured");
  });

  it("throws ClaimError('forbidden') on 403 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

    await expect(apiClaimRepository.getClaims("token")).rejects.toThrow(
      expect.objectContaining({ code: "forbidden" }),
    );
  });

  it("throws ClaimError('unavailable') on 500 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server error", { status: 500 })));

    await expect(apiClaimRepository.getClaims("token")).rejects.toThrow(
      expect.objectContaining({ code: "unavailable" }),
    );
  });

  describe("getClaimById", () => {
    it("parses the API detail and preserves the numeric claim and operation identifiers", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleClaimDetailResponse)));
      vi.stubGlobal("fetch", fetcher);

      const result = await apiClaimRepository.getClaimById("my-token", "101");

      expect(fetcher).toHaveBeenCalledWith(
        "https://api.example.com/admin/claims/101",
        expect.objectContaining({
          cache: "no-store",
          headers: {
            Authorization: "Bearer my-token",
            Accept: "application/json",
          },
        }),
      );
      expect(result).toMatchObject({
        id: "101",
        operationId: "sp-42",
        claimantName: "ana@example.com",
        claimReason: "non_compliance",
        evidencePhotoUrls: [
          "https://example.com/evidence-1.jpg",
          "https://example.com/evidence-2.jpg",
        ],
      });
      expect(result.respondentName).toBeUndefined();
      expect(result.urgency).toBeUndefined();
    });

    it("throws ClaimError('notFound') on 404 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Not found", { status: 404 })));

      await expect(apiClaimRepository.getClaimById("token", "999")).rejects.toThrow(
        expect.objectContaining({ code: "notFound" }),
      );
    });

    it("throws ClaimError('forbidden') on 403 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

      await expect(apiClaimRepository.getClaimById("token", "101")).rejects.toThrow(
        expect.objectContaining({ code: "forbidden" }),
      );
    });

    it("throws ClaimError('unavailable') on 500 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server error", { status: 500 })));

      await expect(apiClaimRepository.getClaimById("token", "101")).rejects.toThrow(
        expect.objectContaining({ code: "unavailable" }),
      );
    });
  });

  describe("resolveClaim", () => {
    const input = {
      resolutionType: "favor_consumer" as const,
      reason: "Incumplimiento de visita",
      compensationAmountCents: 5000,
      idempotencyKey: "resolution-request-uuid",
      reviewIdempotencyKey: "review-request-uuid",
    };
    const apiBody = {
      type: "consumer_favor",
      reasoning: "Incumplimiento de visita",
      suggested_compensation: { amount_minor: 5000 },
    };

    it("posts resolution for a claim already in review with an idempotency key", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const fetcher = vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(sampleClaimDetailResponse)))
        .mockResolvedValueOnce(new Response(JSON.stringify(sampleClaimResolutionResponse)));
      vi.stubGlobal("fetch", fetcher);

      const result = await apiClaimRepository.resolveClaim("my-token", "101", input);

      expect(fetcher).toHaveBeenNthCalledWith(
        1,
        "https://api.example.com/admin/claims/101",
        expect.objectContaining({ method: undefined, cache: "no-store" }),
      );
      expect(fetcher).toHaveBeenNthCalledWith(
        2,
        "https://api.example.com/admin/claims/101/resolution",
        expect.objectContaining({
          method: "POST",
          headers: {
            Authorization: "Bearer my-token",
            Accept: "application/json",
            "Content-Type": "application/json",
            "Idempotency-Key": "resolution-request-uuid",
          },
          body: JSON.stringify(apiBody),
          cache: "no-store",
        }),
      );
      expect(fetcher).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        resolutionType: "favor_consumer",
        reason: "Incumplimiento de visita pactada sin aviso previo",
        compensationAmountCents: null,
        resolvedAt: "2026-09-28T23:00:00Z",
      });
    });

    it("starts review before resolution for an open claim using distinct idempotency keys", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      const fetcher = vi.fn()
        .mockResolvedValueOnce(new Response(JSON.stringify(sampleClaimDetailOpenResponse)))
        .mockResolvedValueOnce(new Response("{}"))
        .mockResolvedValueOnce(new Response(JSON.stringify(sampleClaimResolutionResponse)));
      vi.stubGlobal("fetch", fetcher);

      await apiClaimRepository.resolveClaim("my-token", "101", input);

      expect(fetcher).toHaveBeenNthCalledWith(
        2,
        "https://api.example.com/admin/claims/101/review",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Idempotency-Key": "review-request-uuid" }),
        }),
      );
      expect(fetcher).toHaveBeenNthCalledWith(
        3,
        "https://api.example.com/admin/claims/101/resolution",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ "Idempotency-Key": "resolution-request-uuid" }),
          body: JSON.stringify(apiBody),
        }),
      );
      expect(fetcher).toHaveBeenCalledTimes(3);
    });

    it("throws ClaimError('forbidden') on 403 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

      await expect(apiClaimRepository.resolveClaim("token", "101", input)).rejects.toThrow(
        expect.objectContaining({ code: "forbidden" }),
      );
    });

    it("throws ClaimError('notFound') on 404 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Not found", { status: 404 })));

      await expect(apiClaimRepository.resolveClaim("token", "999", input)).rejects.toThrow(
        expect.objectContaining({ code: "notFound" }),
      );
    });

    it("throws ClaimError('unavailable') on 500 response", async () => {
      vi.stubEnv("API_URL", "https://api.example.com");
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server error", { status: 500 })));

      await expect(apiClaimRepository.resolveClaim("token", "101", input)).rejects.toThrow(
        expect.objectContaining({ code: "unavailable" }),
      );
    });
  });
});
