import { afterEach, describe, expect, it, vi } from "vitest";
import { PaymentError } from "@/domain/payments/payment-error";
import { apiPaymentRepository } from "./api-payment-repository";

describe("apiPaymentRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  const sampleListResponse = {
    items: [
      {
        id: 1,
        external_payment_id: "pay_1",
        external_reference: "REF_1",
        purpose: "deposit",
        status: "approved",
        service_proposal_id: 10,
        work_order_id: null,
        consumer: { id: 1, name: "Consumer A", email: "a@test.com" },
        provider: { id: 2, name: "Provider B", email: "b@test.com" },
        currency: "ARS",
        service_amount_cents: 100000,
        seller_amount_cents: 85000,
        platform_fee_cents: 15000,
        total_amount_cents: 100000,
        created_at: "2026-09-20T10:00:00Z",
        verified_at: "2026-09-20T10:05:00Z",
      },
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 1,
      total_pages: 1,
    },
  };

  it("calls /admin/payments with auth bearer token and parses list", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleListResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiPaymentRepository.getPayments("my-token", {
      query: "REF_1",
      purpose: "deposit",
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/admin/payments?query=REF_1&purpose=deposit",
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0].externalReference).toBe("REF_1");
  });

  it("throws error when API_URL is missing", async () => {
    vi.stubEnv("API_URL", "");
    await expect(apiPaymentRepository.getPayments("token")).rejects.toThrow("API_URL is not configured");
  });

  it("throws PaymentError('forbidden') on 403 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Forbidden", { status: 403 })));

    await expect(apiPaymentRepository.getPayments("token")).rejects.toThrow(PaymentError);
  });

  it("throws PaymentError('unavailable') on 500 response", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Server error", { status: 500 })));

    await expect(apiPaymentRepository.getPayments("token")).rejects.toThrow(PaymentError);
  });
});
