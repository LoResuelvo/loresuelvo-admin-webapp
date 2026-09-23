import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ProposalDetail } from "@/domain/operations/unified-operation-detail";
import { OperationProposalCard } from "./operation-proposal-card";

describe("OperationProposalCard", () => {
  const sampleProposal: ProposalDetail = {
    id: 201,
    amountCents: 4500000,
    bookingDepositCents: 900000,
    estimatedDuration: "3 días",
    description: "Desmonte de bacha y recambio de cañería.",
    status: "accepted",
    createdAt: "2026-09-19T11:30:00Z",
  };

  it("renders null when proposals list is empty", () => {
    const { container } = render(<OperationProposalCard proposals={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders agreed proposal conditions and commercial details", () => {
    render(<OperationProposalCard proposals={[sampleProposal]} />);

    const card = screen.getByTestId("operation-proposal-card");
    expect(card).toBeInTheDocument();

    expect(screen.getByText(/45\.000/)).toBeInTheDocument();
    expect(screen.getByText(/9\.000/)).toBeInTheDocument();
    expect(screen.getByText(/20%.*de seña/i)).toBeInTheDocument();
    expect(screen.getByText("3 días")).toBeInTheDocument();
    expect(screen.getByText("Desmonte de bacha y recambio de cañería.")).toBeInTheDocument();
    expect(screen.getByText("Aceptado")).toBeInTheDocument();
  });
});
