import { providerDiagnosticFixture } from "../../features/users/provider_diagnostic_fixture";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserError } from "@/domain/users/user-error";
import { fetchProviderDiagnostic } from "./api-provider-diagnostic";

describe("fetchProviderDiagnostic", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleDiagnosticDto = providerDiagnosticFixture;

  it("requests /admin/providers/:id/diagnostic with bearer token and returns mapped entity", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleDiagnosticDto)));
    vi.stubGlobal("fetch", fetcher);

    const result = await fetchProviderDiagnostic("test-token", 201);

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/providers/201/diagnostic",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer test-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result.id).toBe(201);
    expect(result.name).toBe("Juan");
    expect(result.category.name).toBe("Plomería");
    expect(result.paymentConnection.isConnected).toBe(true);
  });

  it("throws forbidden UserError when API returns 403", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(fetchProviderDiagnostic("test-token", 201)).rejects.toThrow(
      new UserError("forbidden", "Forbidden"),
    );
  });

  it("throws not_found UserError when API returns 404", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Not Found", { status: 404 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(fetchProviderDiagnostic("test-token", 201)).rejects.toThrow(
      new UserError("not_found", "Provider not found"),
    );
  });

  it("throws unavailable UserError when API returns 500", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response("Server Error", { status: 500 }));
    vi.stubGlobal("fetch", fetcher);

    await expect(fetchProviderDiagnostic("test-token", 201)).rejects.toThrow(
      new UserError("unavailable", "Failed to fetch provider diagnostic: 500"),
    );
  });
});
