import type { ReviewListFilter, ReviewModerationItem } from "@/domain/reviews/review-moderation";
import { ReviewError } from "@/domain/reviews/review-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapReviewsList, mapReviewModerationDetail, mapReviewModerationResult } from "./review-mapper";

export async function getE2EReviewsStub(status?: ReviewListFilter): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());

    if (status) {
      const match = stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === `/admin/reviews?status=${encodeURIComponent(status)}` ||
            s.endpoint.includes(`status=${encodeURIComponent(status)}`)),
      );
      if (match) return match;
    }

    return (
      stubs.find(
        (s) =>
          s.method === "GET" &&
          (s.endpoint === "/admin/reviews" ||
            s.endpoint === "/reviews" ||
            s.endpoint.startsWith("/admin/reviews?")),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export async function resolveReviewsFromStub(
  stub: ApiStub,
  status?: ReviewListFilter,
): Promise<ReviewModerationItem[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new ReviewError("forbidden", "Forbidden");
  if (stub.status >= 500) throw new ReviewError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ReviewError("unknown", `Failed: ${stub.status}`);

  let result = mapReviewsList(stub.body);
  if (status && status !== "all") {
    result = result.filter((review) => {
      if (status === "reported") return review.pendingReportCount > 0;
      return review.visibility === status;
    });
  }
  return result;
}

export async function getE2EReviewDetailStub(id: string): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return stubs.find((s) => s.method === "GET" && s.endpoint === `/admin/reviews/${id}`) ?? null;
  } catch {
    return null;
  }
}

export async function resolveReviewDetailFromStub(stub: ApiStub) {
  if (stub.delayMs) await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  if (stub.status === 403) throw new ReviewError("forbidden", "Forbidden");
  if (stub.status === 404) throw new ReviewError("notFound", "Review not found");
  if (stub.status >= 500) throw new ReviewError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ReviewError("unknown", `Failed: ${stub.status}`);
  return mapReviewModerationDetail(stub.body);
}

export async function getE2EModerateReviewStub(id: string): Promise<ApiStub | null> {
  if (process.env.APP_ENV === "production") return null;
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const stubs = parseE2EStubsFromCookies(cookieStore.getAll());
    return (
      stubs.find(
        (s) =>
          s.method === "POST" &&
          (s.endpoint === `/admin/reviews/${id}/moderate` ||
            s.endpoint === `/reviews/${id}/moderate`),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export async function resolveModerateReviewFromStub(stub: ApiStub) {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new ReviewError("forbidden", "Forbidden");
  if (stub.status >= 500) throw new ReviewError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ReviewError("unknown", `Failed: ${stub.status}`);

  return mapReviewModerationResult(stub.body);
}

