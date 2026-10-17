import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type {
  ReviewModerationDetail,
  ReviewModerationItem,
  ReviewModerationResult,
  ReviewListFilter,
} from "@/domain/reviews/review-moderation";
import {
  getReviewDetailAction,
  getReviewsAction,
  moderateReviewAction,
} from "@/app/(dashboard)/moderacion/actions";
import { useModerationState } from "./use-moderation-state";

vi.mock("@/app/(dashboard)/moderacion/actions", () => ({
  getReviewDetailAction: vi.fn(),
  getReviewsAction: vi.fn(),
  moderateReviewAction: vi.fn(),
}));

const review: ReviewModerationItem = {
  id: "101", consumerId: 10, providerId: 20, operationId: "work_order-101", rating: 1,
  visibility: "visible", version: 3, pendingReportCount: 1,
  reportedOn: "2026-09-25T14:00:00Z",
};

function detail(item: ReviewModerationItem): ReviewModerationDetail {
  return {
    review: item,
    description: "Comentario disponible al consultar el detalle",
    report: item.pendingReportCount > 0 ? {
      id: 501,
      category: "spam_advertising",
      explanation: "Reporte pendiente",
      status: "pending",
      createdOn: "2026-09-25T14:00:00Z",
    } : null,
    decisions: { items: [], page: 1, limit: 20, total: 0, hasMore: false },
  };
}

function moderationResult(visibility: "visible" | "hidden", version: number): ReviewModerationResult {
  return { id: review.id, visibility, version, decisionId: 89 };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

beforeEach(() => vi.resetAllMocks());

it.each<ReviewListFilter | undefined>(["reported", "visible", undefined])(
  "applies a confirmed hide against the current %s filter",
  async (status) => {
    const item: ReviewModerationItem = status === "visible"
      ? { ...review, pendingReportCount: 0, reportedOn: null }
      : review;
    vi.mocked(getReviewDetailAction).mockResolvedValue({ success: true, data: detail(item) });
    vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: moderationResult("hidden", 4) });
    const { result } = renderHook(() => useModerationState({ initialReviews: [item], initialStatus: status }));

    await act(async () => result.current.openModerateModal(item));
    await act(async () => result.current.submitModerate({ category: "spam_advertising", reason: "Spam reiterado" }));
    expect(result.current.reviews).toEqual(status ? [] : [{
      ...item,
      visibility: "hidden",
      version: 4,
      pendingReportCount: 0,
    }]);
    expect(moderateReviewAction).toHaveBeenCalledWith("101", {
      action: "hide",
      category: "spam_advertising",
      reason: "Spam reiterado",
      expectedVersion: 3,
      ...(item.pendingReportCount > 0 ? { reportId: 501 } : {}),
    });
  },
);

it("removes a restored review from the hidden filter after confirmation", async () => {
  const hidden = { ...review, visibility: "hidden" as const, pendingReportCount: 0, version: 4 };
  vi.mocked(getReviewDetailAction).mockResolvedValue({ success: true, data: detail(hidden) });
  vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: moderationResult("visible", 5) });
  const { result } = renderHook(() => useModerationState({ initialReviews: [hidden], initialStatus: "hidden" }));

  await act(async () => result.current.openRestoreModal(hidden));
  await act(async () => result.current.submitModerate({ reason: "Restablecimiento solicitado" }));
  expect(result.current.reviews).toEqual([]);
  expect(moderateReviewAction).toHaveBeenCalledWith("101", {
    action: "unhide",
    reason: "Restablecimiento solicitado",
    expectedVersion: 4,
  });
});

it.each(["success", "error", "rejection"] as const)("ignores stale %s list responses", async (outcome) => {
  const older = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
  const latest = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
  vi.mocked(getReviewsAction).mockReturnValueOnce(older.promise).mockReturnValueOnce(latest.promise);
  const { result } = renderHook(() => useModerationState());
  act(() => result.current.setStatusFilter("hidden"));
  await waitFor(() => expect(getReviewsAction).toHaveBeenCalledTimes(2));

  await act(async () => {
    if (outcome === "rejection") older.reject(new Error("old"));
    else older.resolve(outcome === "success"
      ? { success: true, data: [review] }
      : { success: false, error: "old", isForbidden: true });
  });
  expect(result.current.isLoading).toBe(true);
  expect(result.current.error).toBeNull();
  expect(result.current.isForbidden).toBe(false);

  await act(async () => latest.resolve({ success: true, data: [{ ...review, visibility: "hidden" }] }));
  expect(result.current.reviews[0].visibility).toBe("hidden");
});

it("preserves confirmed moderation when an in-flight filter snapshot arrives", async () => {
  const load = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
  vi.mocked(getReviewsAction).mockReturnValue(load.promise);
  vi.mocked(getReviewDetailAction).mockResolvedValue({ success: true, data: detail(review) });
  const { result } = renderHook(() => useModerationState({ initialReviews: [review], initialStatus: "reported" }));
  await act(async () => result.current.openModerateModal(review));
  act(() => result.current.setStatusFilter("hidden"));
  await waitFor(() => expect(getReviewsAction).toHaveBeenCalledWith("hidden"));
  vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: moderationResult("hidden", 4) });
  await act(async () => result.current.submitModerate({ category: "spam_advertising", reason: "Spam reiterado" }));
  await act(async () => load.resolve({ success: true, data: [] }));
  expect(result.current.reviews).toEqual([{
    ...review,
    visibility: "hidden",
    version: 4,
    pendingReportCount: 0,
  }]);
});

it("keeps the newest selected filter when an older response arrives last", async () => {
  const older = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
  vi.mocked(getReviewsAction).mockReturnValueOnce(older.promise).mockResolvedValueOnce({
    success: true,
    data: [{ ...review, visibility: "hidden" }],
  });
  const { result } = renderHook(() => useModerationState());
  act(() => result.current.setStatusFilter("hidden"));
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  await act(async () => older.resolve({ success: false, error: "stale", isForbidden: true }));
  expect(result.current.reviews[0].visibility).toBe("hidden");
  expect(result.current.error).toBeNull();
  expect(result.current.isForbidden).toBe(false);
});

it("allows a later reload to replace locally confirmed moderation state", async () => {
  vi.mocked(getReviewDetailAction).mockResolvedValue({ success: true, data: detail(review) });
  const { result } = renderHook(() => useModerationState({ initialReviews: [review] }));
  await act(async () => result.current.openModerateModal(review));
  vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: moderationResult("hidden", 4) });
  await act(async () => result.current.submitModerate({ category: "spam_advertising", reason: "Spam reiterado" }));
  vi.mocked(getReviewsAction).mockResolvedValue({ success: true, data: [review] });
  await act(async () => result.current.reload());
  expect(result.current.reviews[0].pendingReportCount).toBe(1);
});

it("invalidates an in-flight list request after unmount", async () => {
  const pending = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
  vi.mocked(getReviewsAction).mockReturnValue(pending.promise);
  const { result, unmount } = renderHook(() => useModerationState());
  const beforeUnmount = result.current;
  unmount();
  await act(async () => pending.resolve({ success: false, error: "late", isForbidden: true }));
  expect(result.current).toBe(beforeUnmount);
});
