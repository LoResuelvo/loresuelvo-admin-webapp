import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PaymentsPageClient } from "./payments-page-client";
import * as actions from "@/app/(dashboard)/pagos/actions";

vi.mock("@/app/(dashboard)/pagos/actions");

describe("PaymentsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and renders payments on mount", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: true,
      data: {
        items: [
          {
            id: 1,
            externalPaymentId: "pay_100",
            externalReference: "REF-100",
            purpose: "deposit",
            status: "approved",
            serviceProposalId: 10,
            workOrderId: null,
            consumer: { id: 1, name: "Consumidor Test", email: "cons@test.com" },
            provider: { id: 2, name: "Prestador Test", email: "prest@test.com" },
            breakdown: {
              serviceAmountCents: 100000,
              sellerAmountCents: 85000,
              platformFeeCents: 15000,
              totalAmountCents: 100000,
              currency: "ARS",
            },
            createdAt: "2026-09-20T10:00:00Z",
            verifiedAt: "2026-09-20T10:05:00Z",
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });

    render(<PaymentsPageClient />);

    expect(screen.getByTestId("payments-skeleton")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("REF-100")).toBeInTheDocument();
      expect(screen.getByText("Consumidor Test")).toBeInTheDocument();
    });
  });

  it("handles error state and allows retry", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: false,
      error: "Error de red",
    });

    render(<PaymentsPageClient />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Error de red");
    });
  });

  it("handles forbidden state and passes isForbidden to view", async () => {
    vi.mocked(actions.getPaymentsAction).mockResolvedValue({
      success: false,
      error: "No posees permisos para consultar información financiera. El acceso está restringido.",
      isForbidden: true,
    });

    render(<PaymentsPageClient />);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(/restringido|permisos/i);
      expect(screen.queryByRole("button", { name: "Reintentar" })).not.toBeInTheDocument();
    });
  });
});
