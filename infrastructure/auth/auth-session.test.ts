import { beforeEach, expect, it, vi } from "vitest";
import { authSession } from "./auth-session";
const sdk = vi.hoisted(() => ({ getSession: vi.fn(), getAccessToken: vi.fn() }));
vi.mock("./auth0", () => ({ getAuth0: () => sdk }));
beforeEach(() => vi.resetAllMocks());
it("does not request a token without an authenticated session", async () => {
  sdk.getSession.mockResolvedValue(null);
  await expect(authSession.getAccessToken()).rejects.toThrow("unauthenticated");
  expect(sdk.getAccessToken).not.toHaveBeenCalled();
});
it("gets the access token from the server SDK after session validation", async () => {
  sdk.getSession.mockResolvedValue({ user: { sub: "auth0|admin" } });
  sdk.getAccessToken.mockResolvedValue({ token: "api-access-token" });
  await expect(authSession.getAccessToken()).resolves.toBe("api-access-token");
});
