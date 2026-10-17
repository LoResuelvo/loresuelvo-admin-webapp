import "server-only";
import type {
  ReviewListFilter,
  ReviewModerationCommand,
  ReviewModerationDetail,
  ReviewModerationItem,
  ReviewModerationResult,
} from "@/domain/reviews/review-moderation";
import { ReviewError } from "@/domain/reviews/review-error";
import type { ReviewRepository } from "@/ports/reviews/review-repository";
import {
  apiReviewDetailSchema,
  apiReviewModerationResultSchema,
  apiReviewsPageSchema,
} from "@/infrastructure/api/types";
import { mapReviewModerationDetail, mapReviewModerationResult, mapReviewsList } from "./review-mapper";
import {
  getE2EReviewsStub,
  resolveReviewsFromStub,
  getE2EReviewDetailStub,
  resolveReviewDetailFromStub,
  getE2EModerateReviewStub,
  resolveModerateReviewFromStub,
} from "./review-stubs";

const pageLimit = 100;

function getBaseUrl(): string {
  const baseUrl = process.env.API_URL;
  if (!baseUrl) throw new Error("API_URL is not configured");
  return baseUrl.replace(/\/$/, "");
}

function buildListUrl(baseUrl: string, status: ReviewListFilter, page: number): URL {
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/admin/reviews`);
  url.searchParams.set("status", status);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(pageLimit));
  return url;
}

async function throwReviewResponseError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null) as { error?: unknown } | null;
  const message = typeof body?.error === "string" ? body.error : `Failed: ${response.status}`;
  if (response.status === 403) throw new ReviewError("forbidden", message);
  if (response.status === 404) throw new ReviewError("notFound", message);
  if (response.status === 409) throw new ReviewError("conflict", message);
  if (response.status === 400) throw new ReviewError("invalid", message);
  if (response.status >= 500) throw new ReviewError("unavailable", message);
  throw new ReviewError("unknown", message);
}

export const apiReviewRepository: ReviewRepository = {
  async getReviews(token: string, status?: ReviewListFilter): Promise<ReviewModerationItem[]> {
    const filter = status ?? "all";
    const stub = await getE2EReviewsStub(filter);
    if (stub) return resolveReviewsFromStub(stub, filter);

    const baseUrl = getBaseUrl();
    const reviews: ReviewModerationItem[] = [];
    let page = 1;
    let total = 0;
    do {
      let response: Response;
      try {
        response = await fetch(buildListUrl(baseUrl, filter, page).toString(), {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        });
      } catch (error: unknown) {
        if (error instanceof ReviewError) throw error;
        throw new ReviewError("unavailable", "Network error when fetching reviews");
      }
      if (!response.ok) await throwReviewResponseError(response);
      const payload = await response.json();
      const parsed = apiReviewsPageSchema.safeParse(payload);
      if (!parsed.success) throw new Error("Invalid reviews page data");
      reviews.push(...mapReviewsList(payload));
      total = parsed.data.total;
      page = parsed.data.page + 1;
    } while ((page - 1) * pageLimit < total);
    return reviews;
  },

  async getReviewById(token: string, id: string): Promise<ReviewModerationDetail> {
    const stub = await getE2EReviewDetailStub(id);
    if (stub) return resolveReviewDetailFromStub(stub);

    let response: Response;
    try {
      response = await fetch(`${getBaseUrl()}/admin/reviews/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ReviewError("unavailable", "Network error when fetching review detail");
    }
    if (!response.ok) await throwReviewResponseError(response);
    const payload: unknown = await response.json();
    const parsed = apiReviewDetailSchema.safeParse(payload);
    if (!parsed.success) throw new Error("Invalid review detail data");
    return mapReviewModerationDetail(payload);
  },

  async moderate(
    token: string,
    id: string,
    command: ReviewModerationCommand,
  ): Promise<ReviewModerationResult> {
    const stub = await getE2EModerateReviewStub(id);
    if (stub) return resolveModerateReviewFromStub(stub);

    const body: Record<string, unknown> = {
      action: command.action,
      reason: command.reason,
      expected_version: command.expectedVersion,
    };
    if (command.action === "hide" && command.category) body.category = command.category;
    if (command.reportId) body.report_id = command.reportId;

    let response: Response;
    try {
      response = await fetch(`${getBaseUrl()}/admin/reviews/${encodeURIComponent(id)}/moderate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ReviewError("unavailable", "Network error when moderating review");
    }
    if (!response.ok) await throwReviewResponseError(response);
    const payload: unknown = await response.json();
    const parsed = apiReviewModerationResultSchema.safeParse(payload);
    if (!parsed.success) throw new Error("Invalid review moderation result");
    return mapReviewModerationResult(payload);
  },
};
