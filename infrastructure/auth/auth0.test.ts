import type { Auth0Client } from "@auth0/nextjs-auth0/server";
import { InvalidStateError } from "@auth0/nextjs-auth0/errors";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

type ClientOptions = NonNullable<ConstructorParameters<typeof Auth0Client>[0]>;
const construct = vi.hoisted(() => vi.fn<(options: ClientOptions) => void>());
vi.mock("@auth0/nextjs-auth0/server", () => ({ Auth0Client: class { constructor(options: ClientOptions) { construct(options); } } }));

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); construct.mockClear(); });

describe("administrator authentication configuration", () => {
  it("keeps tokens server-side and isolates administrator cookies", async () => {
    vi.stubEnv("APP_URL", "http://localhost:3000");
    vi.stubEnv("AUTH0_DOMAIN", "admin.example.com");
    vi.stubEnv("AUTH0_CLIENT_ID", "admin-client");
    vi.stubEnv("AUTH0_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("AUTH0_AUDIENCE", "https://api.example.com");
    vi.stubEnv("AUTH0_CONNECTION", "admin-users");
    vi.stubEnv("AUTH0_SECRET", "a".repeat(64));
    const { getAuth0 } = await import("./auth0");
    getAuth0();
    expect(construct).toHaveBeenCalledWith(expect.objectContaining({
      appBaseUrl: "http://localhost:3000",
      authorizationParameters: {
        audience: "https://api.example.com",
        connection: "admin-users",
        scope: "openid profile email offline_access",
      },
      signInReturnToPath: "/admin",
      enableAccessTokenEndpoint: false,
      session: expect.objectContaining({ cookie: expect.objectContaining({ name: "__admin_session" }) }),
      transactionCookie: expect.objectContaining({ prefix: "__admin_transaction_" }),
    }));
  });

  it("pins login requests to the configured administrator connection", async () => {
    vi.stubEnv("AUTH0_CONNECTION", "admin-users");
    const { enforceAdminConnection } = await import("./auth0");
    const request = new NextRequest("https://admin.example.com/auth/login?connection=consumer-users&prompt=login");

    const securedRequest = enforceAdminConnection(request);

    expect(securedRequest.nextUrl.searchParams.get("connection")).toBe("admin-users");
    expect(securedRequest.nextUrl.searchParams.get("prompt")).toBe("login");
    expect(request.nextUrl.searchParams.get("connection")).toBe("consumer-users");
  });

  it("rejects missing server configuration without including its values", async () => {
    vi.stubEnv("AUTH0_CLIENT_SECRET", "");
    const { getAuth0 } = await import("./auth0");
    expect(() => getAuth0()).toThrow("Authentication is not configured");
    expect(construct).not.toHaveBeenCalled();
  });

  it("rejects a missing administrator connection", async () => {
    vi.stubEnv("APP_URL", "http://localhost:3000");
    vi.stubEnv("AUTH0_DOMAIN", "admin.example.com");
    vi.stubEnv("AUTH0_CLIENT_ID", "admin-client");
    vi.stubEnv("AUTH0_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("AUTH0_AUDIENCE", "https://api.example.com");
    vi.stubEnv("AUTH0_CONNECTION", "");
    vi.stubEnv("AUTH0_SECRET", "a".repeat(64));
    const { getAuth0 } = await import("./auth0");

    expect(() => getAuth0()).toThrow("Authentication is not configured");
    expect(construct).not.toHaveBeenCalled();
  });
});

it("returns callback failures safely and keeps successful callbacks on the administrator route", async () => {
  vi.stubEnv("APP_URL", "https://admin.example.com");
  vi.stubEnv("AUTH0_DOMAIN", "tenant.example.com");
  vi.stubEnv("AUTH0_CLIENT_ID", "admin-client");
  vi.stubEnv("AUTH0_CLIENT_SECRET", "test-client-secret");
  vi.stubEnv("AUTH0_AUDIENCE", "https://api.example.com");
  vi.stubEnv("AUTH0_CONNECTION", "admin-users");
  vi.stubEnv("AUTH0_SECRET", "a".repeat(64));
  const { getAuth0 } = await import("./auth0");
  getAuth0();
  const callback = construct.mock.calls[0][0].onCallback;
  expect(callback).toBeTypeOf("function");
  if (!callback) throw new Error("Callback was not registered");
  const error = new InvalidStateError();
  error.message = "sensitive-code-token";
  const failure = await callback(error, { returnTo: "https://attacker.test/sensitive" }, null);
  expect(failure.headers.get("location")).toBe("https://admin.example.com/?auth=incomplete");
  expect(await failure.text()).not.toContain("sensitive");
  const success = await callback(null, { returnTo: "https://attacker.test/" }, {
    user: { sub: "auth0|admin" },
    tokenSet: { accessToken: "test-access-token", expiresAt: 9999999999 },
    internal: { sid: "session-id", createdAt: 1 },
  });
  expect(success.headers.get("location")).toBe("https://admin.example.com/admin");
  expect(success.headers.get("cache-control")).toBe("no-store");
});
