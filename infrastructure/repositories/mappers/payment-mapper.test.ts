import { describe, expect, it } from "vitest";
import { mapPaymentItem, mapPaymentList } from "./payment-mapper";

const validItemDto = {
  id: "0f8fad5b-d9cb-469f-a165-70867728950e",
  service_proposal_id: 100,
  work_order_id: null,
  consumer_id: 1,
  provider_id: 2,
  purpose: "booking_deposit",
  intent_status: "paid",
  currency: "ARS",
  seller_amount_cents: 1_700_000,
  platform_fee_cents: 300_000,
  total_amount_cents: 2_000_000,
  created_on: "2026-09-20T10:00:00Z",
  updated_on: "2026-09-20T10:05:00Z",
  transactions: [
    {
      id: 42,
      processor: "mercado_pago",
      external_payment_id: "pay_ext_123",
      status: "approved",
      currency: "ARS",
      amount_cents: 2_000_000,
      verified_on: "2026-09-20T10:05:00Z",
      created_on: "2026-09-20T10:00:00Z",
      updated_on: "2026-09-20T10:05:00Z",
      processor_fee_cents: null,
      net_settlement_cents: null,
    },
  ],
  breakdown: {
    currency: "ARS",
    service_total_cents: 2_000_000,
    deposit_cents: 500_000,
    platform_fee_total_cents: 300_000,
    platform_fee_due_now_cents: 75_000,
    booking_payment_deadline: "2026-09-21T10:00:00Z",
    amount_due_now_cents: 575_000,
    remaining_service_balance_cents: 1_500_000,
    remaining_platform_fee_cents: 225_000,
    remaining_amount_due_cents: 1_725_000,
  },
  summary: {
    approved_amounts: [{ currency: "ARS", amount_cents: 2_000_000 }],
    pending_amount: null,
    anomalies: [],
  },
  anomalies: [],
};

describe("payment-mapper", () => {
  it("maps the current payment intent DTO to camelCase domain fields", () => {
    const result = mapPaymentItem(validItemDto);

    expect(result).toMatchObject({
      id: "0f8fad5b-d9cb-469f-a165-70867728950e",
      serviceProposalId: 100,
      workOrderId: null,
      consumerId: 1,
      providerId: 2,
      purpose: "booking_deposit",
      status: "paid",
      currency: "ARS",
      sellerAmountCents: 1_700_000,
      platformFeeCents: 300_000,
      totalAmountCents: 2_000_000,
      createdOn: "2026-09-20T10:00:00Z",
      updatedOn: "2026-09-20T10:05:00Z",
      transactions: [
        {
          id: 42,
          processor: "mercado_pago",
          externalPaymentId: "pay_ext_123",
          amountCents: 2_000_000,
          processorFeeCents: null,
          netSettlementCents: null,
        },
      ],
      breakdown: {
        currency: "ARS",
        serviceTotalCents: 2_000_000,
        depositCents: 500_000,
        remainingServiceBalanceCents: 1_500_000,
      },
      summary: {
        approvedAmounts: [{ currency: "ARS", amountCents: 2_000_000 }],
        pendingAmount: null,
        anomalies: [],
      },
      anomalies: [],
    });
  });

  it("maps names and the canonical operation ID while preserving profile IDs", () => {
    const result = mapPaymentItem({
      ...validItemDto,
      consumer_name: "  Ana Rivera  ",
      provider_name: "Mario López",
      operation_id: "jr-123",
    });

    expect(result).toMatchObject({
      consumerId: 1,
      consumerName: "Ana Rivera",
      providerId: 2,
      providerName: "Mario López",
      operationId: "jr-123",
    });
  });

  it("keeps names and operation ID optional for older API responses", () => {
    const result = mapPaymentItem(validItemDto);

    expect(result).toMatchObject({ consumerId: 1, providerId: 2 });
    expect(result.consumerName).toBeUndefined();
    expect(result.providerName).toBeUndefined();
    expect(result.operationId).toBeUndefined();
  });

  it("normalizes blank names and rejects non-canonical operation IDs", () => {
    const result = mapPaymentItem({
      ...validItemDto,
      consumer_name: "   ",
      provider_name: "",
      operation_id: "sp-9",
    });

    expect(result.consumerName).toBeUndefined();
    expect(result.providerName).toBeUndefined();
    expect(result.operationId).toBe("sp-9");
    expect(() => mapPaymentItem({ ...validItemDto, operation_id: "proposal-100" })).toThrow();
  });

  it("maps the API cursor pagination response", () => {
    const result = mapPaymentList({
      payments: [validItemDto],
      page: { limit: 20, next_cursor: "signed-next-cursor" },
    });

    expect(result.items).toHaveLength(1);
    expect(result.page).toEqual({ limit: 20, nextCursor: "signed-next-cursor" });
  });

  it("preserves a null next cursor on the final page", () => {
    const result = mapPaymentList({
      payments: [],
      page: { limit: 20, next_cursor: null },
    });

    expect(result).toEqual({ items: [], page: { limit: 20, nextCursor: null } });
  });

  it("rejects legacy list and item DTOs", () => {
    expect(() => mapPaymentList({ items: [], pagination: { page: 1, limit: 20, total: 0, total_pages: 0 } })).toThrow();
    expect(() => mapPaymentItem({ ...validItemDto, purpose: "deposit" })).toThrow();
  });
});
