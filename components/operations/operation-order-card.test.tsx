import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OrderDetail } from "@/domain/operations/unified-operation-detail";
import { OperationOrderCard } from "./operation-order-card";

describe("OperationOrderCard", () => {
  const sampleOrder: OrderDetail = {
    id: 301,
    status: "scheduled",
    scheduledFor: "2026-09-25T09:00:00Z",
    completionReport: null,
    review: null,
  };

  it("renders null when order is null or undefined", () => {
    const { container } = render(<OperationOrderCard order={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders order status and scheduled date", () => {
    render(<OperationOrderCard order={sampleOrder} />);

    const card = screen.getByTestId("operation-order-card");
    expect(card).toBeInTheDocument();

    const statusBadges = screen.getAllByText("Programada");
    expect(statusBadges.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText(/25.*2026/i)).toBeInTheDocument();
  });
});
