import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PaymentsView } from "./payments-view";
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
];

describe("PaymentsView", () => {
  it("renders title, description and payments table", () => {
    render(<PaymentsView items={mockPayments} />);
    expect(screen.getByRole("heading", { name: "Consola de Pagos" })).toBeInTheDocument();
    expect(screen.getByText("MP-REF-45891")).toBeInTheDocument();
    expect(screen.getByText("MP-REF-45892")).toBeInTheDocument();
  });

  it("renders loading skeleton when isLoading is true", () => {
    render(<PaymentsView items={[]} isLoading={true} />);
    expect(screen.getByTestId("payments-skeleton")).toBeInTheDocument();
    expect(screen.getByText("Cargando pagos...")).toBeInTheDocument();
  });

  it("renders error message and retry button when error is provided", async () => {
    const handleRetry = vi.fn();
    render(<PaymentsView items={[]} error="Error al cargar pagos" onRetry={handleRetry} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Error al cargar pagos");

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when no items exist", () => {
    render(<PaymentsView items={[]} />);
    expect(screen.getByTestId("payments-empty")).toBeInTheDocument();
    expect(screen.getByText("No hay transacciones disponibles")).toBeInTheDocument();
  });

  it("filters items by search input query", async () => {
    const user = userEvent.setup();
    render(<PaymentsView items={mockPayments} />);

    const searchInput = screen.getByRole("searchbox", {
      name: "Buscar por referencia o participante",
    });
    await user.type(searchInput, "MP-REF-45892");

    expect(screen.getByText("MP-REF-45892")).toBeInTheDocument();
    expect(screen.queryByText("MP-REF-45891")).not.toBeInTheDocument();
  });

  it("shows empty state when search query matches no items", async () => {
    const user = userEvent.setup();
    render(<PaymentsView items={mockPayments} />);

    const searchInput = screen.getByRole("searchbox", {
      name: "Buscar por referencia o participante",
    });
    await user.type(searchInput, "NO_MATCH");

    expect(screen.getByTestId("payments-empty")).toBeInTheDocument();
    expect(screen.getByText("No hay transacciones disponibles")).toBeInTheDocument();
  });
});
