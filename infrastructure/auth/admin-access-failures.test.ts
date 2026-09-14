import { afterEach, expect, it, vi } from "vitest";
import { GET } from "@/app/api/admin/access/route";

vi.mock("@/infrastructure/auth/auth-session", () => ({ authSession: { getAccessToken: async () => "server-only-token" } }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it.each([
  ["network failure", () => Promise.reject(new Error("private network details"))],
  ["server failure", () => Promise.resolve(new Response("private failure", { status: 500 }))],
  ["invalid JSON", () => Promise.resolve(new Response("not json"))],
  ["incompatible profile", () => Promise.resolve(Response.json({ id: 1, role: "admin" }))],
  ["unknown role", () => Promise.resolve(Response.json({ id: 1, name: "Ana", surname: "Pérez", email: "ana@example.com", role: "unknown", calendar_connection_status: "disconnected" }))],
] as const)("returns a safe retryable result for %s through the server pipeline", async (_label, respond) => {
  vi.stubEnv("API_URL", "https://api.example.com");
  const fetcher = vi.fn(respond);
  vi.stubGlobal("fetch", fetcher);
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(await response.json()).toEqual({ status: "unavailable" });
  expect(fetcher).toHaveBeenCalledTimes(1);
});
