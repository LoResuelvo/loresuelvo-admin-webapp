import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuditLogsAction } from "@/app/(dashboard)/auditoria/actions";
import { getAuditLogs } from "@/application/audit/get-audit-logs";
import { AuditError } from "@/domain/audit/audit-error";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

vi.mock("@/application/audit/get-audit-logs", () => ({ getAuditLogs: vi.fn() }));
vi.mock("@/infrastructure/repositories/api-audit-repository", () => ({
  apiAuditRepository: {},
}));
vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: { getAccessToken: vi.fn() },
}));

describe("getAuditLogsAction user-facing errors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authSession.getAccessToken).mockResolvedValue("test-token");
  });

  it.each([
    new Error("Failed to fetch: 404"),
    new Error("Invalid response with internal details"),
    new Error("fetch failed"),
    "unexpected failure",
    new AuditError("unavailable", "Internal service details"),
  ])("returns safe Spanish guidance for %s", async (error) => {
    vi.mocked(getAuditLogs).mockRejectedValue(error);

    expect(await getAuditLogsAction()).toEqual({
      success: false,
      error: translations.audit.error,
    });
  });

  it("preserves the permission-specific message", async () => {
    vi.mocked(getAuditLogs).mockRejectedValue(new AuditError("forbidden", "Forbidden: 403"));

    expect(await getAuditLogsAction()).toEqual({
      success: false,
      error: translations.audit.forbidden,
      isForbidden: true,
    });
  });
});
