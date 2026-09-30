import { beforeEach, describe, expect, it, vi } from "vitest";
import { getPaymentsAction } from "@/app/(dashboard)/pagos/actions";
import { getPayments } from "@/application/payments/get-payments";
import { PaymentError } from "@/domain/payments/payment-error";
import { authSession } from "@/infrastructure/auth/auth-session";
import { translations } from "@/infrastructure/i18n/translations";

vi.mock("@/application/payments/get-payments", () => ({ getPayments: vi.fn() }));
vi.mock("@/infrastructure/repositories/api-payment-repository", () => ({
  apiPaymentRepository: {},
}));
vi.mock("@/infrastructure/auth/auth-session", () => ({
  authSession: { getAccessToken: vi.fn() },
}));

describe("getPaymentsAction user-facing errors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(authSession.getAccessToken).mockResolvedValue("test-token");
  });

  it.each([
    new Error("Failed to fetch: 404"),
    new Error("Invalid response with internal details"),
    new Error("fetch failed"),
    "unexpected failure",
    new PaymentError("unavailable", "Internal service details"),
  ])("returns safe Spanish guidance for %s", async (error) => {
    vi.mocked(getPayments).mockRejectedValue(error);

    expect(await getPaymentsAction()).toEqual({
      success: false,
      error: translations.payments.error,
    });
  });

  it("preserves the permission-specific message", async () => {
    vi.mocked(getPayments).mockRejectedValue(new PaymentError("forbidden", "Forbidden: 403"));

    expect(await getPaymentsAction()).toEqual({
      success: false,
      error: translations.payments.forbidden,
      isForbidden: true,
    });
  });
});
