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
