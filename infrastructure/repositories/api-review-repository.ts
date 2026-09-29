import "server-only";
import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";
import { ReviewError } from "@/domain/reviews/review-error";
import type { ReviewRepository } from "@/ports/reviews/review-repository";
import { mapReviewsList } from "./review-mapper";
import { getE2EReviewsStub, resolveReviewsFromStub } from "./review-stubs";

function buildApiUrl(baseUrl: string, status?: ReviewStatus): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/reviews`);
  if (status) {
    url.searchParams.set("status", status);
  }
  return url;
}

export const apiReviewRepository: ReviewRepository = {
  async getReviews(token: string, status?: ReviewStatus): Promise<ReviewModerationItem[]> {
    const stub = await getE2EReviewsStub(status);
    if (stub) {
      return resolveReviewsFromStub(stub, status);
    }

    const baseUrl = process.env.API_URL;
    if (!baseUrl) {
      throw new Error("API_URL is not configured");
    }

    const url = buildApiUrl(baseUrl, status);
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err: unknown) {
      if (err instanceof ReviewError) throw err;
      throw new ReviewError("unavailable", "Network error when fetching reviews");
    }

    if (response.status === 403) throw new ReviewError("forbidden", "Forbidden");
    if (response.status >= 500) throw new ReviewError("unavailable", `Failed: ${response.status}`);
    if (!response.ok) throw new ReviewError("unknown", `Failed: ${response.status}`);

    const data = await response.json();
    return mapReviewsList(data);
  },
};
