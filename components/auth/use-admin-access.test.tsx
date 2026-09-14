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
  expect(second.result.current).toEqual({ status: "pending" });
  expect(query).toHaveBeenCalledTimes(2);
});
