import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import type { ReviewModerationItem, ReviewStatus } from "@/domain/reviews/review-moderation";
import { getReviewsAction, moderateReviewAction } from "@/app/(dashboard)/moderacion/actions";
import { useModerationState } from "./use-moderation-state";
vi.mock("@/app/(dashboard)/moderacion/actions", () => ({ getReviewsAction: vi.fn(), moderateReviewAction: vi.fn() }));
const review: ReviewModerationItem = { id: "r1", createdAt: "2026-01-01", operationId: 1, authorName: "Ana", providerName: "Luis", rating: 1, comment: "Comentario", status: "reported" };
function deferred<T>() { let resolve!: (value: T) => void; let reject!: (reason: Error) => void; const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
beforeEach(() => vi.resetAllMocks());
it.each<ReviewStatus | undefined>(["reported", "visible", undefined])("rechecks membership after hide under %s", async (status) => {
 const item = { ...review, status: status ?? "reported" };
 const { result } = renderHook(() => useModerationState({ initialReviews: [item], initialStatus: status }));
 vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: { ...item, status: "hidden" } });
 act(() => result.current.openModerateModal(item));
 await act(() => result.current.submitModerate({ category: "spam", reason: "Spam reiterado" }));
 expect(result.current.reviews).toEqual(status ? [] : [{ ...item, status: "hidden" }]);
});
it("removes restored review from hidden filter", async () => {
 const item = { ...review, status: "hidden" as const };
 const { result } = renderHook(() => useModerationState({ initialReviews: [item], initialStatus: "hidden" }));
 vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: { ...review, status: "visible" } });
 await act(() => result.current.restoreReview(item));
 expect(result.current.reviews).toEqual([]);
});
it.each(["success", "error", "rejection"])("ignores stale %s responses and loading after filter changes", async (outcome) => {
 const older = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
 const latest = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
 vi.mocked(getReviewsAction).mockReturnValueOnce(older.promise).mockReturnValueOnce(latest.promise);
 const { result } = renderHook(() => useModerationState());
 act(() => result.current.setStatusFilter("hidden"));
 await waitFor(() => expect(getReviewsAction).toHaveBeenCalledTimes(2));
 await act(async () => { if (outcome === "rejection") older.reject(new Error("old")); else older.resolve(outcome === "success" ? { success: true, data: [review] } : { success: false, error: "old", isForbidden: true }); });
 expect(result.current.isLoading).toBe(true); expect(result.current.error).toBeNull(); expect(result.current.isForbidden).toBe(false);
 await act(async () => latest.resolve({ success: true, data: [{ ...review, status: "hidden" }] }));
 expect(result.current.reviews[0].status).toBe("hidden");
});
it("preserves confirmed moderation when an in-flight filter snapshot arrives", async () => {
 const load = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
 vi.mocked(getReviewsAction).mockReturnValue(load.promise);
 const { result } = renderHook(() => useModerationState({ initialReviews: [review], initialStatus: "reported" }));
 act(() => result.current.openModerateModal(review));
 act(() => result.current.setStatusFilter("hidden"));
 await waitFor(() => expect(getReviewsAction).toHaveBeenCalledWith("hidden"));
 vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: { ...review, status: "hidden" } });
 await act(() => result.current.submitModerate({ category: "spam", reason: "Spam reiterado" }));
 await act(async () => load.resolve({ success: true, data: [] }));
 expect(result.current.reviews).toEqual([{ ...review, status: "hidden" }]);
});
it("keeps the completed current filter when an older response arrives last", async () => {
 const older = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
 vi.mocked(getReviewsAction).mockReturnValueOnce(older.promise).mockResolvedValueOnce({ success: true, data: [{ ...review, status: "hidden" }] });
 const { result } = renderHook(() => useModerationState());
 act(() => result.current.setStatusFilter("hidden"));
 await waitFor(() => expect(result.current.isLoading).toBe(false));
 await act(async () => older.resolve({ success: false, error: "stale", isForbidden: true }));
 expect(result.current.reviews[0].status).toBe("hidden");
 expect(result.current.error).toBeNull();
 expect(result.current.isForbidden).toBe(false);
});
it("allows a subsequent reload to replace earlier confirmed local moderation", async () => {
 const { result } = renderHook(() => useModerationState({ initialReviews: [review] }));
 act(() => result.current.openModerateModal(review));
 vi.mocked(moderateReviewAction).mockResolvedValue({ success: true, data: { ...review, status: "hidden" } });
 await act(() => result.current.submitModerate({ category: "spam", reason: "Spam reiterado" }));
 vi.mocked(getReviewsAction).mockResolvedValue({ success: true, data: [{ ...review, status: "visible" }] });
 await act(() => result.current.reload());
 expect(result.current.reviews[0].status).toBe("visible");
});
it("invalidates a pending load on unmount", async () => {
 const pending = deferred<Awaited<ReturnType<typeof getReviewsAction>>>();
 vi.mocked(getReviewsAction).mockReturnValue(pending.promise);
 const { result, unmount } = renderHook(() => useModerationState());
 const beforeUnmount = result.current;
 unmount();
 await act(async () => pending.resolve({ success: false, error: "late", isForbidden: true }));
 expect(result.current).toBe(beforeUnmount);
});
