import { beforeEach, expect, it, vi } from "vitest";
import { GET } from "./route";
const verify = vi.hoisted(() => vi.fn());
vi.mock("@/application/auth/verify-admin-access", () => ({ verifyAdminAccess: verify }));
beforeEach(() => vi.resetAllMocks());
it("returns only the verified identity and disables all response caching", async () => {
  const profile = { id: 1, firstName: "Ana", lastName: "Pérez", email: "ana@example.com", role: "admin" };
  verify.mockResolvedValue(profile);
  const response = await GET();
  expect(await response.json()).toEqual({ status: "ready", profile });
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});
it("does not expose exception details or protected content", async () => {
  verify.mockRejectedValue(new Error("secret token"));
  const response = await GET();
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({ status: "unavailable" });
});
it("returns a safe uncached authentication requirement", async () => {
  const { AccessError } = await import("@/domain/auth/access-error");
  verify.mockRejectedValue(new AccessError("unauthenticated"));
  const response = await GET();
  expect(response.status).toBe(401);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(await response.json()).toEqual({ status: "unauthenticated" });
});

it("distinguishes an invalid authentication from a missing session", async () => {
  const { AccessError } = await import("@/domain/auth/access-error");
  verify.mockRejectedValue(new AccessError("sessionExpired"));
  const response = await GET();
  expect(response.status).toBe(401);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(await response.json()).toEqual({ status: "sessionExpired" });
});
