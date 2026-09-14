import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useAdminAccess } from "./use-admin-access";
const query = vi.hoisted(() => vi.fn());
vi.mock("@/infrastructure/auth/query-admin-access", () => ({ queryAdminAccess: query }));
beforeEach(() => vi.resetAllMocks());
it("remains pending until verification settles", async () => {
  let resolve!: (value: { status: "unavailable" }) => void;
  query.mockImplementation(() => new Promise(r => { resolve = r; }));
  const { result } = renderHook(() => useAdminAccess());
  expect(result.current.status).toBe("pending");
  await act(async () => resolve({ status: "unavailable" }));
  await waitFor(() => expect(result.current.status).toBe("unavailable"));
});
it("aborts its request on unmount and ignores late completion", async () => {
  let signal!: AbortSignal;
  query.mockImplementation((value: AbortSignal) => { signal = value; return new Promise(() => {}); });
  const { unmount } = renderHook(() => useAdminAccess());
  unmount();
  expect(signal.aborted).toBe(true);
});
it("starts a fresh verification instead of reusing identity after remount", async () => {
  const profile = { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" };
  query.mockResolvedValueOnce({ status: "ready", profile });
  const first = renderHook(() => useAdminAccess());
  await waitFor(() => expect(first.result.current.status).toBe("ready"));
  first.unmount();
  query.mockImplementationOnce(() => new Promise(() => {}));
  const second = renderHook(() => useAdminAccess());
  expect(second.result.current.status).toBe("pending");
  expect(query).toHaveBeenCalledTimes(2);
});
it("retries only an unavailable verification and prevents duplicate requests", async () => {
  query.mockResolvedValueOnce({ status: "unavailable" });
  query.mockImplementationOnce(() => new Promise(() => {}));
  const { result } = renderHook(() => useAdminAccess());
  await waitFor(() => expect(result.current.status).toBe("unavailable"));
  act(() => { result.current.retry(); result.current.retry(); });
  expect(result.current.status).toBe("pending");
  expect(query).toHaveBeenCalledTimes(2);
});
it("keeps denied states stable when retry is invoked", async () => {
  query.mockResolvedValue({ status: "forbidden" });
  const { result } = renderHook(() => useAdminAccess());
  await waitFor(() => expect(result.current.status).toBe("forbidden"));
  act(() => result.current.retry());
  expect(result.current.status).toBe("forbidden");
  expect(query).toHaveBeenCalledTimes(1);
});
it("discards late identity results from an unmounted verification", async () => {
  let resolve!: (value: { status: "ready"; profile: { id: number; firstName: string; lastName: string; email: string; role: "admin" } }) => void;
  query.mockImplementationOnce(() => new Promise(r => { resolve = r; }));
  const first = renderHook(() => useAdminAccess());
  first.unmount();
  query.mockResolvedValueOnce({ status: "unavailable" });
  const second = renderHook(() => useAdminAccess());
  await waitFor(() => expect(second.result.current.status).toBe("unavailable"));
  await act(async () => resolve({ status: "ready", profile: { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" } }));
  expect(second.result.current.status).toBe("unavailable");
});
it.each([new Error("network failure"), new DOMException("Timed out", "TimeoutError")])("shows an unavailable state for a failed browser request without automatic retries: %s", async error => {
  query.mockRejectedValue(error);
  const { result } = renderHook(() => useAdminAccess());
  await waitFor(() => expect(result.current.status).toBe("unavailable"));
  expect(query).toHaveBeenCalledTimes(1);
});
it("replaces a temporary failure with a freshly verified administrator on retry", async () => {
  const profile = { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" };
  query.mockResolvedValueOnce({ status: "unavailable" }).mockResolvedValueOnce({ status: "ready", profile });
  const { result } = renderHook(() => useAdminAccess());
  await waitFor(() => expect(result.current.status).toBe("unavailable"));
  act(() => result.current.retry());
  await waitFor(() => expect(result.current).toMatchObject({ status: "ready", profile }));
  expect(query).toHaveBeenCalledTimes(2);
  const firstSignal: AbortSignal = query.mock.calls[0][0];
  expect(firstSignal.aborted).toBe(true);
});
