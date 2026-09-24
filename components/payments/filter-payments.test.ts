import { describe, expect, it } from "vitest";
import { filterPayments } from "./filter-payments";
import type { PaymentIntentSummary } from "./types";

const mockPayments: PaymentIntentSummary[] = [
  {
    id: 1,
    externalPaymentId: "pay_1001",
    externalReference: "MP-REF-45891",
    purpose: "deposit",
    status: "approved",
    serviceProposalId: 101,
    workOrderId: null,
    consumer: {
      id: 1,
      name: "María Gómez",
      email: "maria.gomez@example.com",
    },
    provider: {
      id: 2,
      name: "Carlos Plomero",
      email: "carlos.plomero@example.com",
    },
    breakdown: {
      serviceAmountCents: 2000000,
      sellerAmountCents: 1700000,
      platformFeeCents: 300000,
      totalAmountCents: 2000000,
      currency: "ARS",
    },
    createdAt: "2026-09-20T10:00:00Z",
    verifiedAt: "2026-09-20T10:05:00Z",
  },
  {
    id: 2,
    externalPaymentId: "pay_1002",
    externalReference: "MP-REF-45892",
    purpose: "balance",
    status: "approved",
    serviceProposalId: null,
    workOrderId: 201,
    consumer: {
      id: 3,
      name: "Juan Pérez",
      email: "juan.perez@example.com",
    },
    provider: {
      id: 4,
      name: "Ana Electricista",
      email: "ana.electricista@example.com",
    },
    breakdown: {
      serviceAmountCents: 5000000,
      sellerAmountCents: 4250000,
      platformFeeCents: 750000,
      totalAmountCents: 5000000,
      currency: "ARS",
    },
    createdAt: "2026-09-21T15:30:00Z",
    verifiedAt: "2026-09-21T15:35:00Z",
  },
  {
    id: 3,
    externalPaymentId: "pay_1003",
    externalReference: "MP-REF-45893",
    purpose: "deposit",
    status: "pending",
    serviceProposalId: 102,
    workOrderId: null,
    consumer: {
      id: 5,
      name: "Laura Martínez",
      email: "laura.martinez@example.com",
    },
    provider: {
      id: 6,
      name: "Pedro Gasista",
      email: "pedro.gasista@example.com",
    },
    breakdown: {
      serviceAmountCents: 3000000,
      sellerAmountCents: 2550000,
      platformFeeCents: 450000,
      totalAmountCents: 3000000,
      currency: "ARS",
    },
    createdAt: "2026-09-22T12:00:00Z",
    verifiedAt: null,
  },
];

describe("filterPayments", () => {
  it("returns all items when criteria is empty", () => {
    const result = filterPayments(mockPayments, {});
    expect(result).toHaveLength(3);
  });

  it("filters by external reference query", () => {
    const result = filterPayments(mockPayments, { query: "MP-REF-45892" });
    expect(result).toHaveLength(1);
    expect(result[0].externalReference).toBe("MP-REF-45892");
  });

  it("filters case-insensitively by consumer name", () => {
    const result = filterPayments(mockPayments, { query: "maría" });
    expect(result).toHaveLength(1);
    expect(result[0].consumer.name).toBe("María Gómez");
  });

  it("filters case-insensitively by provider email", () => {
    const result = filterPayments(mockPayments, { query: "ana.electricista" });
    expect(result).toHaveLength(1);
    expect(result[0].provider.name).toBe("Ana Electricista");
  });

  it("filters by purpose", () => {
    const result = filterPayments(mockPayments, { purpose: "deposit" });
    expect(result).toHaveLength(2);
  });

  it("filters by status", () => {
    const result = filterPayments(mockPayments, { status: "pending" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("combines purpose and status filters", () => {
    const result = filterPayments(mockPayments, { purpose: "deposit", status: "approved" });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("returns empty array when no payment matches query", () => {
    const result = filterPayments(mockPayments, { query: "nonexistent" });
    expect(result).toHaveLength(0);
  });
});
