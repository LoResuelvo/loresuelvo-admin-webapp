import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentsTable } from "./payments-table";
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
    status: "pending",
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
    verifiedAt: null,
  },
];

describe("PaymentsTable", () => {
  it("renders table column headers correctly", () => {
    render(<PaymentsTable items={mockPayments} />);
    expect(screen.getByRole("columnheader", { name: "Referencia / ID" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Propósito" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Cliente" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Prestador" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Total" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Neto prestador" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Comisión plataforma" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Estado" })).toBeInTheDocument();
  });

  it("renders transactions with consumer, provider, and monetary amounts", () => {
    render(<PaymentsTable items={mockPayments} />);
    expect(screen.getByText("MP-REF-45891")).toBeInTheDocument();
    expect(screen.getByText("María Gómez")).toBeInTheDocument();
    expect(screen.getByText("Carlos Plomero")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana Electricista")).toBeInTheDocument();
    expect(screen.getByText("$ 20.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 17.000,00")).toBeInTheDocument();
    expect(screen.getByText("$ 3.000,00")).toBeInTheDocument();
  });
});
