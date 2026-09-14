import { afterEach, expect, it, vi } from "vitest";
import { queryAdminAccess } from "./query-admin-access";
afterEach(() => vi.unstubAllGlobals());
it("requests the fixed same-origin boundary without persisting tokens", async () => {
  const profile = { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" };
  const fetcher = vi.fn().mockResolvedValue(Response.json({ status: "ready", profile, token: "not-public" }));
  vi.stubGlobal("fetch", fetcher);
  const signal = new AbortController().signal;
  await expect(queryAdminAccess(signal)).resolves.toEqual({ status: "ready", profile });
  expect(fetcher).toHaveBeenCalledWith("/api/admin/access", { cache: "no-store", credentials: "same-origin", signal });
});
it("rejects invalid ready responses", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "ready", profile: {} })));
  await expect(queryAdminAccess(new AbortController().signal)).resolves.toEqual({ status: "unavailable" });
});
