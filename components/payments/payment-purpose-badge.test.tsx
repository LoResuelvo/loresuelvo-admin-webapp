import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentPurposeBadge } from "./payment-purpose-badge";

describe("PaymentPurposeBadge", () => {
  it("renders the booking deposit label", () => {
    render(<PaymentPurposeBadge purpose="booking_deposit" />);
    expect(screen.getByTestId("payment-purpose-badge")).toHaveTextContent("Seña");
  });

  it("renders the service balance label", () => {
    render(<PaymentPurposeBadge purpose="service_balance" />);
    expect(screen.getByTestId("payment-purpose-badge")).toHaveTextContent("Saldo del servicio");
  });
});
