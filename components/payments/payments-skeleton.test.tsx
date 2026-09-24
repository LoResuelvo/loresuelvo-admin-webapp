import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PaymentsSkeleton } from "./payments-skeleton";

describe("PaymentsSkeleton", () => {
  it("renders accessible loading status with indicators", () => {
    render(<PaymentsSkeleton />);

    const statusElement = screen.getByRole("status");
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("skeleton-indicator")).toBeInTheDocument();
  });
});
