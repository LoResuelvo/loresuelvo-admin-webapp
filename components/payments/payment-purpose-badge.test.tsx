import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentPurposeBadge } from "./payment-purpose-badge";

describe("PaymentPurposeBadge", () => {
  it("renders deposit label correctly", () => {
    render(<PaymentPurposeBadge purpose="deposit" />);
    expect(screen.getByTestId("payment-purpose-badge")).toHaveTextContent("Seña");
  });

  it("renders balance label correctly", () => {
    render(<PaymentPurposeBadge purpose="balance" />);
    expect(screen.getByTestId("payment-purpose-badge")).toHaveTextContent("Saldo");
  });
});
