import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type {
  CompletionReport,
  ServiceReview,
} from "@/domain/operations/unified-operation-detail";
import { OperationCompletionCard } from "./operation-completion-card";

describe("OperationCompletionCard", () => {
  const sampleReport: CompletionReport = {
    completedAt: "2026-09-25T15:30:00Z",
    notes: "Se reparó con éxito la pérdida del sifón y se colocó caño corrugado nuevo con junta de estanqueidad.",
    photos: [
      "https://example.com/photos/evidence-1.jpg",
      "https://example.com/photos/evidence-2.jpg",
    ],
  };

  const sampleReview: ServiceReview = {
    rating: 5,
    comment: "Excelente trabajo de Carlos, muy prolijo y puntual. Resolvió todo en el tiempo pactado.",
    createdAt: "2026-09-25T17:00:00Z",
  };

  it("renders null when both completionReport and review are missing", () => {
    const { container } = render(
      <OperationCompletionCard completionReport={null} review={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders completion report notes and evidence photos", () => {
    render(<OperationCompletionCard completionReport={sampleReport} review={null} />);

    expect(screen.getByTestId("operation-completion-card")).toBeInTheDocument();
    expect(
      screen.getByText(/Se reparó con éxito la pérdida del sifón/),
    ).toBeInTheDocument();

    const photos = screen.getAllByTestId("evidence-photo");
    expect(photos).toHaveLength(2);
    expect(photos[0]).toHaveAttribute("src", "https://example.com/photos/evidence-1.jpg");
  });

  it("renders customer review with star rating and comment", () => {
    render(<OperationCompletionCard completionReport={null} review={sampleReview} />);

    expect(screen.getByTestId("operation-completion-card")).toBeInTheDocument();
    const reviewCard = screen.getByTestId("operation-review-card");
    expect(reviewCard).toBeInTheDocument();

    expect(
      screen.getByText(/Excelente trabajo de Carlos, muy prolijo y puntual/),
    ).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("renders both report and review when both are provided", () => {
    render(
      <OperationCompletionCard completionReport={sampleReport} review={sampleReview} />,
    );

    expect(screen.getByTestId("operation-completion-card")).toBeInTheDocument();
    expect(screen.getByTestId("operation-review-card")).toBeInTheDocument();
    expect(screen.getAllByTestId("evidence-photo")).toHaveLength(2);
    expect(screen.getByText(/junta de estanqueidad/)).toBeInTheDocument();
    expect(screen.getByText(/Resolvió todo en el tiempo pactado/)).toBeInTheDocument();
  });
});
