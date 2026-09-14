import { afterEach, expect, it, vi } from "vitest";
import { queryAdminAccess } from "./query-admin-access";
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });
it("requests the fixed same-origin boundary without persisting tokens", async () => {
  const profile = { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" };
  const fetcher = vi.fn().mockResolvedValue(Response.json({ status: "ready", profile, token: "not-public" }));
  vi.stubGlobal("fetch", fetcher);
  const signal = new AbortController().signal;
  await expect(queryAdminAccess(signal)).resolves.toEqual({ status: "ready", profile });
  expect(fetcher).toHaveBeenCalledWith("/api/admin/access", { cache: "no-store", credentials: "same-origin", signal: expect.any(AbortSignal) });
});
it("rejects invalid ready responses", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "ready", profile: {} })));
  await expect(queryAdminAccess(new AbortController().signal)).resolves.toEqual({ status: "unavailable" });
});
it("recognizes the authentication boundary without exposing error details", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "unauthenticated", detail: "private" }, { status: 401 })));
  await expect(queryAdminAccess(new AbortController().signal)).resolves.toEqual({ status: "unauthenticated" });
});

it("preserves the safe expired-session result", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "sessionExpired" }, { status: 401 })));
  await expect(queryAdminAccess(new AbortController().signal)).resolves.toEqual({ status: "sessionExpired" });
});
it("rejects an incompatible unauthorized response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "ready" }, { status: 401 })));
  await expect(queryAdminAccess(new AbortController().signal)).resolves.toEqual({ status: "unavailable" });
});
it("recognizes only the validated account provisioning response", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "notProvisioned", detail: "private" }, { status: 404 })));
  await expect(queryAdminAccess(new AbortController().signal)).resolves.toEqual({ status: "notProvisioned" });
});
it("recognizes a validated forbidden response without identity", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "forbidden", profile: { email: "private@example.com" } }, { status: 403 })));
  await expect(queryAdminAccess(new AbortController().signal)).resolves.toEqual({ status: "forbidden" });
});
it.each(["timeout", "caller"])("cancels browser verification on %s", async source => {
  const timeout = new AbortController();
  const timeoutSpy = vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeout.signal);
  const parent = new AbortController();
  let requestSignal!: AbortSignal;
  vi.stubGlobal("fetch", vi.fn((_url, options: RequestInit) => {
    requestSignal = options.signal!;
    return new Promise<Response>((_resolve, reject) => requestSignal.addEventListener("abort", () => reject(requestSignal.reason)));
  }));
  const pending = queryAdminAccess(parent.signal);
  const rejected = expect(pending).rejects.toBeDefined();
  if (source === "timeout") timeout.abort(new DOMException("Request timed out", "TimeoutError"));
  else parent.abort();
  expect(requestSignal.aborted).toBe(true);
  await rejected;
  expect(timeoutSpy).toHaveBeenCalledWith(15_000);
  timeoutSpy.mockRestore();
});
