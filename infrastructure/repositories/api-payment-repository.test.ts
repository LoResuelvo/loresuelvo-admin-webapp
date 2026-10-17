import { afterEach, describe, expect, it, vi } from "vitest";
import { PaymentError } from "@/domain/payments/payment-error";
import { apiPaymentRepository } from "./api-payment-repository";

const paymentId = "0f8fad5b-d9cb-469f-a165-70867728950e";
const sampleListResponse = {
  payments: [
    {
      id: paymentId,
      service_proposal_id: 10,
      work_order_id: null,
      consumer_id: 1,
      provider_id: 2,
      purpose: "booking_deposit",
      intent_status: "paid",
      currency: "ARS",
      seller_amount_cents: 85_000,
      platform_fee_cents: 15_000,
      total_amount_cents: 100_000,
      created_on: "2026-09-20T10:00:00Z",
      updated_on: "2026-09-20T10:05:00Z",
      transactions: [],
      breakdown: {
        currency: "ARS",
        service_total_cents: 100_000,
        deposit_cents: 30_000,
        platform_fee_total_cents: 15_000,
        platform_fee_due_now_cents: 4_500,
        booking_payment_deadline: "2026-09-21T10:00:00Z",
        amount_due_now_cents: 34_500,
        remaining_service_balance_cents: 70_000,
        remaining_platform_fee_cents: 10_500,
        remaining_amount_due_cents: 80_500,
      },
      summary: { approved_amounts: [], pending_amount: null, anomalies: [] },
      anomalies: [],
    },
  ],
  page: { limit: 10, next_cursor: null },
};

describe("apiPaymentRepository", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("calls the current admin payments endpoint with only supported query parameters", async () => {
    vi.stubEnv("API_URL", "https://api.example.com");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(sampleListResponse)));
    vi.stubGlobal("fetch", fetcher);

    const result = await apiPaymentRepository.getPayments("my-token", {
      paymentIntentId: paymentId,
      externalReference: paymentId,
      externalPaymentId: "pay 1",
      serviceProposalId: 17,
      consumerEmail: "consumer@example.com",
      providerEmail: "provider@example.com",
      purpose: "booking_deposit",
      intentStatus: "paid",
      createdFrom: "2026-09-01T00:00:00Z",
      createdTo: "2026-10-01T00:00:00Z",
      limit: 10,
      cursor: "signed-cursor",
    });

    const requestUrl = new URL(fetcher.mock.calls[0][0] as string);
    expect(requestUrl.pathname).toBe("/admin/payments");
    expect(Object.fromEntries(requestUrl.searchParams)).toEqual({
      payment_intent_id: paymentId,
      external_reference: paymentId,
      external_payment_id: "pay 1",
      service_proposal_id: "17",
      consumer_email: "consumer@example.com",
      provider_email: "provider@example.com",
      purpose: "booking_deposit",
      intent_status: "paid",
      created_from: "2026-09-01T00:00:00Z",
      created_to: "2026-10-01T00:00:00Z",
      limit: "10",
      cursor: "signed-cursor",
    });
    expect(requestUrl.searchParams.has("query")).toBe(false);
    expect(requestUrl.searchParams.has("status")).toBe(false);
    expect(requestUrl.searchParams.has("page")).toBe(false);
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("https://api.example.com/admin/payments"),
      expect.objectContaining({
        cache: "no-store",
        headers: {
          Authorization: "Bearer my-token",
          Accept: "application/json",
        },
      }),
    );
    expect(result.items[0].id).toBe(paymentId);
    expect(result.page).toEqual({ limit: 10, nextCursor: null });
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
