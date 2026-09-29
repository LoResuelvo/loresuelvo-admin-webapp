import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";
import { ReviewError } from "@/domain/reviews/review-error";
import type { ApiStub } from "@/infrastructure/api/types";
import { parseE2EStubsFromCookies } from "@/infrastructure/api/e2e-stubs-utils";
import { mapReviewsList } from "./review-mapper";

export async function getE2EReviewsStub(status?: ReviewStatus): Promise<ApiStub | null> {
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
  status?: ReviewStatus,
): Promise<ReviewModerationItem[]> {
  if (stub.delayMs) {
    await new Promise((resolve) => setTimeout(resolve, stub.delayMs));
  }
  if (stub.status === 403) throw new ReviewError("forbidden", "Forbidden");
  if (stub.status >= 500) throw new ReviewError("unavailable", `Failed: ${stub.status}`);
  if (stub.status >= 400) throw new ReviewError("unknown", `Failed: ${stub.status}`);

  let result = mapReviewsList(stub.body);
  if (status) {
    result = result.filter((r) => r.status === status);
  }
  return result;
}
