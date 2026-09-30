import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProviderDiagnosticAction } from "@/app/(dashboard)/usuarios/actions";
import { getProviderDiagnostic } from "@/application/users/get-provider-diagnostic";
import { UserError } from "@/domain/users/user-error";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

vi.mock("@/application/users/get-provider-diagnostic", () => ({ getProviderDiagnostic: vi.fn() }));
vi.mock("@/infrastructure/repositories/api-user-repository", () => ({
  apiUserRepository: {},
}));
vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: { getAccessToken: vi.fn() },
}));

describe("getProviderDiagnosticAction user-facing errors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authSession.getAccessToken).mockResolvedValue("test-token");
  });

  it.each([
    new Error("Failed to fetch: 404"),
    new Error("Invalid provider diagnostic data"),
    new Error("fetch failed"),
    "unexpected failure",
    new UserError("unavailable", "Internal service details"),
  ])("returns safe Spanish guidance for %s", async (error) => {
    vi.mocked(getProviderDiagnostic).mockRejectedValue(error);

    expect(await getProviderDiagnosticAction(2)).toEqual({
      success: false,
      error: translations.users.diagnostic.error,
    });
  });

  it("preserves the permission-specific message", async () => {
    vi.mocked(getProviderDiagnostic).mockRejectedValue(new UserError("forbidden", "Forbidden: 403"));

    expect(await getProviderDiagnosticAction(2)).toEqual({
      success: false,
      error: translations.users.diagnostic.forbidden,
      isForbidden: true,
    });
  });
  it("preserves the provider-not-found message", async () => {
    vi.mocked(getProviderDiagnostic).mockRejectedValue(new UserError("not_found", "Internal resource details"));

    expect(await getProviderDiagnosticAction(2)).toEqual({
      success: false,
      error: translations.users.diagnostic.notFound,
      isNotFound: true,
    });
  });
});
