import { afterEach, describe, expect, it, vi } from "vitest";

const construct = vi.hoisted(() => vi.fn());
vi.mock("@auth0/nextjs-auth0/server", () => ({ Auth0Client: class { constructor(options: unknown) { construct(options); } } }));

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); construct.mockClear(); });

describe("administrator authentication configuration", () => {
  it("keeps tokens server-side and isolates administrator cookies", async () => {
    vi.stubEnv("APP_URL", "http://localhost:3000");
    vi.stubEnv("AUTH0_DOMAIN", "admin.example.com");
    vi.stubEnv("AUTH0_CLIENT_ID", "admin-client");
    vi.stubEnv("AUTH0_CLIENT_SECRET", "test-client-secret");
    vi.stubEnv("AUTH0_AUDIENCE", "https://api.example.com");
    vi.stubEnv("AUTH0_SECRET", "a".repeat(64));
    const { getAuth0 } = await import("./auth0");
    getAuth0();
    expect(construct).toHaveBeenCalledWith(expect.objectContaining({
      appBaseUrl: "http://localhost:3000",
      authorizationParameters: { audience: "https://api.example.com", scope: "openid profile email offline_access" },
      signInReturnToPath: "/admin",
      enableAccessTokenEndpoint: false,
      session: expect.objectContaining({ cookie: expect.objectContaining({ name: "__admin_session" }) }),
      transactionCookie: expect.objectContaining({ prefix: "__admin_transaction_" }),
    }));
  });

  it("rejects missing server configuration without including its values", async () => {
    vi.stubEnv("AUTH0_CLIENT_SECRET", "");
    const { getAuth0 } = await import("./auth0");
    expect(() => getAuth0()).toThrow("Authentication is not configured");
    expect(construct).not.toHaveBeenCalled();
  });
});
