import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentStatusBadge } from "./payment-status-badge";

describe("PaymentStatusBadge", () => {
  it("renders approved status badge", () => {
    render(<PaymentStatusBadge status="approved" />);
    expect(screen.getByTestId("payment-status-badge")).toHaveTextContent("Aprobado");
  });

  it("renders pending status with explicit non-accredited clarification", () => {
    render(<PaymentStatusBadge status="pending" />);
    expect(screen.getByTestId("payment-status-badge")).toHaveTextContent("Pendiente");
    expect(screen.getByText("No computado como cobro acreditado")).toBeInTheDocument();
  });

  it("renders rejected status badge", () => {
    render(<PaymentStatusBadge status="rejected" />);
    expect(screen.getByTestId("payment-status-badge")).toHaveTextContent("Rechazado");
  });

  it("renders cancelled status badge", () => {
    render(<PaymentStatusBadge status="cancelled" />);
    expect(screen.getByTestId("payment-status-badge")).toHaveTextContent("Cancelado");
  });
});
