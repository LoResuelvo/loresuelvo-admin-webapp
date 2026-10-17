import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewError } from "@/domain/reviews/review-error";
import { apiReviewRepository } from "./api-review-repository";

describe("apiReviewRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const reviewSummary = {
    work_order_id: 101,
    consumer_id: 10,
    provider_id: 20,
    operation_id: "work_order-101",
    rating: 1,
    visibility: "visible",
    version: 3,
    pending_report_count: 1,
    reported_on: "2026-09-25T14:00:00Z",
  };

  const reviewPage = {
    items: [reviewSummary],
    page: 1,
    limit: 100,
    total: 1,
  };

  const reviewDetail = {
    review: reviewSummary,
    description: "El comentario reportado.",
    report: {
      id: 501,
      category: "abusive_language",
      explanation: "Lenguaje agraviante",
      status: "pending",
      created_on: "2026-09-25T14:00:00Z",
    },
    decisions: { items: [], page: 1, limit: 20, total: 0, has_more: false },
  };

  it("requests the paginated review list with the selected API status", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(reviewPage)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiReviewRepository.getReviews("my-token", "reported");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/reviews?status=reported&page=1&limit=100",
      expect.objectContaining({
        cache: "no-store",
        headers: { Authorization: "Bearer my-token", Accept: "application/json" },
      }),
    );
    expect(result).toEqual([{
      id: "101",
      consumerId: 10,
      providerId: 20,
      operationId: "work_order-101",
      rating: 1,
      visibility: "visible",
      version: 3,
      pendingReportCount: 1,
      reportedOn: "2026-09-25T14:00:00Z",
    }]);
  });

  it("preserves reported reviews in the API visibility filter", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const visibleWithoutReport = {
      ...reviewSummary,
      work_order_id: 201,
      operation_id: "work_order-201",
      pending_report_count: 0,
      reported_on: null,
    };
    const reportedButVisible = {
      ...reviewSummary,
      work_order_id: 202,
      operation_id: "work_order-202",
    };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [visibleWithoutReport, reportedButVisible], page: 1, limit: 100, total: 2,
    })));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiReviewRepository.getReviews("token", "visible");

    expect(result.map((review) => review.id)).toEqual(["201", "202"]);
    expect(result[0].visibility).toBe("visible");
    expect(result[1].pendingReportCount).toBe(1);
  });

  it("preserves hidden reviews with pending reports in the API reported filter", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const hiddenWithPendingReport = {
      ...reviewSummary,
      visibility: "hidden",
      pending_report_count: 1,
    };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      items: [hiddenWithPendingReport], page: 1, limit: 100, total: 1,
    })));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiReviewRepository.getReviews("token", "reported");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ visibility: "hidden", pendingReportCount: 1 });
  });

  it("requests all reviews explicitly because the API default is reported only", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(reviewPage)));
    vi.stubGlobal("fetch", fetcher);

    await apiReviewRepository.getReviews("token");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/reviews?status=all&page=1&limit=100",
      expect.any(Object),
    );
  });

  it("loads subsequent pages so the table does not silently omit reviews", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const firstPage = Array.from({ length: 100 }, (_, index) => ({
      ...reviewSummary,
      work_order_id: index + 1,
      operation_id: `work_order-${index + 1}`,
    }));
    const secondReview = { ...reviewSummary, work_order_id: 101, operation_id: "work_order-101" };
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: firstPage, page: 1, limit: 100, total: 101 })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ items: [secondReview], page: 2, limit: 100, total: 101 })));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiReviewRepository.getReviews("token", "all");

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][0]).toBe("https://api.example.com/admin/reviews?status=all&page=2&limit=100");
    expect(result).toHaveLength(101);
    expect(result[100].id).toBe("101");
  });

  it("maps review detail with its report explanation and decisions", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(reviewDetail)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiReviewRepository.getReviewById("my-token", "101");

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/reviews/101",
      expect.objectContaining({
        cache: "no-store",
        headers: { Authorization: "Bearer my-token", Accept: "application/json" },
      }),
    );
    expect(result.review.id).toBe("101");
    expect(result.description).toBe("El comentario reportado.");
    expect(result.report).toMatchObject({ id: 501, explanation: "Lenguaje agraviante" });
  });

  it("sends API moderation fields including the expected version and report id", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const resultDto = { work_order_id: 101, visibility: "hidden", version: 4, decision_id: 89 };
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(resultDto)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiReviewRepository.moderate("auth-token", "101", {
      action: "hide",
      category: "abusive_language",
      reason: "Lenguaje ofensivo",
      expectedVersion: 3,
      reportId: 501,
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/reviews/101/moderate",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer auth-token",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }),
    );
    expect(JSON.parse(fetcher.mock.calls[0][1].body as string)).toEqual({
      action: "hide",
      reason: "Lenguaje ofensivo",
      expected_version: 3,
      category: "abusive_language",
      report_id: 501,
    });
    expect(result).toEqual({ id: "101", visibility: "hidden", version: 4, decisionId: 89 });
  });

  it("omits category and report id when restoring visibility and still includes its reason", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      work_order_id: 101,
      visibility: "visible",
      version: 5,
      decision_id: 90,
    })));
    vi.stubGlobal("fetch", fetcher);

    await apiReviewRepository.moderate("token", "101", {
      action: "unhide",
      reason: "Restablecimiento solicitado",
      expectedVersion: 4,
    });

    expect(JSON.parse(fetcher.mock.calls[0][1].body as string)).toEqual({
      action: "unhide",
      reason: "Restablecimiento solicitado",
      expected_version: 4,
    });
  });

  it("surfaces moderation version conflicts instead of reporting a generic API failure", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "review version conflict" }), { status: 409 })));

    await expect(apiReviewRepository.moderate("token", "101", {
      action: "unhide",
      reason: "Restablecimiento solicitado",
      expectedVersion: 4,
    })).rejects.toSatisfy((error) => error instanceof ReviewError && error.code === "conflict");
  });
});
