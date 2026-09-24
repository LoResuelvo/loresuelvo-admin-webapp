import { describe, expect, it } from "vitest";
import { mapPaymentItem, mapPaymentList } from "./payment-mapper";

describe("payment-mapper", () => {
  const validItemDto = {
    id: 10,
    external_payment_id: "pay_ext_123",
    external_reference: "MP-REF-999",
    purpose: "deposit",
    status: "approved",
    service_proposal_id: 100,
    work_order_id: null,
    consumer: {
      id: 1,
      name: "Laura Gómez",
      email: "laura@example.com",
    },
    provider: {
      id: 2,
      name: "Mario Plomero",
      email: "mario@example.com",
    },
    currency: "ARS",
    service_amount_cents: 2000000,
    seller_amount_cents: 1700000,
    platform_fee_cents: 300000,
    total_amount_cents: 2000000,
    created_at: "2026-09-20T10:00:00Z",
    verified_at: "2026-09-20T10:05:00Z",
  };

  it("maps valid payment item DTO to camelCase domain model", () => {
    const result = mapPaymentItem(validItemDto);

    expect(result.id).toBe(10);
    expect(result.externalPaymentId).toBe("pay_ext_123");
    expect(result.externalReference).toBe("MP-REF-999");
    expect(result.purpose).toBe("deposit");
    expect(result.status).toBe("approved");
    expect(result.serviceProposalId).toBe(100);
    expect(result.workOrderId).toBeNull();
    expect(result.consumer).toEqual({
      id: 1,
      name: "Laura Gómez",
      email: "laura@example.com",
    });
    expect(result.provider).toEqual({
      id: 2,
      name: "Mario Plomero",
      email: "mario@example.com",
    });
    expect(result.breakdown).toEqual({
      serviceAmountCents: 2000000,
      sellerAmountCents: 1700000,
      platformFeeCents: 300000,
      totalAmountCents: 2000000,
      currency: "ARS",
    });
    expect(result.createdAt).toBe("2026-09-20T10:00:00Z");
    expect(result.verifiedAt).toBe("2026-09-20T10:05:00Z");
  });

  it("handles nullish optional fields safely", () => {
    const minimalDto = {
      ...validItemDto,
      external_payment_id: null,
      external_reference: null,
      service_proposal_id: null,
      verified_at: null,
    };
    const result = mapPaymentItem(minimalDto);

    expect(result.externalPaymentId).toBeNull();
    expect(result.externalReference).toBeNull();
    expect(result.serviceProposalId).toBeNull();
    expect(result.verifiedAt).toBeNull();
  });

  it("maps paginated payment list DTO to domain PaymentListResult", () => {
    const listDto = {
      items: [validItemDto],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        total_pages: 1,
      },
    };
    const result = mapPaymentList(listDto);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(1);
  });

  it("supports raw array fallback", () => {
    const result = mapPaymentList([validItemDto]);

    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("throws validation error for invalid DTO data", () => {
    const invalidDto = { ...validItemDto, purpose: "invalid_purpose" };
    expect(() => mapPaymentItem(invalidDto)).toThrow();
  });
});
