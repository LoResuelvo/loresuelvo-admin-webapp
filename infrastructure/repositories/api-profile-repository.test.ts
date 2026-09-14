import { afterEach, expect, it, vi } from "vitest";
import { apiProfileRepository } from "./api-profile-repository";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
it("requests only /me with a server token and no cache", async () => {
  vi.stubEnv("API_URL", "https://api.example.com");
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 1, name: "Ana", surname: "Pérez", email: "ana@example.com", role: "admin", calendar_connection_status: "disconnected" })));
  vi.stubGlobal("fetch", fetcher);
  await apiProfileRepository.getProfile("server-token");
  expect(fetcher).toHaveBeenCalledWith("https://api.example.com/me", expect.objectContaining({ cache: "no-store", headers: { Authorization: "Bearer server-token", Accept: "application/json" }, signal: expect.any(AbortSignal) }));
});
it.each([401, 404, 500])("rejects HTTP %i without response details", async status => {
  vi.stubEnv("API_URL", "https://api.example.com");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("sensitive response", { status })));
  await expect(apiProfileRepository.getProfile("token")).rejects.not.toThrow("sensitive response");
});
