import { afterEach, expect, it, vi } from "vitest";
import { verifyAdminAccess } from "@/application/auth/verify-admin-access";
import { apiProfileRepository } from "@/infrastructure/repositories/api-profile-repository";
import { authSession } from "./auth-session";

const sdk = vi.hoisted(() => ({ getSession: vi.fn(), getAccessToken: vi.fn() }));
vi.mock("./auth0", () => ({ getAuth0: () => sdk }));
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("revalidates each session against its own uncached profile", async () => {
  vi.stubEnv("API_URL", "https://api.example.com");
  sdk.getSession.mockResolvedValue({ user: { sub: "not-authoritative" } });
  sdk.getAccessToken.mockResolvedValueOnce({ token: "first-session" }).mockResolvedValueOnce({ token: "second-session" });
  const fetcher = vi.fn().mockImplementation(async (_url: string, options: RequestInit) => {
    const isFirst = new Headers(options.headers).get("Authorization") === "Bearer first-session";
    return Response.json({
      id: isFirst ? 1 : 2, name: isFirst ? "Ana" : "Luis", surname: "Pérez",
      email: isFirst ? "ana@example.com" : "luis@example.com",
      role: "admin", calendar_connection_status: "disconnected",
    });
  });
  vi.stubGlobal("fetch", fetcher);
  const results = await Promise.all([
    verifyAdminAccess(authSession, apiProfileRepository),
    verifyAdminAccess(authSession, apiProfileRepository),
  ]);
  expect(results.map(profile => profile.email)).toEqual(["ana@example.com", "luis@example.com"]);
  expect(sdk.getSession).toHaveBeenCalledTimes(2);
  expect(fetcher).toHaveBeenCalledTimes(2);
  for (const [, options] of fetcher.mock.calls) expect(options.cache).toBe("no-store");
});
