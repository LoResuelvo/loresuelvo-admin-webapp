import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentStatusBadge } from "./payment-status-badge";

describe("PaymentStatusBadge", () => {
  it("shows paid status without a pending-payment clarification", () => {
    render(<PaymentStatusBadge status="paid" />);
    expect(screen.getByTestId("payment-status-badge")).toHaveTextContent("Pagado");
    expect(screen.queryByText("Sin cobro acreditado")).not.toBeInTheDocument();
  });

  it.each([
    ["requires_checkout", "Checkout requerido"],
    ["checkout_ready", "Checkout disponible"],
    ["processing", "En proceso"],
    ["rejected", "Rechazado"],
    ["expired", "Vencido"],
    ["cancelled", "Cancelado"],
    ["refunded", "Reintegrado"],
    ["disputed", "En disputa"],
    ["payment_mismatch", "Pago inconsistente"],
  ] as const)("shows %s without marking it as accredited", (status, label) => {
    render(<PaymentStatusBadge status={status} />);
    expect(screen.getByTestId("payment-status-badge")).toHaveTextContent(label);
    expect(screen.getByText("Sin cobro acreditado")).toBeInTheDocument();
  });
});
