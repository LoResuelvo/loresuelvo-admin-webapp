import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewError } from "@/domain/reviews/review-error";
import { apiReviewRepository } from "./api-review-repository";

describe("apiReviewRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleReviewsList = [
    {
      id: "rev-101",
      created_at: "2026-09-25T14:00:00Z",
      operation_id: 101,
      author_name: "Lucía Fernández",
      provider_name: "Roberto Gómez",
      rating: 1,
      comment: "El trabajo fue pésimo.",
      status: "reported",
      report_reason: "Lenguaje agraviante",
      moderation: null,
    },
  ];

  it("calls /admin/reviews with auth bearer token and parses list", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleReviewsList)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiReviewRepository.getReviews("my-token", "reported");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/reviews?status=reported",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("rev-101");
    expect(result[0].authorName).toBe("Lucía Fernández");
  });

  it("throws error when API_URL is missing", async () => {
    vi.stubEnv("API_URL", "");
    await expect(apiReviewRepository.getReviews("token")).rejects.toThrow("API_URL is not configured");
  });

  it("throws ReviewError('forbidden') on 403 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

    await expect(apiReviewRepository.getReviews("token")).rejects.toThrow(ReviewError);
  });

  it("throws ReviewError('unavailable') on 500 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server Error", { status: 500 })));

    await expect(apiReviewRepository.getReviews("token")).rejects.toThrow(ReviewError);
  });
});
