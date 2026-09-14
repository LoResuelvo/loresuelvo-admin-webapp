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

it.each(["missing_refresh_token", "session_expired", "missing_session"])("requires authentication for SDK %s", async code => {
  const { AccessTokenError } = await import("@auth0/nextjs-auth0/errors");
  sdk.getSession.mockResolvedValue({ user: { sub: "auth0|admin" } });
  sdk.getAccessToken.mockRejectedValue(new AccessTokenError(code, "private detail"));
  await expect(authSession.getAccessToken()).rejects.toThrow("sessionExpired");
  expect(sdk.getAccessToken).toHaveBeenCalledTimes(1);
});
it("requires authentication when the refresh grant is invalid", async () => {
  const { AccessTokenError, OAuth2Error } = await import("@auth0/nextjs-auth0/errors");
  sdk.getSession.mockResolvedValue({ user: { sub: "auth0|admin" } });
  sdk.getAccessToken.mockRejectedValue(new AccessTokenError("failed_to_refresh_token", "private detail", new OAuth2Error({ code: "invalid_grant", message: "revoked token" })));
  await expect(authSession.getAccessToken()).rejects.toThrow("sessionExpired");
});
it.each(["invalid_client", "server_error", "unknown_error"])("does not treat refresh %s as invalid authentication", async code => {
  const { AccessTokenError, OAuth2Error } = await import("@auth0/nextjs-auth0/errors");
  sdk.getSession.mockResolvedValue({ user: { sub: "auth0|admin" } });
  const error = new AccessTokenError("failed_to_refresh_token", "private detail", new OAuth2Error({ code, message: "private" }));
  sdk.getAccessToken.mockRejectedValue(error);
  await expect(authSession.getAccessToken()).rejects.toBe(error);
});
it("does not misclassify unrelated SDK failures", async () => {
  sdk.getSession.mockResolvedValue({ user: { sub: "auth0|admin" } });
  const error = new Error("configuration unavailable");
  sdk.getAccessToken.mockRejectedValue(error);
  await expect(authSession.getAccessToken()).rejects.toBe(error);
});
it("rejects an empty token after an authenticated session", async () => {
  sdk.getSession.mockResolvedValue({ user: { sub: "auth0|admin" } });
  sdk.getAccessToken.mockResolvedValue({ token: "" });
  await expect(authSession.getAccessToken()).rejects.toThrow("sessionExpired");
});
